interface HierarchyLevel {
  name: string;
  level: number;
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

interface MendixEntitySummary {
  totalEntities: {
    Secteur: number;
    Atelier: number;
    Machine: number;
    SmartAggregation_Conso: number;
    SmartAggregation_Production: number;
    SmartAggregation_IPE: number;
    EtatCapteur: number;
  };
  secteurs: Array<{
    entity: 'Smart.Secteur';
    attributes: {
      Nom: string;
      TotalConso: string;
    };
  }>;
  ateliers: Array<{
    entity: 'Smart.Atelier';
    attributes: {
      Nom: string;
      TotalConso: string;
      Secteur: string;
    };
  }>;
  machines: Array<{
    entity: 'Smart.Machine';
    attributes: {
      Identifiant: string;
      Nom: string;
      IPE: string;
      TotalConso: string;
      Secteur: string;
      Atelier: string;
      TypeEnergie: string;
    };
    parentSector?: string;
    parentWorkshop?: string;
  }>;
  aggregations_conso: Array<{
    entity: 'Smart.Aggregation_Conso';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  aggregations_production: Array<{
    entity: 'Smart.Aggregation_Production';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  aggregations_ipe: Array<{
    entity: 'Smart.Aggregation_IPE';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  etatCapteurs: Array<{
    entity: 'Smart.EtatCapteur';
    attributes: {
      NomCapteur: string;
      Etat: string;
      DerniereMaj: string;
      IdEtatCapteur?: string;
    };
    parentMachine: string;
  }>;
}

export function generateDynamicMendixCode(
  hierarchyLevels: HierarchyLevel[],
  requiredEntities: RequiredEntity[],
  iihData: IIHData,
  mendixSummary: MendixEntitySummary
): string {
  const code = [
    '// BEGIN EXTRA CODE',
    'const ENTITIES = {',
    '    SECTEUR: "Smart.Secteur",',
    '    ATELIER: "Smart.Atelier",',
    '    MACHINE: "Smart.Machine",',
    '    AGGREGATION_CONSO: "Smart.Aggregation_Conso",',
    '    AGGREGATION_PRODUCTION: "Smart.Aggregation_Production",',
    '    AGGREGATION_IPE: "Smart.Aggregation_IPE",',
    '    ETAT_CAPTEUR: "Smart.EtatCapteur"',
    '};',
    '',
    '// Données des assets (structure hiérarchique complète)',
    'const ASSETS_DATA = ' + JSON.stringify(iihData, null, 2) + ';',
    '',
    '// Niveaux hiérarchiques',
    'const hierarchyLevels = ' + JSON.stringify(hierarchyLevels, null, 2) + ';',
    '',
    '// Définition du mapping des entités Mendix',
    'const MENDIX_SUMMARY = ' + JSON.stringify(mendixSummary, null, 2) + ';',
    '// END EXTRA CODE',
    '',
    '/**',
    ' * @returns {Promise.<void>}',
    ' */',
    'export async function JavaScript_action() {',
    '    // BEGIN USER CODE',
    '    try {',
    '        // Vérification des données',
    '        console.log("[DEBUG] Checking data availability...");',
    '        if (!ASSETS_DATA) {',
    '            throw new Error("ASSETS_DATA is not defined");',
    '        }',
    '        console.log("[DEBUG] ASSETS_DATA is defined");',
    '        console.log("[DEBUG] ASSETS_DATA structure:", JSON.stringify(ASSETS_DATA, null, 2));',
    '',
    '        if (!MENDIX_SUMMARY) {',
    '            throw new Error("MENDIX_SUMMARY is not defined");',
    '        }',
    '        console.log("[DEBUG] MENDIX_SUMMARY is defined");',
    '        console.log("[DEBUG] MENDIX_SUMMARY structure:", JSON.stringify(MENDIX_SUMMARY, null, 2));',
    '',
    '        const createAndCommitObject = async (entity, attributes) => {',
    '            return new Promise((resolve, reject) => {',
    '                try {',
    '                    console.log("[CREATE] Starting entity creation: " + entity);',
    '                    console.log("[CREATE] Attributes: " + JSON.stringify(attributes));',
    '                    mx.data.create({',
    '                        entity: entity,',
    '                        callback: function(obj) {',
    '                            try {',
    '                                console.log("[CREATE] Entity created successfully");',
    '                                Object.entries(attributes).forEach(([key, value]) => {',
    '                                    if (value !== undefined && value !== null) {',
    '                                        console.log("[ATTRIBUTE] Setting " + key + " = " + value);',
    '                                        obj.set(key, value.toString());',
    '                                    }',
    '                                });',
    '                                console.log("[COMMIT] Attempting to commit");',
    '                                mx.data.commit({',
    '                                    mxobj: obj,',
    '                                    callback: function() {',
    '                                        console.log("[SUCCESS] Entity committed: " + entity);',
    '                                        resolve(obj);',
    '                                    },',
    '                                    error: function(e) {',
    '                                        console.error("[ERROR] Commit failed: " + e.message);',
    '                                        reject(new Error("Commit failed: " + e.message));',
    '                                    }',
    '                                });',
    '                            } catch (err) {',
    '                                console.error("[ERROR] Configuration failed: " + err.message);',
    '                                reject(new Error("Configuration failed: " + err.message));',
    '                            }',
    '                        },',
    '                        error: function(e) {',
    '                            console.error("[ERROR] Creation failed: " + e.message);',
    '                            reject(new Error("Creation failed: " + e.message));',
    '                        }',
    '                    });',
    '                } catch (err) {',
    '                    console.error("[ERROR] Global error: " + err.message);',
    '                    reject(err);',
    '                }',
    '            });',
    '        };',
    '',
    '        // Traitement direct des données hiérarchiques',
    '        const nodes = ASSETS_DATA.hierarchyData.nodes;',
    '        const links = ASSETS_DATA.hierarchyData.links;',
    '        console.log("[DEBUG] Processing nodes:", JSON.stringify(nodes, null, 2));',
    '        console.log("[DEBUG] Processing links:", JSON.stringify(links, null, 2));',
    '        console.log("[DEBUG] Hierarchy levels:", JSON.stringify(hierarchyLevels, null, 2));',
    '',
    '        // Fonction pour trouver le parent d\'un nœud',
    '        const findParentNode = (nodeId, parentLevel) => {',
    '            const parentLink = links.find(link => link.target === nodeId);',
    '            if (parentLink) {',
    '                return nodes.find(node => node.id === parentLink.source && node.metadata.level === parentLevel);',
    '            }',
    '            return null;',
    '        };',
    '',
    '        // Créer les objets pour chaque niveau hiérarchique',
    '        for (const level of hierarchyLevels) {',
    '            const levelNodes = nodes.filter(node => node.metadata.level === level.name);',
    '            console.log(`[DEBUG] Found ${level.name}:`, JSON.stringify(levelNodes, null, 2));',
    '',
    '            for (const node of levelNodes) {',
    '                console.log(`[${level.name.toUpperCase()}] Creating ${level.name}:`, node.name);',
    '                const attributes = {',
    '                    "Nom": node.name,',
    '                    "TotalConso": "0"',
    '                };',
    '',
    '                // Gérer les références aux parents en fonction du niveau',
    '                if (level.name === "Machine") {',
    '                    console.log("[DEBUG] Machine metadata:", JSON.stringify(node.metadata, null, 2));',
    '                    attributes["Identifiant"] = node.metadata.assetId || node.id;',
    '                    attributes["IPE"] = "0";',
    '                    attributes["TypeEnergie"] = node.metadata.energyType || node.metadata.rawEnergyType || "";',
    '',
    '                    // Trouver le secteur parent',
    '                    const parentSecteur = findParentNode(node.id, "Secteur");',
    '                    if (parentSecteur) {',
    '                        attributes["Secteur"] = parentSecteur.name;',
    '                    }',
    '',
    '                    // Trouver l\'atelier parent',
    '                    const parentAtelier = findParentNode(node.id, "Atelier");',
    '                    if (parentAtelier) {',
    '                        attributes["Atelier"] = parentAtelier.name;',
    '                    }',
    '                } else if (level.name === "Atelier") {',
    '                    console.log("[DEBUG] Atelier metadata:", JSON.stringify(node.metadata, null, 2));',
    '                    // Trouver le secteur parent',
    '                    const parentSecteur = findParentNode(node.id, "Secteur");',
    '                    if (parentSecteur) {',
    '                        attributes["Secteur"] = parentSecteur.name;',
    '                    }',
    '                }',
    '',
    '                // Créer l\'objet',
    '                await createAndCommitObject(',
    '                    `Smart.${level.name}`,',
    '                    attributes',
    '                );',
    '',
    '                // Pour les machines, créer aussi les objets associés',
    '                if (level.name === "Machine") {',
    '                    // Traiter les variables de consommation',
    '                    if (node.metadata.variable) {',
    '                        console.log("[VARIABLE] Creating consumption variable for:", node.name);',
    '                        const aggConsoAttributes = {',
    '                            "VariableId": node.metadata.variable.id,',
    '                            "VariableName": node.metadata.variable.name,',
    '                            "AssetName": node.name,',
    '                            "Machine": node.name',
    '                        };',
'',
    '                        if (node.metadata.variable.aggregations) {',
    '                            const aggs = node.metadata.variable.aggregations;',
    '                            if (aggs["5min"]) aggConsoAttributes["Identifiant5Min"] = aggs["5min"].id;',
    '                            if (aggs["1h"]) aggConsoAttributes["Identifiant1h"] = aggs["1h"].id;',
    '                            if (aggs["4h"]) aggConsoAttributes["Identifiant4h"] = aggs["4h"].id;',
    '                            if (aggs["8h"]) aggConsoAttributes["Identifiant8h"] = aggs["8h"].id;',
    '                            if (aggs["1d"]) aggConsoAttributes["Identifiant1day"] = aggs["1d"].id;',
    '                        }',
'',
    '                        await createAndCommitObject(ENTITIES.AGGREGATION_CONSO, aggConsoAttributes);',
    '                    }',
'',
    '                    // Traiter les états des capteurs',
    '                    if (node.metadata.stateVariable) {',
    '                        console.log("[SENSOR] Creating sensor state for:", node.name);',
    '                        await createAndCommitObject(',
    '                            ENTITIES.ETAT_CAPTEUR,',
    '                            {',
    '                                "NomCapteur": node.name,',
    '                                "Etat": "false",',
    '                                "DerniereMaj": new Date().toISOString(),',
    '                                "IdEtatCapteur": node.metadata.stateVariable.variableId',
    '                            }',
    '                        );',
    '                    }',
    '                }',
    '            }',
    '        }',
'',
    '        mx.ui.info("Configuration terminée avec succès!", {});',
    '    } catch (error) {',
    '        console.error("Erreur lors de la configuration:", error);',
    '        mx.ui.error("Erreur lors de la configuration: " + error.message, {});',
    '        throw error;',
    '    }',
    '    // END USER CODE',
    '}'
  ].join('\n');

  return code;
}

export function generateDynamicCleanupCode(requiredEntities: RequiredEntity[]): string {
  const code = [
    '// BEGIN EXTRA CODE',
    'const ENTITIES = {',
    '    SECTEUR: "Smart.Secteur",',
    '    ATELIER: "Smart.Atelier",',
    '    MACHINE: "Smart.Machine",',
    '    AGGREGATION_CONSO: "Smart.Aggregation_Conso",',
    '    AGGREGATION_PRODUCTION: "Smart.Aggregation_Production",',
    '    AGGREGATION_IPE: "Smart.Aggregation_IPE",',
    '    ETAT_CAPTEUR: "Smart.EtatCapteur"',
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
    '        const deleteAllEntitiesOfType = async (entityName: string) => {',
    '            return new Promise((resolve, reject) => {',
    '                try {',
    '                    console.log(`Suppression des entités ${entityName}...`);',
    '                    mx.data.get({',
    '                        xpath: `//${entityName}`,',
    '                        callback: function(objs) {',
    '                            console.log(`${objs.length} ${entityName} trouvés`);',
    '                            const deletePromises = objs.map(obj => {',
    '                                return new Promise((resolveDelete) => {',
    '                                    mx.data.remove({',
    '                                        guid: obj.getGuid(),',
    '                                        callback: () => resolveDelete(true),',
    '                                        error: (e) => {',
    '                                            console.error(`Erreur lors de la suppression de ${entityName}:`, e);',
    '                                            resolveDelete(false);',
    '                                        }',
    '                                    });',
    '                                });',
    '                            });',
'',
    '                            Promise.all(deletePromises)',
    '                                .then(() => {',
    '                                    console.log(`Suppression de ${entityName} terminée`);',
    '                                    resolve(true);',
    '                                })',
    '                                .catch(error => {',
    '                                    console.error(`Erreur lors de la suppression des ${entityName}:`, error);',
    '                                    reject(error);',
    '                                });',
    '                        },',
    '                        error: function(error) {',
    '                            console.error(`Erreur lors de la récupération des ${entityName}:`, error);',
    '                            reject(error);',
    '                        }',
    '                    });',
    '                } catch (err) {',
    '                    console.error(`Erreur globale pour ${entityName}:`, err);',
    '                    reject(err);',
    '                }',
    '            });',
    '        };',
    '',
    '        // Supprimer dans l\'ordre inverse de la création pour respecter les dépendances',
    '        const entitiesToDelete = [',
    '            ENTITIES.ETAT_CAPTEUR,',
    '            ENTITIES.AGGREGATION_IPE,',
    '            ENTITIES.AGGREGATION_PRODUCTION,',
    '            ENTITIES.AGGREGATION_CONSO,',
    '            ENTITIES.MACHINE,',
    '            ENTITIES.ATELIER,',
    '            ENTITIES.SECTEUR',
    '        ];',
    '',
    '        for (const entity of entitiesToDelete) {',
    '            try {',
    '                await deleteAllEntitiesOfType(entity);',
    '            } catch (error) {',
    '                console.error(`Erreur lors du nettoyage de ${entity}:`, error);',
    '            }',
    '        }',
'',
    '        console.log("=== Nettoyage terminé ===");',
    '        mx.ui.info("Nettoyage terminé avec succès!", {});',
    '    } catch (error) {',
    '        console.error("Erreur lors du nettoyage:", error);',
    '        mx.ui.error("Erreur lors du nettoyage: " + error.message, {});',
    '        throw error;',
    '    }',
    '    // END USER CODE',
    '}'
  ].join('\n');

  return code;
} 