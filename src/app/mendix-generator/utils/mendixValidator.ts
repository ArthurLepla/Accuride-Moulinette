import { IIHData } from './codeGenerator';

export interface RequiredAttribute {
  name: string;
  type: string;
}

export interface RequiredEntity {
  name: string;
  attributes: RequiredAttribute[];
}

export function generateRequiredEntities(hierarchyLevels: { name: string }[]): RequiredEntity[] {
  const entities: RequiredEntity[] = [];

  // Ajouter les entités pour chaque niveau hiérarchique
  hierarchyLevels.forEach((level, index) => {
    const entityName = `Smart.${level.name.replace(/\s+/g, '')}`;
    let attributes: RequiredAttribute[] = [];
    
    // Le dernier niveau est spécial (Machine)
    if (index === hierarchyLevels.length - 1) {
      attributes = [
        { name: 'Identifiant', type: 'String' },
        { name: 'Nom', type: 'String' },
        { name: 'IPE', type: 'String' },
        { name: 'TotalConso', type: 'String' },
        { name: 'TypeEnergie', type: 'String' }
      ];
    } else {
      // Pour les autres niveaux, inclure les attributs de consommation par type d'énergie
      attributes = [
        { name: 'Nom', type: 'String' },
        { name: 'TotalConso', type: 'String' },
        { name: 'TotalConsoElec', type: 'String' },
        { name: 'TotalConsoGaz', type: 'String' },
        { name: 'TotalConsoAir', type: 'String' },
        { name: 'TotalConsoEau', type: 'String' }
      ];
    }

    // Ajouter les références aux niveaux parents pour tous les niveaux sauf le premier
    if (index > 0) {
      for (let i = 0; i < index; i++) {
        const parentLevel = hierarchyLevels[i];
        attributes.push({
          name: parentLevel.name.replace(/\s+/g, ''),
          type: 'String'
        });
      }
    }

    entities.push({
      name: entityName,
      attributes
    });
    
    // Ajouter les entités d'agrégation spécifiques pour chaque niveau
    const levelNameNormalized = level.name.replace(/\s+/g, '');
    
    // Consommation par niveau
    entities.push({
      name: `Smart.Aggregation_Conso_${levelNameNormalized.toUpperCase()}`,
      attributes: [
        { name: 'VariableId', type: 'String' },
        { name: 'VariableName', type: 'String' },
        { name: 'AssetName', type: 'String' },
        { name: level.name, type: 'String' },
        { name: 'TypeEnergie', type: 'String' },
        { name: 'Identifiant5Min', type: 'String' },
        { name: 'Identifiant1h', type: 'String' },
        { name: 'Identifiant4h', type: 'String' },
        { name: 'Identifiant8h', type: 'String' },
        { name: 'Identifiant1day', type: 'String' }
      ]
    });
    
    // Pour tous les niveaux sauf le dernier, ajouter les entités d'agrégation de production et IPE
    if (index < hierarchyLevels.length - 1) {
      // Production Quantité par niveau
      entities.push({
        name: `Smart.Aggregation_Production_Quantite_${levelNameNormalized.toUpperCase()}`,
        attributes: [
          { name: 'VariableId', type: 'String' },
          { name: 'VariableName', type: 'String' },
          { name: 'AssetName', type: 'String' },
          { name: level.name, type: 'String' },
          { name: 'Identifiant5Min', type: 'String' },
          { name: 'Identifiant1h', type: 'String' },
          { name: 'Identifiant4h', type: 'String' },
          { name: 'Identifiant8h', type: 'String' },
          { name: 'Identifiant1day', type: 'String' }
        ]
      });
      
      // Production Kg par niveau
      entities.push({
        name: `Smart.Aggregation_Production_Kg_${levelNameNormalized.toUpperCase()}`,
        attributes: [
          { name: 'VariableId', type: 'String' },
          { name: 'VariableName', type: 'String' },
          { name: 'AssetName', type: 'String' },
          { name: level.name, type: 'String' },
          { name: 'Identifiant5Min', type: 'String' },
          { name: 'Identifiant1h', type: 'String' },
          { name: 'Identifiant4h', type: 'String' },
          { name: 'Identifiant8h', type: 'String' },
          { name: 'Identifiant1day', type: 'String' }
        ]
      });
      
      // IPE Quantité par niveau
      entities.push({
        name: `Smart.Aggregation_IPE_Quantite_${levelNameNormalized.toUpperCase()}`,
        attributes: [
          { name: 'VariableId', type: 'String' },
          { name: 'VariableName', type: 'String' },
          { name: 'AssetName', type: 'String' },
          { name: level.name, type: 'String' },
          { name: 'TypeEnergie', type: 'String' },
          { name: 'Identifiant5Min', type: 'String' },
          { name: 'Identifiant1h', type: 'String' },
          { name: 'Identifiant4h', type: 'String' },
          { name: 'Identifiant8h', type: 'String' },
          { name: 'Identifiant1day', type: 'String' }
        ]
      });
      
      // IPE Kg par niveau
      entities.push({
        name: `Smart.Aggregation_IPE_Kg_${levelNameNormalized.toUpperCase()}`,
        attributes: [
          { name: 'VariableId', type: 'String' },
          { name: 'VariableName', type: 'String' },
          { name: 'AssetName', type: 'String' },
          { name: level.name, type: 'String' },
          { name: 'TypeEnergie', type: 'String' },
          { name: 'Identifiant5Min', type: 'String' },
          { name: 'Identifiant1h', type: 'String' },
          { name: 'Identifiant4h', type: 'String' },
          { name: 'Identifiant8h', type: 'String' },
          { name: 'Identifiant1day', type: 'String' }
        ]
      });
    }
  });

  // Ajouter l'entité pour les états des capteurs
  entities.push({
    name: 'Smart.EtatCapteur',
    attributes: [
      { name: 'NomCapteur', type: 'String' },
      { name: 'Etat', type: 'String' },
      { name: 'DerniereMaj', type: 'String' },
      { name: 'IdEtatCapteur', type: 'String' }
    ]
  });

  return entities;
}

