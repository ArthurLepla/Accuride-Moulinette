import { getAuthConfig } from './auth';
import { FlexibleProcessedData, HierarchyNode } from '@/types/sankey';

interface CreateAssetParams {
  name: string;
  parentId: string;
  type: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface Aggregation {
  id: string;
  type: string;
  cycle: {
    base: string;
    factor: number;
  };
}

interface Variable {
  id: string;
  name: string;
  aggregations?: {
    [key: string]: Aggregation;
  };
}

// Fonction pour nettoyer les noms d'assets
function sanitizeAssetName(name: string | undefined): string {
  if (!name) {
    throw new Error('Le nom de l\'asset ne peut pas être vide ou undefined');
  }
  
  return name
    .trim()
    .replace(/[']/g, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    throw new Error(`Erreur lors de la création de l'asset: ${errorText}`);
  }

  const newAsset = await response.json();
  console.log(`✅ Nouvel asset créé: ${newAsset.assetId}`);
  return newAsset;
}

async function getExistingVariable(assetId: string, variableName: string) {
  try {
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    console.log(`🔍 Recherche de la variable "${variableName}" pour l'asset ${assetId}`);
    const response = await fetch(`/api/variables/${assetId}`, {
      headers: {
        'X-Auth-Config': JSON.stringify(authConfig)
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ Erreur lors de la recherche de variables:`, errorText);
      return null;
    }

    const variables = await response.json();
    console.log(`📋 Variables trouvées pour l'asset ${assetId}:`, variables.map((v: any) => v.variableName));
    
    const existingVariable = variables.find((variable: any) => 
      variable.variableName.toLowerCase() === variableName.toLowerCase()
    );
    
    if (existingVariable) {
      console.log(`✓ Variable existante trouvée: ${existingVariable.variableName}`);
    } else {
      console.log(`❌ Variable non trouvée: ${variableName}`);
    }
    
    return existingVariable || null;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de variable:', error);
    return null;
  }
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
    throw new Error(`Erreur lors de la création de l'agrégation pour la variable ${variableId}: ${errorText}`);
  }

  return await response.json();
}

async function createAggregations(variableId: string, variableName: string) {
  console.log(`📊 Création des agrégations pour la variable ${variableId} (${variableName})`);
  const timeIntervals = [
    { 
      name: '5min',
      base: 'minute',
      factor: 5,
      type: 'Sum'
    },
    { 
      name: '1h',
      base: 'hour',
      factor: 1,
      type: 'Sum'
    },
    { 
      name: '4h',
      base: 'hour',
      factor: 4,
      type: 'Sum'
    },
    { 
      name: '8h',
      base: 'hour',
      factor: 8,
      type: 'Sum'
    },
    { 
      name: '1d',
      base: 'day',
      factor: 1,
      type: 'Sum'
    }
  ];

  const aggregations: { [key: string]: any } = {};

  for (const interval of timeIntervals) {
    console.log(`  📈 Création agrégation ${interval.name} pour ${variableName}`);
    const agg = await createAggregation(variableId, interval.type, interval.base, interval.factor);
    aggregations[interval.name] = {
      id: agg.id,
      type: interval.type,
      cycle: {
        base: interval.base,
        factor: interval.factor
      }
    };
  }

  return aggregations;
}

async function createOrGetVariable(assetId: string, name: string, dataType: string = 'DOUBLE', unit: string | null = null, description?: string, createAggs: boolean = false) {
  // Vérifier si la variable existe déjà
  const existingVariable = await getExistingVariable(assetId, name);
  if (existingVariable) {
    console.log(`✓ Variable existante trouvée: ${name}`);
    return {
      ...existingVariable,
      aggregations: createAggs ? await createAggregations(existingVariable.variableId, name) : undefined
    };
  }

  // Si la variable n'existe pas, la créer
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const body = {
    variableName: name,
    assetId,
    dataType,
    description: description || `Variable ${name} créée automatiquement`,
    unit
  };

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
    throw new Error(`Erreur lors de la création de la variable: ${errorText}`);
  }

  const newVariable = await response.json();
  console.log(`✅ Nouvelle variable créée: ${name}`);

  // Créer les agrégations si demandé
  if (createAggs) {
    console.log(`📊 Création des agrégations pour ${name}`);
    const aggregations = await createAggregations(newVariable.variableId, name);
    return {
      ...newVariable,
      aggregations
    };
  }

  return newVariable;
}

async function getRootAsset() {
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const response = await fetch('/api/assets/root', {
    headers: {
      'X-Auth-Config': JSON.stringify(authConfig)
    }
  });

  if (!response.ok) {
    throw new Error('Impossible de récupérer l\'asset racine');
  }

  const rootAsset = await response.json();
  return rootAsset;
}

// Fonction pour obtenir l'unité en fonction du type d'énergie
function getUnitForEnergyType(energyType: string): string {
  switch (energyType.toLowerCase()) {
    case 'elec':
      return 'kWh';
    case 'gaz':
      return 'm3/h';
    case 'eau':
      return 'm3/h';
    case 'air':
      return 'm3/h';
    default:
      return 'kWh';
  }
}

// Fonction pour normaliser le type d'énergie
function normalizeEnergyType(energyType: string): string {
  const normalized = energyType.toLowerCase().trim();
  
  if (normalized.includes('elec') || normalized.includes('électric')) return 'Elec';
  if (normalized.includes('gaz')) return 'Gaz';
  if (normalized.includes('eau')) return 'Eau';
  if (normalized.includes('air') || normalized.includes('comprim')) return 'Air';
  
  return 'Unknown';
}

export async function importFlexibleAssetsToIIH(data: FlexibleProcessedData) {
  const { hierarchyData } = data;
  const createdAssets = new Map<string, any>();

  // Récupérer l'asset racine
  const rootAsset = await getRootAsset();
  console.log('Asset racine récupéré:', rootAsset);

  // Fonction récursive pour créer les assets
  async function createAssetsRecursively(node: HierarchyNode, parentId: string) {
    // Créer l'asset actuel
    const asset = await createOrGetAsset({
      name: node.name,
      parentId,
      type: 'asset',
      metadata: {
        level: node.levelName
      }
    });

    createdAssets.set(node.id, asset);

    // Vérifier si c'est un nœud du dernier niveau (pas d'enfants)
    const isLastLevel = !hierarchyData.links.some(link => link.source === node.id);

    if (isLastLevel) {
      // Déterminer le type d'énergie à partir des métadonnées ou du nom
      let energyType = node.metadata?.energyType || 'Unknown';
      if (energyType === 'Unknown') {
        // Fallback sur la détection par le nom si pas de type spécifié
        const name = node.name.toLowerCase();
        if (name.includes('elec') || name.includes('électric')) energyType = 'Elec';
        else if (name.includes('gaz')) energyType = 'Gaz';
        else if (name.includes('eau')) energyType = 'Eau';
        else if (name.includes('air') || name.includes('comprim')) energyType = 'Air';
      }

      // Variable de consommation
      const consoVarName = `Consommation_${energyType}_${sanitizeAssetName(node.name)}`;
      const consoVar = await createOrGetVariable(
        asset.assetId,
        consoVarName,
        'FLOAT32',
        getUnitForEnergyType(energyType),
        'Consommation énergétique',
        true
      );

      // Variable de production
      const prodVarName = `Production_${sanitizeAssetName(node.name)}`;
      const prodVar = await createOrGetVariable(
        asset.assetId,
        prodVarName,
        'FLOAT32',
        'pcs',
        'Production',
        true
      );

      // Variable IPE
      const ipeVarName = `IPE_${sanitizeAssetName(node.name)}`;
      const ipeVar = await createOrGetVariable(
        asset.assetId,
        ipeVarName,
        'FLOAT32',
        'kWh/pcs',
        'Indicateur de Performance Énergétique',
        true
      );

      // État capteur
      const stateVar = await createOrGetVariable(
        asset.assetId,
        `EtatCapteur_${sanitizeAssetName(node.name)}`,
        'STRING',
        null,
        'État du capteur de la machine'
      );

      // Mettre à jour les métadonnées du nœud avec les IDs des variables
      node.metadata = {
        ...node.metadata,
        energyType,
        assetId: asset.assetId,
        type: 'machine',
        variable: consoVar ? {
          id: consoVar.variableId,
          name: consoVarName,
          aggregations: consoVar.aggregations ? Object.entries(consoVar.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
            ...acc,
            [key]: {
              id: agg.id,
              type: agg.type,
              cycle: {
                base: agg.cycle.base,
                factor: agg.cycle.factor
              }
            }
          }), {}) : undefined
        } : undefined,
        productionVariable: prodVar ? {
          id: prodVar.variableId,
          name: prodVarName,
          aggregations: prodVar.aggregations ? Object.entries(prodVar.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
            ...acc,
            [key]: {
              id: agg.id,
              type: agg.type,
              cycle: {
                base: agg.cycle.base,
                factor: agg.cycle.factor
              }
            }
          }), {}) : undefined
        } : undefined,
        ipeVariable: ipeVar ? {
          id: ipeVar.variableId,
          name: ipeVarName,
          aggregations: ipeVar.aggregations ? Object.entries(ipeVar.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
            ...acc,
            [key]: {
              id: agg.id,
              type: agg.type,
              cycle: {
                base: agg.cycle.base,
                factor: agg.cycle.factor
              }
            }
          }), {}) : undefined
        } : undefined,
        stateVariable: stateVar ? {
          variableId: stateVar.variableId,
          name: stateVar.variableName
        } : undefined
      };
    }

    // Trouver et créer les enfants
    const childLinks = hierarchyData.links.filter(link => link.source === node.id);
    for (const link of childLinks) {
      const childNode = hierarchyData.nodes.find(n => n.id === link.target);
      if (childNode) {
        await createAssetsRecursively(childNode, asset.assetId);
      }
    }

    return asset;
  }

  // Commencer par les nœuds de premier niveau
  const topLevelNodes = hierarchyData.nodes.filter(
    node => node.level === hierarchyData.levels[0].level
  );

  for (const node of topLevelNodes) {
    await createAssetsRecursively(node, rootAsset.assetId);
  }

  return {
    success: true,
    message: `Import terminé avec succès. ${createdAssets.size} assets créés.`,
    assets: Array.from(createdAssets.values())
  };
} 