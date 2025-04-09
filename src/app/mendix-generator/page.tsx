'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowLeft, X } from 'lucide-react';
import { generateRequiredEntities, generateMendixValidationCode } from './utils/mendixValidator';
import { generateDynamicMendixCode, generateDynamicCleanupCode, MendixEntitySummary } from './utils/codeGenerator';
import AppLayout from '@/components/layout/AppLayout';

interface IIHAsset {
  assetId: string;
  name: string;
  variables?: Array<{
    variableId: string;
    name: string;
    aggregations?: {
      [key: string]: {
        id: string;
        cycle: {
          base: string;
          factor: number;
        };
      };
    };
  }>;
}

interface EntityEntry {
  entity: string;
  attributes: {
    [key: string]: string;
  };
  [key: string]: any;
}

interface RequiredEntityDisplay {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
  }>;
}

export default function MendixGeneratorPage() {
  console.log('MendixGenerator - Page Component Initializing');
  
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [cleanupCode, setCleanupCode] = useState<string>('');
  const [validationCode, setValidationCode] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mendixSummary, setMendixSummary] = useState<MendixEntitySummary | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [requiredEntities, setRequiredEntities] = useState<RequiredEntityDisplay[]>([]);
  const [showEntitiesModal, setShowEntitiesModal] = useState(true);

  const generateMendixSummary = (iihData: any) => {
    console.log('Structure IIH reçue:', JSON.stringify(iihData, null, 2));
    
    // Récupérer les niveaux hiérarchiques à partir des données
    const hierarchyLevels = iihData.hierarchyData?.levels || [];
    
    // Initialisation de base
    const summary: MendixEntitySummary = {
      totalEntities: {
        Secteur: 0,
        Atelier: 0,
        Ligne: 0,
        Poste: 0,
        Machine: 0,
        SmartAggregation_Conso: 0,
        SmartAggregation_Production_Quantite: 0,
        SmartAggregation_Production_Kg: 0,
        SmartAggregation_IPE_Quantite: 0,
        SmartAggregation_IPE_Kg: 0,
        EtatCapteur: 0
      },
      secteurs: [],
      ateliers: [],
      lignes: [],
      postes: [],
      machines: [],
      etatCapteurs: []
    };
    
    // Générer dynamiquement les collections d'agrégation pour chaque niveau
    hierarchyLevels.forEach((level: { name: string }) => {
      const levelName = level.name.toLowerCase();
      const collectionBaseName = levelName + 's'; // Exemple: "secteur" -> "secteurs"
      
      // S'assurer que la collection de base est initialisée
      if (!summary[collectionBaseName]) {
        summary[collectionBaseName] = [];
      }
      
      // Créer dynamiquement les collections d'agrégation pour ce niveau
      summary[`aggregations_conso_${levelName}`] = [];
      summary[`aggregations_production_quantite_${levelName}`] = [];
      summary[`aggregations_production_kg_${levelName}`] = [];
      summary[`aggregations_ipe_quantite_${levelName}`] = [];
      summary[`aggregations_ipe_kg_${levelName}`] = [];
    });

    // LOG: Verify that all arrays are initialized correctly
    console.log("[DEBUG] Verifying array initialization:");
    // Parcourir toutes les propriétés du summary
    Object.keys(summary).forEach(key => {
      if (key !== 'totalEntities') {
        console.log(`[DEBUG] ${key} is ${Array.isArray(summary[key]) ? 'array' : typeof summary[key]}`);
      }
    });

    // Fonction helper pour créer une entrée d'entité
    const createEntityEntry = (entityName: string, name: string, attributes: any): EntityEntry => ({
      entity: `Smart.${entityName}`,
      attributes: {
        ...attributes
      }
    });

    // Traiter la hiérarchie
    const processNode = (node: any, parentNodes: any[] = []) => {
      const level = node.metadata.level;
      summary.totalEntities[level]++;

      // Créer les attributs de base
      const attributes: any = {};
      
      // Attributs différents selon le niveau
      if (level === 'Machine') {
        attributes.Identifiant = node.metadata.assetId || node.id;
        attributes.Nom = node.name;
        attributes.IPE = '0';
        attributes.TotalConso = '0';
        attributes.TypeEnergie = node.metadata.energyType || node.metadata.rawEnergyType || '';
      } else {
        // Pour les niveaux autres que Machine
        attributes.Nom = node.name;
        attributes.TotalConso = '0';
        attributes.TotalConsoElec = '0';
        attributes.TotalConsoGaz = '0';
        attributes.TotalConsoAir = '0';
        attributes.TotalConsoEau = '0';
      }

      // Ajouter les références aux parents
      parentNodes.forEach(parent => {
        attributes[parent.metadata.level] = parent.name;
      });

      // Ajouter l'entrée au niveau correspondant
      const entityEntry = createEntityEntry(level, node.name, attributes);
      const collectionName = level.toLowerCase() + 's';
      
      if (Array.isArray(summary[collectionName])) {
        summary[collectionName].push(entityEntry);
      }

      // Traiter les variables
      processVariables(node, summary, parentNodes);
    };

    // Parcourir la hiérarchie et traiter chaque nœud
    const processHierarchy = (nodes: any[], links: any[]) => {
      nodes.forEach(node => {
        const parents = findAllParents(node.id, nodes, links);
        processNode(node, parents);
      });
    };

    // Traiter la hiérarchie complète
    if (iihData.hierarchyData?.nodes && iihData.hierarchyData?.links) {
      processHierarchy(iihData.hierarchyData.nodes, iihData.hierarchyData.links);
    }

    return summary;
  };

  const findAllParents = (nodeId: string, nodes: any[], links: any[]) => {
    const parents = [];
    let currentId = nodeId;

    while (true) {
      const parentLink = links.find(link => link.target === currentId);
      if (!parentLink) break;

      const parentNode = nodes.find(node => node.id === parentLink.source);
      if (!parentNode) break;

      parents.push(parentNode);
      currentId = parentNode.id;
    }

    return parents;
  };

  const processVariables = (node: any, summary: MendixEntitySummary, parentNodes: any[]) => {
    // Normalisation du nom de niveau pour éviter les problèmes de casse
    const rawLevel = node.metadata.level;
    const level = rawLevel.toLowerCase();
    
    console.log(`[DEBUG] Processing variables for node: ${node.name}, level: ${level}, raw level: ${rawLevel}`);
    
    // Vérifier si le nœud a un niveau reconnu
    if (!level) {
      console.log(`[DEBUG] Node ${node.name} has no level defined, skipping...`);
      return;
    }
    
    // Créer dynamiquement les collections si elles n'existent pas
    const aggregationTypes = [
      'aggregations_conso',
      'aggregations_production_quantite',
      'aggregations_production_kg',
      'aggregations_ipe_quantite',
      'aggregations_ipe_kg'
    ];
    
    aggregationTypes.forEach(aggType => {
      const collectionName = `${aggType}_${level}`;
      if (!summary[collectionName]) {
        summary[collectionName] = [];
        console.log(`[DEBUG] Created missing collection: ${collectionName}`);
      }
    });
    
    // Extraire les informations des parents pour les références
    const parentInfo: Record<string, string> = {};
    parentNodes.forEach(parent => {
      const parentLevel = parent.metadata.level.toLowerCase();
      parentInfo[parentLevel] = parent.name;
      
      // Ajouter également avec première lettre majuscule pour être sûr
      const parentLevelCapitalized = parentLevel.charAt(0).toUpperCase() + parentLevel.slice(1);
      parentInfo[parentLevelCapitalized] = parent.name;
    });
    
    // DEBUG: Log parent info
    console.log(`[DEBUG] Parent info for ${node.name}:`, parentInfo);
    
    // Fonction d'aide pour préparer les attributs communs
    const prepareCommonAttributes = (variableName: string, variableId: string) => {
      const attrs: any = {
        VariableId: variableId,
        VariableName: variableName,
        AssetName: node.name,
        TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || "Elec"
      };
      
      // Ajouter la référence au niveau courant
      attrs[rawLevel] = node.name;
      
      // Ajouter les références aux parents
      for (const [parentLevel, parentName] of Object.entries(parentInfo)) {
        attrs[parentLevel] = parentName;
      }
      
      return attrs;
    };
    
    // Fonction d'aide pour ajouter à une collection
    const addToCollection = (collectionName: string, entityName: string, attributes: any) => {
      if (!summary[collectionName]) {
        summary[collectionName] = [];
        console.log(`[DEBUG] Created collection ${collectionName} that was missing`);
      }
      
      summary[collectionName].push({
        entity: entityName,
        attributes: attributes
      });
      
      console.log(`[DEBUG] Added to ${collectionName} for node ${node.name}`);
    };
    
    // 1. Traiter la variable de consommation
    if (node.metadata.variable) {
      summary.totalEntities.SmartAggregation_Conso++;
      console.log(`[DEBUG] Found consumption variable for ${node.name}:`, node.metadata.variable.id);
      
      const aggConsoAttributes = prepareCommonAttributes(
        node.metadata.variable.name,
        node.metadata.variable.id
      );
      
      // Ajouter les IDs des agrégations
      if (node.metadata.variable.aggregations) {
        const aggs = node.metadata.variable.aggregations;
        if (aggs['5min']) aggConsoAttributes.Identifiant5Min = aggs['5min'].id;
        if (aggs['1h']) aggConsoAttributes.Identifiant1h = aggs['1h'].id;
        if (aggs['4h']) aggConsoAttributes.Identifiant4h = aggs['4h'].id;
        if (aggs['8h']) aggConsoAttributes.Identifiant8h = aggs['8h'].id;
        if (aggs['1d']) aggConsoAttributes.Identifiant1day = aggs['1d'].id;
      }
      
      // Ajouter à la collection appropriée
      const collectionName = `aggregations_conso_${level}`;
      const entityName = `Smart.Aggregation_Conso_${rawLevel}`;
      addToCollection(collectionName, entityName, aggConsoAttributes);
    } else {
      console.log(`[DEBUG] No consumption variable found for ${node.name}`);
    }

    // Ne traiter les variables de production et IPE que pour les niveaux autres que Machine
    if (level !== 'machine') {
      // 2. Traiter la variable de production (quantité)
      if (node.metadata.productionVariable) {
        summary.totalEntities.SmartAggregation_Production_Quantite++;
        console.log(`[DEBUG] Found production quantity variable for ${node.name}:`, node.metadata.productionVariable.id);
        
        const aggProdAttributes = prepareCommonAttributes(
          node.metadata.productionVariable.name,
          node.metadata.productionVariable.id
        );
        
        // Ajouter les IDs des agrégations
        if (node.metadata.productionVariable.aggregations) {
          const aggs = node.metadata.productionVariable.aggregations;
          if (aggs['5min']) aggProdAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']) aggProdAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']) aggProdAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']) aggProdAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']) aggProdAttributes.Identifiant1day = aggs['1d'].id;
        }
        
        // Ajouter à la collection appropriée
        const collectionName = `aggregations_production_quantite_${level}`;
        const entityName = `Smart.Aggregation_Production_Quantite_${rawLevel}`;
        addToCollection(collectionName, entityName, aggProdAttributes);
      } else {
        console.log(`[DEBUG] No production quantity variable found for ${node.name}`);
      }
      
      // 3. Traiter la variable de production (kg)
      if (node.metadata.productionKgVariable) {
        summary.totalEntities.SmartAggregation_Production_Kg++;
        console.log(`[DEBUG] Found production kg variable for ${node.name}:`, node.metadata.productionKgVariable.id);
        
        const aggProdKgAttributes = prepareCommonAttributes(
          node.metadata.productionKgVariable.name,
          node.metadata.productionKgVariable.id
        );
        
        // Ajouter les IDs des agrégations
        if (node.metadata.productionKgVariable.aggregations) {
          const aggs = node.metadata.productionKgVariable.aggregations;
          if (aggs['5min']) aggProdKgAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']) aggProdKgAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']) aggProdKgAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']) aggProdKgAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']) aggProdKgAttributes.Identifiant1day = aggs['1d'].id;
        }
        
        // Ajouter à la collection appropriée
        const collectionName = `aggregations_production_kg_${level}`;
        const entityName = `Smart.Aggregation_Production_Kg_${rawLevel}`;
        addToCollection(collectionName, entityName, aggProdKgAttributes);
      } else {
        console.log(`[DEBUG] No production kg variable found for ${node.name}`);
      }
      
      // 4. Traiter la variable IPE (quantité)
      if (node.metadata.ipeVariable || node.metadata.ipeQuantiteVariable) {
        summary.totalEntities.SmartAggregation_IPE_Quantite++;
        
        const ipeVar = node.metadata.ipeVariable || node.metadata.ipeQuantiteVariable;
        console.log(`[DEBUG] Found IPE quantity variable for ${node.name}:`, ipeVar.id);
        
        const aggIPEAttributes = prepareCommonAttributes(
          ipeVar.name,
          ipeVar.id
        );
        
        // Ajouter les IDs des agrégations
        if (ipeVar.aggregations) {
          const aggs = ipeVar.aggregations;
          if (aggs['5min']) aggIPEAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']) aggIPEAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']) aggIPEAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']) aggIPEAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']) aggIPEAttributes.Identifiant1day = aggs['1d'].id;
        }
        
        // Ajouter à la collection appropriée
        const collectionName = `aggregations_ipe_quantite_${level}`;
        const entityName = `Smart.Aggregation_IPE_Quantite_${rawLevel}`;
        addToCollection(collectionName, entityName, aggIPEAttributes);
      } else {
        console.log(`[DEBUG] No IPE quantity variable found for ${node.name}`);
      }
      
      // 5. Traiter la variable IPE (kg)
      if (node.metadata.ipeKgVariable) {
        summary.totalEntities.SmartAggregation_IPE_Kg++;
        console.log(`[DEBUG] Found IPE kg variable for ${node.name}:`, node.metadata.ipeKgVariable.id);
        
        const aggIPEKgAttributes = prepareCommonAttributes(
          node.metadata.ipeKgVariable.name,
          node.metadata.ipeKgVariable.id
        );
        
        // Ajouter les IDs des agrégations
        if (node.metadata.ipeKgVariable.aggregations) {
          const aggs = node.metadata.ipeKgVariable.aggregations;
          if (aggs['5min']) aggIPEKgAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']) aggIPEKgAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']) aggIPEKgAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']) aggIPEKgAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']) aggIPEKgAttributes.Identifiant1day = aggs['1d'].id;
        }
        
        // Ajouter à la collection appropriée
        const collectionName = `aggregations_ipe_kg_${level}`;
        const entityName = `Smart.Aggregation_IPE_Kg_${rawLevel}`;
        addToCollection(collectionName, entityName, aggIPEKgAttributes);
      } else {
        console.log(`[DEBUG] No IPE kg variable found for ${node.name}`);
      }
    } else {
      console.log(`[DEBUG] Skipping production and IPE variables for ${node.name} because level is 'machine'`);
    }

    // Traiter l'état du capteur (uniquement pour les machines)
    if (level === 'machine' && node.metadata.stateVariable?.variableId) {
      summary.totalEntities.EtatCapteur++;
      console.log(`[DEBUG] Found state variable for machine ${node.name}:`, node.metadata.stateVariable.variableId);
      
      if (!summary.etatCapteurs) {
        summary.etatCapteurs = [];
        console.log(`[DEBUG] Created etatCapteurs collection that was missing`);
      }
      
      summary.etatCapteurs.push({
        entity: 'Smart.EtatCapteur',
        attributes: {
          NomCapteur: node.name,
          Etat: "false",
          DerniereMaj: new Date().toISOString(),
          IdEtatCapteur: node.metadata.stateVariable.variableId
        }
      });
      console.log(`[DEBUG] Successfully added state sensor for ${node.name}`);
    } else if (level === 'machine') {
      console.log(`[DEBUG] No state variable found for machine ${node.name}`);
    }
  };

  useEffect(() => {
    const loadEntities = async () => {
    const iihStructure = localStorage.getItem('iihStructure');
    if (!iihStructure) {
        router.push('/');
        return;
    }

    try {
        setIsValidating(true);
        const data = JSON.parse(iihStructure);
        const hierarchyLevels = data.hierarchyData.levels;
        
        // Générer les entités requises basées sur les niveaux
        const requiredEntities = generateRequiredEntities(hierarchyLevels);
        setRequiredEntities(requiredEntities);
        setIsValidating(false);
    } catch (error) {
        console.error('Erreur lors du chargement des entités:', error);
        setValidationError(error instanceof Error ? error.message : 'Une erreur est survenue');
        router.push('/dashboard');
    }
    };

    loadEntities();
  }, [router]);

  const handleValidateAndGenerate = async () => {
    if (!requiredEntities.length) return;

    try {
      setIsValidating(true);
      const iihStructure = localStorage.getItem('iihStructure');
      if (!iihStructure) return;

      const data = JSON.parse(iihStructure);
      const hierarchyLevels = data.hierarchyData.levels;
      
      console.log("[DEBUG] Data from localStorage:", JSON.stringify(data, null, 2));
      console.log("[DEBUG] Hierarchy levels:", JSON.stringify(hierarchyLevels, null, 2));

      // Analyser et fixer les données avant de générer le code Mendix
      const fixedData = associateVariablesToNodes(data);
      console.log("[DEBUG] Données après association des variables:", fixedData);

      // DEBUG: Analyze nodes for variables
      if (fixedData.hierarchyData && fixedData.hierarchyData.nodes) {
        console.log("[DEBUG] Total nodes:", fixedData.hierarchyData.nodes.length);
        
        // Check variables in each node
        const variableCounts = {
          consoVariables: 0,
          productionVariables: 0,
          productionKgVariables: 0,
          ipeVariables: 0,
          ipeQuantiteVariables: 0,
          ipeKgVariables: 0,
          stateVariables: 0
        };
        
        fixedData.hierarchyData.nodes.forEach((node: any) => {
          if (node.metadata) {
            if (node.metadata.variable) variableCounts.consoVariables++;
            if (node.metadata.productionVariable) variableCounts.productionVariables++;
            if (node.metadata.productionKgVariable) variableCounts.productionKgVariables++;
            if (node.metadata.ipeVariable) variableCounts.ipeVariables++;
            if (node.metadata.ipeQuantiteVariable) variableCounts.ipeQuantiteVariables++;
            if (node.metadata.ipeKgVariable) variableCounts.ipeKgVariables++;
            if (node.metadata.stateVariable) variableCounts.stateVariables++;
          }
        });
        
        console.log("[DEBUG] Variable counts in nodes after fixing:", variableCounts);
        
        // Print details of a few nodes as examples
        console.log("[DEBUG] Sample nodes after fixing (up to 3):");
        for (let i = 0; i < Math.min(3, fixedData.hierarchyData.nodes.length); i++) {
          const node = fixedData.hierarchyData.nodes[i];
          console.log(`[DEBUG] Node ${i+1}:`, {
            id: node.id,
            name: node.name,
            level: node.metadata?.level,
            hasVariable: !!node.metadata?.variable,
            hasProductionVariable: !!node.metadata?.productionVariable,
            hasStateVariable: !!node.metadata?.stateVariable
          });
        }
      }

      await validateMendixEntities(requiredEntities);
      const mendixSummary = generateMendixSummary(fixedData);
      console.log("[DEBUG] Generated Mendix Summary:", JSON.stringify(mendixSummary, null, 2));
      setMendixSummary(mendixSummary);
      const generatedCode = generateDynamicMendixCode(hierarchyLevels, requiredEntities, fixedData, mendixSummary);
      setGeneratedCode(generatedCode);
      const cleanup = generateDynamicCleanupCode(requiredEntities, hierarchyLevels);
      setCleanupCode(cleanup);
      setShowEntitiesModal(false);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Erreur de validation Mendix');
    } finally {
      setIsValidating(false);
    }
  };

  // Fonction pour associer les variables aux nœuds de la hiérarchie
  const associateVariablesToNodes = (data: any) => {
    // Créer une copie profonde des données pour ne pas modifier l'original
    const fixedData = JSON.parse(JSON.stringify(data));
    
    // Si pas de variables externes, on utilise principalement les métadonnées existantes mais on les formate.
    if (!fixedData.variables || !Array.isArray(fixedData.variables) || fixedData.variables.length === 0) {
      console.log("[DEBUG associateVariablesToNodes] Aucune variable externe à associer. Formatage des métadonnées existantes.");
      // S'assurer que les métadonnées existantes sont bien structurées
      if (fixedData.hierarchyData?.nodes) {
        fixedData.hierarchyData.nodes.forEach((node: any) => {
          if (node.metadata?.variable?.aggregations) {
            node.metadata.variable.aggregations = formatAggregations(node.metadata.variable.aggregations);
          }
          if (node.metadata?.productionVariable?.aggregations) {
            node.metadata.productionVariable.aggregations = formatAggregations(node.metadata.productionVariable.aggregations);
          }
          if (node.metadata?.productionKgVariable?.aggregations) {
             node.metadata.productionKgVariable.aggregations = formatAggregations(node.metadata.productionKgVariable.aggregations);
          }
          if (node.metadata?.ipeVariable?.aggregations) {
             node.metadata.ipeVariable.aggregations = formatAggregations(node.metadata.ipeVariable.aggregations);
          }
          if (node.metadata?.ipeKgVariable?.aggregations) {
             node.metadata.ipeKgVariable.aggregations = formatAggregations(node.metadata.ipeKgVariable.aggregations);
          }
        });
      }
      return fixedData;
    }
    
    // Si pas de nœuds, retourner les données inchangées
    if (!fixedData.hierarchyData?.nodes || !Array.isArray(fixedData.hierarchyData.nodes)) {
      console.log("[DEBUG associateVariablesToNodes] Aucun nœud dans la hiérarchie. Nœuds:", fixedData.hierarchyData?.nodes);
      return fixedData;
    }
    
    console.log("[DEBUG associateVariablesToNodes] Association des variables externes aux nœuds...");
    console.log(`[DEBUG associateVariablesToNodes] ${fixedData.variables.length} variables externes à associer à ${fixedData.hierarchyData.nodes.length} nœuds`);
    
    // Map des variables par assetId pour faciliter la recherche
    const variablesByAssetId: Record<string, any[]> = {};
    
    fixedData.variables.forEach((variable: any) => {
      if (variable.assetId) {
        if (!variablesByAssetId[variable.assetId]) {
          variablesByAssetId[variable.assetId] = [];
        }
        variablesByAssetId[variable.assetId].push(variable);
      }
    });
    
    // Traiter chaque nœud
    fixedData.hierarchyData.nodes.forEach((node: any) => {
      // S'assurer que le nœud a un objet metadata, sinon le créer
      if (!node.metadata) {
        node.metadata = { level: node.levelName || 'Unknown' };
      }
      const existingMetadata = node.metadata; // Conserver une référence aux métadonnées chargées

      // Récupérer l'assetId depuis le nœud ou d'une propriété potentiellement différente
      const assetId = node.id || node.assetId || existingMetadata?.assetId;
      
      if (!assetId) {
        console.log(`[DEBUG associateVariablesToNodes] Nœud sans assetId ${node.name}, impossible d'associer des variables externes.`);
        // On ne retourne pas, car il faut quand même formater les métadonnées existantes si elles existent
      } else {
          // Récupérer les variables externes pour cet asset
          const variables = variablesByAssetId[assetId] || [];
          
          if (variables.length === 0) {
            console.log(`[DEBUG associateVariablesToNodes] Aucune variable externe trouvée pour le nœud ${node.name} (assetId: ${assetId}). Préservation/Formatage des métadonnées existantes.`);
          } else {
              console.log(`[DEBUG associateVariablesToNodes] ${variables.length} variables externes trouvées pour ${node.name}. Association...`);
              // Association des variables externes en fonction de leur nom
              variables.forEach((variable: any) => {
                const variableName = variable.name?.toLowerCase() || '';
                const variableId = variable.id || variable.variableId;
                
                // Utiliser les agrégations de la variable externe OU les agrégations existantes
                const formattedExternalAggs = formatAggregations(variable.aggregations);

                if (variableName.includes('conso') || variableName.includes('consommation')) {
                  const existingAggregations = existingMetadata.variable?.aggregations ? formatAggregations(existingMetadata.variable.aggregations) : {};
                  node.metadata.variable = {
                    id: variableId,
                    name: variable.name,
                    aggregations: Object.keys(formattedExternalAggs).length > 0 ? formattedExternalAggs : existingAggregations
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe conso associée à ${node.name}.`);
                } 
                else if (variableName.includes('prod') && variableName.includes('kg')) {
                  const existingAggregations = existingMetadata.productionKgVariable?.aggregations ? formatAggregations(existingMetadata.productionKgVariable.aggregations) : {};
                  node.metadata.productionKgVariable = {
                    id: variableId,
                    name: variable.name,
                    aggregations: Object.keys(formattedExternalAggs).length > 0 ? formattedExternalAggs : existingAggregations
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe prod_kg associée à ${node.name}.`);
                }
                else if (variableName.includes('prod') || variableName.includes('production')) {
                   const existingAggregations = existingMetadata.productionVariable?.aggregations ? formatAggregations(existingMetadata.productionVariable.aggregations) : {};
                  node.metadata.productionVariable = {
                    id: variableId,
                    name: variable.name,
                    aggregations: Object.keys(formattedExternalAggs).length > 0 ? formattedExternalAggs : existingAggregations
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe prod associée à ${node.name}.`);
                }
                else if (variableName.includes('ipe') && variableName.includes('kg')) {
                  const existingAggregations = existingMetadata.ipeKgVariable?.aggregations ? formatAggregations(existingMetadata.ipeKgVariable.aggregations) : {};
                  node.metadata.ipeKgVariable = {
                    id: variableId,
                    name: variable.name,
                    aggregations: Object.keys(formattedExternalAggs).length > 0 ? formattedExternalAggs : existingAggregations
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe ipe_kg associée à ${node.name}.`);
                }
                else if (variableName.includes('ipe') || variableName.includes('indicateur')) {
                  const existingAggregations = existingMetadata.ipeVariable?.aggregations ? formatAggregations(existingMetadata.ipeVariable.aggregations) : {};
                  node.metadata.ipeVariable = {
                    id: variableId,
                    name: variable.name,
                    aggregations: Object.keys(formattedExternalAggs).length > 0 ? formattedExternalAggs : existingAggregations
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe ipe associée à ${node.name}.`);
                }
                else if (variableName.includes('etat') || variableName.includes('status') || variableName.includes('état')) {
                  node.metadata.stateVariable = {
                    variableId: variableId,
                    name: variable.name
                  };
                  console.log(`[DEBUG associateVariablesToNodes] Variable externe etat associée à ${node.name}.`);
                }
              });
          }
      }

      // Après association (ou non), s'assurer que TOUTES les agrégations présentes sont formatées
       if (node.metadata.variable?.aggregations) {
           node.metadata.variable.aggregations = formatAggregations(node.metadata.variable.aggregations);
       }
       if (node.metadata.productionVariable?.aggregations) {
           node.metadata.productionVariable.aggregations = formatAggregations(node.metadata.productionVariable.aggregations);
       }
       if (node.metadata.productionKgVariable?.aggregations) {
           node.metadata.productionKgVariable.aggregations = formatAggregations(node.metadata.productionKgVariable.aggregations);
       }
       if (node.metadata.ipeVariable?.aggregations) {
           node.metadata.ipeVariable.aggregations = formatAggregations(node.metadata.ipeVariable.aggregations);
       }
       if (node.metadata.ipeKgVariable?.aggregations) {
           node.metadata.ipeKgVariable.aggregations = formatAggregations(node.metadata.ipeKgVariable.aggregations);
       }

    });
    
    // SUPPRESSION de la partie création de variables synthétiques
    console.log("[DEBUG associateVariablesToNodes] Fin de l'association/formatage. La création de variables synthétiques est désactivée.");
    
    return fixedData;
  };

  // Fonction auxiliaire pour formater les agrégations
  const formatAggregations = (aggregations: any) => {
    if (!aggregations || typeof aggregations !== 'object') return {}; // Retourner objet vide si null, undefined ou pas un objet
    
    // Log - Peut être réduit/supprimé en production
    console.log(`[DEBUG formatAggregations] Structure d'agrégation brute reçue:`, JSON.stringify(aggregations));
    
    const formatted: Record<string, any> = {};
    
    // Cas 1: Si aggregations est un objet (dictionnaire)
    if (!Array.isArray(aggregations)) {
      Object.entries(aggregations).forEach(([key, agg]: [string, any]) => {
        let cycleKey = key;
        let aggId = null;
        let aggCycle = null;
        let aggType = 'Sum'; // Default type

        if (agg && typeof agg === 'object') {
          aggId = agg.id || agg.variableId || null;
          aggCycle = agg.cycle;
          aggType = agg.type || aggType;
        } else if (typeof agg === 'string') {
           aggId = agg; // L'ID est directement la valeur
        }

        if (!aggId) {
           console.warn(`[DEBUG formatAggregations] ID d'agrégation non trouvé pour la clé ${key} dans l'objet:`, agg);
           return; // Ignorer cette entrée
        }

        // Standardiser les clés (5min, 1h...) si possible
        if (aggCycle) {
            const { base, factor } = aggCycle;
            if (base === 'minute' && factor === 5) cycleKey = '5min';
            else if (base === 'hour' && factor === 1) cycleKey = '1h';
            else if (base === 'hour' && factor === 4) cycleKey = '4h';
            else if (base === 'hour' && factor === 8) cycleKey = '8h';
            else if (base === 'day' && factor === 1) cycleKey = '1d';
            // else garder la clé originale
        } else {
            // Essayer via la clé si pas de cycle
            if (key.includes('5min')) cycleKey = '5min';
            else if (key.includes('1h')) cycleKey = '1h';
            else if (key.includes('4h')) cycleKey = '4h';
            else if (key.includes('8h')) cycleKey = '8h';
            else if (key.includes('1d') || key.includes('day')) cycleKey = '1d';
        }
          
        formatted[cycleKey] = {
          id: aggId,
          type: aggType,
          cycle: aggCycle // Conserver l'objet cycle original
        };
      });
    }
    // Cas 2: Si c'est un tableau (moins courant mais géré)
    else if (Array.isArray(aggregations)) {
      console.warn("[DEBUG formatAggregations] Structure d'agrégation en tableau détectée - traitement...");
      aggregations.forEach((agg: any) => {
        if (agg && typeof agg === 'object') {
          let cycleKey = '';
          let aggId = agg.id || agg.variableId || null;
          let aggCycle = agg.cycle;
          let aggType = agg.type || 'Sum';

          if (!aggId) {
             console.warn("[DEBUG formatAggregations] Élément de tableau sans ID:", agg);
             return; // Ignorer
          }

          // Déterminer la clé du cycle
          if (aggCycle) {
            const { base, factor } = aggCycle;
            if (base === 'minute' && factor === 5) cycleKey = '5min';
            else if (base === 'hour' && factor === 1) cycleKey = '1h';
            // ... autres cas ...
            else if (base === 'day' && factor === 1) cycleKey = '1d';
          } else if (agg.cycleTime) { cycleKey = agg.cycleTime; }
          // ... autres fallbacks pour cycleKey ...
          
          if (cycleKey) {
            formatted[cycleKey] = { id: aggId, type: aggType, cycle: aggCycle };
          } else {
             console.warn(`[DEBUG formatAggregations] Impossible de déterminer cycleKey pour l'élément de tableau:`, agg);
          }
        }
      });
    }
    
    if (Object.keys(formatted).length > 0) {
      console.log('[DEBUG formatAggregations] Identifiants d\'agrégation formatés:', formatted);
    }
    
    return formatted;
  };

  // Fonction de simulation de validation Mendix - Gardée pour le moment
  const validateMendixEntities = async (entities: any[]) => {
    // Simuler un appel API à Mendix
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Ici, vous devriez implémenter la vraie logique de validation avec l'API Mendix
        const missingEntities = entities.filter(entity => {
          // Simulation: considérer que certaines entités n'existent pas
          return !entity.name.includes('Smart');
        });

        if (missingEntities.length > 0) {
          reject(new Error(`Entités manquantes dans Mendix: ${missingEntities.map(e => e.name).join(', ')}`));
        } else {
          resolve(true);
        }
      }, 1000);
    });
  };

  const handleCopyCode = async (codeToClipboard: string, type: 'creation' | 'cleanup' | 'validation' = 'creation') => {
    console.log(`MendixGenerator - Copying ${type} Code to Clipboard`);
    try {
        await navigator.clipboard.writeText(codeToClipboard);
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
        console.error('MendixGenerator - Copy Error:', err);
        setCopySuccess(null);
    }
};

  const handleBack = () => {
    console.log('MendixGenerator - Navigating Back to Dashboard');
    router.push('/dashboard');
  };

  console.log('MendixGenerator - Rendering Component:', {
    hasGeneratedCode: !!generatedCode,
    copySuccess
  });

  const EntityRequirementsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Entités Mendix Requises</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {requiredEntities.map((entity, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-6 relative">
              {/* Ligne de connexion avec le niveau précédent */}
              {index > 0 && (
                <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-blue-400"></div>
              )}
              
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                {entity.name}
              </h2>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Attributs requis :</h3>
                <div className="grid grid-cols-2 gap-4">
                  {entity.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="bg-gray-700 p-3 rounded">
                      <p className="text-white font-medium flex items-center">
                        {attr.name}
                        {/* Indicateur de relation si l'attribut fait référence à un niveau précédent */}
                        {requiredEntities.slice(0, index).some(e => e.name.includes(attr.name)) && (
                          <span className="ml-2 text-blue-400 text-sm">
                            ↑ Référence au niveau {requiredEntities.findIndex(e => e.name.includes(attr.name)) + 1}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-300 text-sm">Type: {attr.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleValidateAndGenerate}
            disabled={isValidating}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validation...
              </>
            ) : (
              <>
                <span>Valider et Générer</span>
                <ArrowLeft className="h-5 w-5 transform rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isValidating && !requiredEntities.length) {
  return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des entités requises...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-red-900/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Erreur de Validation</h2>
          <p className="text-red-200 mb-6">{validationError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white text-red-900 rounded hover:bg-red-100 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {showEntitiesModal && <EntityRequirementsModal />}

      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Générateur de Code Mendix</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Code de Création Mendix</h2>
              <button
                onClick={() => handleCopyCode(generatedCode, 'creation')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copySuccess === 'creation' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier le code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-gray-300 text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Code de Nettoyage Mendix</h2>
              <button
                onClick={() => handleCopyCode(cleanupCode, 'cleanup')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {copySuccess === 'cleanup' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier le code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-gray-300 text-sm">
              <code>{cleanupCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 