export function generateMendixValidationCode(requiredEntities: RequiredEntity[]): string {
  const code = [
    '// Code de validation des entités Mendix',
    'export async function validateMendixEntities() {',
    '    // BEGIN USER CODE',
    '    try {',
    '        const validationResults = [];',
    '',
    '        const validateEntity = async (entityName) => {',
    '            return new Promise((resolve, reject) => {',
    '                mx.meta.getEntity(entityName, {',
    '                    callback: entity => resolve(entity),',
    '                    error: error => reject(new Error(`Entité ${entityName} non trouvée: ${error.message}`))',
    '                });',
    '            });',
    '        };',
    '',
    '        // Valider chaque entité requise',
    '        for (const entity of ' + JSON.stringify(requiredEntities, null, 4) + ') {',
    '            try {',
    '                const mendixEntity = await validateEntity(entity.name);',
    '                const missingAttributes = [];',
    '',
    '                // Vérifier les attributs requis',
    '                for (const attr of entity.attributes) {',
    '                    if (!mendixEntity.has(attr.name)) {',
    '                        missingAttributes.push(attr.name);',
    '                    }',
    '                }',
    '',
    '                if (missingAttributes.length > 0) {',
    '                    validationResults.push({',
    '                        entity: entity.name,',
    '                        valid: false,',
    '                        error: `Attributs manquants: ${missingAttributes.join(", ")}`',
    '                    });',
    '                } else {',
    '                    validationResults.push({',
    '                        entity: entity.name,',
    '                        valid: true',
    '                    });',
    '                }',
    '            } catch (error) {',
    '                validationResults.push({',
    '                    entity: entity.name,',
    '                    valid: false,',
    '                    error: error.message',
    '                });',
    '            }',
    '        }',
    '',
    '        // Vérifier s\'il y a des erreurs',
    '        const errors = validationResults.filter(r => !r.valid);',
    '        if (errors.length > 0) {',
    '            const errorMessage = errors.map(e => `${e.entity}: ${e.error}`).join("\\n");',
    '            throw new Error(`Validation échouée:\\n${errorMessage}`);',
    '        }',
    '',
    '        return true;',
    '    } catch (error) {',
    '        console.error("Erreur lors de la validation:", error);',
    '        throw error;',
    '    }',
    '    // END USER CODE',
    '}'
  ].join('\n');

  return code;
}

export interface MendixEntitySummary {
  totalEntities: {
    [key: string]: number;
  };
  // Niveaux hiérarchiques (dynamique)
  [key: string]: any;
  // Entités d'agrégation consommation par niveau
  aggregations_conso_secteur?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_conso_atelier?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_conso_ligne?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_conso_poste?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Poste: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_conso_machine?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Machine: string;
      Poste?: string;
      Ligne?: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  
  // Agrégations production quantité par niveau (sauf machine)
  aggregations_production_quantite_secteur?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_quantite_atelier?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_quantite_ligne?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_quantite_poste?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Poste: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  
  // Agrégations production kg par niveau (sauf machine)
  aggregations_production_kg_secteur?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_kg_atelier?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_kg_ligne?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_production_kg_poste?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Poste: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  
  // Agrégations IPE quantité par niveau (sauf machine)
  aggregations_ipe_quantite_secteur?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_quantite_atelier?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_quantite_ligne?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_quantite_poste?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Poste: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  
  // Agrégations IPE kg par niveau (sauf machine)
  aggregations_ipe_kg_secteur?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_kg_atelier?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_kg_ligne?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  aggregations_ipe_kg_poste?: Array<{
    entity: string;
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Poste: string;
      Ligne: string;
      Atelier: string;
      Secteur: string;
      TypeEnergie: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
  }>;
  
  // État des capteurs
  etatCapteurs: Array<{
    entity: 'Smart.EtatCapteur';
    attributes: {
      NomCapteur: string;
      Etat: string;
      DerniereMaj: string;
      IdEtatCapteur: string;
    };
  }>;
}

