interface HierarchyLevel {
  name: string;
  level: number;
}

export interface MendixEntitySummary {
  totalEntities: {
    [key: string]: number;
  };
  [key: string]: any;
}

interface RequiredEntity {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
  }>;
}

export interface IIHData {
  sectors: {
    [key: string]: {
      name: string;
      assetId: string;
      machines?: {
        [key: string]: {
          name: string;
          assetId: string;
          energyType?: string;
          variable?: {
            id: string;
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
          };
          stateVariable?: {
            variableId: string;
          };
        };
      };
      workshops?: {
        [key: string]: {
          name: string;
          assetId: string;
          machines?: {
            [key: string]: {
              name: string;
              assetId: string;
              energyType?: string;
              variable?: {
                id: string;
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
              };
              stateVariable?: {
                variableId: string;
              };
            };
          };
        };
      };
    };
  };
  rootMachines: {
    [key: string]: {
      name: string;
      assetId: string;
      energyType?: string;
      variable?: {
        id: string;
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
      };
      stateVariable?: {
        variableId: string;
      };
    };
  };
}

export function generateDynamicMendixCode(
  hierarchyLevels: HierarchyLevel[],
  mendixSummary: MendixEntitySummary
): string {
  // Fonction utilitaire pour mettre la première lettre en majuscule
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  // --- NOUVEAU: Déterminer le dernier niveau ---
  let maxLevelNumber = 0;
  let maxLevelName = '';
  if (Array.isArray(hierarchyLevels) && hierarchyLevels.length > 0) {
      hierarchyLevels.forEach(level => {
          if (level.level > maxLevelNumber) {
              maxLevelNumber = level.level;
              maxLevelName = capitalize(level.name).replace(/\s+/g, ''); // Utiliser le nom capitalisé et sans espace
          }
      });
      console.log(`[codeGenerator] Last level identified: ${maxLevelName} (Number: ${maxLevelNumber})`);
  } else {
      console.warn("[codeGenerator] hierarchyLevels is missing or empty. Cannot determine last level.");
  }
  // --- FIN NOUVEAU ---

  // Générer les noms d'entités dynamiquement
  const allEntityNames = new Set<string>();
  hierarchyLevels.forEach(level => allEntityNames.add(`Smart.${capitalize(level.name)}`));
  hierarchyLevels.forEach(level => {
    const currentLevelNumber = level.level;
    const levelName = capitalize(level.name).replace(/\s+/g, '');
    const levelNameLower = level.name.toLowerCase().replace(/\s+/g, ''); // For checking summary keys

    allEntityNames.add(`Smart.Aggregation_Conso_${levelName}`);

    // --- MODIFICATION: Logique conditionnelle basée sur maxLevelNumber ---
    if (currentLevelNumber === maxLevelNumber) {
        // Pour le DERNIER niveau, vérifier si les données existent dans le summary
        const prodCollectionKey = `aggregations_production_${levelNameLower}`;
        if (mendixSummary[prodCollectionKey] && Array.isArray(mendixSummary[prodCollectionKey]) && mendixSummary[prodCollectionKey].length > 0) {
            allEntityNames.add(`Smart.Aggregation_Production_${capitalize(level.name)}`);
            console.log(`[codeGenerator] Added LAST LEVEL Prod entity: Smart.Aggregation_Production_${capitalize(level.name)}`);
        } else {
             console.log(`[codeGenerator] Skipping LAST LEVEL Prod entity (key: ${prodCollectionKey}, length: ${mendixSummary[prodCollectionKey]?.length ?? 'undefined'})`);
        }

        const ipeCollectionKey = `aggregations_ipe_${levelNameLower}`;
        if (mendixSummary[ipeCollectionKey] && Array.isArray(mendixSummary[ipeCollectionKey]) && mendixSummary[ipeCollectionKey].length > 0) {
            allEntityNames.add(`Smart.Aggregation_IPE_${capitalize(level.name)}`);
            console.log(`[codeGenerator] Added LAST LEVEL IPE entity: Smart.Aggregation_IPE_${capitalize(level.name)}`);
        } else {
            console.log(`[codeGenerator] Skipping LAST LEVEL IPE entity (key: ${ipeCollectionKey}, length: ${mendixSummary[ipeCollectionKey]?.length ?? 'undefined'})`);
        }
    } else {
        // Pour les niveaux INTERMÉDIAIRES, ajouter systématiquement _quantite et _kg
        allEntityNames.add(`Smart.Aggregation_Production_quantite_${levelName}`);
        allEntityNames.add(`Smart.Aggregation_Production_kg_${levelName}`);
        allEntityNames.add(`Smart.Aggregation_IPE_quantite_${levelName}`);
        allEntityNames.add(`Smart.Aggregation_IPE_kg_${levelName}`);
        console.log(`[codeGenerator] Added INTERMEDIATE entities for level: ${levelName}`);
    }
    // --- FIN MODIFICATION ---
  });

  // Ajouter EtatCapteur seulement s'il y a des données
  if (mendixSummary.etatCapteurs && Array.isArray(mendixSummary.etatCapteurs) && mendixSummary.etatCapteurs.length > 0) {
      allEntityNames.add('Smart.EtatCapteur');
      console.log("[codeGenerator] Added EtatCapteur entity.");
  } else {
      console.log("[codeGenerator] Skipping EtatCapteur entity (no data).");
  }

  // Create ENTITIES map for use within the generated code (optional, but can be helpful)
  console.log("[codeGenerator] Generating ENTITY_MAP from:", Array.from(allEntityNames)); // DEBUG
  const entityDefinitions = Array.from(allEntityNames).map(fullName => {
      // Générer un nom de constante lisible
      const shortName = fullName.replace('Smart.', '').toUpperCase()
          .replace(/_QUANTITE/g, '_QTE')
          .replace(/_KG/g, '_KG')
          .replace(/PRODUCTION/g, 'PROD')
          .replace(/AGGREGATION/g, 'AGG');
      return `    ${shortName}: "${fullName}",`;
  }).join('\n');

  const code = [
    '// This file was generated by Mendix Studio Pro.',
    '//',
    '// WARNING: Only the following code will be retained when actions are regenerated:',
    '// - the import list',
    '// - the code between BEGIN USER CODE and END USER CODE',
    '// - the code between BEGIN EXTRA CODE and END EXTRA CODE',
    '// Other code you write will be lost the next time you deploy the project.',
    'import "mx-global";',
    'import { Big } from "big.js";',
    '',
    '// BEGIN EXTRA CODE',
    '// Définition du mapping des entités Mendix (pour référence si besoin)',
    'const ENTITIES_MAP = {',
    entityDefinitions, // Inclut maintenant les entités Machine si elles existent
    '};',
    '',
    '// Données pré-traitées à créer',
    'const MENDIX_SUMMARY = ' + JSON.stringify(mendixSummary, null, 2) + ';',
    '// END EXTRA CODE',
    '',
    '/**',
    ' * @returns {Promise.<void>}',
    ' */',
    'export async function JavaScript_action() {',
    '    // BEGIN USER CODE',
    '    try {',
    '        console.log("[DEBUG] Checking MENDIX_SUMMARY availability...");',
    '        if (!MENDIX_SUMMARY) {',
    '            throw new Error("MENDIX_SUMMARY is not defined or empty in the generated code.");',
    '        }',
    '        console.log("[DEBUG] MENDIX_SUMMARY is defined. Starting entity creation...");',
    '',
    '        const actualCreatedCounts = {}; // Initialize actual counts object',
    '',
    '        const createAndCommitObject = async (entityFullName, attributes) => {',
    '            return new Promise((resolve, reject) => {',
    '                try {',
    '                    // Log attempt',
    '                    const objectIdentifier = attributes.Nom || attributes.AssetName || attributes.NomCapteur || "N/A";',
    '                    console.log(`[CREATE ATTEMPT] Entity: ${entityFullName}, Identifier: ${objectIdentifier}`);',
    '                    // console.log("[DEBUG] Attributes:", JSON.stringify(attributes)); // Verbose: uncomment if needed',
    '                    ',
    '                    mx.data.create({',
    '                        entity: entityFullName, // Use the full name passed',
    '                        callback: function(obj) {',
    '                            try {',
    '                                // console.log("[CREATE] Mendix object created for", entityFullName);',
    '                                Object.entries(attributes).forEach(([key, value]) => {',
    '                                    if (value !== undefined && value !== null && key !== "entity") { // Ensure value is not null/undefined and key is not "entity"',
    '                                        // console.log(`[ATTRIBUTE] Setting ${key} = ${value} (type: ${typeof value})`); // Verbose',
    '                                        try {',
    '                                           if (typeof value === \'boolean\') {',
    '                                               obj.set(key, value);',
    '                                           } else if (typeof value === \'number\') {',
    '                                                // Handle potential large numbers or decimals if necessary',
    '                                                obj.set(key, new Big(value)); ',
    '                                           } else {',
    '                                               obj.set(key, value.toString());',
    '                                           }',
    '                                        } catch (setErr) {',
    '                                           console.warn(`[WARN] Failed to set attribute \'${key}\' for entity ${entityFullName}. Value: ${value}. Error: ${setErr.message}`);',
    '                                        }',
    '                                    }',
    '                                });',
    '                                // console.log("[COMMIT] Attempting commit for", entityFullName);',
    '                                mx.data.commit({',
    '                                    mxobj: obj,',
    '                                    callback: function() {',
    '                                        console.log(`[SUCCESS] Committed: ${entityFullName} - ${objectIdentifier}`);',
    '                                        // Increment actual count for this entity type',
    '                                        actualCreatedCounts[entityFullName] = (actualCreatedCounts[entityFullName] || 0) + 1;',
    '                                        resolve(obj);',
    '                                    },',
    '                                    error: function(e) {',
    '                                        console.error(`[ERROR] Commit failed for ${entityFullName} - ${objectIdentifier}: ${e.message}`, e);',
    '                                        reject(new Error(`Commit failed for ${entityFullName}: ${e.message}`));',
    '                                    }',
    '                                });',
    '                            } catch (configErr) {',
    '                                console.error(`[ERROR] Attribute configuration failed for ${entityFullName} - ${objectIdentifier}: ${configErr.message}`, configErr);',
    '                                reject(new Error(`Attribute configuration failed for ${entityFullName}: ${configErr.message}`));',
    '                            }',
    '                        },',
    '                        error: function(e) {',
    '                            console.error(`[ERROR] Object creation failed for ${entityFullName} - ${objectIdentifier}: ${e.message}`, e);',
    '                            reject(new Error(`Object creation failed for ${entityFullName}: ${e.message}`));',
    '                        }',
    '                    });',
    '                } catch (globalErr) {',
    '                    console.error(`[ERROR] Global error during create/commit for ${entityFullName}: ${globalErr.message}`, globalErr);',
    '                    reject(globalErr);',
    '                }',
    '            });',
    '        };',
    '',
    '        // --- Main Creation Loop ---',
    '        console.log("Starting entity creation loop from MENDIX_SUMMARY...");',
    '        let createdCount = 0;',
    '        let errorCount = 0;',
    '',
    '        // Iterate over all keys in MENDIX_SUMMARY representing arrays of entities',
    '        for (const summaryKey in MENDIX_SUMMARY) {',
    '            if (summaryKey === \'totalEntities\' || !Array.isArray(MENDIX_SUMMARY[summaryKey])) {',
    '                continue; // Skip total counts and non-array properties',
    '            }',
    '',
    '            const entityArray = MENDIX_SUMMARY[summaryKey];',
    '            console.log(`Processing ${entityArray.length} items for summary key: ${summaryKey}`);',
    '',
    '            for (const item of entityArray) {',
    '                if (!item || !item.entity || !item.attributes) {',
    '                     console.warn(`[WARNING] Skipping invalid item in MENDIX_SUMMARY key \'${summaryKey}\':`, item);',
    '                     continue;',
    '                }',
    '',
    '                // Utiliser directement le nom d\'entité fourni dans l\'item (qui a été corrigé dans page.tsx)',
    '                const entityName = item.entity; // Ex: Smart.Aggregation_Production_Machine ou Smart.Aggregation_Production_quantite_NiveauX',
    '                const attributes = item.attributes;',
    '',
    '                // AJOUT Log pour vérifier le nom d\'entité traité',
    '                console.log(`[CodeGenerator Loop] Processing item with Entity Name: ${entityName}`);',
    '',
    '                try {',
    '                    await createAndCommitObject(entityName, attributes);',
    '                    createdCount++;',
    '                } catch (creationError) {',
    '                     errorCount++;',
    '                     console.warn(`Continuing creation process despite error for entity \'${entityName}\'.`);',
    '                }',
    '            }',
    '             console.log(`Finished processing summary key: ${summaryKey}`);',
    '        }',
    '',
    '        console.log(`--- Creation Summary ---`);',
    '        console.log(`Successfully created/committed: ${createdCount} objects.`);',
    '        console.log(`Failed attempts: ${errorCount} objects.`);',
    '        console.log(`------------------------`);',
    '        console.log(`--- Actual Created Counts ---`);',
    '        console.log(JSON.stringify(actualCreatedCounts, null, 2));',
    '        console.log(`-----------------------------`);',
    '',
    '        if (errorCount > 0) {',
    '            mx.ui.warning(`Configuration terminée avec ${errorCount} erreur(s). Vérifiez la console pour les détails.`, {});',
    '        } else {',
    '            mx.ui.info("Configuration depuis MENDIX_SUMMARY terminée avec succès!", {});',
    '        }',
    '',
    '    } catch (error) {',
    '        console.error("Erreur globale lors de la configuration depuis MENDIX_SUMMARY:", error);',
    '        mx.ui.error("Erreur lors de la configuration: " + error.message, {});',
    '        throw error; // Re-throw the error for Mendix to handle',
    '    }',
    '    // END USER CODE',
    '}'
  ].join('\n');

  return code;
}

