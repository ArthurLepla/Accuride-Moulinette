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
    console.log('[generateMendixSummary] START', JSON.stringify(iihData, null, 2));
    const tStartSummary = performance.now();
    
    // Récupérer les niveaux hiérarchiques à partir des données
    const hierarchyLevels = iihData.hierarchyData?.levels || [];
    if (!Array.isArray(hierarchyLevels) || hierarchyLevels.length === 0) {
        console.error("[generateMendixSummary] Aucun niveau hiérarchique valide trouvé dans iihData.hierarchyData.levels");
        // Retourner une structure vide ou lancer une erreur ? Pour l'instant, on continue avec une structure vide.
    }
    console.log('[generateMendixSummary] Hierarchy Levels:', hierarchyLevels);
    
    // === MODIFICATION : Initialisation dynamique de totalEntities ===
    const initialTotalEntities: { [key: string]: number } = {
        // Garder les compteurs spécifiques aux agrégations et EtatCapteur
        SmartAggregation_Conso: 0,
        SmartAggregation_Production_Quantite: 0,
        SmartAggregation_Production_Kg: 0,
        SmartAggregation_IPE_Quantite: 0,
        SmartAggregation_IPE_Kg: 0,
        EtatCapteur: 0
    };
    hierarchyLevels.forEach((level: { name: string }) => {
        // Utiliser le nom de niveau tel qu'il est (respecter la casse, ex: "ETH", "Secteur")
        initialTotalEntities[level.name] = 0;
    });
    // =============================================================

    // Initialisation de base avec totalEntities dynamique
    const summary: MendixEntitySummary = {
      totalEntities: initialTotalEntities, // Utiliser l'objet dynamique
      secteurs: [],
      ateliers: [],
      lignes: [],
      postes: [],
      machines: [],
      etatCapteurs: []
      // Les autres tableaux (ex: usines, eths) seront créés dynamiquement ci-dessous si nécessaire
    };
    console.log('[generateMendixSummary] Initial Summary Structure (with Dynamic totalEntities):', JSON.stringify(summary));
    
    // Générer dynamiquement les collections d'agrégation ET les collections de base pour chaque niveau
    hierarchyLevels.forEach((level: { name: string }) => {
      // Utiliser le nom de niveau tel qu'il est pour les vérifications,
      // mais le nom en minuscules pour les clés des tableaux (convention actuelle)
      const levelNameOriginalCase = level.name;
      const levelNameLowercase = levelNameOriginalCase.toLowerCase();
      const baseCollectionName = levelNameLowercase + 's'; // Exemple: "ETH" -> "eths", "Secteur" -> "secteurs"

      // S'assurer que la collection de base existe dans summary (ex: summary.eths, summary.secteurs)
      if (!summary[baseCollectionName]) {
        summary[baseCollectionName] = [];
        console.log(`[generateMendixSummary] Initialized base collection: ${baseCollectionName}`);
      }

      // Créer dynamiquement les collections d'agrégation pour ce niveau (utilise le nom en minuscules)
      summary[`aggregations_conso_${levelNameLowercase}`] = [];
      summary[`aggregations_production_quantite_${levelNameLowercase}`] = [];
      summary[`aggregations_production_kg_${levelNameLowercase}`] = [];
      summary[`aggregations_ipe_quantite_${levelNameLowercase}`] = [];
      summary[`aggregations_ipe_kg_${levelNameLowercase}`] = [];
      console.log(`[generateMendixSummary] Initialized aggregation collections for level: ${levelNameLowercase}`);
    });

    // LOG: Verify that all arrays are initialized correctly
    // console.log("[generateMendixSummary] Verifying array initialization after dynamic creation:");
    // Parcourir toutes les propriétés du summary
    // Object.keys(summary).forEach(key => {
    //   if (key !== 'totalEntities') {
    //     console.log(`[generateMendixSummary]   ${key} is ${Array.isArray(summary[key]) ? 'array' : typeof summary[key]}`);
    //   }
    // });

    // Fonction helper pour créer une entrée d'entité
    const createEntityEntry = (entityName: string, name: string, attributes: any): EntityEntry => {
        // console.log(`[createEntityEntry] Creating entity: Smart.${entityName} for name: ${name}`); // Reduced log verbosity
        return {
            entity: `Smart.${entityName}`,
            attributes: {
                ...attributes
            }
        };
    };

    // Traiter la hiérarchie
    const processNode = (node: any, parentNodes: any[] = []) => {
      // console.log(`[processNode] Processing node: ${node.name} (ID: ${node.id}, Level: ${node.metadata?.level})`); // Reduced log verbosity
      const nodeLevel = node.metadata?.level; // Garde la casse originale (ex: "ETH")
      if (!nodeLevel || !summary.totalEntities.hasOwnProperty(nodeLevel)) { // Vérifie avec la casse originale
          console.warn(`[processNode] Node ${node.name} has invalid or missing level: ${nodeLevel}. Skipping level count increment.`);
      } else {
          summary.totalEntities[nodeLevel]++; // Incrémente avec la casse originale
      }

      // Créer les attributs de base
      const attributes: any = {};
      // console.log(`[processNode] Initializing attributes for ${node.name}`); // Reduced log verbosity
      
      // Attributs différents selon le niveau
      if (nodeLevel === 'Machine') {
        attributes.Identifiant = node.metadata.assetId || node.id;
        attributes.Nom = node.name;
        attributes.IPE = '0';
        attributes.TotalConso = '0';
        attributes.TypeEnergie = node.metadata.energyType || node.metadata.rawEnergyType || '';
        attributes.isElec = node.metadata.isElec ?? false;
        attributes.isGaz = node.metadata.isGaz ?? false;
        attributes.isEau = node.metadata.isEau ?? false;
        attributes.isAir = node.metadata.isAir ?? false;
        // console.log(`[processNode] Machine attributes initialized for ${node.name}:`, attributes); // Reduced log verbosity
      } else {
        // Pour les niveaux autres que Machine
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
        // console.log(`[processNode] Non-Machine attributes initialized for ${node.name}:`, attributes); // Reduced log verbosity
      }

      // Ajouter les références aux parents
      parentNodes.forEach(parent => {
        const parentLevelName = parent.metadata?.level;
        if(parentLevelName){
            attributes[parentLevelName] = parent.name;
            // console.log(`[processNode] Added parent reference: ${parentLevelName}=${parent.name} to ${node.name}`); // Reduced log verbosity
        } else {
            console.warn(`[processNode] Parent node ${parent.name} (ID: ${parent.id}) is missing level information.`);
        }
      });

      // Ajouter l'entrée au niveau correspondant
      const entityEntry = createEntityEntry(nodeLevel, node.name, attributes);
      const collectionName = nodeLevel?.toLowerCase() + 's'; // Accède au tableau avec minuscules + 's'
      
      if (collectionName && Array.isArray(summary[collectionName])) {
        summary[collectionName].push(entityEntry);
        // console.log(`[processNode] Added entity entry for ${node.name} to collection '${collectionName}'.`); // Reduced log verbosity
      } else {
        console.warn(`[processNode] Could not add entity entry for ${node.name}. Invalid or non-array collection: '${collectionName}'. Summary keys:`, Object.keys(summary));
      }

      // Traiter les variables
      // console.log(`[processNode] Calling processVariables for node: ${node.name}`); // Reduced log verbosity
      processVariables(node, summary, parentNodes);
      // console.log(`[processNode] Finished processing node: ${node.name}`); // Reduced log verbosity
    };

    // Parcourir la hiérarchie et traiter chaque nœud
    const processHierarchy = (nodes: any[], links: any[]) => {
        // console.log(`[processHierarchy] Starting processing for ${nodes.length} nodes and ${links.length} links.`); // Reduced log verbosity
        nodes.forEach((node, index) => {
            // console.log(`[processHierarchy] Finding parents for node ${index + 1}/${nodes.length}: ${node.name} (ID: ${node.id})`); // Reduced log verbosity
            const parents = findAllParents(node.id, nodes, links);
            // console.log(`[processHierarchy] Found ${parents.length} parents for ${node.name}:`, parents.map(p => ({name: p.name, level: p.metadata?.level}))); // Reduced log verbosity
            processNode(node, parents);
        });
        // console.log(`[processHierarchy] Finished processing all nodes.`); // Reduced log verbosity
    };

    // Traiter la hiérarchie complète
    if (iihData.hierarchyData?.nodes && iihData.hierarchyData?.links) {
      processHierarchy(iihData.hierarchyData.nodes, iihData.hierarchyData.links);
    } else {
      console.warn("[generateMendixSummary] Missing nodes or links in hierarchyData. Skipping hierarchy processing.");
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
    // console.log(`[findAllParents] Searching parents for nodeId: ${nodeId}`); // Reduced log verbosity
    const parents = [];
    let currentId = nodeId;
    let depth = 0; // Safety break

    while (true && depth < 10) { // Added depth limit
      depth++;
      const parentLink = links.find(link => link.target === currentId); // Reverted change: Use currentId
      if (!parentLink) {
        // console.log(`[findAllParents] No more parent links found for ${currentId}.`); // Reduced log verbosity
        break;
      }
      // console.log(`[findAllParents] Found link: ${parentLink.source} -> ${parentLink.target}`); // Reduced log verbosity

      const parentNode = nodes.find(node => node.id === parentLink.source);
      if (!parentNode) {
        console.warn(`[findAllParents] Parent node with ID ${parentLink.source} not found in nodes array.`);
        break; // Stop if parent node doesn't exist
      }
      // console.log(`[findAllParents] Found parent node: ${parentNode.name} (ID: ${parentNode.id})`); // Reduced log verbosity

      parents.push(parentNode);
      currentId = parentNode.id;
    }
    if(depth >= 10) console.warn(`[findAllParents] Reached max depth limit for nodeId ${nodeId}`);

    // console.log(`[findAllParents] Found ${parents.length} parents for ${nodeId}.`); // Reduced log verbosity
    return parents.reverse(); // Return in top-down order
  };

  const processVariables = (node: any, summary: MendixEntitySummary, parentNodes: any[]) => {
    // console.log(`[processVariables] START processing variables for node: ${node.name} (ID: ${node.id})`); // Reduced log verbosity
    const tStartProcessVars = performance.now();

    // Normalisation du nom de niveau pour éviter les problèmes de casse
    const rawLevel = node.metadata?.level;
    if (!rawLevel) {
        console.warn(`[processVariables] Node ${node.name} (ID: ${node.id}) has no level defined in metadata. Skipping variable processing.`);
        return;
    }
    const level = rawLevel.toLowerCase();
    // console.log(`[processVariables] Node: ${node.name}, Raw Level: ${rawLevel}, Lowercase Level: ${level}`); // Reduced log verbosity
    
    // Vérifier si le nœud a un niveau reconnu (check if rawLevel exists as a key in totalEntities)
    if (!summary.totalEntities.hasOwnProperty(rawLevel)) {
      console.warn(`[processVariables] Node ${node.name} has unrecognized level '${rawLevel}'. Skipping.`);
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
          // Pas besoin de capitaliser, on utilise le nom exact du niveau
          // const parentLevelCapitalized = parentLevel.charAt(0).toUpperCase() + parentLevel.slice(1);
          // parentInfo[parentLevelCapitalized] = parent.name;
      } else {
          console.warn(`[processVariables] Parent node ${parent.name} (ID: ${parent.id}) for node ${node.name} is missing level information.`);
      }
    });
    
    // DEBUG: Log parent info
    // console.log(`[processVariables] Parent info for ${node.name}:`, parentInfo); // Reduced log verbosity
    
    // Fonction d'aide pour préparer les attributs communs
    const prepareCommonAttributes = (variableName: string, variableId: string) => {
      // console.log(`[prepareCommonAttributes] Preparing attributes for VarName: ${variableName}, VarID: ${variableId}, Node: ${node.name}`); // Reduced log verbosity
      const attrs: any = {
        VariableId: variableId,
        VariableName: variableName,
        AssetName: node.name,
        TypeEnergie: node.metadata?.energyType || node.metadata?.rawEnergyType || "Elec" // Safe access
      };
      // console.log(`[prepareCommonAttributes] Initial common attributes:`, attrs); // Reduced log verbosity
      
      // Ajouter la référence au niveau courant
      attrs[rawLevel] = node.name; // Use the original case level name
      // console.log(`[prepareCommonAttributes] Added current level ref: ${rawLevel}=${node.name}`); // Reduced log verbosity
      
      // Ajouter les références aux parents
      for (const [parentLevel, parentName] of Object.entries(parentInfo)) {
        attrs[parentLevel] = parentName; // Use the original case level name from parentInfo keys
        // console.log(`[prepareCommonAttributes] Added parent ref: ${parentLevel}=${parentName}`); // Reduced log verbosity
      }
      
      // console.log(`[prepareCommonAttributes] Final common attributes for ${variableName}:`, attrs); // Reduced log verbosity
      return attrs;
    };
    
    // Fonction d'aide pour ajouter à une collection
    const addToCollection = (collectionName: string, entityName: string, attributes: any) => {
      console.log(`[addToCollection] Attempting to add to collection: ${collectionName}, Entity: ${entityName}`); // AJOUT DEBUG
      // console.log(`[addToCollection] Attempting to add to collection: ${collectionName}, Entity: ${entityName}`); // Reduced log verbosity
      if (!summary[collectionName]) {
        summary[collectionName] = [];
        console.warn(`[addToCollection] Created missing collection ${collectionName} on the fly.`);
      }
      
      // AJOUT DEBUG: Log spécifique pour Prod/IPE avant le push
      if (collectionName.includes('production') || collectionName.includes('ipe')) {
        console.log(`[addToCollection] -> Preparing to PUSH Prod/IPE data to ${collectionName}:`, { entity: entityName, attributes });
      }
      // FIN AJOUT DEBUG
      
      // console.log(`[addToCollection] Attributes being added:`, JSON.stringify(attributes)); // Replaced by targeted log in processVariables
      summary[collectionName].push({
        entity: entityName,
        attributes: attributes
      });
      
      // Targeted Log on Success
      if (collectionName === 'aggregations_conso_secteur' || collectionName === 'aggregations_conso_atelier' || collectionName === 'aggregations_conso_machine') {
          console.log(`[addToCollection] Added entity '${entityName}' to collection '${collectionName}' (size: ${summary[collectionName].length})`);
      }
      // console.log(`[addToCollection] Successfully added to ${collectionName} for node ${node.name}. Current collection size: ${summary[collectionName].length}`); // Reduced log verbosity
    };
    
    // 1. Traiter LES variables de consommation
    const consoVars = node.metadata?.consumptionVariables; // Lire le tableau

    if (Array.isArray(consoVars) && consoVars.length > 0) { // Vérifier si c'est un tableau non vide
        consoVars.forEach((consoVar: any) => { // Itérer sur chaque variable de consommation trouvée
            if (consoVar && consoVar.id && consoVar.name) { // Vérifier chaque variable individuellement
                console.log(`[processVariables] Found consumption variable for ${node.name}: ID=${consoVar.id}, Name=${consoVar.name}, Type=${consoVar.type}`); // Log le type
                if (!summary.totalEntities.SmartAggregation_Conso) summary.totalEntities.SmartAggregation_Conso = 0;
                summary.totalEntities.SmartAggregation_Conso++;

                // Utiliser le nom et l'ID de la variable courante
                const aggConsoAttributes = prepareCommonAttributes(consoVar.name, consoVar.id);

                // === MODIFICATION : Surcharger TypeEnergie avec celui de la variable ===
                aggConsoAttributes.TypeEnergie = consoVar.type || 'Unknown'; // Utilise le type stocké lors de l'association
                // =====================================================================

                console.log(`[processVariables] IMMEDIATELY AFTER prepareCommonAttributes for ${node.name} (Overriding TypeEnergie with ${aggConsoAttributes.TypeEnergie}): VarID='${aggConsoAttributes.VariableId}', VarName='${aggConsoAttributes.VariableName}'`); // Log la valeur surchargée

                if (consoVar.aggregations && typeof consoVar.aggregations === 'object') {
                    const aggs = consoVar.aggregations;
                    if (aggs['5min']?.id) aggConsoAttributes.Identifiant5Min = aggs['5min'].id;
                    if (aggs['1h']?.id) aggConsoAttributes.Identifiant1h = aggs['1h'].id;
                    if (aggs['4h']?.id) aggConsoAttributes.Identifiant4h = aggs['4h'].id;
                    if (aggs['8h']?.id) aggConsoAttributes.Identifiant8h = aggs['8h'].id;
                    if (aggs['1d']?.id) aggConsoAttributes.Identifiant1day = aggs['1d'].id;
                }

                const collectionName = `aggregations_conso_${level}`; // Correction: Utiliser levelLowercase (variable déjà définie)
                const entityName = `Smart.Aggregation_Conso_${rawLevel}`; // Correction: Utiliser nodeLevel (variable déjà définie)
                console.log(`[processVariables] Preparing to add to '${collectionName}': Entity='${entityName}', VarID='${aggConsoAttributes.VariableId}', VarName='${aggConsoAttributes.VariableName}', TypeEnergie='${aggConsoAttributes.TypeEnergie}'`); // Logguer le type d'énergie final
                addToCollection(collectionName, entityName, aggConsoAttributes);
            } else {
              // Le warning existant pour le check raté peut rester ici, il s'appliquera si une variable dans le tableau est invalide
              console.warn(`[processVariables] Skipping one consumption variable processing for node ${node.name} (Level: ${rawLevel}). Reason: Check 'consoVar && consoVar.id && consoVar.name' failed for this item.`, { consoVarExists: !!consoVar, idExists: !!consoVar?.id, nameExists: !!consoVar?.name });
            }
        }); // Fin de la boucle forEach sur consoVars
    } else {
      // Ce cas se produit si aucune variable de consommation n'a été trouvée pour le nœud
      console.log(`[processVariables] No consumption variables found in metadata for node ${node.name} (Level: ${rawLevel}).`);
    }

    // Ne traiter les variables de production et IPE que pour les niveaux autres que Machine
    if (level !== 'machine') {
      console.log(`[processVariables] Node ${node.name} (Level: ${level}) is NOT a Machine. Processing Prod/IPE variables.`); // AJOUT LOG
      // console.log(`[processVariables] Node ${node.name} is not a Machine, processing Prod/IPE variables.`); // Reduced log verbosity
      // 2. Traiter la variable de production (quantité)
      const prodVar = node.metadata?.productionVariable;
      // === AJOUT LOG: Vérifier si prodVar existe ===
      console.log(`[processVariables] Checking prodVar for ${node.name}:`, prodVar ? `Found (ID: ${prodVar.id}, Name: ${prodVar.name})` : 'Not Found');
      // =========================================
      if (prodVar && prodVar.id && prodVar.name) {
        console.log(`[processVariables] Found production quantity variable for ${node.name}: ID=${prodVar.id}, Name=${prodVar.name}`);
        if (!summary.totalEntities.SmartAggregation_Production_Quantite) summary.totalEntities.SmartAggregation_Production_Quantite = 0;
        summary.totalEntities.SmartAggregation_Production_Quantite++;
        
        const aggProdAttributes = prepareCommonAttributes(prodVar.name, prodVar.id);
        
        if (prodVar.aggregations && typeof prodVar.aggregations === 'object') {
            // console.log(`[processVariables] Found prod quantity aggregations for ${node.name}:`, prodVar.aggregations); // Reduced log verbosity
            const aggs = prodVar.aggregations;
            if (aggs['5min']?.id) aggProdAttributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']?.id) aggProdAttributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']?.id) aggProdAttributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']?.id) aggProdAttributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']?.id) aggProdAttributes.Identifiant1day = aggs['1d'].id;
             // console.log(`[processVariables] Prod quantity Aggregation IDs added:`, aggProdAttributes); // Reduced log verbosity
        }
        // else {
        //      console.log(`[processVariables] No valid prod quantity aggregations found.`); // Reduced log verbosity
        // }
        
        const collectionName = `aggregations_production_quantite_${level}`;
        const entityName = `Smart.Aggregation_Production_quantite_${rawLevel}`; // Corrected: lowercase 'quantite'
        // Targeted log BEFORE adding
        console.log(`[processVariables] Preparing to add to '${collectionName}': Entity='${entityName}', VarID='${aggProdAttributes.VariableId}', VarName='${aggProdAttributes.VariableName}'`);
        addToCollection(collectionName, entityName, aggProdAttributes);
      }
      // else {
        // console.log(`[processVariables] No production quantity variable found for ${node.name}`); // Reduced log verbosity
      // }
      
      // 3. Traiter la variable de production (kg)
      const prodKgVar = node.metadata?.productionKgVariable;
      // === AJOUT LOG: Vérifier si prodKgVar existe ===
      console.log(`[processVariables] Checking prodKgVar for ${node.name}:`, prodKgVar ? `Found (ID: ${prodKgVar.id}, Name: ${prodKgVar.name})` : 'Not Found');
      // ===========================================
      if (prodKgVar && prodKgVar.id && prodKgVar.name) {
         console.log(`[processVariables] Found production kg variable for ${node.name}: ID=${prodKgVar.id}, Name=${prodKgVar.name}`);
         if (!summary.totalEntities.SmartAggregation_Production_Kg) summary.totalEntities.SmartAggregation_Production_Kg = 0;
         summary.totalEntities.SmartAggregation_Production_Kg++;
        
        const aggProdKgAttributes = prepareCommonAttributes(prodKgVar.name, prodKgVar.id);
        
        if (prodKgVar.aggregations && typeof prodKgVar.aggregations === 'object') {
            // console.log(`[processVariables] Found prod kg aggregations for ${node.name}:`, prodKgVar.aggregations); // Reduced log verbosity
            const aggs = prodKgVar.aggregations;
            if (aggs['5min']?.id) aggProdKgAttributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']?.id) aggProdKgAttributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']?.id) aggProdKgAttributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']?.id) aggProdKgAttributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']?.id) aggProdKgAttributes.Identifiant1day = aggs['1d'].id;
            // console.log(`[processVariables] Prod kg Aggregation IDs added:`, aggProdKgAttributes); // Reduced log verbosity
        }
        // else {
        //     console.log(`[processVariables] No valid prod kg aggregations found.`); // Reduced log verbosity
        // }
        
        const collectionName = `aggregations_production_kg_${level}`;
        const entityName = `Smart.Aggregation_Production_kg_${rawLevel}`; // Corrected: lowercase 'kg'
        // Targeted log BEFORE adding
        console.log(`[processVariables] Preparing to add to '${collectionName}': Entity='${entityName}', VarID='${aggProdKgAttributes.VariableId}', VarName='${aggProdKgAttributes.VariableName}'`);
        addToCollection(collectionName, entityName, aggProdKgAttributes);
      }
      // else {
        // console.log(`[processVariables] No production kg variable found for ${node.name}`); // Reduced log verbosity
      // }
      
      // 4. Traiter la variable IPE (quantité)
      const ipeVar = node.metadata?.ipeVariable || node.metadata?.ipeQuantiteVariable;
      // === AJOUT LOG: Vérifier si ipeVar existe ===
      console.log(`[processVariables] Checking ipeVar for ${node.name}:`, ipeVar ? `Found (ID: ${ipeVar.id}, Name: ${ipeVar.name})` : 'Not Found');
      // =======================================
      if (ipeVar && ipeVar.id && ipeVar.name) {
        console.log(`[processVariables] Found IPE quantity variable for ${node.name}: ID=${ipeVar.id}, Name=${ipeVar.name}`);
        if (!summary.totalEntities.SmartAggregation_IPE_Quantite) summary.totalEntities.SmartAggregation_IPE_Quantite = 0;
        summary.totalEntities.SmartAggregation_IPE_Quantite++;
        
        const aggIPEAttributes = prepareCommonAttributes(ipeVar.name, ipeVar.id);
        
        if (ipeVar.aggregations && typeof ipeVar.aggregations === 'object') {
             // console.log(`[processVariables] Found IPE quantity aggregations for ${node.name}:`, ipeVar.aggregations); // Reduced log verbosity
             const aggs = ipeVar.aggregations;
             if (aggs['5min']?.id) aggIPEAttributes.Identifiant5Min = aggs['5min'].id;
             if (aggs['1h']?.id) aggIPEAttributes.Identifiant1h = aggs['1h'].id;
             if (aggs['4h']?.id) aggIPEAttributes.Identifiant4h = aggs['4h'].id;
             if (aggs['8h']?.id) aggIPEAttributes.Identifiant8h = aggs['8h'].id;
             if (aggs['1d']?.id) aggIPEAttributes.Identifiant1day = aggs['1d'].id;
             // console.log(`[processVariables] IPE quantity Aggregation IDs added:`, aggIPEAttributes); // Reduced log verbosity
        }
        // else {
        //      console.log(`[processVariables] No valid IPE quantity aggregations found.`); // Reduced log verbosity
        // }
        
        const collectionName = `aggregations_ipe_quantite_${level}`;
        const entityName = `Smart.Aggregation_IPE_quantite_${rawLevel}`; // Corrected: lowercase 'quantite'
         // Targeted log BEFORE adding
        console.log(`[processVariables] Preparing to add to '${collectionName}': Entity='${entityName}', VarID='${aggIPEAttributes.VariableId}', VarName='${aggIPEAttributes.VariableName}'`);
        addToCollection(collectionName, entityName, aggIPEAttributes);
      }
      // else {
        // console.log(`[processVariables] No IPE quantity variable found for ${node.name}`); // Reduced log verbosity
      // }
      
      // 5. Traiter la variable IPE (kg)
      const ipeKgVar = node.metadata?.ipeKgVariable;
      // === AJOUT LOG: Vérifier si ipeKgVar existe ===
      console.log(`[processVariables] Checking ipeKgVar for ${node.name}:`, ipeKgVar ? `Found (ID: ${ipeKgVar.id}, Name: ${ipeKgVar.name})` : 'Not Found');
      // ==========================================
      if (ipeKgVar && ipeKgVar.id && ipeKgVar.name) {
        console.log(`[processVariables] Found IPE kg variable for ${node.name}: ID=${ipeKgVar.id}, Name=${ipeKgVar.name}`);
        if (!summary.totalEntities.SmartAggregation_IPE_Kg) summary.totalEntities.SmartAggregation_IPE_Kg = 0;
        summary.totalEntities.SmartAggregation_IPE_Kg++;
        
        const aggIPEKgAttributes = prepareCommonAttributes(ipeKgVar.name, ipeKgVar.id);
        
        if (ipeKgVar.aggregations && typeof ipeKgVar.aggregations === 'object') {
            // console.log(`[processVariables] Found IPE kg aggregations for ${node.name}:`, ipeKgVar.aggregations); // Reduced log verbosity
            const aggs = ipeKgVar.aggregations;
            if (aggs['5min']?.id) aggIPEKgAttributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']?.id) aggIPEKgAttributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']?.id) aggIPEKgAttributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']?.id) aggIPEKgAttributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']?.id) aggIPEKgAttributes.Identifiant1day = aggs['1d'].id;
            // console.log(`[processVariables] IPE kg Aggregation IDs added:`, aggIPEKgAttributes); // Reduced log verbosity
        }
        // else {
        //      console.log(`[processVariables] No valid IPE kg aggregations found.`); // Reduced log verbosity
        // }
        
        const collectionName = `aggregations_ipe_kg_${level}`;
        const entityName = `Smart.Aggregation_IPE_kg_${rawLevel}`; // Corrected: lowercase 'kg'
        // Targeted log BEFORE adding
        console.log(`[processVariables] Preparing to add to '${collectionName}': Entity='${entityName}', VarID='${aggIPEKgAttributes.VariableId}', VarName='${aggIPEKgAttributes.VariableName}'`);
        addToCollection(collectionName, entityName, aggIPEKgAttributes);
      }
      // else {
        // console.log(`[processVariables] No IPE kg variable found for ${node.name}`); // Reduced log verbosity
      // }
    }
    else {
      console.log(`[processVariables] Skipping production and IPE variables for ${node.name} because level is 'machine'`); // AJOUT LOG (pour confirmation)
      // console.log(`[processVariables] Skipping production and IPE variables for ${node.name} because level is 'machine'`); // Reduced log verbosity
    }

    // Traiter l'état du capteur (uniquement pour les machines)
    const stateVar = node.metadata?.stateVariable;
    if (level === 'machine' && stateVar?.variableId) {
        console.log(`[processVariables] Found state variable for machine ${node.name}: ID=${stateVar.variableId}`);
        if (!summary.totalEntities.EtatCapteur) summary.totalEntities.EtatCapteur = 0;
        summary.totalEntities.EtatCapteur++;
        
        if (!summary.etatCapteurs) {
            summary.etatCapteurs = [];
            console.warn(`[processVariables] Created etatCapteurs collection that was missing.`);
        }
        
        const stateAttributes = {
            NomCapteur: node.name,
            Etat: "false", // Default to false? Or read from somewhere?
            DerniereMaj: new Date().toISOString(),
            IdEtatCapteur: stateVar.variableId
        };
        // console.log(`[processVariables] State sensor attributes prepared:`, stateAttributes); // Reduced log verbosity
        
        summary.etatCapteurs.push({
            entity: 'Smart.EtatCapteur',
            attributes: stateAttributes
        });
        // console.log(`[processVariables] Successfully added state sensor for ${node.name}. Current collection size: ${summary.etatCapteurs.length}`); // Reduced log verbosity
    }
    // else if (level === 'machine') {
      // console.log(`[processVariables] No state variable found for machine ${node.name}`); // Reduced log verbosity
    // }

    const tEndProcessVars = performance.now();
    // console.log(`[processVariables] END processing variables for node: ${node.name}. Duration: ${(tEndProcessVars - tStartProcessVars).toFixed(1)} ms`); // Reduced log verbosity
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
        console.log("[DEBUG RAW DATA] Contenu de data.variables:", JSON.stringify(data.variables, null, 2)); // Ensure this line exists and is not commented out
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
      console.log(`[DEBUG propagate] Machine ${node.name} - Metadata AVANT flags:`, JSON.stringify(node.metadata));
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
      console.log(`[DEBUG propagate] Machine ${node.name} - Metadata APRES flags:`, JSON.stringify(node.metadata));
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
            console.log(`[DEBUG propagate] Parent ${parentNode.name} - Metadata AVANT:`, JSON.stringify(parentNode.metadata));
            // ==================================================
            // Propager les flags
            if (node.metadata.isElec) parentNode.metadata.isElec = true;
            if (node.metadata.isGaz) parentNode.metadata.isGaz = true;
            if (node.metadata.isEau) parentNode.metadata.isEau = true;
            if (node.metadata.isAir) parentNode.metadata.isAir = true;
            // === LOG AJOUTÉ : Metadata Parent APRES propagation ===
            console.log(`[DEBUG propagate] Parent ${parentNode.name} - Metadata APRES:`, JSON.stringify(parentNode.metadata));
            // ==================================================
            nextParents.push(parentNode.id);
          }
        }
        currentNodeIds = nextParents;
      }
      // === LOG AJOUTÉ : Metadata Machine APRES propagation complète ===
      console.log(`[DEBUG propagate] Machine ${node.name} - Metadata FINAL:`, JSON.stringify(node.metadata));
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
      console.log("[DEBUG RAW DATA] Contenu de data.variables:", JSON.stringify(data.variables, null, 2));
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
          console.log(`[DEBUG AGGS - AFTER ASSOC] Node ${nodeCheckAfterAssoc.name} aggregations (variable):`, JSON.stringify(nodeCheckAfterAssoc.metadata.variable.aggregations));
      } else {
          // Essayer avec un autre type si variable n'a pas été trouvé
          const nodeCheckAlt = fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.productionKgVariable?.aggregations && Object.keys(n.metadata.productionKgVariable.aggregations).length > 0);
           if (nodeCheckAlt) {
               console.log(`[DEBUG AGGS - AFTER ASSOC] Node ${nodeCheckAlt.name} aggregations (prodKg):`, JSON.stringify(nodeCheckAlt.metadata.productionKgVariable.aggregations));
           } else {
              console.log("[DEBUG AGGS - AFTER ASSOC] Aucun nœud trouvé avec des agrégations pour vérification.");
           }
      }
      const refNodeId = nodeCheckAfterAssoc?.id || fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.productionKgVariable?.aggregations && Object.keys(n.metadata.productionKgVariable.aggregations).length > 0)?.id;
      // =============================================================

      propagateEnergyTypes(fixedData.hierarchyData); // Appel de la fonction suspecte

      // === DEBUG AGGREGATIONS: Check AFTER propagateEnergyTypes ===
      const nodeToCheckAgain = refNodeId ? fixedData.hierarchyData?.nodes.find((n: any) => n.id === refNodeId) : null;
      if (nodeToCheckAgain) {
          console.log(`[DEBUG AGGS - AFTER PROPAGATE] Node ${nodeToCheckAgain.name} metadata.variable.aggregations:`, JSON.stringify(nodeToCheckAgain.metadata?.variable?.aggregations));
          console.log(`[DEBUG AGGS - AFTER PROPAGATE] Node ${nodeToCheckAgain.name} metadata.productionKgVariable.aggregations:`, JSON.stringify(nodeToCheckAgain.metadata?.productionKgVariable?.aggregations));
          // Ajouter d'autres types si nécessaire
      } else {
           console.log("[DEBUG AGGS - AFTER PROPAGATE] Aucun nœud de référence trouvé pour vérifier les agrégations.");
      }
      // ============================================================

      await validateMendixEntities(requiredEntities);
      const mendixSummary = generateMendixSummary(fixedData);

      // === AJOUT DEBUG: Vérifier le contenu FINAL de mendixSummary AVANT génération ===
      console.log("[DEBUG PAGE - FINAL SUMMARY CHECK] Contenu COMPLET de mendixSummary:", JSON.stringify(mendixSummary, null, 2));
      // ==========================================================================

      console.log("[DEBUG SUMMARY CHECK] Contenu détaillé des agrégations AVANT génération code:");
      Object.keys(mendixSummary).forEach(key => {
        // Se concentrer sur les clés contenant "aggregations_"
        if (key.startsWith('aggregations_')) {
          console.log(`[DEBUG SUMMARY CHECK] ${key}:`, JSON.stringify(mendixSummary[key], null, 2));
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
      console.log("[DEBUG PAGE - GENERATED MENDIX CODE]", generatedCode);
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
    // === LOG AJOUTÉ : Entrée de la fonction ===
    console.log(`[DEBUG extractNodeName] Tentative d'extraction pour: "${varName}"`);
    // ==========================================
    if (!varName) return null;
    const nameLower = varName.toLowerCase();
    // Essayer d'extraire basé sur les préfixes connus
    const prefixes = ['consommation_', 'etat_capteur_', 'production_kg_', 'production_', 'ipe_kg_', 'ipe_'];
    for (const prefix of prefixes) {
      // === LOG AJOUTÉ : Test du préfixe ===
      const starts = nameLower.startsWith(prefix);
      console.log(`[DEBUG extractNodeName] Test préfixe "${prefix}": ${starts}`);
      // ==================================
      if (starts) {
        // Extraire la partie après le préfixe et nettoyer
        const extracted = varName.substring(prefix.length);
        // === CORRECTION: Ajouter 'elec' à l'expression régulière ===
        const cleanExtracted = extracted.replace(/^(électricité|elec|gaz|eau|air)_/i, '');
        // ===========================================================
        const finalName = sanitizeNodeNameForMatch(cleanExtracted); // Utiliser le même nettoyage
        // === LOG AJOUTÉ : Succès ===
        console.log(`[DEBUG extractNodeName] Succès! Préfixe="${prefix}", Extrait="${extracted}", Nettoyé="${cleanExtracted}", Final="${finalName}"`);
        // ==========================
        return finalName;
      }
    }
    // === LOG AJOUTÉ : Échec ===
    console.warn(`[DEBUG extractNodeName] ÉCHEC: Aucun préfixe trouvé pour "${varName}"`);
    // ========================
    console.warn(`[extractNodeNameFromVarName] Impossible d'extraire le nom du nœud pour : ${varName}`);
    return null; // Aucun préfixe connu trouvé
  };
  
  // Fonction pour associer les variables aux nœuds de la hiérarchie (NOUVELLE VERSION par NOM)
  const associateVariablesToNodes = (data: any) => {
    const t0 = performance.now();
    // Créer une copie profonde des données pour ne pas modifier l'original
    const fixedData = JSON.parse(JSON.stringify(data));
    
    // 1. Vérifier les données d'entrée
    if (!fixedData.variables || !Array.isArray(fixedData.variables) || fixedData.variables.length === 0) {
      console.warn("[associateVariablesToNodes] Aucune variable externe fournie pour l'association.");
      // Continuer pour formater les agrégations existantes
    }
    if (!fixedData.hierarchyData?.nodes || !Array.isArray(fixedData.hierarchyData.nodes)) {
      console.error("[associateVariablesToNodes] Aucune donnée de nœud hiérarchique trouvée.");
      return fixedData; // Ne peut pas continuer sans nœuds
    }
    
    console.log("[DEBUG associateVariablesToNodes] Début de l'association par nom...");
    
    // 2. Pré-traiter les variables externes pour les regrouper par nom de nœud extrait
    const variablesByExtractedName = new Map<string, any[]>();
    let stateVarCount = 0;
    console.log(`[DEBUG associateVariablesToNodes] Vérification de fixedData.variables: Existe=${!!fixedData.variables}, EstTableau=${Array.isArray(fixedData.variables)}, Longueur=${fixedData.variables?.length ?? 0}`);
    if (fixedData.variables) {
        fixedData.variables.forEach((variable: any, index: number) => {
          console.log(`[DEBUG associateVariablesToNodes] Traitement variable ${index}:`, JSON.stringify(variable));
          const originalVarName = variable.variableName; // Store original name
          const extractedNameAttempt = extractNodeNameFromVarName(originalVarName);

          // === NOUVEAU LOG CIBLÉ 1 ===
          if (originalVarName === "Consommation_électricité_PUITS_1") {
              console.warn(`[DEBUG SPECIFIC VAR] Found target variable: "${originalVarName}", Extracted Name Attempt: "${extractedNameAttempt || 'NULL'}"`);
          }
          // =========================

          console.log(`[DEBUG NAME EXTRACTION] Var: "${originalVarName}", Extracted Node Name Attempt: "${extractedNameAttempt || 'NULL'}"`);

          // === CORRECTION : Utiliser extractedNameAttempt ===
          if (extractedNameAttempt) {
            const extractedName = extractedNameAttempt; // Utilisation correcte
            if (!variablesByExtractedName.has(extractedName)) {
              variablesByExtractedName.set(extractedName, []);
            }
            variablesByExtractedName.get(extractedName)!.push(variable);
            // Correction : Utiliser originalVarName pour la vérification 'etat'
            if (originalVarName?.toLowerCase().includes('etat')) {
              stateVarCount++;
            }
          }
        });
    }
    console.log(`[DEBUG associateVariablesToNodes] ${variablesByExtractedName.size} noms de nœuds uniques extraits des variables. ${stateVarCount} variables d'état potentielles indexées.`);
    
    // 3. Traiter chaque nœud de la hiérarchie
    let nodesMatched = 0;
    let stateVariablesAssociated = 0;
    fixedData.hierarchyData.nodes.forEach((node: any) => {
      if (!node.metadata) node.metadata = {};
      const originalNodeName = node.name;
      const sanitizedNodeName = sanitizeNodeNameForMatch(originalNodeName);

      const matchingVariables = variablesByExtractedName.get(sanitizedNodeName) || [];

      if (matchingVariables.length > 0) {
        nodesMatched++;
        console.debug(`[DEBUG associateVariablesToNodes] ${matchingVariables.length} variable(s) trouvée(s) pour le nœud ${node.name} (nom nettoyé: ${sanitizedNodeName})`);

        // === MODIFICATION : Initialiser un tableau pour les variables de consommation ===
        node.metadata.consumptionVariables = [];
        // ==========================================================================

        matchingVariables.forEach((variable: any) => {
          const variableNameLower = variable.variableName?.toLowerCase() || '';
          const variableId = variable.id || variable.variableId || '';
          const variableName = variable.variableName || '';
          const formattedAggs = formatAggregations(variable.metadata?.aggregations);

          console.log(`[DEBUG associateVariables] Testing variable name (lowercase): "${variableNameLower}" for node ${node.name}`);

          // IMPORTANT: Order matters! Check specific cases (like KG) before general ones.
          if (variableNameLower.includes('conso') || variableNameLower.includes('consommation')) { // 1. Conso
             console.log(`[DEBUG ASSIGN] Adding to node.metadata.consumptionVariables for ${node.name}: Var=${variableName}`);
             // === MODIFICATION : Ajouter au tableau au lieu d'écraser ===
             node.metadata.consumptionVariables.push({ id: variableId, name: variableName, aggregations: formattedAggs, type: variableNameLower.includes('électricité') || variableNameLower.includes('elec') ? 'Elec' : variableNameLower.includes('gaz') ? 'Gaz' : variableNameLower.includes('eau') ? 'Eau' : variableNameLower.includes('air') ? 'Air' : 'Unknown' });
             // ========================================================
             // Supprimer l'ancienne assignation : node.metadata.variable = ...
          }
          else if (variableNameLower.includes('ipe') && variableNameLower.includes('kg')) { // 2. Specific IPE KG
             console.log(`[DEBUG associateVariables] Associating IPE KG for ${node.name}: ${variable.variableName}`);
             node.metadata.ipeKgVariable = { id: variableId, name: variableName, aggregations: formattedAggs };
          }
          else if (variableNameLower.includes('prod') && variableNameLower.includes('kg')) { // 3. Specific Prod KG
             console.log(`[DEBUG associateVariables] Associating PROD KG for ${node.name}: ${variable.variableName}`);
             node.metadata.productionKgVariable = { id: variableId, name: variableName, aggregations: formattedAggs };
          }
          else if (variableNameLower.includes('ipe') || variableNameLower.includes('indicateur')) { // 4. General IPE QTE
             console.log(`[DEBUG associateVariables] Associating IPE QTE for ${node.name}: ${variable.variableName}`);
             node.metadata.ipeVariable = { id: variableId, name: variable.variableName, aggregations: formattedAggs };
          }
          else if (variableNameLower.includes('prod') || variableNameLower.includes('production')) { // 5. General Prod QTE
             console.log(`[DEBUG associateVariables] Associating PROD QTE for ${node.name}: ${variable.variableName}`);
             node.metadata.productionVariable = { id: variableId, name: variable.variableName, aggregations: formattedAggs };
          }
          else if (variableNameLower.includes('etat') || variableNameLower.includes('status') || variableNameLower.includes('état')) { // 6. Etat last
             console.log(`[DEBUG ASSIGN] Assigning to node.metadata.stateVariable for ${node.name}: Var=${variableName}`);
             node.metadata.stateVariable = { variableId: variableId, name: variableName };
             stateVariablesAssociated++;
          }
        });

        if (originalNodeName === "PUITS_1") {
            console.warn(`[DEBUG FINAL METADATA in ASSOC] Node ${originalNodeName} final metadata after loop:`, JSON.stringify(node.metadata, null, 2));
        }
      } else {
          // Log si aucun match, peut être réduit en production
          // console.log(`[DEBUG associateVariablesToNodes] Aucune variable externe trouvée pour le nœud ${node.name} via le nom ${sanitizedNodeName}`);
      }
      
      // 4. Formater les agrégations existantes (même si aucune variable externe n'a été associée)
      // CELA SEMBLE REDONDANT ET POTENTIELLEMENT PROBLEM ATIQUE - Supprimons cette section.
      // Les agrégations sont déjà formatées lors de l'association initiale.
      /*
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
      */
    });
    
    const t1 = performance.now();
    console.info(`[associateVariablesToNodes] Association par nom terminée en ${(t1 - t0).toFixed(1)} ms. ${nodesMatched}/${fixedData.hierarchyData.nodes.length} nœuds ont trouvé des variables correspondantes. ${stateVariablesAssociated} variables d'état associées.`);
    
    // === LOG AJOUTÉ : Vérification FINALE DANS associateVariablesToNodes ===
    const finalMachineNodeCheck = fixedData.hierarchyData?.nodes.find((n: any) => n.metadata?.level === 'Machine');
    if (finalMachineNodeCheck) {
      console.log("[DEBUG associateVariablesToNodes - FINAL CHECK] Node Machine stateVariable:", 
        JSON.stringify(finalMachineNodeCheck.metadata?.stateVariable));
    } else {
      console.log("[DEBUG associateVariablesToNodes - FINAL CHECK] Aucun nœud Machine trouvé pour vérification finale.");
    }
    // ==================================================================

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