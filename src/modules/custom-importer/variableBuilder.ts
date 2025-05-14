import { CustomImportConfig } from './configSchema';
import { IIHApi } from '../simple-importer/api';
import { AuthConfig, IIHVariable } from '../simple-importer/types';

/**
 * Construit les variables dans IIH pour chaque asset selon la configuration
 * @param config Configuration d'import personnalisé
 * @param assets Liste des assets créés
 * @param excelData Données Excel traitées
 * @returns Liste des variables créées avec leur ID
 */
export async function buildVariablesFromConfig(
  config: CustomImportConfig,
  assets: any[],
  excelData: Record<string, any>[]
): Promise<any[]> {
  console.log('Création des variables selon la configuration:', {
    levels: config.hierarchy.levels.length,
    variablesMappings: config.tagMappings?.length
  });

  if (!assets || assets.length === 0) {
    throw new Error('Aucun asset disponible pour créer des variables');
  }

  // Log des assets reçus pour déboguer
  console.log(`Reçu ${assets.length} assets pour création de variables:`, assets.map(a => ({
    name: a.name,
    assetId: a.assetId,
    metadata: a.metadata
  })));

  // 1. Récupérer la configuration d'authentification
  const authConfigString = localStorage.getItem('authConfig');
  if (!authConfigString) {
    throw new Error('Configuration d\'authentification non trouvée');
  }
  
  const authConfig: AuthConfig = JSON.parse(authConfigString);
  const api = new IIHApi(authConfig);

  // 2. Préparer la liste des variables à créer
  const variablesToCreate: IIHVariable[] = [];
  
  // 3. Pour chaque niveau de la hiérarchie configurée
  for (let levelIndex = 0; levelIndex < config.hierarchy.levels.length; levelIndex++) {
    const level = config.hierarchy.levels[levelIndex];
    console.log(`Traitement des variables pour le niveau ${levelIndex + 1}: ${level.columnName}`);
    
    // Si le niveau n'a pas de levelVariables définis, on passe au suivant
    if (!hasLevelVariables(level)) {
      console.warn(`Aucune variable définie pour le niveau ${levelIndex + 1}`);
      continue;
    }
    
    // Récupérer les assets pour ce niveau avec plusieurs stratégies de détection
    let levelAssets = [];
    
    // Stratégie 1: Identifier par metadata.level (méthode préférée)
    const assetsByMetadataLevel = assets.filter(asset => 
      asset.metadata?.level === (levelIndex + 1)
    );
    
    if (assetsByMetadataLevel.length > 0) {
      console.log(`Stratégie 1: Trouvé ${assetsByMetadataLevel.length} assets avec metadata.level=${levelIndex + 1}`);
      levelAssets = assetsByMetadataLevel;
    } else {
      // Stratégie 2: Identifier par la profondeur du chemin dans metadata.path
      const assetsByPathDepth = assets.filter(asset => 
        asset.metadata?.path && 
        Array.isArray(asset.metadata.path) && 
        asset.metadata.path.length === (levelIndex + 1)
      );
      
      if (assetsByPathDepth.length > 0) {
        console.log(`Stratégie 2: Trouvé ${assetsByPathDepth.length} assets avec profondeur de chemin ${levelIndex + 1}`);
        levelAssets = assetsByPathDepth;
      } else {
        // Stratégie 3: Pour le niveau 1, tous les assets sans parent ou avec parentId = rootAsset.assetId
        if (levelIndex === 0) {
          const rootAssetId = await getRootAssetId(api);
          const level1Assets = assets.filter(asset => 
            !asset.parentId || 
            asset.parentId === "root" || 
            asset.parentId === rootAssetId
          );
          
          if (level1Assets.length > 0) {
            console.log(`Stratégie 3: Trouvé ${level1Assets.length} assets de niveau 1 par relation parent`);
            levelAssets = level1Assets;
          }
        }
        
        // Stratégie 4: Pour le dernier niveau, considérer les assets qui n'ont pas d'enfants
        if (levelIndex === config.hierarchy.levels.length - 1 && levelAssets.length === 0) {
          // Collecter tous les parentIds
          const allParentIds = new Set(
            assets
              .filter(asset => asset.parentId)
              .map(asset => asset.parentId)
          );
          
          // Les assets sans enfants sont ceux qui ne sont pas dans la liste des parentIds
          const leafAssets = assets.filter(asset => 
            asset.assetId && !allParentIds.has(asset.assetId)
          );
          
          if (leafAssets.length > 0) {
            console.log(`Stratégie 4: Trouvé ${leafAssets.length} assets feuilles (sans enfants) pour le dernier niveau`);
            levelAssets = leafAssets;
          }
        }
        
        // Stratégie 5 (dernier recours): Utiliser tous les assets si toujours rien trouvé
        if (levelAssets.length === 0) {
          console.warn(`⚠️ Aucun asset correspondant au niveau ${levelIndex + 1} trouvé avec les stratégies 1-4. Utilisation de tous les assets.`);
          levelAssets = assets;
        }
      }
    }
    
    if (levelAssets.length === 0) {
      console.warn(`Aucun asset trouvé pour le niveau ${levelIndex + 1} après toutes les stratégies de détection!`);
      continue;
    }
    
    console.log(`Traitement de ${levelAssets.length} assets pour le niveau ${levelIndex + 1}:`, 
      levelAssets.map(a => ({ name: a.name, assetId: a.assetId })));
    
    // Pour chaque variable définie dans ce niveau
    for (const variable of level.levelVariables) {
      console.log(`Configuration de la variable: ${variable.baseName}`);
      
      // Trouver le mapping de tag pour cette variable
      const tagMapping = config.tagMappings?.find(
        mapping => mapping.levelIndex === levelIndex && mapping.variableId === variable.id
      );
      
      if (!tagMapping) {
        console.warn(`Aucun mapping de tag trouvé pour la variable ${variable.baseName} au niveau ${levelIndex + 1}`);
        continue;
      }
      
      // Pour chaque asset de ce niveau, créer une variable
      for (const asset of levelAssets) {
        try {
          if (!asset.assetId) {
            console.warn(`Asset sans assetId trouvé, ignoré: ${asset.name || 'Unnamed'}`);
            continue;
          }
          
          // Déterminer le type d'énergie si configuré
          let energyType = '';
          if (config.hierarchy.energyTypeColumn && excelData.length > 0) {
            // D'abord essayer de prendre de l'asset metadata
            if (asset.metadata?.energyType) {
              energyType = asset.metadata.energyType;
            } 
            // Sinon chercher dans la première ligne de données Excel
            else {
              energyType = excelData[0][config.hierarchy.energyTypeColumn] || '';
            }
          }
          
          // Construire le nom d'affichage en remplaçant les placeholders
          const displayName = buildDisplayName(
            variable.displayNamePatternBlocks,
            asset.name,
            energyType
          );
          
          // Déterminer l'unité en fonction de la source configurée
          let unit = '';
          if (variable.unitSource === 'auto') {
            unit = determineUnitFromEnergyType(energyType);
          } else if (variable.unitSource === 'column' && variable.unitColumn) {
            unit = excelData[0][variable.unitColumn] || '';
          } else if (variable.unitSource === 'ruleBased' && variable.unitRules && variable.unitRules.length > 0) {
            unit = determineUnitFromRules(
              variable.unitRules,
              energyType,
              excelData[0]
            );
          }
          
          // Créer la structure de variable
          const variableToCreate: IIHVariable = {
            variableName: displayName,
            dataType: variable.dataType,
            assetId: asset.assetId,
            description: `Variable: ${variable.baseName} pour ${asset.name}`,
            sourceType: 'Tag', // Toujours Tag pour l'instant
            unit,
            tag: {
              adapterId: config.selectedAdapterId || '',
              connectionName: tagMapping.connectionName || '',
              tagName: tagMapping.selectedTag || '',
              dataType: variable.dataType
            },
            store: true, // Toujours stocker les données
            retention: config.retention.enable ? {
              settings: {
                timeSettings: {
                  timeRange: {
                    base: 'year',
                    factor: config.retention.years
                  }
                }
              }
            } : undefined
          };
          
          variablesToCreate.push(variableToCreate);
          console.log(`Variable préparée: ${displayName} pour asset ${asset.name} (${asset.assetId})`);
        } catch (error) {
          console.error(`Erreur lors de la préparation de la variable pour l'asset ${asset.name}:`, error);
          // Continue with other assets
        }
      }
    }
  }
  
  // 4. Créer les variables en bulk
  console.log(`Création en bulk de ${variablesToCreate.length} variables...`);
  if (variablesToCreate.length === 0) {
    return [];
  }
  
  try {
    const createdVariables = await api.createVariablesBulk(variablesToCreate);
    console.log(`✅ ${createdVariables.results?.length || 0} variables créées avec succès`);
    return createdVariables.results || [];
  } catch (error) {
    console.error('Erreur lors de la création des variables:', error);
    throw error;
  }
}

