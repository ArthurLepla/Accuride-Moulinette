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
    const attributes: RequiredAttribute[] = [
      { name: 'Nom', type: 'String' },
      { name: 'TotalConso', type: 'String' }
    ];

    // Ajouter les références aux niveaux parents si ce n'est pas le premier niveau
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
  });

  // Ajouter les entités standard pour les agrégations et états
  entities.push({
    name: 'Smart.Aggregation_Conso',
    attributes: [
      { name: 'VariableId', type: 'String' },
      { name: 'VariableName', type: 'String' },
      { name: 'AssetName', type: 'String' },
      { name: 'Machine', type: 'String' },
      { name: 'Identifiant5Min', type: 'String' },
      { name: 'Identifiant1h', type: 'String' },
      { name: 'Identifiant4h', type: 'String' },
      { name: 'Identifiant8h', type: 'String' },
      { name: 'Identifiant1day', type: 'String' }
    ]
  });

  entities.push({
    name: 'Smart.Aggregation_Production',
    attributes: [
      { name: 'VariableId', type: 'String' },
      { name: 'VariableName', type: 'String' },
      { name: 'AssetName', type: 'String' },
      { name: 'Machine', type: 'String' },
      { name: 'Identifiant5Min', type: 'String' },
      { name: 'Identifiant1h', type: 'String' },
      { name: 'Identifiant4h', type: 'String' },
      { name: 'Identifiant8h', type: 'String' },
      { name: 'Identifiant1day', type: 'String' }
    ]
  });

  entities.push({
    name: 'Smart.Aggregation_IPE',
    attributes: [
      { name: 'VariableId', type: 'String' },
      { name: 'VariableName', type: 'String' },
      { name: 'AssetName', type: 'String' },
      { name: 'Machine', type: 'String' },
      { name: 'Identifiant5Min', type: 'String' },
      { name: 'Identifiant1h', type: 'String' },
      { name: 'Identifiant4h', type: 'String' },
      { name: 'Identifiant8h', type: 'String' },
      { name: 'Identifiant1day', type: 'String' }
    ]
  });

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
      SmartAggregation_Production: 0,
      SmartAggregation_IPE: 0,
      EtatCapteur: 0
    },
    secteurs: [],
    ateliers: [],
    machines: [],
    aggregations_conso: [],
    aggregations_production: [],
    aggregations_ipe: [],
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
            TotalConso: '0'
          }
        });
      }
    });

    // Deuxième passe : traiter les machines
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
            TypeEnergie: node.metadata.energyType || node.metadata.rawEnergyType || ''
          }
        });

        // Traiter les variables de consommation
        if (node.metadata.variable) {
          summary.totalEntities.SmartAggregation_Conso++;
          const aggConso: typeof summary.aggregations_conso[0] = {
            entity: 'Smart.Aggregation_Conso',
            attributes: {
              VariableId: node.metadata.variable.id,
              VariableName: node.metadata.variable.name,
              AssetName: node.name
            },
            parentMachine: node.name
          };

          if (node.metadata.variable.aggregations) {
            const aggs = node.metadata.variable.aggregations;
            if (aggs['5min']) aggConso.attributes.Identifiant5Min = aggs['5min'].id;
            if (aggs['1h']) aggConso.attributes.Identifiant1h = aggs['1h'].id;
            if (aggs['4h']) aggConso.attributes.Identifiant4h = aggs['4h'].id;
            if (aggs['8h']) aggConso.attributes.Identifiant8h = aggs['8h'].id;
            if (aggs['1d']) aggConso.attributes.Identifiant1day = aggs['1d'].id;
          }

          summary.aggregations_conso.push(aggConso);
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
            },
            parentMachine: node.name
          });
        }
      }
    });
  }

  return summary;
} 