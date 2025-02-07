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
}

interface IIHSector extends IIHAssetBase {
  type: 'sector';
  workshops: {
    [key: string]: IIHWorkshop;
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
    throw new Error(`Erreur lors de la création de l'agrégation pour la variable ${variableId}: ${errorText}`);
  }

  return await response.json();
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

          // Variable de production
          const productionVariable = await createProductionVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable de production créée avec l'ID: ${productionVariable.variableId}`);

          // Variable IPE
          const ipeVariable = await createIPEVariable(sanitizedMachineName, machineAsset.assetId);
          console.log(`      ✅ Variable IPE créée avec l'ID: ${ipeVariable.variableId}`);

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
          const productionAggregations: { [key: string]: any } = {};
          const ipeAggregations: { [key: string]: any } = {};

          // Agrégations pour consommation, production et IPE
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

            // Agrégation production
            const aggProd = await createAggregation(productionVariable.variableId, 'Sum', interval.base, interval.factor);
            productionAggregations[interval.name] = {
              id: aggProd.id,
              type: 'Sum',
              cycle: { base: interval.base, factor: interval.factor }
            };

            // Agrégation IPE
            const aggIPE = await createAggregation(ipeVariable.variableId, 'Sum', interval.base, interval.factor);
            ipeAggregations[interval.name] = {
              id: aggIPE.id,
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
            productionVariable: {
              id: productionVariable.variableId,
              name: `Production_${sanitizedMachineName}`,
              aggregations: productionAggregations
            },
            ipeVariable: {
              id: ipeVariable.variableId,
              name: `IPE_${sanitizedMachineName}`,
              aggregations: ipeAggregations
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

          iihStructure.sectors[sanitizedSectorName] = {
            id: sectorAsset.id,
            assetId: sectorAsset.assetId,
            name: sectorAsset.name,
            type: 'sector',
            workshops: {}
          };
        }

        // Gérer l'atelier (utiliser 'sans_atelier' si non spécifié)
        const workshopName = item.workshop || 'Sans atelier';
        const sanitizedWorkshopName = sanitizeAssetName(workshopName);

        if (!iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName]) {
          const workshopAsset = await createOrGetAsset({
            name: workshopName,
            description: `Atelier ${workshopName} du secteur ${item.sector}`,
            parentId: iihStructure.sectors[sanitizedSectorName].assetId,
            type: 'workshop'
          });

          iihStructure.sectors[sanitizedSectorName].workshops[sanitizedWorkshopName] = {
            id: workshopAsset.id,
            assetId: workshopAsset.assetId,
            name: workshopAsset.name,
            type: 'workshop',
            machines: {}
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

            // Variable de production
            const productionVariable = await createProductionVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable de production créée avec l'ID: ${productionVariable.variableId}`);

            // Variable IPE
            const ipeVariable = await createIPEVariable(sanitizedMachineName, machineAsset.assetId);
            console.log(`      ✅ Variable IPE créée avec l'ID: ${ipeVariable.variableId}`);

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
            const productionAggregations: { [key: string]: any } = {};
            const ipeAggregations: { [key: string]: any } = {};

            // Agrégations pour consommation, production et IPE
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

              // Agrégation production
              const aggProd = await createAggregation(productionVariable.variableId, 'Sum', interval.base, interval.factor);
              productionAggregations[interval.name] = {
                id: aggProd.id,
                type: 'Sum',
                cycle: { base: interval.base, factor: interval.factor }
              };

              // Agrégation IPE
              const aggIPE = await createAggregation(ipeVariable.variableId, 'Sum', interval.base, interval.factor);
              ipeAggregations[interval.name] = {
                id: aggIPE.id,
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
              productionVariable: {
                id: productionVariable.variableId,
                name: `Production_${sanitizedMachineName}`,
                aggregations: productionAggregations
              },
              ipeVariable: {
                id: ipeVariable.variableId,
                name: `IPE_${sanitizedMachineName}`,
                aggregations: ipeAggregations
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