interface HierarchyNode {
  id: string;
  name: string;
  level: number;
  levelName: string;
  metadata: {
    level: string;
    rawEnergyType?: string;
    energyType?: string;
    assetId?: string;
    type?: string;
    parentSector?: string;
    parentWorkshop?: string;
    parentLine?: string;
    parentPoste?: string;
    variable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
          cycle: {
            base: string;
            factor: number;
          };
        };
      };
    };
    productionVariable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
          cycle: {
            base: string;
            factor: number;
          };
        };
      };
    };
    productionKgVariable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
          cycle: {
            base: string;
            factor: number;
          };
        };
      };
    };
    ipeVariable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
          cycle: {
            base: string;
            factor: number;
          };
        };
      };
    };
    ipeQuantiteVariable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
          cycle: {
            base: string;
            factor: number;
          };
        };
      };
    };
    ipeKgVariable?: {
      id: string;
      name: string;
      aggregations?: {
        [key: string]: {
          id: string;
          type: string;
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
}

export function generateMendixSummary(iihData: any): MendixEntitySummary {
  const summary: MendixEntitySummary = {
    totalEntities: {
      Secteur: 0,
      Atelier: 0,
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
    machines: [],
    // Initialiser toutes les listes d'agrégation par niveau
    aggregations_conso_secteur: [],
    aggregations_conso_atelier: [],
    aggregations_conso_ligne: [],
    aggregations_conso_poste: [],
    aggregations_conso_machine: [],
    
    aggregations_production_quantite_secteur: [],
    aggregations_production_quantite_atelier: [],
    aggregations_production_quantite_ligne: [],
    aggregations_production_quantite_poste: [],
    
    aggregations_production_kg_secteur: [],
    aggregations_production_kg_atelier: [],
    aggregations_production_kg_ligne: [],
    aggregations_production_kg_poste: [],
    
    aggregations_ipe_quantite_secteur: [],
    aggregations_ipe_quantite_atelier: [],
    aggregations_ipe_quantite_ligne: [],
    aggregations_ipe_quantite_poste: [],
    
    aggregations_ipe_kg_secteur: [],
    aggregations_ipe_kg_atelier: [],
    aggregations_ipe_kg_ligne: [],
    aggregations_ipe_kg_poste: [],
    
    etatCapteurs: []
  };

  // Si nous avons des données hiérarchiques
  if (iihData.hierarchyData?.nodes) {
    const nodes = iihData.hierarchyData.nodes as HierarchyNode[];
    
    // Première passe : créer les secteurs
    nodes.forEach(node => {
      if (node.metadata.level === 'Secteur') {
        summary.totalEntities.Secteur++;
        summary.secteurs.push({
          entity: 'Smart.Secteur',
          attributes: {
            Nom: node.name,
            TotalConso: '0',
            TotalConsoElec: '0',
            TotalConsoGaz: '0',
            TotalConsoAir: '0',
            TotalConsoEau: '0'
          }
        });
      }
    });

    // Deuxième passe : créer les ateliers
    nodes.forEach(node => {
      if (node.metadata.level === 'Atelier') {
        summary.totalEntities.Atelier++;
        
        // Trouver le secteur parent
        const parentSector = node.metadata.parentSector || '';
        
        summary.ateliers.push({
          entity: 'Smart.Atelier',
          attributes: {
            Nom: node.name,
            TotalConso: '0',
            TotalConsoElec: '0',
            TotalConsoGaz: '0',
            TotalConsoAir: '0',
            TotalConsoEau: '0',
            Secteur: parentSector
          }
        });
      }
    });

    // Troisième passe : traiter les niveaux intermédiaires (Ligne, Poste) s'ils existent
    nodes.forEach(node => {
      if (node.metadata.level === 'Ligne') {
        // Ajouter la ligne à l'objet summary si la structure existe
        if (summary.lignes) {
          summary.lignes.push({
            entity: 'Smart.Ligne',
            attributes: {
              Nom: node.name,
              TotalConso: '0',
              TotalConsoElec: '0',
              TotalConsoGaz: '0',
              TotalConsoAir: '0',
              TotalConsoEau: '0',
              Secteur: node.metadata.parentSector || '',
              Atelier: node.metadata.parentWorkshop || ''
            }
          });
        }
      } else if (node.metadata.level === 'Poste') {
        // Ajouter le poste à l'objet summary si la structure existe
        if (summary.postes) {
          summary.postes.push({
            entity: 'Smart.Poste',
            attributes: {
              Nom: node.name,
              TotalConso: '0',
              TotalConsoElec: '0',
              TotalConsoGaz: '0',
              TotalConsoAir: '0',
              TotalConsoEau: '0',
              Secteur: node.metadata.parentSector || '',
              Atelier: node.metadata.parentWorkshop || '',
              Ligne: node.metadata.parentLine || ''
            }
          });
        }
      }
    });

    // Traiter les machines et leurs variables
    nodes.forEach(node => {
      if (node.metadata.level === 'Machine') {
        summary.totalEntities.Machine++;
        
        // Créer la machine
        summary.machines.push({
          entity: 'Smart.Machine',
          attributes: {
            Identifiant: node.metadata.assetId || node.id,
            Nom: node.name,
            IPE: '0',
            TotalConso: '0',
            Secteur: node.metadata.parentSector || '',
            Atelier: node.metadata.parentWorkshop || '',
            Ligne: node.metadata.parentLine || '',
            Poste: node.metadata.parentPoste || '',
            TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || ''
          }
        });

        // Traiter les variables de consommation
        if (node.metadata.variable) {
          summary.totalEntities.SmartAggregation_Conso++;
          
          const aggConso = {
            entity: 'Smart.Aggregation_Conso_MACHINE',
            attributes: {
              VariableId: node.metadata.variable.id,
              VariableName: node.metadata.variable.name,
              AssetName: node.name,
              Machine: node.name,
              TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || "Elec",
              Secteur: node.metadata.parentSector || '',
              Atelier: node.metadata.parentWorkshop || '',
              Ligne: node.metadata.parentLine || '',
              Poste: node.metadata.parentPoste || ''
            } as any
          };

          // Initialisation des identifiants d'agrégation
          if (node.metadata.variable.aggregations) {
            const aggs = node.metadata.variable.aggregations;
            if (aggs['5min'] && aggs['5min'].id) {
              aggConso.attributes.Identifiant5Min = aggs['5min'].id;
              console.log(`Saving aggregation ID for ${node.name} 5min: ${aggs['5min'].id}`);
            }
            if (aggs['1h'] && aggs['1h'].id) {
              aggConso.attributes.Identifiant1h = aggs['1h'].id;
              console.log(`Saving aggregation ID for ${node.name} 1h: ${aggs['1h'].id}`);
            }
            if (aggs['4h'] && aggs['4h'].id) {
              aggConso.attributes.Identifiant4h = aggs['4h'].id;
              console.log(`Saving aggregation ID for ${node.name} 4h: ${aggs['4h'].id}`);
            }
            if (aggs['8h'] && aggs['8h'].id) {
              aggConso.attributes.Identifiant8h = aggs['8h'].id;
              console.log(`Saving aggregation ID for ${node.name} 8h: ${aggs['8h'].id}`);
            }
            if (aggs['1d'] && aggs['1d'].id) {
              aggConso.attributes.Identifiant1day = aggs['1d'].id;
              console.log(`Saving aggregation ID for ${node.name} 1d: ${aggs['1d'].id}`);
            }
          }

          // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
          if (aggConso.attributes.VariableId && aggConso.attributes.VariableId.length > 0) {
            console.log(`Using VariableId for ${node.name}: ${aggConso.attributes.VariableId}`);
            // Ne pas écraser les identifiants existants s'ils sont déjà définis
            if (!aggConso.attributes.Identifiant5Min)
              aggConso.attributes.Identifiant5Min = `${aggConso.attributes.VariableId}_5min`;
            if (!aggConso.attributes.Identifiant1h)
              aggConso.attributes.Identifiant1h = `${aggConso.attributes.VariableId}_1h`;
            if (!aggConso.attributes.Identifiant4h)
              aggConso.attributes.Identifiant4h = `${aggConso.attributes.VariableId}_4h`;
            if (!aggConso.attributes.Identifiant8h)
              aggConso.attributes.Identifiant8h = `${aggConso.attributes.VariableId}_8h`;
            if (!aggConso.attributes.Identifiant1day)
              aggConso.attributes.Identifiant1day = `${aggConso.attributes.VariableId}_1d`;
          } else if (node.metadata.variable && node.metadata.variable.id) {
            // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
            console.log(`Setting VariableId for ${node.name} from metadata: ${node.metadata.variable.id}`);
            aggConso.attributes.VariableId = node.metadata.variable.id;
            
            // Générer les identifiants d'agrégation manquants
            if (!aggConso.attributes.Identifiant5Min)
              aggConso.attributes.Identifiant5Min = `${aggConso.attributes.VariableId}_5min`;
            if (!aggConso.attributes.Identifiant1h)
              aggConso.attributes.Identifiant1h = `${aggConso.attributes.VariableId}_1h`;
            if (!aggConso.attributes.Identifiant4h)
              aggConso.attributes.Identifiant4h = `${aggConso.attributes.VariableId}_4h`;
            if (!aggConso.attributes.Identifiant8h)
              aggConso.attributes.Identifiant8h = `${aggConso.attributes.VariableId}_8h`;
            if (!aggConso.attributes.Identifiant1day)
              aggConso.attributes.Identifiant1day = `${aggConso.attributes.VariableId}_1d`;
          }

          // Ajouter à aggregations_conso_machine au lieu de aggregations_conso
          summary.aggregations_conso_machine!.push(aggConso);
        }

        // Traiter les états des capteurs
        if (node.metadata.stateVariable) {
          summary.totalEntities.EtatCapteur++;
          summary.etatCapteurs.push({
            entity: 'Smart.EtatCapteur',
            attributes: {
              NomCapteur: node.name,
              Etat: 'false',
              DerniereMaj: new Date().toISOString(),
              IdEtatCapteur: node.metadata.stateVariable.variableId
            }
          });
        }
      }
    });

    // Traiter les agrégations des niveaux supérieurs
    nodes.forEach(node => {
      const levelName = node.metadata.level.toLowerCase();
      
      // Traiter les variables pour chaque niveau (sauf Machine, qui est déjà fait)
      if (levelName !== 'machine') {
        
        // Traiter les variables de consommation pour ce niveau
        if (node.metadata.variable) {
          const targetArray = summary[`aggregations_conso_${levelName}`];
          if (Array.isArray(targetArray)) {
            const aggConsoAttributes = {
              VariableId: node.metadata.variable.id,
              VariableName: node.metadata.variable.name,
              AssetName: node.name,
              [node.metadata.level]: node.name,
              TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || "Elec",
              Secteur: node.metadata.parentSector || ''
            } as any;

            if (node.metadata.parentWorkshop) aggConsoAttributes.Atelier = node.metadata.parentWorkshop;
            if (node.metadata.parentLine) aggConsoAttributes.Ligne = node.metadata.parentLine;
            
            // Initialisation des identifiants d'agrégation
            if (node.metadata.variable.aggregations) {
              const aggs = node.metadata.variable.aggregations;
              if (aggs['5min'] && aggs['5min'].id) {
                aggConsoAttributes.Identifiant5Min = aggs['5min'].id;
                console.log(`Saving aggregation ID for ${node.name} 5min: ${aggs['5min'].id}`);
              }
              if (aggs['1h'] && aggs['1h'].id) {
                aggConsoAttributes.Identifiant1h = aggs['1h'].id;
                console.log(`Saving aggregation ID for ${node.name} 1h: ${aggs['1h'].id}`);
              }
              if (aggs['4h'] && aggs['4h'].id) {
                aggConsoAttributes.Identifiant4h = aggs['4h'].id;
                console.log(`Saving aggregation ID for ${node.name} 4h: ${aggs['4h'].id}`);
              }
              if (aggs['8h'] && aggs['8h'].id) {
                aggConsoAttributes.Identifiant8h = aggs['8h'].id;
                console.log(`Saving aggregation ID for ${node.name} 8h: ${aggs['8h'].id}`);
              }
              if (aggs['1d'] && aggs['1d'].id) {
                aggConsoAttributes.Identifiant1day = aggs['1d'].id;
                console.log(`Saving aggregation ID for ${node.name} 1d: ${aggs['1d'].id}`);
              }
            }
            
            // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
            if (aggConsoAttributes.VariableId && aggConsoAttributes.VariableId.length > 0) {
              console.log(`Using VariableId for ${node.name}: ${aggConsoAttributes.VariableId}`);
              // Ne pas écraser les identifiants existants s'ils sont déjà définis
              if (!aggConsoAttributes.Identifiant5Min)
                aggConsoAttributes.Identifiant5Min = `${aggConsoAttributes.VariableId}_5min`;
              if (!aggConsoAttributes.Identifiant1h)
                aggConsoAttributes.Identifiant1h = `${aggConsoAttributes.VariableId}_1h`;
              if (!aggConsoAttributes.Identifiant4h)
                aggConsoAttributes.Identifiant4h = `${aggConsoAttributes.VariableId}_4h`;
              if (!aggConsoAttributes.Identifiant8h)
                aggConsoAttributes.Identifiant8h = `${aggConsoAttributes.VariableId}_8h`;
              if (!aggConsoAttributes.Identifiant1day)
                aggConsoAttributes.Identifiant1day = `${aggConsoAttributes.VariableId}_1d`;
            } else if (node.metadata.variable && node.metadata.variable.id) {
              // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
              console.log(`Setting VariableId for ${node.name} from metadata: ${node.metadata.variable.id}`);
              aggConsoAttributes.VariableId = node.metadata.variable.id;
              
              // Générer les identifiants d'agrégation manquants
              if (!aggConsoAttributes.Identifiant5Min)
                aggConsoAttributes.Identifiant5Min = `${aggConsoAttributes.VariableId}_5min`;
              if (!aggConsoAttributes.Identifiant1h)
                aggConsoAttributes.Identifiant1h = `${aggConsoAttributes.VariableId}_1h`;
              if (!aggConsoAttributes.Identifiant4h)
                aggConsoAttributes.Identifiant4h = `${aggConsoAttributes.VariableId}_4h`;
              if (!aggConsoAttributes.Identifiant8h)
                aggConsoAttributes.Identifiant8h = `${aggConsoAttributes.VariableId}_8h`;
              if (!aggConsoAttributes.Identifiant1day)
                aggConsoAttributes.Identifiant1day = `${aggConsoAttributes.VariableId}_1d`;
            }

            targetArray.push({
              entity: `Smart.Aggregation_Conso_${node.metadata.level.toUpperCase()}`,
              attributes: aggConsoAttributes
            });
          }
        }
        
        // Traiter les variables de production (quantité)
        if (node.metadata.productionVariable) {
          summary.totalEntities.SmartAggregation_Production_Quantite++;
          const targetArray = summary[`aggregations_production_quantite_${levelName}`];
          
          if (Array.isArray(targetArray)) {
            const aggProdAttributes = {
              VariableId: node.metadata.productionVariable.id,
              VariableName: node.metadata.productionVariable.name,
              AssetName: node.name,
              [node.metadata.level]: node.name,
              Secteur: node.metadata.parentSector || ''
            } as any;

            if (node.metadata.parentWorkshop) aggProdAttributes.Atelier = node.metadata.parentWorkshop;
            if (node.metadata.parentLine) aggProdAttributes.Ligne = node.metadata.parentLine;
            
            // Initialisation des identifiants d'agrégation
            if (node.metadata.productionVariable.aggregations) {
              const aggs = node.metadata.productionVariable.aggregations;
              if (aggs['5min'] && aggs['5min'].id) aggProdAttributes.Identifiant5Min = aggs['5min'].id;
              if (aggs['1h'] && aggs['1h'].id) aggProdAttributes.Identifiant1h = aggs['1h'].id;
              if (aggs['4h'] && aggs['4h'].id) aggProdAttributes.Identifiant4h = aggs['4h'].id;
              if (aggs['8h'] && aggs['8h'].id) aggProdAttributes.Identifiant8h = aggs['8h'].id;
              if (aggs['1d'] && aggs['1d'].id) aggProdAttributes.Identifiant1day = aggs['1d'].id;
            }
            
            // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
            if (aggProdAttributes.VariableId && aggProdAttributes.VariableId.length > 0) {
              console.log(`Using VariableId for ${node.name}: ${aggProdAttributes.VariableId}`);
              // Ne pas écraser les identifiants existants s'ils sont déjà définis
              if (!aggProdAttributes.Identifiant5Min)
                aggProdAttributes.Identifiant5Min = `${aggProdAttributes.VariableId}_5min`;
              if (!aggProdAttributes.Identifiant1h)
                aggProdAttributes.Identifiant1h = `${aggProdAttributes.VariableId}_1h`;
              if (!aggProdAttributes.Identifiant4h)
                aggProdAttributes.Identifiant4h = `${aggProdAttributes.VariableId}_4h`;
              if (!aggProdAttributes.Identifiant8h)
                aggProdAttributes.Identifiant8h = `${aggProdAttributes.VariableId}_8h`;
              if (!aggProdAttributes.Identifiant1day)
                aggProdAttributes.Identifiant1day = `${aggProdAttributes.VariableId}_1d`;
            } else if (node.metadata.productionVariable && node.metadata.productionVariable.id) {
              // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
              console.log(`Setting VariableId for ${node.name} from metadata: ${node.metadata.productionVariable.id}`);
              aggProdAttributes.VariableId = node.metadata.productionVariable.id;
              
              // Générer les identifiants d'agrégation manquants
              if (!aggProdAttributes.Identifiant5Min)
                aggProdAttributes.Identifiant5Min = `${aggProdAttributes.VariableId}_5min`;
              if (!aggProdAttributes.Identifiant1h)
                aggProdAttributes.Identifiant1h = `${aggProdAttributes.VariableId}_1h`;
              if (!aggProdAttributes.Identifiant4h)
                aggProdAttributes.Identifiant4h = `${aggProdAttributes.VariableId}_4h`;
              if (!aggProdAttributes.Identifiant8h)
                aggProdAttributes.Identifiant8h = `${aggProdAttributes.VariableId}_8h`;
              if (!aggProdAttributes.Identifiant1day)
                aggProdAttributes.Identifiant1day = `${aggProdAttributes.VariableId}_1d`;
            }

            targetArray.push({
              entity: `Smart.Aggregation_Production_Quantite_${node.metadata.level.toUpperCase()}`,
              attributes: aggProdAttributes
            });
          }
        }
        
        // Traiter les variables de production (kg)
        if (node.metadata.productionKgVariable) {
          summary.totalEntities.SmartAggregation_Production_Kg++;
          const targetArray = summary[`aggregations_production_kg_${levelName}`];
          
          if (Array.isArray(targetArray)) {
            const aggProdKgAttributes = {
              VariableId: node.metadata.productionKgVariable.id,
              VariableName: node.metadata.productionKgVariable.name,
              AssetName: node.name,
              [node.metadata.level]: node.name,
              Secteur: node.metadata.parentSector || ''
            } as any;

            if (node.metadata.parentWorkshop) aggProdKgAttributes.Atelier = node.metadata.parentWorkshop;
            if (node.metadata.parentLine) aggProdKgAttributes.Ligne = node.metadata.parentLine;
            
            // Initialisation des identifiants d'agrégation
            if (node.metadata.productionKgVariable.aggregations) {
              const aggs = node.metadata.productionKgVariable.aggregations;
              if (aggs['5min'] && aggs['5min'].id) aggProdKgAttributes.Identifiant5Min = aggs['5min'].id;
              if (aggs['1h'] && aggs['1h'].id) aggProdKgAttributes.Identifiant1h = aggs['1h'].id;
              if (aggs['4h'] && aggs['4h'].id) aggProdKgAttributes.Identifiant4h = aggs['4h'].id;
              if (aggs['8h'] && aggs['8h'].id) aggProdKgAttributes.Identifiant8h = aggs['8h'].id;
              if (aggs['1d'] && aggs['1d'].id) aggProdKgAttributes.Identifiant1day = aggs['1d'].id;
            }
            
            // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
            if (aggProdKgAttributes.VariableId && aggProdKgAttributes.VariableId.length > 0) {
              console.log(`Using VariableId for ${node.name}: ${aggProdKgAttributes.VariableId}`);
              // Ne pas écraser les identifiants existants s'ils sont déjà définis
              if (!aggProdKgAttributes.Identifiant5Min)
                aggProdKgAttributes.Identifiant5Min = `${aggProdKgAttributes.VariableId}_5min`;
              if (!aggProdKgAttributes.Identifiant1h)
                aggProdKgAttributes.Identifiant1h = `${aggProdKgAttributes.VariableId}_1h`;
              if (!aggProdKgAttributes.Identifiant4h)
                aggProdKgAttributes.Identifiant4h = `${aggProdKgAttributes.VariableId}_4h`;
              if (!aggProdKgAttributes.Identifiant8h)
                aggProdKgAttributes.Identifiant8h = `${aggProdKgAttributes.VariableId}_8h`;
              if (!aggProdKgAttributes.Identifiant1day)
                aggProdKgAttributes.Identifiant1day = `${aggProdKgAttributes.VariableId}_1d`;
            } else if (node.metadata.productionKgVariable && node.metadata.productionKgVariable.id) {
              // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
              console.log(`Setting VariableId for ${node.name} from metadata: ${node.metadata.productionKgVariable.id}`);
              aggProdKgAttributes.VariableId = node.metadata.productionKgVariable.id;
              
              // Générer les identifiants d'agrégation manquants
              if (!aggProdKgAttributes.Identifiant5Min)
                aggProdKgAttributes.Identifiant5Min = `${aggProdKgAttributes.VariableId}_5min`;
              if (!aggProdKgAttributes.Identifiant1h)
                aggProdKgAttributes.Identifiant1h = `${aggProdKgAttributes.VariableId}_1h`;
              if (!aggProdKgAttributes.Identifiant4h)
                aggProdKgAttributes.Identifiant4h = `${aggProdKgAttributes.VariableId}_4h`;
              if (!aggProdKgAttributes.Identifiant8h)
                aggProdKgAttributes.Identifiant8h = `${aggProdKgAttributes.VariableId}_8h`;
              if (!aggProdKgAttributes.Identifiant1day)
                aggProdKgAttributes.Identifiant1day = `${aggProdKgAttributes.VariableId}_1d`;
            }

            targetArray.push({
              entity: `Smart.Aggregation_Production_Kg_${node.metadata.level.toUpperCase()}`,
              attributes: aggProdKgAttributes
            });
          }
        }
        
        // Traiter les variables IPE (quantité)
        if (node.metadata.ipeVariable || node.metadata.ipeQuantiteVariable) {
          summary.totalEntities.SmartAggregation_IPE_Quantite++;
          const targetArray = summary[`aggregations_ipe_quantite_${levelName}`];
          
          if (Array.isArray(targetArray)) {
            const ipeVar = node.metadata.ipeVariable || node.metadata.ipeQuantiteVariable;
            const aggIpeQteAttributes = {
              VariableId: ipeVar!.id,
              VariableName: ipeVar!.name,
              AssetName: node.name,
              [node.metadata.level]: node.name,
              TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || "Elec",
              Secteur: node.metadata.parentSector || ''
            } as any;

            if (node.metadata.parentWorkshop) aggIpeQteAttributes.Atelier = node.metadata.parentWorkshop;
            if (node.metadata.parentLine) aggIpeQteAttributes.Ligne = node.metadata.parentLine;
            
            // Initialisation des identifiants d'agrégation
            if (ipeVar && ipeVar.aggregations) {
              const aggs = ipeVar.aggregations;
              if (aggs['5min'] && aggs['5min'].id) aggIpeQteAttributes.Identifiant5Min = aggs['5min'].id;
              if (aggs['1h'] && aggs['1h'].id) aggIpeQteAttributes.Identifiant1h = aggs['1h'].id;
              if (aggs['4h'] && aggs['4h'].id) aggIpeQteAttributes.Identifiant4h = aggs['4h'].id;
              if (aggs['8h'] && aggs['8h'].id) aggIpeQteAttributes.Identifiant8h = aggs['8h'].id;
              if (aggs['1d'] && aggs['1d'].id) aggIpeQteAttributes.Identifiant1day = aggs['1d'].id;
            }
            
            // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
            if (aggIpeQteAttributes.VariableId && aggIpeQteAttributes.VariableId.length > 0) {
              console.log(`Using VariableId for ${node.name}: ${aggIpeQteAttributes.VariableId}`);
              // Ne pas écraser les identifiants existants s'ils sont déjà définis
              if (!aggIpeQteAttributes.Identifiant5Min)
                aggIpeQteAttributes.Identifiant5Min = `${aggIpeQteAttributes.VariableId}_5min`;
              if (!aggIpeQteAttributes.Identifiant1h)
                aggIpeQteAttributes.Identifiant1h = `${aggIpeQteAttributes.VariableId}_1h`;
              if (!aggIpeQteAttributes.Identifiant4h)
                aggIpeQteAttributes.Identifiant4h = `${aggIpeQteAttributes.VariableId}_4h`;
              if (!aggIpeQteAttributes.Identifiant8h)
                aggIpeQteAttributes.Identifiant8h = `${aggIpeQteAttributes.VariableId}_8h`;
              if (!aggIpeQteAttributes.Identifiant1day)
                aggIpeQteAttributes.Identifiant1day = `${aggIpeQteAttributes.VariableId}_1d`;
            } else if (ipeVar && ipeVar.id) {
              // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
              console.log(`Setting VariableId for ${node.name} from metadata: ${ipeVar.id}`);
              aggIpeQteAttributes.VariableId = ipeVar.id;
              
              // Générer les identifiants d'agrégation manquants
              if (!aggIpeQteAttributes.Identifiant5Min)
                aggIpeQteAttributes.Identifiant5Min = `${aggIpeQteAttributes.VariableId}_5min`;
              if (!aggIpeQteAttributes.Identifiant1h)
                aggIpeQteAttributes.Identifiant1h = `${aggIpeQteAttributes.VariableId}_1h`;
              if (!aggIpeQteAttributes.Identifiant4h)
                aggIpeQteAttributes.Identifiant4h = `${aggIpeQteAttributes.VariableId}_4h`;
              if (!aggIpeQteAttributes.Identifiant8h)
                aggIpeQteAttributes.Identifiant8h = `${aggIpeQteAttributes.VariableId}_8h`;
              if (!aggIpeQteAttributes.Identifiant1day)
                aggIpeQteAttributes.Identifiant1day = `${aggIpeQteAttributes.VariableId}_1d`;
            }

            targetArray.push({
              entity: `Smart.Aggregation_IPE_Quantite_${node.metadata.level.toUpperCase()}`,
              attributes: aggIpeQteAttributes
            });
          }
        }
        
        // Traiter les variables IPE (kg)
        if (node.metadata.ipeKgVariable) {
          summary.totalEntities.SmartAggregation_IPE_Kg++;
          const targetArray = summary[`aggregations_ipe_kg_${levelName}`];
          
          if (Array.isArray(targetArray)) {
            const aggIpeKgAttributes = {
              VariableId: node.metadata.ipeKgVariable.id,
              VariableName: node.metadata.ipeKgVariable.name,
              AssetName: node.name,
              [node.metadata.level]: node.name,
              TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || "Elec",
              Secteur: node.metadata.parentSector || ''
            } as any;

            if (node.metadata.parentWorkshop) aggIpeKgAttributes.Atelier = node.metadata.parentWorkshop;
            if (node.metadata.parentLine) aggIpeKgAttributes.Ligne = node.metadata.parentLine;
            
            // Initialisation des identifiants d'agrégation
            if (node.metadata.ipeKgVariable.aggregations) {
              const aggs = node.metadata.ipeKgVariable.aggregations;
              if (aggs['5min'] && aggs['5min'].id) aggIpeKgAttributes.Identifiant5Min = aggs['5min'].id;
              if (aggs['1h'] && aggs['1h'].id) aggIpeKgAttributes.Identifiant1h = aggs['1h'].id;
              if (aggs['4h'] && aggs['4h'].id) aggIpeKgAttributes.Identifiant4h = aggs['4h'].id;
              if (aggs['8h'] && aggs['8h'].id) aggIpeKgAttributes.Identifiant8h = aggs['8h'].id;
              if (aggs['1d'] && aggs['1d'].id) aggIpeKgAttributes.Identifiant1day = aggs['1d'].id;
            }
            
            // Si nous avons un VariableId valide, générer automatiquement les IDs d'agrégation manquants
            if (aggIpeKgAttributes.VariableId && aggIpeKgAttributes.VariableId.length > 0) {
              console.log(`Using VariableId for ${node.name}: ${aggIpeKgAttributes.VariableId}`);
              // Ne pas écraser les identifiants existants s'ils sont déjà définis
              if (!aggIpeKgAttributes.Identifiant5Min)
                aggIpeKgAttributes.Identifiant5Min = `${aggIpeKgAttributes.VariableId}_5min`;
              if (!aggIpeKgAttributes.Identifiant1h)
                aggIpeKgAttributes.Identifiant1h = `${aggIpeKgAttributes.VariableId}_1h`;
              if (!aggIpeKgAttributes.Identifiant4h)
                aggIpeKgAttributes.Identifiant4h = `${aggIpeKgAttributes.VariableId}_4h`;
              if (!aggIpeKgAttributes.Identifiant8h)
                aggIpeKgAttributes.Identifiant8h = `${aggIpeKgAttributes.VariableId}_8h`;
              if (!aggIpeKgAttributes.Identifiant1day)
                aggIpeKgAttributes.Identifiant1day = `${aggIpeKgAttributes.VariableId}_1d`;
            } else if (node.metadata.ipeKgVariable && node.metadata.ipeKgVariable.id) {
              // Si VariableId n'est pas défini mais que nous avons un ID dans les métadonnées, l'utiliser
              console.log(`Setting VariableId for ${node.name} from metadata: ${node.metadata.ipeKgVariable.id}`);
              aggIpeKgAttributes.VariableId = node.metadata.ipeKgVariable.id;
              
              // Générer les identifiants d'agrégation manquants
              if (!aggIpeKgAttributes.Identifiant5Min)
                aggIpeKgAttributes.Identifiant5Min = `${aggIpeKgAttributes.VariableId}_5min`;
              if (!aggIpeKgAttributes.Identifiant1h)
                aggIpeKgAttributes.Identifiant1h = `${aggIpeKgAttributes.VariableId}_1h`;
              if (!aggIpeKgAttributes.Identifiant4h)
                aggIpeKgAttributes.Identifiant4h = `${aggIpeKgAttributes.VariableId}_4h`;
              if (!aggIpeKgAttributes.Identifiant8h)
                aggIpeKgAttributes.Identifiant8h = `${aggIpeKgAttributes.VariableId}_8h`;
              if (!aggIpeKgAttributes.Identifiant1day)
                aggIpeKgAttributes.Identifiant1day = `${aggIpeKgAttributes.VariableId}_1d`;
            }

            targetArray.push({
              entity: `Smart.Aggregation_IPE_Kg_${node.metadata.level.toUpperCase()}`,
              attributes: aggIpeKgAttributes
            });
          }
        }
      }
    });
  }

  return summary;
} 