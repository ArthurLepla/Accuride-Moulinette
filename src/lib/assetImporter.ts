import { ExcelData, EnergyType } from './types';
import { getAuthConfig } from './auth';

interface CreateAssetParams {
  name: string;
  parentId: string;
  type: string;
  description?: string;
  metadata?: {
    sector?: string;
    workshop?: string | null;
  };
}

interface IIHAssetBase {
  id: string;
  assetId: string;
  name: string;
  type: string;
}

interface IIHMachine extends IIHAssetBase {
  type: 'machine';
  energyType: EnergyType;
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
  productionKgVariable?: {
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
  productionQuantiteVariable?: {
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
  ipeKgVariable?: {
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
  ipeQuantiteVariable?: {
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
  productionVariable?: {
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
  ipeVariable?: {
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
    name: string;
  };
  mendixEntity?: any;
}

interface IIHWorkshop extends IIHAssetBase {
  type: 'workshop';
  machines: {
    [key: string]: IIHMachine;
  };
  ipeKgVariable?: {
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
  ipeQuantiteVariable?: {
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
  productionKgVariable?: {
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
  productionQuantiteVariable?: {
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
  consommationVariable?: {
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
}

interface IIHSector extends IIHAssetBase {
  type: 'sector';
  workshops: {
    [key: string]: IIHWorkshop;
  };
  ipeKgVariable?: {
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
  ipeQuantiteVariable?: {
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
  productionKgVariable?: {
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
  productionQuantiteVariable?: {
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
}

interface IIHStructure {
  sectors: {
    [key: string]: IIHSector;
  };
  rootMachines: {
    [key: string]: IIHMachine;
  };
}

// Fonction pour nettoyer les noms d'assets
function sanitizeAssetName(name: string | undefined): string {
  if (!name) {
    throw new Error('Le nom de l\'asset ne peut pas être vide ou undefined');
  }
  
  // Remplacer les caractères spéciaux mais garder les accents
  return name
    .trim()
    .replace(/[']/g, '') // Supprimer les apostrophes
    .replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '') // Garder lettres, chiffres, accents, espaces et tirets
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul espace
    .trim(); // Supprimer les espaces au début et à la fin
}

async function getExistingAsset(name: string, parentId: string) {
  try {
    console.log(`🔍 Recherche d'asset sous parent ${parentId}`);
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`/api/assets/${parentId}?includeChildren=true`, {
      headers: {
        'X-Auth-Config': JSON.stringify(authConfig)
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Erreur lors de la recherche d'assets existants:`, await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.children) {
      console.log(`ℹ️ Pas d'enfants trouvés pour le parent ${parentId}`);
      return null;
    }

    const sanitizedName = sanitizeAssetName(name);
    const existingAsset = data.children.find((child: any) => 
      sanitizeAssetName(child.name) === sanitizedName
    );
    
    if (existingAsset) {
      console.log(`✅ Asset existant trouvé: ${existingAsset.assetId}`);
    } else {
      console.log(`ℹ Aucun asset existant trouvé avec le nom: ${sanitizedName}`);
    }
    
    return existingAsset || null;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche d\'asset existant:', error);
    return null;
  }
}

async function createOrGetAsset(params: CreateAssetParams) {
  const sanitizedName = sanitizeAssetName(params.name);
  console.log(`🔍 Recherche de l'asset existant: ${sanitizedName} sous parent: ${params.parentId}`);
  
  const existingAsset = await getExistingAsset(sanitizedName, params.parentId);
  if (existingAsset) {
    return existingAsset;
  }

  console.log(`📍 Création d'un nouvel asset: ${sanitizedName}`);
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify({
      ...params,
      name: sanitizedName
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erreur création asset:', {
      status: response.status,
      body: errorText
    });
    throw new Error(`Erreur lors de la création de l'asset: ${errorText}`);
  }

  const newAsset = await response.json();
  console.log(`✅ Nouvel asset créé: ${newAsset.assetId}`);
  return newAsset;
}

// Fonction utilitaire pour obtenir l'unité en fonction du type
const getUnitByType = (type: string): string => {
  switch (type) {
    case 'Elec':
      return 'kWh';
    case 'Gaz':
    case 'Eau':
    case 'Air':
      return 'm³';
    default:
      return 'kW';
  }
};

async function createVariable(name: string, assetId: string, type: string, dataType: string = 'DOUBLE', unit: string | null = null, description: string | null = null) {
  const iihDataType = dataType.toUpperCase() === 'DATETIME' ? 'STRING' : dataType.toUpperCase();

  const body: any = {
    variableName: name,
    assetId,
    dataType: iihDataType,
    description: description || `Variable ${name} créée automatiquement`
  };

  // Ajouter l'unité uniquement pour les variables de consommation
  if (name.startsWith('Consommation_')) {
    body.unit = getUnitByType(type);
  }
  // Les variables Production et IPE n'ont pas d'unité et sont en FLOAT32
  if (name.startsWith('Production_') || name.startsWith('IPE_')) {
    body.dataType = 'FLOAT32';
  }

  console.log('Données reçues pour création variable:', {
    variableName: name,
    assetId,
    dataType: body.dataType,
    description: body.description,
    unit: body.unit
  });

  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const response = await fetch('/api/variables', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur création variable:', {
      status: response.status,
      headers: response.headers,
      body: errorText
    });
    throw new Error(`Erreur lors de la création de la variable pour l'asset ${assetId}: ${errorText}`);
  }

  return await response.json();
}

async function createProductionVariable(machineName: string, assetId: string) {
  return await createVariable(
    `Production_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    null,
    `Variable de production pour la machine ${machineName}`
  );
}

async function createIPEVariable(machineName: string, assetId: string) {
  return await createVariable(
    `IPE_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    null,
    `Indicateur de performance énergétique pour la machine ${machineName}`
  );
}

// Nouvelles fonctions pour les variables modifiées
async function createProductionKgVariable(machineName: string, assetId: string) {
  return await createVariable(
    `Production_kg_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    'kg',
    `Production en kg pour la machine ${machineName}`
  );
}

async function createProductionQuantiteVariable(machineName: string, assetId: string) {
  return await createVariable(
    `Production_quantite_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    'pcs',
    `Production en quantité pour la machine ${machineName}`
  );
}

async function createIPEKgVariable(machineName: string, assetId: string) {
  return await createVariable(
    `IPE_kg_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    'kWh/kg',
    `Indicateur de performance énergétique en kg pour la machine ${machineName}`
  );
}

async function createIPEQuantiteVariable(machineName: string, assetId: string) {
  return await createVariable(
    `IPE_quantite_${machineName}`,
    assetId,
    '',
    'FLOAT32',
    'kWh/pcs',
    `Indicateur de performance énergétique en quantité pour la machine ${machineName}`
  );
}

// Fonction pour créer une transformation (variable calculée à partir d'autres variables)
async function configureTransformation(params: {
  name: string;
  targetAssetId: string;
  sourceVariableIds: string[];
  formula: string;
  unit?: string;
}) {
  try {
    console.log(`📊 Configuration d'une variable de transformation (Rule) pour ${params.name}`);
    console.log(`    → Asset cible: ${params.targetAssetId}`);
    console.log(`    → Variables sources: ${params.sourceVariableIds.join(', ')}`);
    console.log(`    → Formule: ${params.formula}`);
    
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    // Récupérer les informations sur les variables sources pour créer les tags
    const tags = [];
    
    for (let i = 0; i < params.sourceVariableIds.length; i++) {
      const variableId = params.sourceVariableIds[i];
      
      // Dans une implémentation réelle, nous devrions récupérer les informations complètes sur la variable
      // Pour l'instant, nous simulons avec des valeurs génériques conformes à la doc IIH
      tags.push({
        name: `var${i+1}`,  // var1, var2, etc. utilisé dans la formule
        variableId: variableId, // ID de la variable source
        dataType: "FLOAT32"
      });
    }
    
    // Construction de la requête de création de variable avec règle
    // Structure conforme à la documentation IIH
    const transformationBody = {
      variableName: params.name,
      assetId: params.targetAssetId,
      dataType: "FLOAT32",
      description: `Variable de transformation ${params.name}`,
      unit: params.unit || "",
      store: true,
      sourceType: "Rule",  // Type "Rule" pour les transformations
      rule: {
        formula: params.formula,  // Formule de transformation ex: "var1 + var2"
        variables: tags  // Variables référencées dans la formule
      },
      connected: true
    };
    
    console.log('Données de transformation (Rule):', transformationBody);
    
    // Dans une implémentation réelle, nous ferions l'appel à l'API ici
    const response = await fetch('/api/variables', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Config': JSON.stringify(authConfig)
      },
      body: JSON.stringify(transformationBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la création de la variable de transformation:`, errorText);
      throw new Error(`Erreur lors de la création de la variable de transformation: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Variable de transformation (Rule) créée avec succès:', result);
    return result;
  } catch (error) {
    console.error(`❌ Erreur lors de la configuration de la variable de transformation (Rule): ${error}`);
    throw error;
  }
}

// Mise à jour de la fonction createConsommationAggregeeVariable pour utiliser la nouvelle approche de transformation
async function createConsommationAggregeeVariable(assetName: string, assetId: string, childrenVariableIds: string[]) {
  try {
    console.log(`📍 Création de la variable de consommation agrégée pour ${assetName} (avant-dernier niveau)`);
    
    // Si nous avons des IDs de variables enfants, créer une variable de transformation
    if (childrenVariableIds.length > 0) {
      console.log(`📊 Configuration de la transformation pour agréger les consommations des enfants: ${childrenVariableIds.join(', ')}`);
      
      // Construire la formule en fonction du nombre de variables sources
      // Par exemple: "var1 + var2 + var3" pour 3 variables sources
      const formula = childrenVariableIds.map((_, index) => `var${index + 1}`).join(' + ');
      
      // Configurer la transformation pour sommer les variables enfants
      const transformationResult = await configureTransformation({
        name: `Consommation_${assetName}`,
        targetAssetId: assetId,
        sourceVariableIds: childrenVariableIds,
        formula: formula,
        unit: 'kWh'
      });
      
      console.log(`✅ Variable de consommation agrégée créée par transformation avec ID: ${transformationResult.variableId}`);
      return transformationResult;
    } else {
      // Si pas de variables enfants, créer une variable normale
      console.log(`⚠️ Pas de variables enfants à agréger pour la consommation de ${assetName}`);
      
      const aggregationVarResponse = await createVariable(
        `Consommation_${assetName}`,
        assetId,
        '',
        'FLOAT32',
        'kWh',
        `Consommation agrégée pour ${assetName} (aucune source pour l'instant)`
      );
      
      console.log(`✅ Variable de consommation agrégée créée pour ${assetName} avec ID: ${aggregationVarResponse.variableId}`);
      return aggregationVarResponse;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la variable de consommation agrégée: ${error}`);
    throw error;
  }
}

// Fonction pour créer les attributs des niveaux intermédiaires (sauf niveau 1)
async function createIntermediateAssetAttributes(
  assetName: string, 
  assetId: string, 
  isSecondLastLevel: boolean = false, 
  childrenConsumptionVariableIds: string[] = []
) {
  try {
    console.log(`📍 Création des attributs pour le niveau intermédiaire: ${assetName}`);
    
    // Création des variables IPE et Production
    const ipeKgVariable = await createIPEKgVariable(assetName, assetId);
    console.log(`✅ Variable IPE (kg) créée avec l'ID: ${ipeKgVariable.variableId}`);
    
    const ipeQuantiteVariable = await createIPEQuantiteVariable(assetName, assetId);
    console.log(`✅ Variable IPE (quantité) créée avec l'ID: ${ipeQuantiteVariable.variableId}`);
    
    const productionKgVariable = await createProductionKgVariable(assetName, assetId);
    console.log(`✅ Variable Production (kg) créée avec l'ID: ${productionKgVariable.variableId}`);
    
    const productionQuantiteVariable = await createProductionQuantiteVariable(assetName, assetId);
    console.log(`✅ Variable Production (quantité) créée avec l'ID: ${productionQuantiteVariable.variableId}`);
    
    let consommationVariable = null;
    
    // Pour l'avant-dernier niveau, créer également la variable de consommation
    if (isSecondLastLevel) {
      console.log(`📊 Pour le niveau ${assetName} (avant-dernier niveau), création de la variable de consommation agrégée`);
      if (childrenConsumptionVariableIds.length > 0) {
        console.log(`📊 Variables de consommation enfants qui seront agrégées: ${childrenConsumptionVariableIds.join(', ')}`);
      } else {
        console.log(`⚠️ Aucune variable de consommation enfant disponible pour l'agrégation`);
      }
      
      consommationVariable = await createConsommationAggregeeVariable(assetName, assetId, childrenConsumptionVariableIds);
      console.log(`✅ Variable Consommation créée avec l'ID: ${consommationVariable.variableId}`);
    }
    
    // Créer les agrégations
    console.log(`📊 Création des agrégations pour le niveau intermédiaire: ${assetName}`);
    const ipeKgAggregations: { [key: string]: any } = {};
    const ipeQuantiteAggregations: { [key: string]: any } = {};
    const productionKgAggregations: { [key: string]: any } = {};
    const productionQuantiteAggregations: { [key: string]: any } = {};
    const consommationAggregations: { [key: string]: any } = {};
    
    // Intervalles de temps pour les agrégations
    const timeIntervals = [
      { name: '5min', base: 'minute', factor: 5 },
      { name: '1h', base: 'hour', factor: 1 },
      { name: '4h', base: 'hour', factor: 4 },
      { name: '8h', base: 'hour', factor: 8 },
      { name: '1d', base: 'day', factor: 1 }
    ];
    
    for (const interval of timeIntervals) {
      // Agrégations IPE et Production
      const aggIPEKg = await createAggregation(ipeKgVariable.variableId, 'Sum', interval.base, interval.factor);
      ipeKgAggregations[interval.name] = {
        id: aggIPEKg.id,
        type: 'Sum',
        cycle: { base: interval.base, factor: interval.factor }
      };
      
      const aggIPEQuantite = await createAggregation(ipeQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
      ipeQuantiteAggregations[interval.name] = {
        id: aggIPEQuantite.id,
        type: 'Sum',
        cycle: { base: interval.base, factor: interval.factor }
      };
      
      const aggProdKg = await createAggregation(productionKgVariable.variableId, 'Sum', interval.base, interval.factor);
      productionKgAggregations[interval.name] = {
        id: aggProdKg.id,
        type: 'Sum',
        cycle: { base: interval.base, factor: interval.factor }
      };
      
      const aggProdQuantite = await createAggregation(productionQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
      productionQuantiteAggregations[interval.name] = {
        id: aggProdQuantite.id,
        type: 'Sum',
        cycle: { base: interval.base, factor: interval.factor }
      };
      
      // Agrégation de consommation pour l'avant-dernier niveau
      if (isSecondLastLevel && consommationVariable) {
        const aggConso = await createAggregation(consommationVariable.variableId, 'Sum', interval.base, interval.factor);
        consommationAggregations[interval.name] = {
          id: aggConso.id,
          type: 'Sum',
          cycle: { base: interval.base, factor: interval.factor }
        };
      }
    }
    
    // Préparer et retourner les informations sur les variables créées
    const result: any = {
      ipeKgVariable: {
        id: ipeKgVariable.variableId,
        name: `IPE_kg_${assetName}`,
        aggregations: ipeKgAggregations
      },
      ipeQuantiteVariable: {
        id: ipeQuantiteVariable.variableId,
        name: `IPE_quantite_${assetName}`,
        aggregations: ipeQuantiteAggregations
      },
      productionKgVariable: {
        id: productionKgVariable.variableId,
        name: `Production_kg_${assetName}`,
        aggregations: productionKgAggregations
      },
      productionQuantiteVariable: {
        id: productionQuantiteVariable.variableId,
        name: `Production_quantite_${assetName}`,
        aggregations: productionQuantiteAggregations
      }
    };
    
    if (isSecondLastLevel && consommationVariable) {
      result.consommationVariable = {
        id: consommationVariable.variableId,
        name: `Consommation_${assetName}`,
        aggregations: consommationAggregations
      };
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Erreur lors de la création des attributs pour le niveau intermédiaire: ${error}`);
    throw error;
  }
}

async function createSensorStateVariable(machineName: string, assetId: string) {
  console.log(`Création de la variable d'état pour la machine ${machineName} avec assetId ${assetId}`);
  const variable = await createVariable(
    `EtatCapteur_${machineName}`,
    assetId,
    '',
    'STRING',
    null,
    `État du capteur pour la machine ${machineName}`
  );
  console.log(`Variable d'état créée:`, variable);
  return variable;
}

async function createAggregation(variableId: string, aggregationType: string, base: string, factor: number) {
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const response = await fetch('/api/aggregations', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify({
      aggregation: aggregationType,
      sourceId: variableId,
      cycle: {
        base,
        factor
      },
      provideAsVariable: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erreur lors de la création de l'agrégation pour la variable ${variableId}:`, errorText);
    throw new Error(`Erreur lors de la création de l'agrégation pour la variable ${variableId}: ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Agrégation créée avec succès pour la variable ${variableId}: ${result.id}`);
  return result;
}

export async function importAssetsFromExcel(data: ExcelData[]) {
  try {
    const iihStructure: IIHStructure = {
      sectors: {},
      rootMachines: {}
    };

    // Structure pour stocker les entités Mendix
    const mendixEntities: {
      [key: string]: {
        entity: string;
        attributes: {
          name: string;
          type: string;
          value: string;
          variableId?: string;
        }[];
      };
    } = {};

    // Après avoir créé une machine dans un atelier, stocker la variable de consommation
    let workshopConsumptionVariables: { [workshopKey: string]: string[] } = {};

    // Traiter chaque ligne du fichier Excel
    for (const item of data) {
      // Si la machine n'a pas de secteur, la créer à la racine
      if (!item.sector && item.machine) {
        const sanitizedMachineName = sanitizeAssetName(item.machine);
        
        if (!iihStructure.rootMachines[sanitizedMachineName]) {
          const machineAsset = await createOrGetAsset({
            name: item.machine,
            description: `Machine ${item.machine} - Type: ${item.type}`,
            parentId: '0',
            type: 'machine'
          });

          // Créer la variable de consommation
          console.log(`      📍 Création des variables pour: ${sanitizedMachineName}`);
          
          // Variable de consommation
          const consumptionVariable = await createVariable(
            `Consommation_${item.type}_${sanitizedMachineName}`, 
            machineAsset.assetId, 
            item.type
          );
          console.log(`      ✅ Variable de consommation créée avec l'ID: ${consumptionVariable.variableId}`);

          // Variables de production (kg et quantité)
          const productionKgVariable = await createProductionKgVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable de production (kg) créée avec l'ID: ${productionKgVariable.variableId}`);

          const productionQuantiteVariable = await createProductionQuantiteVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable de production (quantité) créée avec l'ID: ${productionQuantiteVariable.variableId}`);

          // Variables IPE (kg et quantité)
          const ipeKgVariable = await createIPEKgVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable IPE (kg) créée avec l'ID: ${ipeKgVariable.variableId}`);

          const ipeQuantiteVariable = await createIPEQuantiteVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable IPE (quantité) créée avec l'ID: ${ipeQuantiteVariable.variableId}`);

          // Variable d'état du capteur
          const stateVariable = await createSensorStateVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable d'état créée avec l'ID: ${stateVariable.variableId}`);
          console.log('      📍 Détails de la variable d\'état:', {
            name: `EtatCapteur_${sanitizedMachineName}`,
            variableId: stateVariable.variableId,
            assetId: machineAsset.assetId
          });

          // Créer les agrégations
          console.log(`        📍 Création des agrégations pour: ${sanitizedMachineName}`);
          const aggregations: { [key: string]: any } = {};
          const productionKgAggregations: { [key: string]: any } = {};
          const productionQuantiteAggregations: { [key: string]: any } = {};
          const ipeKgAggregations: { [key: string]: any } = {};
          const ipeQuantiteAggregations: { [key: string]: any } = {};

          // Agrégations pour les différentes variables
          const timeIntervals = [
            { name: '5min', base: 'minute', factor: 5 },
            { name: '1h', base: 'hour', factor: 1 },
            { name: '4h', base: 'hour', factor: 4 },
            { name: '8h', base: 'hour', factor: 8 },
            { name: '1d', base: 'day', factor: 1 }
          ];

          for (const interval of timeIntervals) {
            // Agrégation consommation
            const aggConso = await createAggregation(consumptionVariable.variableId, 'Sum', interval.base, interval.factor);
            aggregations[interval.name] = {
              id: aggConso.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };

            // Agrégation production (kg)
            const aggProdKg = await createAggregation(productionKgVariable.variableId, 'Sum', interval.base, interval.factor);
            productionKgAggregations[interval.name] = {
              id: aggProdKg.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };

            // Agrégation production (quantité)
            const aggProdQuantite = await createAggregation(productionQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
            productionQuantiteAggregations[interval.name] = {
              id: aggProdQuantite.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };

            // Agrégation IPE (kg)
            const aggIPEKg = await createAggregation(ipeKgVariable.variableId, 'Sum', interval.base, interval.factor);
            ipeKgAggregations[interval.name] = {
              id: aggIPEKg.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };

            // Agrégation IPE (quantité)
            const aggIPEQuantite = await createAggregation(ipeQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
            ipeQuantiteAggregations[interval.name] = {
              id: aggIPEQuantite.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };
          }

          // Après la création des variables
          const mendixEntity = {
            entity: 'Smart.EtatCapteur',
            attributes: [
              { name: 'NomCapteur', type: 'String', value: sanitizedMachineName },
              { name: 'Etat', type: 'String', value: 'false' },
              { name: 'DerniereMaj', type: 'String', value: new Date().toISOString() },
              { name: 'IdEtatCapteur', type: 'String', value: stateVariable.variableId }
            ]
          };

          mendixEntities[sanitizedMachineName] = mendixEntity;

          iihStructure.rootMachines[sanitizedMachineName] = {
            id: machineAsset.id,
            assetId: machineAsset.assetId,
            name: machineAsset.name,
            type: 'machine',
            energyType: item.type,
            variable: {
              id: consumptionVariable.variableId,
              name: `Consommation_${item.type}_${sanitizedMachineName}`,
              aggregations: aggregations
            },
            productionKgVariable: {
              id: productionKgVariable.variableId,
              name: `Production_kg_${sanitizedMachineName}`,
              aggregations: productionKgAggregations
            },
            productionQuantiteVariable: {
              id: productionQuantiteVariable.variableId,
              name: `Production_quantite_${sanitizedMachineName}`,
              aggregations: productionQuantiteAggregations
            },
            ipeKgVariable: {
              id: ipeKgVariable.variableId,
              name: `IPE_kg_${sanitizedMachineName}`,
              aggregations: ipeKgAggregations
            },
            ipeQuantiteVariable: {
              id: ipeQuantiteVariable.variableId,
              name: `IPE_quantite_${sanitizedMachineName}`,
              aggregations: ipeQuantiteAggregations
            },
            stateVariable: {
              variableId: stateVariable.variableId,
              name: `EtatCapteur_${sanitizedMachineName}`
            },
            mendixEntity: mendixEntity
          };
          console.log(`Machine racine créée avec variable d'état:`, {
            machineName: sanitizedMachineName,
            stateVariable: {
              variableId: stateVariable.variableId,
              name: `EtatCapteur_${sanitizedMachineName}`
            }
          });
        }
        continue;
      }

      // Traitement normal pour les machines avec secteur
      if (item.sector) {
        const sanitizedSectorName = sanitizeAssetName(item.sector);
        
        // Créer le secteur s'il n'existe pas déjà
        if (!iihStructure.sectors[sanitizedSectorName]) {
          const sectorAsset = await createOrGetAsset({
            name: item.sector,
            description: `Secteur ${item.sector}`,
            parentId: '0',
            type: 'sector'
          });

          console.log(`📍 Création des attributs pour le secteur: ${sanitizedSectorName} (niveau intermédiaire)`);
          // Le secteur est un niveau intermédiaire, mais pas l'avant-dernier niveau
          // Il reçoit donc les attributs standards des niveaux intermédiaires, mais pas la consommation
          const sectorAttributes = await createIntermediateAssetAttributes(
            sanitizedSectorName, 
            sectorAsset.assetId,
            false, // Ce n'est pas l'avant-dernier niveau
            [] // Pas de variables de consommation enfants
          );

          iihStructure.sectors[sanitizedSectorName] = {
            id: sectorAsset.id,
            assetId: sectorAsset.assetId,
            name: sectorAsset.name,
            type: 'sector',
            workshops: {},
            // Ajout des attributs intermédiaires
            ...sectorAttributes
          };
        }

        // Gérer l'atelier (utiliser 'sans_atelier' si non spécifié)
        const workshopName = item.workshop || 'Sans atelier';
        const sanitizedWorkshopName = sanitizeAssetName(workshopName);
        
        // Initialiser le tableau des variables de consommation pour cet atelier s'il n'existe pas
        if (!workshopConsumptionVariables[sanitizedWorkshopName]) {
          workshopConsumptionVariables[sanitizedWorkshopName] = [];
        }

        if (!iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName]) {
          const workshopAsset = await createOrGetAsset({
            name: workshopName,
            description: `Atelier ${workshopName} du secteur ${item.sector}`,
            parentId: iihStructure.sectors[sanitizedSectorName].assetId,
            type: 'workshop'
          });

          console.log(`📍 Création des attributs pour l'atelier: ${sanitizedWorkshopName} (niveau intermédiaire)`);
          // L'atelier est généralement l'avant-dernier niveau avant les machines
          // On lui donne donc les attributs intermédiaires + consommation
          // Note: On ne peut pas encore passer les variables de consommation car les machines n'existent pas
          // On les collectera plus tard
          const workshopAttributes = await createIntermediateAssetAttributes(
            sanitizedWorkshopName, 
            workshopAsset.assetId,
            true, // C'est l'avant-dernier niveau, donc on crée aussi la variable de consommation
            [] // Pour l'instant, pas de variables de consommation enfants
          );

          iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName] = {
            id: workshopAsset.id,
            assetId: workshopAsset.assetId,
            name: workshopAsset.name,
            type: 'workshop',
            machines: {},
            // Ajout des attributs intermédiaires
            ...workshopAttributes
          };
        }

        // Gérer la machine
        if (item.machine) {
          const sanitizedMachineName = sanitizeAssetName(item.machine);
          
          if (!iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName].machines[sanitizedMachineName]) {
            const machineAsset = await createOrGetAsset({
              name: item.machine,
              description: `Machine ${item.machine}${item.workshop ? ` de l'atelier ${workshopName}` : ''} du secteur ${item.sector} - Type: ${item.type}`,
              parentId: iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName].assetId,
              type: 'machine'
            });

            // Créer la variable de consommation
            console.log(`      📍 Création des variables pour: ${sanitizedMachineName}`);
            
            // Variable de consommation
            const consumptionVariable = await createVariable(
              `Consommation_${item.type}_${sanitizedMachineName}`, 
              machineAsset.assetId, 
              item.type
            );
            console.log(`      ✅ Variable de consommation créée avec l'ID: ${consumptionVariable.variableId}`);
            
            // Ajouter l'ID de la variable de consommation à la liste pour cet atelier
            workshopConsumptionVariables[sanitizedWorkshopName].push(consumptionVariable.variableId);
            console.log(`      ✅ Variable de consommation ajoutée à la liste pour l'atelier ${sanitizedWorkshopName}`);

            // Variables de production (kg et quantité)
            const productionKgVariable = await createProductionKgVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable de production (kg) créée avec l'ID: ${productionKgVariable.variableId}`);

            const productionQuantiteVariable = await createProductionQuantiteVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable de production (quantité) créée avec l'ID: ${productionQuantiteVariable.variableId}`);

            // Variables IPE (kg et quantité)
            const ipeKgVariable = await createIPEKgVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable IPE (kg) créée avec l'ID: ${ipeKgVariable.variableId}`);

            const ipeQuantiteVariable = await createIPEQuantiteVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable IPE (quantité) créée avec l'ID: ${ipeQuantiteVariable.variableId}`);

            // Variable d'état du capteur
            const stateVariable = await createSensorStateVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable d'état créée avec l'ID: ${stateVariable.variableId}`);
            console.log('      📍 Détails de la variable d\'état:', {
              name: `EtatCapteur_${sanitizedMachineName}`,
              variableId: stateVariable.variableId,
              assetId: machineAsset.assetId
            });

            // Créer les agrégations
            console.log(`        📍 Création des agrégations pour: ${sanitizedMachineName}`);
            const aggregations: { [key: string]: any } = {};
            const productionKgAggregations: { [key: string]: any } = {};
            const productionQuantiteAggregations: { [key: string]: any } = {};
            const ipeKgAggregations: { [key: string]: any } = {};
            const ipeQuantiteAggregations: { [key: string]: any } = {};

            // Agrégations pour les différentes variables
            const timeIntervals = [
              { name: '5min', base: 'minute', factor: 5 },
              { name: '1h', base: 'hour', factor: 1 },
              { name: '4h', base: 'hour', factor: 4 },
              { name: '8h', base: 'hour', factor: 8 },
              { name: '1d', base: 'day', factor: 1 }
            ];

            for (const interval of timeIntervals) {
              // Agrégation consommation
              const aggConso = await createAggregation(consumptionVariable.variableId, 'Sum', interval.base, interval.factor);
              aggregations[interval.name] = {
                id: aggConso.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };

              // Agrégation production (kg)
              const aggProdKg = await createAggregation(productionKgVariable.variableId, 'Sum', interval.base, interval.factor);
              productionKgAggregations[interval.name] = {
                id: aggProdKg.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };

              // Agrégation production (quantité)
              const aggProdQuantite = await createAggregation(productionQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
              productionQuantiteAggregations[interval.name] = {
                id: aggProdQuantite.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };

              // Agrégation IPE (kg)
              const aggIPEKg = await createAggregation(ipeKgVariable.variableId, 'Sum', interval.base, interval.factor);
              ipeKgAggregations[interval.name] = {
                id: aggIPEKg.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };

              // Agrégation IPE (quantité)
              const aggIPEQuantite = await createAggregation(ipeQuantiteVariable.variableId, 'Sum', interval.base, interval.factor);
              ipeQuantiteAggregations[interval.name] = {
                id: aggIPEQuantite.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };
            }

            // Après la création des variables
            const mendixEntity = {
              entity: 'Smart.EtatCapteur',
              attributes: [
                { name: 'NomCapteur', type: 'String', value: sanitizedMachineName },
                { name: 'Etat', type: 'String', value: 'false' },
                { name: 'DerniereMaj', type: 'String', value: new Date().toISOString() },
                { name: 'IdEtatCapteur', type: 'String', value: stateVariable.variableId }
              ]
            };

            mendixEntities[sanitizedMachineName] = mendixEntity;

            iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName].machines[sanitizedMachineName] = {
              id: machineAsset.id,
              assetId: machineAsset.assetId,
              name: machineAsset.name,
              type: 'machine',
              energyType: item.type,
              variable: {
                id: consumptionVariable.variableId,
                name: `Consommation_${item.type}_${sanitizedMachineName}`,
                aggregations: aggregations
              },
              productionKgVariable: {
                id: productionKgVariable.variableId,
                name: `Production_kg_${sanitizedMachineName}`,
                aggregations: productionKgAggregations
              },
              productionQuantiteVariable: {
                id: productionQuantiteVariable.variableId,
                name: `Production_quantite_${sanitizedMachineName}`,
                aggregations: productionQuantiteAggregations
              },
              ipeKgVariable: {
                id: ipeKgVariable.variableId,
                name: `IPE_kg_${sanitizedMachineName}`,
                aggregations: ipeKgAggregations
              },
              ipeQuantiteVariable: {
                id: ipeQuantiteVariable.variableId,
                name: `IPE_quantite_${sanitizedMachineName}`,
                aggregations: ipeQuantiteAggregations
              },
              stateVariable: {
                variableId: stateVariable.variableId,
                name: `EtatCapteur_${sanitizedMachineName}`
              },
              mendixEntity: mendixEntity
            };
            
            console.log(`Machine créée avec variable d'état:`, {
              machineName: sanitizedMachineName,
              stateVariable: {
                variableId: stateVariable.variableId,
                name: `EtatCapteur_${sanitizedMachineName}`
              }
            });
          }
        }
      }
    }

    // Une fois toutes les machines créées, mettre à jour les transformations pour les ateliers
    console.log(`\n📊 Configuration des transformations pour les variables de consommation des ateliers`);
    for (const [sectorName, sector] of Object.entries(iihStructure.sectors)) {
      for (const [workshopName, workshop] of Object.entries(sector.workshops)) {
        if (workshopConsumptionVariables[workshopName] && workshopConsumptionVariables[workshopName].length > 0 && workshop.consommationVariable) {
          console.log(`📊 Configuration de la transformation pour l'atelier ${workshopName} avec ${workshopConsumptionVariables[workshopName].length} variables sources`);
          
          try {
            // Générer la formule dynamiquement en fonction du nombre de variables
            const formula = workshopConsumptionVariables[workshopName]
              .map((_, index) => `var${index + 1}`)
              .join(' + ');
            
            await configureTransformation({
              name: `Somme_Consommation_${workshopName}`,
              targetAssetId: workshop.assetId, // Utiliser l'assetId de l'atelier et non l'ID de la variable
              sourceVariableIds: workshopConsumptionVariables[workshopName],
              formula: formula,
              unit: 'kWh'
            });
            console.log(`✅ Transformation configurée avec succès pour l'atelier ${workshopName}`);
          } catch (error) {
            console.error(`❌ Erreur lors de la configuration de la transformation pour l'atelier ${workshopName}: ${error}`);
          }
        } else {
          console.log(`⚠️ Pas de variables de consommation disponibles pour l'atelier ${workshopName}`);
        }
      }
    }

    // Sauvegarder la structure dans le localStorage
    localStorage.setItem('iihStructure', JSON.stringify(iihStructure));
    console.log('\n=== Structure IIH sauvegardée ===');
    console.log(iihStructure);

    // Sauvegarder les entités Mendix dans le localStorage
    localStorage.setItem('mendixEntities', JSON.stringify(mendixEntities));
    console.log('\n=== Entités Mendix sauvegardées ===');
    console.log(mendixEntities);

    console.log('\n=== Import terminé avec succès ===');
    return { 
      success: true, 
      message: 'Import terminé avec succès', 
      structure: iihStructure,
      mendixEntities: mendixEntities
    };
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'import:', error);
    throw error;
  }
}

export function previewImportStructure(data: ExcelData[]) {
  console.log('\n=== Structure qui sera créée dans l\'IIH ===');
  
  // Grouper par secteur
  const sectors = new Map<string, {
    workshops: Map<string, {
      machines: {
        name: string;
        type: string;
        variables: {
          name: string;
          type: string;
          unit?: string;
        }[];
        mendixEntity?: {
          entity: string;
          attributes: {
            name: string;
            type: string;
            value: string;
          }[];
        };
      }[];
    }>;
    machines: {
      name: string;
      type: string;
      variables: {
        name: string;
        type: string;
        unit?: string;
      }[];
      mendixEntity?: {
        entity: string;
        attributes: {
          name: string;
          type: string;
          value: string;
        }[];
      };
    }[];
  }>();

  data.forEach(row => {
    const { sector, workshop, machine, type } = row;
    if (!sector) return;

    if (!sectors.has(sector)) {
      sectors.set(sector, {
        workshops: new Map(),
        machines: []
      });
    }

    const sectorData = sectors.get(sector)!;
    
    const createMachineData = (machineName: string, machineType: string) => ({
      name: machineName,
      type: machineType,
      variables: [
        { name: `Consommation_${machineType}_${machineName}`, type: 'DOUBLE', unit: getUnitByType(machineType) },
        { name: `EtatCapteur_${machineName}`, type: 'STRING' }
      ],
      mendixEntity: {
        entity: 'Smart.EtatCapteur',
        attributes: [
          { name: 'NomCapteur', type: 'String', value: machineName },
          { name: 'Etat', type: 'String', value: `EtatCapteur_${machineName}` }
        ]
      }
    });
    
    if (workshop) {
      if (!sectorData.workshops.has(workshop)) {
        sectorData.workshops.set(workshop, { machines: [] });
      }
      if (machine) {
        const workshopMachines = sectorData.workshops.get(workshop)!;
        workshopMachines.machines.push(createMachineData(machine, type));
      }
    } else if (machine) {
      sectorData.machines.push(createMachineData(machine, type));
    }
  });

  // Afficher la structure
  let totalAssets = 0;
  let totalVariables = 0;
  let totalAggregations = 0;
  let totalMendixEntities = 0;

  console.log('\nStructure hiérarchique qui sera créée:');
  for (const [sectorName, sectorData] of Array.from(sectors.entries())) {
    console.log(`\n🏭 Secteur: ${sectorName}`);
    totalAssets++; // Compter le secteur
    
    if (sectorData.machines.length > 0) {
      console.log('  └─ Machines directes:');
      sectorData.machines.forEach(machine => {
        console.log(`     └─ 🔧 ${machine.name} (${machine.type})`);
        machine.variables.forEach(variable => {
          console.log(`        └─ 📊 ${variable.name} (${variable.type}${variable.unit ? `, ${variable.unit}` : ''})`);
          if (variable.type === 'DOUBLE') {
            console.log('           └─ 📈 Agrégations: 5min, 1h, 4h, 8h, 24h');
            totalAggregations += 5;
          }
        });
        
        if (machine.mendixEntity) {
          console.log(`        └─ 🔵 Entité Mendix: ${machine.mendixEntity.entity}`);
          machine.mendixEntity.attributes.forEach(attr => {
            console.log(`           └─ ${attr.name} (${attr.type}): ${attr.value}`);
          });
          totalMendixEntities++;
        }
        
        totalAssets++; // Compter la machine
        totalVariables += machine.variables.length;
      });
    }

    if (sectorData.workshops.size > 0) {
      console.log('  └─ Ateliers:');
      for (const [workshopName, workshop] of Array.from(sectorData.workshops.entries())) {
        console.log(`     └─ 🏢 ${workshopName}`);
        totalAssets++; // Compter l'atelier
        workshop.machines.forEach(machine => {
          console.log(`        └─ 🔧 ${machine.name} (${machine.type})`);
          machine.variables.forEach(variable => {
            console.log(`           └─ 📊 ${variable.name} (${variable.type}${variable.unit ? `, ${variable.unit}` : ''})`);
            if (variable.type === 'DOUBLE') {
              console.log('              └─ 📈 Agrégations: 5min, 1h, 4h, 8h, 24h');
              totalAggregations += 5;
            }
          });
          
          if (machine.mendixEntity) {
            console.log(`           └─ 🔵 Entité Mendix: ${machine.mendixEntity.entity}`);
            machine.mendixEntity.attributes.forEach(attr => {
              console.log(`              └─ ${attr.name} (${attr.type}): ${attr.value}`);
            });
            totalMendixEntities++;
          }
          
          totalAssets++; // Compter la machine
          totalVariables += machine.variables.length;
        });
      }
    }
  }

  console.log('\n=== Résumé ===');
  console.log(`Total des assets à créer: ${totalAssets}`);
  console.log(`Total des variables à créer: ${totalVariables}`);
  console.log(`Total des agrégations à créer: ${totalAggregations}`);
  console.log(`Total des entités Mendix à créer: ${totalMendixEntities}`);
  console.log('\nCliquez sur "Importer" pour procéder à la création.');

  return sectors;
} 