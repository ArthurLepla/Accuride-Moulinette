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
    console.log('[generateMendixSummary] START');
    const tStartSummary = performance.now();

    const hierarchyLevels = iihData.hierarchyData?.levels || [];
    if (!Array.isArray(hierarchyLevels) || hierarchyLevels.length === 0) {
        console.error("[generateMendixSummary] Aucun niveau hiérarchique valide trouvé.");
        // Retourner une structure vide ou gérer l'erreur
        return { totalEntities: {}, /* autres collections vides */ };
    }
    console.log('[generateMendixSummary] Hierarchy Levels:', hierarchyLevels);

    // --- MODIFICATION: Déterminer le nom et le numéro du dernier niveau ---
    let maxLevelNumber = 0;
    let maxLevelName = '';
    hierarchyLevels.forEach((level: { name: string, level: number }) => {
        if (level.level > maxLevelNumber) {
            maxLevelNumber = level.level;
            maxLevelName = level.name; // Conserver la casse originale du nom du dernier niveau
        }
    });
    console.log(`[generateMendixSummary] Dernier niveau détecté: ${maxLevelName} (Numéro: ${maxLevelNumber})`);
    // --- FIN MODIFICATION ---

    // Initialisation dynamique de totalEntities
    const initialTotalEntities: { [key: string]: number } = {
        SmartAggregation_Conso: 0,
        // Compteurs standard pour niveaux 1 à max-1
        SmartAggregation_Production_Quantite: 0,
        SmartAggregation_Production_Kg: 0,
        SmartAggregation_IPE_Quantite: 0,
        SmartAggregation_IPE_Kg: 0,
        // --- MODIFICATION: Compteurs spécifiques pour le DERNIER niveau ---
        // Utiliser le nom réel du dernier niveau
        [`SmartAggregation_Production_${maxLevelName}`]: 0, // Ex: SmartAggregation_Production_Niveau4
        [`SmartAggregation_IPE_${maxLevelName}`]: 0,      // Ex: SmartAggregation_IPE_Niveau4
        // --- FIN MODIFICATION ---
        EtatCapteur: 0
    };
    hierarchyLevels.forEach((level: { name: string }) => {
        initialTotalEntities[level.name] = 0;
    });

    // Initialisation de base avec totalEntities dynamique
    const summary: MendixEntitySummary = {
      totalEntities: initialTotalEntities,
      etatCapteurs: []
      // Les autres collections (base et agrégations) seront ajoutées dynamiquement
    };
    console.log('[generateMendixSummary] Initial Summary Structure:', JSON.stringify(summary));

    // Générer dynamiquement les collections
    hierarchyLevels.forEach((level: { name: string }) => {
      const levelNameOriginalCase = level.name;
      const levelNameLowercase = levelNameOriginalCase.toLowerCase().replace(/\\s+/g, '');
      const baseCollectionName = levelNameLowercase + 's';
      const isLastLevel = levelNameOriginalCase === maxLevelName;

      // Collection de base (ex: secteurs, ateliers, niveau4s)
      if (!summary[baseCollectionName]) {
        summary[baseCollectionName] = [];
        console.log(`[generateMendixSummary] Initialized base collection: ${baseCollectionName}`);
      }

      // Collection Conso (pour tous les niveaux)
      summary[`aggregations_conso_${levelNameLowercase}`] = [];

      // --- MODIFICATION: Collections conditionnelles pour Prod/IPE ---
      if (isLastLevel) {
          // Pour le dernier niveau, créer les collections simples
          summary[`aggregations_production_${levelNameLowercase}`] = []; // Ex: aggregations_production_niveau4
          summary[`aggregations_ipe_${levelNameLowercase}`] = [];      // Ex: aggregations_ipe_niveau4
          console.log(`[generateMendixSummary] Initialized LAST LEVEL aggregation collections for ${levelNameLowercase}: production, ipe`);
      } else {
          // Pour les niveaux intermédiaires, créer les collections qte/kg
          summary[`aggregations_production_quantite_${levelNameLowercase}`] = [];
          summary[`aggregations_production_kg_${levelNameLowercase}`] = [];
          summary[`aggregations_ipe_quantite_${levelNameLowercase}`] = [];
          summary[`aggregations_ipe_kg_${levelNameLowercase}`] = [];
           console.log(`[generateMendixSummary] Initialized INTERMEDIATE LEVEL aggregation collections for ${levelNameLowercase}: prod_qte, prod_kg, ipe_qte, ipe_kg`);
      }
      // --- FIN MODIFICATION ---

      console.log(`[generateMendixSummary] Initialized collections for level: ${levelNameLowercase}`);
    });

    // Fonction helper pour créer une entrée d'entité
    const createEntityEntry = (entityName: string, name: string, attributes: any): EntityEntry => {
        return {
            entity: `Smart.${entityName}`,
            attributes: {
                ...attributes
            }
        };
    };

    // Traiter la hiérarchie
    const processNode = (node: any, parentNodes: any[] = []) => {
      const nodeLevel = node.metadata?.level;
      if (!nodeLevel || !summary.totalEntities.hasOwnProperty(nodeLevel)) {
          console.warn(`[processNode] Node ${node.name} invalid level: ${nodeLevel}. Skipping count.`);
      } else {
          summary.totalEntities[nodeLevel]++;
      }

      const attributes: any = {};
      const isLastLevelNode = (nodeLevel === maxLevelName); // <- Utiliser maxLevelName

      if (isLastLevelNode) { // Utiliser le flag
        attributes.Identifiant = node.metadata.assetId || node.id;
        attributes.Nom = node.name;
        attributes.IPE = '0';
        attributes.TotalConso = '0';
        attributes.TypeEnergie = node.metadata.energyType || node.metadata.rawEnergyType || '';
        attributes.isElec = node.metadata.isElec ?? false;
        attributes.isGaz = node.metadata.isGaz ?? false;
        attributes.isEau = node.metadata.isEau ?? false;
        attributes.isAir = node.metadata.isAir ?? false;
      } else {
        attributes.Nom = node.name;
        attributes.TotalConso = '0';
        attributes.TotalConsoElec = '0';
        attributes.TotalConsoGaz = '0';
        attributes.TotalConsoAir = '0';
        attributes.TotalConsoEau = '0';
        attributes.isElec = node.metadata.isElec ?? false;
        attributes.isGaz = node.metadata.isGaz ?? false;
        attributes.isEau = node.metadata.isEau ?? false;
        attributes.isAir = node.metadata.isAir ?? false;
      }

      // Ajouter les références aux parents
      parentNodes.forEach(parent => {
        const parentLevelName = parent.metadata?.level;
        if(parentLevelName){
            attributes[parentLevelName] = parent.name;
        } else {
            console.warn(`[processNode] Parent node ${parent.name} (ID: ${parent.id}) is missing level information.`);
        }
      });

      // Ajouter l'entrée au niveau correspondant
      const entityEntry = createEntityEntry(nodeLevel, node.name, attributes);
      const collectionName = nodeLevel?.toLowerCase() + 's';
      if (collectionName && Array.isArray(summary[collectionName])) {
        summary[collectionName].push(entityEntry);
      } else {
        console.warn(`[processNode] Could not add to collection: '${collectionName}'.`);
      }

      // Traiter les variables en passant le nom du dernier niveau
      processVariables(node, summary, parentNodes, maxLevelName); // <- Passer maxLevelName
    };

    // Parcourir la hiérarchie et traiter chaque nœud
    const processHierarchy = (nodes: any[], links: any[]) => {
        nodes.forEach((node, index) => {
            const parents = findAllParents(node.id, nodes, links);
            processNode(node, parents);
        });
    };

    // Traiter la hiérarchie complète
    if (iihData.hierarchyData?.nodes && iihData.hierarchyData?.links) {
      processHierarchy(iihData.hierarchyData.nodes, iihData.hierarchyData.links);
    } else {
      console.warn("[generateMendixSummary] Missing nodes or links.");
    }

    const tEndSummary = performance.now();
    // console.log(`[generateMendixSummary] END. Duration: ${(tEndSummary - tStartSummary).toFixed(1)} ms. Final Summary:`, JSON.stringify(summary, null, 2)); // Replaced with targeted log below

    // Targeted Final Summary Log
    const finalCountsLog: Record<string, any> = { totalEntities: summary.totalEntities };
    Object.keys(summary).forEach(key => {
        if(Array.isArray(summary[key])) {
            finalCountsLog[`${key}_len`] = summary[key].length;
        }
    });
    console.log(`[generateMendixSummary] END. Duration: ${(tEndSummary - tStartSummary).toFixed(1)} ms. Final Counts:`, finalCountsLog);

    return summary;
  };

  const findAllParents = (nodeId: string, nodes: any[], links: any[]) => {
    const parents = [];
    let currentId = nodeId;
    let depth = 0; // Safety break

    while (true && depth < 10) { // Added depth limit
      depth++;
      const parentLink = links.find(link => link.target === currentId); // Reverted change: Use currentId
      if (!parentLink) {
        break;
      }

      const parentNode = nodes.find(node => node.id === parentLink.source);
      if (!parentNode) {
        console.warn(`[findAllParents] Parent node with ID ${parentLink.source} not found in nodes array.`);
        break; // Stop if parent node doesn't exist
      }

      parents.push(parentNode);
      currentId = parentNode.id;
    }
    if(depth >= 10) console.warn(`[findAllParents] Reached max depth limit for nodeId ${nodeId}`);

    return parents.reverse(); // Return in top-down order
  };

  const processVariables = (node: any, summary: MendixEntitySummary, parentNodes: any[], maxLevelName: string) => {
    const tStartProcessVars = performance.now();

    const rawLevel = node.metadata?.level; // Nom original du niveau (ex: "Niveau4")
    if (!rawLevel) {
        console.warn(`[processVariables] Node ${node.name} (ID: ${node.id}) has no level. Skipping.`);
        return;
    }
    const level = rawLevel.toLowerCase().replace(/\\s+/g, ''); // Nom en minuscules SANS ESPACE pour les clés (ex: "niveau4")
    const isLastLevel = (rawLevel === maxLevelName); // Comparer avec le nom du dernier niveau

    if (!summary.totalEntities.hasOwnProperty(rawLevel)) {
      console.warn(`[processVariables] Node ${node.name} unrecognized level '${rawLevel}'. Skipping.`);
      return;
    }

    // Créer dynamiquement les collections si elles n'existent pas (should already be done, but safe check)
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
        console.warn(`[processVariables] Created missing aggregation collection during processing: ${collectionName}. This should have been done earlier.`);
      }
    });
    
    // Extraire les informations des parents pour les références
    const parentInfo: Record<string, string> = {};
    parentNodes.forEach(parent => {
      const parentLevelName = parent.metadata?.level;
      if (parentLevelName) {
          parentInfo[parentLevelName] = parent.name;
      } else {
          console.warn(`[processVariables] Parent node ${parent.name} (ID: ${parent.id}) for node ${node.name} is missing level information.`);
      }
    });
    
    // Fonction d'aide pour préparer les attributs communs
    const prepareCommonAttributes = (variableName: string, variableId: string) => {
      const attrs: any = {
        VariableId: variableId,
        VariableName: variableName,
        AssetName: node.name,
        TypeEnergie: node.metadata?.energyType || node.metadata?.rawEnergyType || "Elec" // Safe access
      };
      
      attrs[rawLevel] = node.name; // Use the original case level name
      
      for (const [parentLevel, parentName] of Object.entries(parentInfo)) {
        attrs[parentLevel] = parentName; // Use the original case level name from parentInfo keys
      }
      
      return attrs;
    };
    
    // Fonction d'aide pour ajouter à une collection
    const addToCollection = (collectionName: string, entityName: string, attributes: any) => {
      console.log(`[addToCollection] Attempting to add to collection: ${collectionName}, Entity: ${entityName}`); // AJOUT DEBUG
      if (!summary[collectionName]) {
        summary[collectionName] = [];
        console.warn(`[addToCollection] Created missing collection ${collectionName} on the fly.`);
      }
      
      // AJOUT DEBUG: Log spécifique pour Prod/IPE avant le push
      if (collectionName.includes('production') || collectionName.includes('ipe')) {
        console.log(`[addToCollection] -> Preparing to PUSH Prod/IPE data to ${collectionName}:`, { entity: entityName, attributes });
      }
      
      summary[collectionName].push({
        entity: entityName,
        attributes: attributes
      });
      
      if (collectionName === 'aggregations_conso_secteur' || collectionName === 'aggregations_conso_atelier' || collectionName === 'aggregations_conso_machine') {
          console.log(`[addToCollection] Added entity '${entityName}' to collection '${collectionName}' (size: ${summary[collectionName].length})`);
      }
    };
    
    console.log(`[processVariables] Processing node: ${node.name} (Level: ${rawLevel}, IsLast: ${isLastLevel})`);

    // 1. Traiter TOUTES les variables de consommation
    const consoVars = node.metadata?.consumptionVariables;
    if (Array.isArray(consoVars) && consoVars.length > 0) {
        consoVars.forEach((consoVar: any) => {
            if (consoVar && consoVar.id && consoVar.name) {
                console.log(`[processVariables] Found consumption variable for ${node.name}: ID=${consoVar.id}, Name=${consoVar.name}, Type=${consoVar.type}`); // Log le type
                if (!summary.totalEntities.SmartAggregation_Conso) summary.totalEntities.SmartAggregation_Conso = 0;
                summary.totalEntities.SmartAggregation_Conso++;

                const aggConsoAttributes = prepareCommonAttributes(consoVar.name, consoVar.id);
                aggConsoAttributes.TypeEnergie = consoVar.type || 'Unknown';
                 if (consoVar.aggregations && typeof consoVar.aggregations === 'object') {
                     const aggs = consoVar.aggregations;
                     if (aggs['5min']?.id) aggConsoAttributes.Identifiant5Min = aggs['5min'].id;
                     if (aggs['1h']?.id) aggConsoAttributes.Identifiant1h = aggs['1h'].id;
                     if (aggs['4h']?.id) aggConsoAttributes.Identifiant4h = aggs['4h'].id;
                     if (aggs['8h']?.id) aggConsoAttributes.Identifiant8h = aggs['8h'].id;
                     if (aggs['1d']?.id) aggConsoAttributes.Identifiant1day = aggs['1d'].id;
                 }
                const collectionName = `aggregations_conso_${level}`;
                const entityName = `Smart.Aggregation_Conso_${rawLevel}`;
                addToCollection(collectionName, entityName, aggConsoAttributes);
            }
        });
    } else {
        console.log(`[processVariables] No consumption variables found for ${node.name}.`);
    }

    // 2. Traiter toutes les variables de production (logique conditionnelle basée sur isLastLevel)
    const prodVars = node.metadata?.productionVariables || [];
    prodVars.forEach((prodVar: any) => {
      if (prodVar && prodVar.id && prodVar.name) {
        const aggProdAttributes = prepareCommonAttributes(prodVar.name, prodVar.id);
        if (prodVar.aggregations && typeof prodVar.aggregations === 'object') {
          const aggs = prodVar.aggregations;
          if (aggs['5min']?.id) aggProdAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']?.id) aggProdAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']?.id) aggProdAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']?.id) aggProdAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']?.id) aggProdAttributes.Identifiant1day = aggs['1d'].id;
        }
        if (isLastLevel) {
          const entityCounterName = `SmartAggregation_Production_${rawLevel}`;
          if (!summary.totalEntities[entityCounterName]) summary.totalEntities[entityCounterName] = 0;
          summary.totalEntities[entityCounterName]++;
          const collectionName = `aggregations_production_${level}`;
          const entityName = `Smart.Aggregation_Production_${rawLevel}`;
          addToCollection(collectionName, entityName, aggProdAttributes);
        } else {
          if (!summary.totalEntities.SmartAggregation_Production_Quantite) summary.totalEntities.SmartAggregation_Production_Quantite = 0;
          summary.totalEntities.SmartAggregation_Production_Quantite++;
          const collectionName = `aggregations_production_quantite_${level}`;
          const entityName = `Smart.Aggregation_Production_quantite_${rawLevel}`;
          addToCollection(collectionName, entityName, aggProdAttributes);
        }
      }
    });

    // 3. Traiter toutes les variables de production KG (uniquement Niveaux INTERMEDIAIRES)
    const prodKgVars = node.metadata?.productionKgVariables || [];
    if (!isLastLevel) {
      prodKgVars.forEach((prodKgVar: any) => {
        if (prodKgVar && prodKgVar.id && prodKgVar.name) {
          const aggProdKgAttributes = prepareCommonAttributes(prodKgVar.name, prodKgVar.id);
          if (prodKgVar.aggregations && typeof prodKgVar.aggregations === 'object') {
            const aggs = prodKgVar.aggregations;
            if (aggs['5min']?.id) aggProdKgAttributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']?.id) aggProdKgAttributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']?.id) aggProdKgAttributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']?.id) aggProdKgAttributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']?.id) aggProdKgAttributes.Identifiant1day = aggs['1d'].id;
          }
          const collectionName = `aggregations_production_kg_${level}`;
          const entityName = `Smart.Aggregation_Production_kg_${rawLevel}`;
          addToCollection(collectionName, entityName, aggProdKgAttributes);
        }
      });
    }

    // 4. Traiter toutes les variables IPE (logique conditionnelle basée sur isLastLevel)
    const ipeVars = node.metadata?.ipeVariables || [];
    ipeVars.forEach((ipeVar: any) => {
      if (ipeVar && ipeVar.id && ipeVar.name) {
        const aggIPEAttributes = prepareCommonAttributes(ipeVar.name, ipeVar.id);
        if (ipeVar.aggregations && typeof ipeVar.aggregations === 'object') {
          const aggs = ipeVar.aggregations;
          if (aggs['5min']?.id) aggIPEAttributes.Identifiant5Min = aggs['5min'].id;
          if (aggs['1h']?.id) aggIPEAttributes.Identifiant1h = aggs['1h'].id;
          if (aggs['4h']?.id) aggIPEAttributes.Identifiant4h = aggs['4h'].id;
          if (aggs['8h']?.id) aggIPEAttributes.Identifiant8h = aggs['8h'].id;
          if (aggs['1d']?.id) aggIPEAttributes.Identifiant1day = aggs['1d'].id;
        }
        if (isLastLevel) {
          const entityCounterName = `SmartAggregation_IPE_${rawLevel}`;
          if (!summary.totalEntities[entityCounterName]) summary.totalEntities[entityCounterName] = 0;
          summary.totalEntities[entityCounterName]++;
          const collectionName = `aggregations_ipe_${level}`;
          const entityName = `Smart.Aggregation_IPE_${rawLevel}`;
          addToCollection(collectionName, entityName, aggIPEAttributes);
        } else {
          if (!summary.totalEntities.SmartAggregation_IPE_Quantite) summary.totalEntities.SmartAggregation_IPE_Quantite = 0;
          summary.totalEntities.SmartAggregation_IPE_Quantite++;
          const collectionName = `aggregations_ipe_quantite_${level}`;
          const entityName = `Smart.Aggregation_IPE_quantite_${rawLevel}`;
          addToCollection(collectionName, entityName, aggIPEAttributes);
        }
      }
    });

    // 5. Traiter toutes les variables IPE KG (uniquement Niveaux INTERMEDIAIRES)
    const ipeKgVars = node.metadata?.ipeKgVariables || [];
    if (!isLastLevel) {
      ipeKgVars.forEach((ipeKgVar: any) => {
        if (ipeKgVar && ipeKgVar.id && ipeKgVar.name) {
          const aggIPEKgAttributes = prepareCommonAttributes(ipeKgVar.name, ipeKgVar.id);
          if (ipeKgVar.aggregations && typeof ipeKgVar.aggregations === 'object') {
            const aggs = ipeKgVar.aggregations;
            if (aggs['5min']?.id) aggIPEKgAttributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']?.id) aggIPEKgAttributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']?.id) aggIPEKgAttributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']?.id) aggIPEKgAttributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']?.id) aggIPEKgAttributes.Identifiant1day = aggs['1d'].id;
          }
          const collectionName = `aggregations_ipe_kg_${level}`;
          const entityName = `Smart.Aggregation_IPE_kg_${rawLevel}`;
          addToCollection(collectionName, entityName, aggIPEKgAttributes);
        }
      });
    }

    // 6. Traiter l'état du capteur (uniquement pour le DERNIER niveau)
    const stateVar = node.metadata?.stateVariable;
    if (isLastLevel && stateVar?.variableId) { // Condition isLastLevel ajoutée
        console.log(`[processVariables] Found state variable for Last Level (${rawLevel}) ${node.name}: ID=${stateVar.variableId}`);
        if (!summary.etatCapteurs) summary.etatCapteurs = []; // Safe check
        const stateAttributes = {
            NomCapteur: node.name,
            Etat: "false", // Default to false? Or read from somewhere?
            DerniereMaj: new Date().toISOString(),
            IdEtatCapteur: stateVar.variableId
        };
        summary.etatCapteurs.push({
            entity: 'Smart.EtatCapteur',
            attributes: stateAttributes
        });
    }

    const tEndProcessVars = performance.now();
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
        // === DEBUG: Vérifier les variables BRUTES depuis localStorage ===
        // console.log("[DEBUG RAW DATA] Contenu de data.variables:", JSON.stringify(data.variables, null, 2)); // Ensure this line exists and is not commented out
        // =========================================================
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

  /**
   * Propage les types d'énergie (isElec, isGaz, isEau, isAir) du bas vers le haut dans la hiérarchie.
   * Initialise tous les flags à false, puis pour chaque machine, détecte son type d'énergie et propage les flags à tous ses parents.
   * Gère les cas multi-parent, logs détaillés, et fallback "Elec" si le type d'énergie est absent.
   * @param {object} hierarchyData - L'objet contenant nodes, links, levels
   * @returns {void} (modifie l'objet par référence)
   */
  function propagateEnergyTypes(hierarchyData: any) {
    const t0 = performance.now();
    console.info("[propagateEnergyTypes] Début de la propagation...");
    if (!hierarchyData || !hierarchyData.nodes || !hierarchyData.links) {
      console.warn("[propagateEnergyTypes] Données hiérarchiques incomplètes");
      return;
    }
    const { nodes, links, levels } = hierarchyData;
    const nodeMap = new Map();
    nodes.forEach((node: any) => {
      nodeMap.set(node.id, node);
      if (!node.metadata) node.metadata = {};
      // Initialisation (ne devrait pas supprimer stateVariable)
      node.metadata.isElec = false;
      node.metadata.isGaz = false;
      node.metadata.isEau = false;
      node.metadata.isAir = false;
    });
    // Déterminer le niveau max (dernier niveau = machines)
    const maxLevel = levels ? Math.max(...levels.map((l: any) => l.level)) : undefined;
    // Identifier les machines
    const machineNodes = nodes.filter((node: any) =>
      node.metadata?.level === "Machine" ||
      node.levelName === "Machine" ||
      (typeof node.level === 'number' && maxLevel !== undefined && node.level === maxLevel)
    );
    console.info(`[propagateEnergyTypes] ${machineNodes.length} nœuds Machine détectés (niveau ${maxLevel})`);
    let missingEnergyType = 0;
    machineNodes.forEach((node: any) => {
      // === LOG AJOUTÉ : Metadata Machine AVANT flags ===
      // console.log(`[DEBUG propagate] Machine ${node.name} - Metadata AVANT flags:`, JSON.stringify(node.metadata));
      // ==============================================
      let energyType = (node.metadata?.energyType || node.metadata?.rawEnergyType || "Elec").toLowerCase();
      if (!node.metadata?.energyType && !node.metadata?.rawEnergyType) {
        missingEnergyType++;
        console.warn(`[propagateEnergyTypes] Machine ${node.name} sans type d'énergie explicite, fallback 'Elec'`);
      }
      // Définir le flag sur la machine
      if (energyType.includes('elec')) node.metadata.isElec = true;
      if (energyType.includes('gaz')) node.metadata.isGaz = true;
      if (energyType.includes('eau')) node.metadata.isEau = true;
      if (energyType.includes('air')) node.metadata.isAir = true;
      
      // === LOG AJOUTÉ : Metadata Machine APRES flags ===
      // console.log(`[DEBUG propagate] Machine ${node.name} - Metadata APRES flags:`, JSON.stringify(node.metadata));
      // =============================================
      
      // Propagation ascendante (multi-parent)
      let currentNodeIds = [node.id];
      const visited = new Set();
      while (currentNodeIds.length > 0) {
        const nextParents: string[] = [];
        for (const currentNodeId of currentNodeIds) {
          if (visited.has(currentNodeId)) continue;
          visited.add(currentNodeId);
          const parentLinks = links.filter((link: any) => link.target === currentNodeId);
          for (const parentLink of parentLinks) {
            const parentNode = nodeMap.get(parentLink.source);
            if (!parentNode) continue;
            // === LOG AJOUTÉ : Metadata Parent AVANT propagation ===
            // console.log(`[DEBUG propagate] Parent ${parentNode.name} - Metadata AVANT:`, JSON.stringify(parentNode.metadata));
            // ==================================================
            // Propager les flags
            if (node.metadata.isElec) parentNode.metadata.isElec = true;
            if (node.metadata.isGaz) parentNode.metadata.isGaz = true;
            if (node.metadata.isEau) parentNode.metadata.isEau = true;
            if (node.metadata.isAir) parentNode.metadata.isAir = true;
            // === LOG AJOUTÉ : Metadata Parent APRES propagation ===
            // console.log(`[DEBUG propagate] Parent ${parentNode.name} - Metadata APRES:`, JSON.stringify(parentNode.metadata));
            // ==================================================
            nextParents.push(parentNode.id);
          }
        }
        currentNodeIds = nextParents;
      }
      // === LOG AJOUTÉ : Metadata Machine APRES propagation complète ===
      // console.log(`[DEBUG propagate] Machine ${node.name} - Metadata FINAL:`, JSON.stringify(node.metadata));
      // ==========================================================
    });
    // Statistiques finales
    const stats = { total: nodes.length, withElec: 0, withGaz: 0, withEau: 0, withAir: 0 };
    nodes.forEach((n: any) => {
      if (n.metadata?.isElec) stats.withElec++;
      if (n.metadata?.isGaz) stats.withGaz++;
      if (n.metadata?.isEau) stats.withEau++;
      if (n.metadata?.isAir) stats.withAir++;
    });
    const t1 = performance.now();
    console.info(`[propagateEnergyTypes] Résumé:`, stats, `| Machines sans type d'énergie: ${missingEnergyType}`);
    console.info(`[propagateEnergyTypes] Terminé en ${(t1-t0).toFixed(1)} ms`);
  }

  const handleValidateAndGenerate = async () => {
    if (!requiredEntities.length) return;
    try {
      setIsValidating(true);
      const iihStructure = localStorage.getItem('iihStructure');
      if (!iihStructure) return;
      const data = JSON.parse(iihStructure);
      // === DEBUG: Vérifier les variables BRUTES depuis localStorage ===
      // console.log("[DEBUG RAW DATA] Contenu de data.variables:", JSON.stringify(data.variables, null, 2));
      // =========================================================
      const hierarchyLevels = data.hierarchyData.levels;
      console.log("[DEBUG] Data from localStorage:", JSON.stringify(data, null, 2));
      console.log("[DEBUG] Hierarchy levels:", JSON.stringify(hierarchyLevels, null, 2));
      // Analyser et fixer les données avant de générer le code Mendix
      const fixedData = associateVariablesToNodes(data);
      console.log("[DEBUG] Données après association des variables:", fixedData);

      // === DEBUG AGGREGATIONS: Check AFTER associateVariablesToNodes ===
      // Chercher un nœud qui *devrait* avoir des agrégations (on prend le premier trouvé avec une variable conso/prod/etc.)
      const nodeCheckAfterAssoc = fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.variable?.aggregations && Object.keys(n.metadata.variable.aggregations).length > 0);
      if (nodeCheckAfterAssoc) {
          // console.log(`[DEBUG AGGS - AFTER ASSOC] Node ${nodeCheckAfterAssoc.name} aggregations (variable):`, JSON.stringify(nodeCheckAfterAssoc.metadata.variable.aggregations));
      } else {
          // Essayer avec un autre type si variable n'a pas été trouvé
          const nodeCheckAlt = fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.productionKgVariable?.aggregations && Object.keys(n.metadata.productionKgVariable.aggregations).length > 0);
           if (nodeCheckAlt) {
               // console.log(`[DEBUG AGGS - AFTER ASSOC] Node ${nodeCheckAlt.name} aggregations (prodKg):`, JSON.stringify(nodeCheckAlt.metadata.productionKgVariable.aggregations));
           } else {
              // console.log("[DEBUG AGGS - AFTER ASSOC] Aucun nœud trouvé avec des agrégations pour vérification.");
           }
      }
      const refNodeId = nodeCheckAfterAssoc?.id || fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.productionKgVariable?.aggregations && Object.keys(n.metadata.productionKgVariable.aggregations).length > 0)?.id;
      // =============================================================

      propagateEnergyTypes(fixedData.hierarchyData); // Appel de la fonction suspecte

      // === DEBUG AGGREGATIONS: Check AFTER propagateEnergyTypes ===
      const nodeToCheckAgain = refNodeId ? fixedData.hierarchyData?.nodes.find((n: any) => n.id === refNodeId) : null;
      if (nodeToCheckAgain) {
          // console.log(`[DEBUG AGGS - AFTER PROPAGATE] Node ${nodeToCheckAgain.name} metadata.variable.aggregations:`, JSON.stringify(nodeToCheckAgain.metadata?.variable?.aggregations));
          // console.log(`[DEBUG AGGS - AFTER PROPAGATE] Node ${nodeToCheckAgain.name} metadata.productionKgVariable.aggregations:`, JSON.stringify(nodeToCheckAgain.metadata?.productionKgVariable?.aggregations));
          // Ajouter d'autres types si nécessaire
      } else {
           // console.log("[DEBUG AGGS - AFTER PROPAGATE] Aucun nœud de référence trouvé pour vérifier les agrégations.");
      }
      // ============================================================

      await validateMendixEntities(requiredEntities);
      const mendixSummary = generateMendixSummary(fixedData);

      // === AJOUT DEBUG: Vérifier le contenu FINAL de mendixSummary AVANT génération ===
      // console.log("[DEBUG PAGE - FINAL SUMMARY CHECK] Contenu COMPLET de mendixSummary:", JSON.stringify(mendixSummary, null, 2)); // Keep commented unless needed

      // === AJOUT DEBUG: Log Spécifique pour Contenu Aggregations LMAX ===
      const lastLevelInfo = hierarchyLevels.find((l: any) => l.level === Math.max(...hierarchyLevels.map((h: any) => h.level)));
      if (lastLevelInfo) {
          const lastLevelNameLower = lastLevelInfo.name.toLowerCase().replace(/\\s+/g, '');
          const prodKey = `aggregations_production_${lastLevelNameLower}`;
          const ipeKey = `aggregations_ipe_${lastLevelNameLower}`;
          // console.log(`[DEBUG PAGE - LMAX CONTENT CHECK] Summary content for key "${prodKey}":`, JSON.stringify(mendixSummary[prodKey], null, 2));
          // console.log(`[DEBUG PAGE - LMAX CONTENT CHECK] Summary content for key "${ipeKey}":`, JSON.stringify(mendixSummary[ipeKey], null, 2));
      } else {
          // console.warn("[DEBUG PAGE - LMAX CONTENT CHECK] Could not determine last level name to check summary content.");
      }
      // =======================================================================

      // === AJOUT DEBUG: Vérifier le contenu FINAL de mendixSummary AVANT génération ===
      console.log("[DEBUG PAGE - FINAL SUMMARY CHECK] Contenu COMPLET de mendixSummary:", JSON.stringify(mendixSummary, null, 2));
      // ==========================================================================

      console.log("[DEBUG SUMMARY CHECK] Contenu détaillé des agrégations AVANT génération code:");
      Object.keys(mendixSummary).forEach(key => {
        // Se concentrer sur les clés contenant "aggregations_"
        if (key.startsWith('aggregations_')) {
          // console.log(`[DEBUG SUMMARY CHECK] ${key}:`, JSON.stringify(mendixSummary[key], null, 2));
        }
      });
      // ==========================================================

      setMendixSummary(mendixSummary);
      
      // === ANCIEN LOG (gardé pour comparaison si besoin) ===
      // const machineNodeForGen = fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.level === 'Machine');
      // if (machineNodeForGen) {
      //   console.log("[DEBUG PAGE - PRE-GEN] Node Machine stateVariable:", 
      //     JSON.stringify(machineNodeForGen.metadata?.stateVariable));
      // } else {
      //   console.log("[DEBUG PAGE - PRE-GEN] Aucun nœud Machine trouvé pour vérification finale.");
      // }
      // =======================================================
      
      const generatedCode = generateDynamicMendixCode(hierarchyLevels, mendixSummary);
      // === AJOUT DEBUG: Logguer le code Mendix généré COMPLET ===
      // console.log("[DEBUG PAGE - GENERATED MENDIX CODE]", generatedCode);
      // =======================================================
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

  // Fonction pour nettoyer un nom de nœud pour la correspondance
  const sanitizeNodeNameForMatch = (nodeName: string): string => {
    if (!nodeName) return '';
    // Logique simple : remplacer espaces et caractères spéciaux par underscore, et passer en minuscules
    // À adapter si les conventions de nommage sont différentes
    return nodeName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };
  
  // Fonction pour extraire le nom du nœud à partir du nom de la variable IIH
  const extractNodeNameFromVarName = (varName: string): string | null => {
    // console.log(`[DEBUG extractNodeName START] Attempting extraction for: "${varName}"`); // START Log
    if (!varName) return null;
    const nameLower = varName.toLowerCase();
    // Ordre IMPORTANT: Vérifier les préfixes longs/spécifiques (_kg) avant les courts (production_, ipe_)
    const prefixes = ['consommation_', 'etat_capteur_', 'production_kg_', 'ipe_kg_', 'production_', 'ipe_'];
    for (const prefix of prefixes) {
      const starts = nameLower.startsWith(prefix);
      // console.log(`[DEBUG extractNodeName] Test prefix "${prefix}": ${starts}`); // Keep this commented unless extreme detail needed
      if (starts) {
        const extracted = varName.substring(prefix.length);
        // Nettoyer les types d'énergie potentiels (pour conso)
        const cleanExtracted = extracted.replace(/^(électricité|elec|gaz|eau|air)_/i, '');
        // *** IMPORTANT: Ne PAS nettoyer les suffixes _quantite ou _kg ici ***
        //     Car la logique d'association doit pouvoir les distinguer.
        //     Le nettoyage final pour obtenir le nom de base se fait avec sanitizeNodeNameForMatch.
        const finalNameForMatch = sanitizeNodeNameForMatch(cleanExtracted); // Nettoie espaces, caractères spéciaux, etc. MAIS PAS _quantite/_kg
        // console.log(`[DEBUG extractNodeName] Success! Prefix="${prefix}", Extracted="${extracted}", CleanedEnergy="${cleanExtracted}", FinalForMatch="${finalNameForMatch}"`); // Keep commented
        // console.log(`[DEBUG extractNodeName RETURN] Var: "${varName}", Prefix: "${prefix}", RETURN KEY: "${finalNameForMatch}"`); // FINAL RETURN Log
        return finalNameForMatch; // Retourne le nom nettoyé pour le MATCHING
      }
    }
    // console.warn(`[DEBUG extractNodeName FAIL] Var: "${varName}", No prefix found. Returning null.`); // FAIL Log
    return null;
  };
  
  // Fonction pour associer les variables aux nœuds de la hiérarchie (NOUVELLE VERSION par NOM)
  const associateVariablesToNodes = (data: any) => {
       // console.log("****** ASSOCIATE VARIABLES TO NODES CALLED ******");
       const t0 = performance.now();
       const fixedData = JSON.parse(JSON.stringify(data));

       // Vérification #1: Les variables existent-elles ?
       if (!fixedData.variables || !Array.isArray(fixedData.variables) || fixedData.variables.length === 0) {
          // console.warn("****** ASSOCIATE VARIABLES TO NODES: fixedData.variables est vide ou invalide. Sortie anticipée. ******", fixedData.variables); // LOG AJOUTÉ
          return fixedData; /* Sortie anticipée */
       }
       // Vérification #2: Les nœuds existent-ils ?
       if (!fixedData.hierarchyData?.nodes || !Array.isArray(fixedData.hierarchyData.nodes) || fixedData.hierarchyData.nodes.length === 0) {
          // console.warn("****** ASSOCIATE VARIABLES TO NODES: fixedData.hierarchyData.nodes est vide ou invalide. Sortie anticipée. ******", fixedData.hierarchyData?.nodes); // LOG AJOUTÉ
          return fixedData; /* Sortie anticipée */
       }

       // LOG AJOUTÉ: Si on passe les vérifications, afficher le nombre d'éléments
       // console.log(`****** ASSOCIATE VARIABLES TO NODES: Données valides. Nb Variables: ${fixedData.variables.length}, Nb Noeuds: ${fixedData.hierarchyData.nodes.length} ******`);

       // console.log("[DEBUG associateVariablesToNodes] Start association..."); // Ce log devrait maintenant apparaître si les données sont valides

       const variablesByExtractedName = new Map<string, any[]>();
       if (fixedData.variables) {
           fixedData.variables.forEach((variable: any) => {
             const originalVarName = variable.variableName;
             // IMPORTANT: extractNodeNameFromVarName retourne maintenant le nom nettoyé *pour le matching*,
             //            il peut encore contenir _quantite ou _kg si présents.
             const extractedNameForMatch = extractNodeNameFromVarName(originalVarName);
             if (extractedNameForMatch) {
               if (!variablesByExtractedName.has(extractedNameForMatch)) {
                 variablesByExtractedName.set(extractedNameForMatch, []);
               }
               variablesByExtractedName.get(extractedNameForMatch)!.push(variable); // Stocker la variable entière
             }
           });
       }
       // console.log(`[DEBUG associateVariablesToNodes] ${variablesByExtractedName.size} unique extracted names mapped.`);

       let nodesMatched = 0;
       let lastLevelNodesProcessed = 0; // Counter for last level nodes
       const hierarchyLevels = fixedData.hierarchyData.levels || [];
       let maxLevelNumber = 0;
       hierarchyLevels.forEach((level: { level: number }) => {
           if (level.level > maxLevelNumber) maxLevelNumber = level.level;
       });


       fixedData.hierarchyData.nodes.forEach((node: any) => {
         if (!node.metadata) node.metadata = {};
         const sanitizedNodeName = sanitizeNodeNameForMatch(node.name);
         const nodeLevelNum = node.metadata.levelNum || node.level; // Get node level
         const isLastLevelNode = nodeLevelNum === maxLevelNumber;

         if (isLastLevelNode) {
             lastLevelNodesProcessed++;
             // console.log(`[DEBUG associateVariablesToNodes LOOKUP - LAST LEVEL] Node: "${node.name}", Sanitized Key: "${sanitizedNodeName}"`); // LOOKUP log for LAST LEVEL
         } else {
              // Optional: Log for other levels if needed, but keep it less verbose
              // console.log(`[DEBUG associateVariablesToNodes LOOKUP] Node: "${node.name}" (Level ${nodeLevelNum}), Sanitized Key: "${sanitizedNodeName}"`);
         }

         const matchingVariables = variablesByExtractedName.get(sanitizedNodeName) || [];

         if (matchingVariables.length > 0) {
           nodesMatched++;
           node.metadata.consumptionVariables = []; // Initialiser

           // Log the match
           if (isLastLevelNode) {
               // console.log(`[DEBUG associateVariablesToNodes MATCH - LAST LEVEL] Node: "${node.name}", Key: "${sanitizedNodeName}", Found Vars: [${matchingVariables.map((v: any) => v.variableName).join(', ')}]`); // MATCH log for LAST LEVEL
           } else {
               // Optional: Log matches for other levels
               // console.log(`[DEBUG associateVariablesToNodes MATCH] Node: "${node.name}" (Level ${nodeLevelNum}), Key: "${sanitizedNodeName}", Found Vars: [${matchingVariables.map((v: any) => v.variableName).join(', ')}]`);
           }


           matchingVariables.forEach((variable: any) => {
             const variableNameLower = variable.variableName?.toLowerCase() || '';
             const variableId = variable.id || variable.variableId || '';
             const variableName = variable.variableName || '';
             const formattedAggs = formatAggregations(variable.metadata?.aggregations);

             if (variableNameLower.startsWith('production_kg_')) {
               if (!node.metadata.productionKgVariables) node.metadata.productionKgVariables = [];
               node.metadata.productionKgVariables.push({ id: variableId, name: variableName, aggregations: formattedAggs });
             } else if (variableNameLower.startsWith('ipe_kg_')) {
               if (!node.metadata.ipeKgVariables) node.metadata.ipeKgVariables = [];
               node.metadata.ipeKgVariables.push({ id: variableId, name: variableName, aggregations: formattedAggs });
             } else if (variableNameLower.startsWith('consommation_')) {
               const energyTypeMatch = variableNameLower.match(/^consommation_(elec|électricité|gaz|eau|air)_/);
               node.metadata.consumptionVariables.push({
                 id: variableId,
                 name: variableName,
                 aggregations: formattedAggs,
                 type: energyTypeMatch ? (energyTypeMatch[1] === 'électricité' ? 'Elec' : energyTypeMatch[1].charAt(0).toUpperCase() + energyTypeMatch[1].slice(1)) : 'Unknown'
               });
             } else if (variableNameLower.startsWith('production_')) {
               if (!node.metadata.productionVariables) node.metadata.productionVariables = [];
               node.metadata.productionVariables.push({ id: variableId, name: variableName, aggregations: formattedAggs });
             } else if (variableNameLower.startsWith('ipe_')) {
               if (!node.metadata.ipeVariables) node.metadata.ipeVariables = [];
               node.metadata.ipeVariables.push({ id: variableId, name: variableName, aggregations: formattedAggs });
             } else if (variableNameLower.startsWith('etat_capteur_')) {
               node.metadata.stateVariable = { variableId: variableId, name: variableName };
             }
           });
         } else if (isLastLevelNode) {
             // Log if no variables are found for a last level node
             // console.warn(`[DEBUG associateVariablesToNodes NO MATCH - LAST LEVEL] Node: "${node.name}", Key: "${sanitizedNodeName}" - No variables found.`);
         }
       });
       const t1 = performance.now();
       // console.info(`[associateVariablesToNodes] Association done in ${(t1 - t0).toFixed(1)} ms. ${nodesMatched} nodes matched. ${lastLevelNodesProcessed} last level nodes processed.`);
       return fixedData;
   };

  // Fonction auxiliaire pour formater les agrégations
  const formatAggregations = (aggregations: any) => {
    if (!aggregations || typeof aggregations !== 'object') return {}; // Retourner objet vide si null, undefined ou pas un objet
    
    // Log - Peut être réduit/supprimé en production
    // console.log(`[DEBUG formatAggregations] Structure d'agrégation brute reçue:`, JSON.stringify(aggregations));
    
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
           // console.warn(`[DEBUG formatAggregations] ID d'agrégation non trouvé pour la clé ${key} dans l'objet:`, agg);
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
      // console.warn("[DEBUG formatAggregations] Structure d'agrégation en tableau détectée - traitement...");
      aggregations.forEach((agg: any) => {
        if (agg && typeof agg === 'object') {
          let cycleKey = '';
          let aggId = agg.id || agg.variableId || null;
          let aggCycle = agg.cycle;
          let aggType = agg.type || 'Sum';

          if (!aggId) {
             // console.warn("[DEBUG formatAggregations] Élément de tableau sans ID:", agg);
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
             // console.warn(`[DEBUG formatAggregations] Impossible de déterminer cycleKey pour l'élément de tableau:`, agg);
          }
        }
      });
    }
    
    if (Object.keys(formatted).length > 0) {
      // console.log('[DEBUG formatAggregations] Identifiants d\'agrégation formatés:', formatted);
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
            <a
              href="/mendix-generator/migrate"
              className="ml-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-base"
            >
              Migration ancien code
            </a>
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