export function generateDynamicCleanupCode(requiredEntities: RequiredEntity[], hierarchyLevels: HierarchyLevel[]): string {
  // Fonction utilitaire pour mettre la première lettre en majuscule
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // --- NOUVEAU: Déterminer le dernier niveau ---
  let maxLevelNumber = 0;
  let maxLevelName = '';
  if (Array.isArray(hierarchyLevels) && hierarchyLevels.length > 0) {
      hierarchyLevels.forEach(level => {
          if (level.level > maxLevelNumber) {
              maxLevelNumber = level.level;
              maxLevelName = capitalize(level.name).replace(/\s+/g, ''); // Utiliser le nom capitalisé et sans espace
          }
      });
      console.log(`[codeGenerator Cleanup] Last level identified: ${maxLevelName} (Number: ${maxLevelNumber})`);
  } else {
      console.warn("[codeGenerator Cleanup] hierarchyLevels is missing or empty. Cannot determine last level.");
  }
  // --- FIN NOUVEAU ---

  // Générer la liste des entités à nettoyer
  const allEntitiesForCleanup = [
    // Niveaux hiérarchiques de base
    ...hierarchyLevels.map(level => {
        const levelNameCapitalized = capitalize(level.name);
        const entityFullName = `Smart.${levelNameCapitalized}`;
        return `    ${level.name.toUpperCase().replace(/\s+/g, '_')}: "${entityFullName}",`;
    }),
    // Agrégations conditionnelles
    ...hierarchyLevels.flatMap(level => {
        const currentLevelNumber = level.level;
        const levelName = capitalize(level.name).replace(/\s+/g, '');
        const upperLevelName = level.name.toUpperCase().replace(/\s+/g, '_');
        const entities = [
             `    AGGREGATION_CONSO_${upperLevelName}: "Smart.Aggregation_Conso_${levelName}",`
        ];

        // --- MODIFICATION: Logique conditionnelle basée sur maxLevelNumber ---
        if (currentLevelNumber === maxLevelNumber) {
             // Pour le DERNIER niveau
             entities.push(`    AGGREGATION_PRODUCTION_${upperLevelName}: "Smart.Aggregation_Production_${levelName}",`);
             entities.push(`    AGGREGATION_IPE_${upperLevelName}: "Smart.Aggregation_IPE_${levelName}",`);
             console.log(`[codeGenerator Cleanup] Added LAST LEVEL cleanup entities for ${levelName}`);
        } else {
             // Pour les niveaux INTERMÉDIAIRES
             entities.push(`    AGGREGATION_PRODUCTION_QUANTITE_${upperLevelName}: "Smart.Aggregation_Production_quantite_${levelName}",`);
             entities.push(`    AGGREGATION_PRODUCTION_KG_${upperLevelName}: "Smart.Aggregation_Production_kg_${levelName}",`);
             entities.push(`    AGGREGATION_IPE_QUANTITE_${upperLevelName}: "Smart.Aggregation_IPE_quantite_${levelName}",`);
             entities.push(`    AGGREGATION_IPE_KG_${upperLevelName}: "Smart.Aggregation_IPE_kg_${levelName}",`);
             console.log(`[codeGenerator Cleanup] Added INTERMEDIATE cleanup entities for ${levelName}`);
        }
        // --- FIN MODIFICATION ---
        return entities;
    }),
    // EtatCapteur (toujours inclus pour le nettoyage, même s'il n'y avait pas de données)
    '    ETAT_CAPTEUR: "Smart.EtatCapteur"'
  ];

  const entityDefinitions = allEntitiesForCleanup.join('\n');

  const code = [
    '// This file was generated by Mendix Studio Pro.',
    '//',
    '// WARNING: Only the following code will be retained when actions are regenerated:',
    '// - the import list',
    '// - the code between BEGIN USER CODE and END USER CODE',
    '// - the code between BEGIN EXTRA CODE and END EXTRA CODE',
    '// Other code you write will be lost the next time you deploy the project.',
    'import "mx-global";',
    'import { Big } from "big.js";',
    '',
    '// BEGIN EXTRA CODE',
    'const ENTITIES_TO_CLEAN = {',
    entityDefinitions, // Inclut maintenant les entités Machine
    '};',
    '// END EXTRA CODE',
    '',
    '/**',
    ' * @returns {Promise.<void>}',
    ' */',
    'export async function JavaScript_cleanup() {',
    '    // BEGIN USER CODE',
    '    try {',
    '        console.log("=== Début du nettoyage des entités ===");',
    '',
    '        function deleteAllEntitiesOfType(entityName) {',
    '            return new Promise((resolve, reject) => {', // Added reject path
    '                console.log(`[Cleanup] Attempting to delete all objects of type: ${entityName}`);',
    '                mx.data.get({',
    '                    xpath: `//${entityName}`,',
    '                    callback: function(objects) {',
    '                        console.log(`[Cleanup] Found ${objects.length} objects of type ${entityName} to delete.`);',
    '                        if (objects.length === 0) {',
    '                            resolve();',
    '                            return;',
    '                        }',
    '                        mx.data.remove({',
    '                           guids: objects.map(obj => obj.getGuid()),',
    '                           callback: function() {',
    '                               console.log(`[Cleanup] Successfully deleted ${objects.length} objects of type ${entityName}.`);',
    '                               resolve();',
    '                           },',
    '                           error: function(e) {',
    '                               console.error(`[Cleanup ERROR] Failed to delete objects of type ${entityName}:`, e);',
    '                               reject(e); // Reject on error',
    '                           }',
    '                       });',
    '                    },',
    '                    error: function(e) {',
    '                        console.error(`[Cleanup ERROR] Failed to retrieve objects of type ${entityName}:`, e);',
    '                        // If retrieval fails, maybe the entity doesn\'t exist, consider resolving?',
    '                        // resolve(); // Option: Continue even if retrieval fails',
    '                         reject(e); // Option: Treat as failure',
    '                    }',
    '                });',
    '            });',
    '        }',
    '',
    '        const entitiesToCleanList = Object.values(ENTITIES_TO_CLEAN);',
    '        console.log("[Cleanup] Entities targeted for deletion:", entitiesToCleanList);',
    '        let cleanupErrors = 0;',
    '',
    '        // Itérer sur les entités définies et les supprimer',
    '        const reversedEntities = entitiesToCleanList.slice().reverse();',
    '',
    '        for (const entityName of reversedEntities) {',
    '             try {',
    '                 await deleteAllEntitiesOfType(entityName);',
    '             } catch (e) {',
    '                 cleanupErrors++;',
    '                 console.warn(`[Cleanup WARN] Failed to fully clean entity ${entityName}, continuing... Error: ${e.message}`);',
    '             }',
    '        }',
    '',
    '        if (cleanupErrors > 0) {',
    '             mx.ui.warning(`Nettoyage terminé avec ${cleanupErrors} erreur(s). Vérifiez la console.`, {});',
    '        } else {',
    '             mx.ui.info("Nettoyage terminé avec succès!", {});',
    '        }',
    '    } catch (error) {',
    '        console.error("Erreur globale lors du nettoyage:", error);',
    '        mx.ui.error("Erreur lors du nettoyage: " + error.message, {});',
    '        throw error; // Re-throw',
    '    }',
    '    // END USER CODE',
    '}'
  ].join('\n');

  return code;
} 