/**
 * Récupérer l'ID de l'asset racine
 */
async function getRootAssetId(api: IIHApi): Promise<string> {
  try {
    const rootAsset = await api.getRootAsset();
    return rootAsset?.assetId || '';
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'asset racine:', error);
    return '';
  }
}

/**
 * Vérifie si un niveau de hiérarchie a des variables définies
 */
function hasLevelVariables(level: any): boolean {
  return level && 
         level.levelVariables && 
         Array.isArray(level.levelVariables) && 
         level.levelVariables.length > 0;
}

/**
 * Construit le nom d'affichage en remplaçant les placeholders par les valeurs réelles
 */
function buildDisplayName(
  patternBlocks: any[],
  assetName: string,
  energyType: string
): string {
  let displayName = '';
  
  if (!patternBlocks || !Array.isArray(patternBlocks)) {
    // Si pas de pattern blocks, utiliser le nom de l'asset
    return assetName || 'Variable';
  }
  
  for (const block of patternBlocks) {
    if (block.type === 'text') {
      displayName += block.value;
    } else if (block.type === 'placeholder') {
      switch (block.value) {
        case 'assetName':
          displayName += assetName;
          break;
        case 'energyType':
          displayName += energyType;
          break;
        case 'levelName':
          displayName += assetName; // Par défaut, utilisez le nom de l'asset
          break;
        default:
          displayName += `{${block.value}}`;
      }
    }
  }
  
  return displayName || assetName || 'Variable';
}

/**
 * Détermine l'unité en fonction du type d'énergie
 */
function determineUnitFromEnergyType(energyType: string): string {
  const lowerType = (energyType || '').toLowerCase();
  
  if (lowerType.includes('elec')) return 'kWh';
  if (lowerType.includes('gaz')) return 'm³';
  if (lowerType.includes('eau')) return 'L';
  if (lowerType.includes('air')) return 'm³';
  
  return ''; // Unité par défaut vide
}

/**
 * Détermine l'unité en fonction des règles configurées
 */
function determineUnitFromRules(
  rules: any[],
  energyType: string,
  rowData: Record<string, any>
): string {
  const lowerType = (energyType || '').toLowerCase();
  
  // Chercher une règle correspondante
  for (const rule of rules) {
    if (!rule.conditionValue) continue;
    
    const ruleValue = rule.conditionValue.toLowerCase();
    if (lowerType.includes(ruleValue)) {
      // Règle trouvée
      if (rule.unitSource === 'column' && rule.unitColumn) {
        return rowData[rule.unitColumn] || '';
      }
      return rule.unit || '';
    }
  }
  
  // Aucune règle ne correspond, utiliser la valeur par défaut
  return '';
} 