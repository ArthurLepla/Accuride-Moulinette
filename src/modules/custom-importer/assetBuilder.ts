import { CustomImportConfig } from './configSchema';
import { IIHApi } from '../simple-importer/api';
import { AuthConfig } from '../simple-importer/types';

/**
 * Construit la hiérarchie d'assets dans IIH en fonction de la configuration et des données Excel
 * @param config Configuration d'import personnalisé
 * @param excelData Données Excel traitées
 * @returns Liste des assets créés avec leur ID
 */
export async function buildAssetsFromConfig(
  config: CustomImportConfig,
  excelData: Record<string, any>[]
): Promise<any[]> {
  console.log('Création des assets selon la configuration:', {
    levels: config.hierarchy.levels,
    energyTypeColumn: config.hierarchy.energyTypeColumn
  });

  if (!excelData || excelData.length === 0) {
    throw new Error('Aucune donnée Excel à traiter pour la création des assets');
  }

  // 1. Récupérer la configuration d'authentification
  const authConfigString = localStorage.getItem('authConfig');
  if (!authConfigString) {
    throw new Error('Configuration d\'authentification non trouvée');
  }
  
  const authConfig: AuthConfig = JSON.parse(authConfigString);

  // Correction : vérifier la présence de iedIp et du token
  if (!authConfig.iedIp || !authConfig.token) {
    throw new Error('Le champ iedIp ou token est manquant dans la configuration d\'authentification. Veuillez vérifier la configuration.');
  }
  
  const api = new IIHApi(authConfig);

  // 2. Récupérer l'asset racine pour rattacher notre hiérarchie
  console.log('Récupération de l\'asset racine...');
  const rootAsset = await api.getRootAsset();
  
  if (!rootAsset || !rootAsset.assetId) {
    throw new Error('Impossible de récupérer l\'asset racine. Vérifiez la connexion à IIH et la validité de la configuration.');
  }
  
  // 3. Extraire les valeurs uniques pour chaque niveau de la hiérarchie
  const hierarchyValues = extractHierarchyValues(config, excelData);
  console.log('Valeurs uniques de la hiérarchie:', hierarchyValues);

  // 4. Créer les assets niveau par niveau
  const createdAssets: Record<string, any> = {};
  const createdAssetsList: any[] = [];
  let parentAssetId = rootAsset.assetId;
  let parentAssetPath: string[] = []; // Chemin hiérarchique du parent
  
  // Pour chaque niveau de la hiérarchie
  for (let levelIndex = 0; levelIndex < config.hierarchy.levels.length; levelIndex++) {
    const level = config.hierarchy.levels[levelIndex];
    const levelName = `Niveau ${levelIndex + 1}: ${level.columnName}`;
    console.log(`Traitement du ${levelName}`);
    
    // Pour chaque valeur unique du niveau courant
    for (const uniqueValue of hierarchyValues[levelIndex]) {
      if (!uniqueValue) continue; // Ignorer les valeurs vides
      
      // Construire un chemin unique pour cet asset
      const assetPath = buildAssetPath(hierarchyValues, levelIndex, uniqueValue);
      const assetName = uniqueValue;
      
      // Vérifie si cet asset a déjà été créé
      if (createdAssets[assetPath]) {
        console.log(`Asset "${assetPath}" déjà créé, passage au suivant`);
        continue;
      }
      
      try {
        // Déterminer le type d'énergie pour cet asset si une colonne est spécifiée
        let energyType = '';
        if (config.hierarchy.energyTypeColumn && excelData.length > 0) {
          // Trouver une ligne qui correspond à cet asset au niveau actuel
          const matchingRow = excelData.find(row => 
            row[level.columnName] === uniqueValue
          );
          if (matchingRow) {
            energyType = matchingRow[config.hierarchy.energyTypeColumn] || '';
          }
        }
        
        // Créer l'asset dans IIH avec des métadonnées
        const newAsset = await api.createAsset({
          name: assetName,
          parentId: parentAssetId,
          // Ajouter des métadonnées utiles
          metadata: {
            level: levelIndex + 1, // Niveau dans la hiérarchie (1-based)
            source: 'custom-import',
            path: [...parentAssetPath], // Chemin hiérarchique (sans cet asset lui-même)
            hierarchyPath: assetPath,
            columnName: level.columnName,
            energyType: energyType,
            createdAt: new Date().toISOString()
          }
        });
        
        if (newAsset && newAsset.assetId) {
          console.log(`✅ Asset "${assetName}" créé avec succès (ID: ${newAsset.assetId})`);
          
          // Mettre à jour le chemin de l'asset pour inclure son propre assetId
          newAsset.metadata = {
            ...newAsset.metadata,
            path: [...(newAsset.metadata?.path || []), newAsset.assetId]
          };
          
          createdAssets[assetPath] = newAsset;
          createdAssetsList.push(newAsset);
          
          // Si c'est le dernier élément du niveau, on utilise son ID comme parent pour le niveau suivant
          if (levelIndex < config.hierarchy.levels.length - 1) {
            parentAssetId = newAsset.assetId;
            // Mettre à jour le chemin parent pour le niveau suivant
            parentAssetPath = newAsset.metadata?.path || [];
          }
        } else {
          console.error(`❌ Échec de création de l'asset "${assetName}"`);
        }
      } catch (error) {
        console.error(`Erreur lors de la création de l'asset "${assetName}":`, error);
        // On continue avec les autres assets (approche best-effort)
      }
    }
  }
  
  console.log(`Total des assets créés: ${createdAssetsList.length}`);
  return createdAssetsList;
}

/**
 * Extrait les valeurs uniques pour chaque niveau de la hiérarchie depuis les données Excel
 */
function extractHierarchyValues(
  config: CustomImportConfig,
  excelData: Record<string, any>[]
): string[][] {
  const hierarchyValues: string[][] = [];
  
  // Pour chaque niveau de la hiérarchie
  for (let i = 0; i < config.hierarchy.levels.length; i++) {
    const columnName = config.hierarchy.levels[i].columnName;
    
    // Extraire toutes les valeurs pour cette colonne
    const values = excelData.map(row => row[columnName]?.toString() || '');
    
    // Filtrer les valeurs uniques et non vides
    const uniqueValues = Array.from(new Set(values)).filter(Boolean);
    hierarchyValues.push(uniqueValues);
  }
  
  return hierarchyValues;
}

/**
 * Construit un chemin unique pour un asset dans la hiérarchie
 */
function buildAssetPath(
  hierarchyValues: string[][],
  currentLevel: number,
  currentValue: string
): string {
  const path = [];
  
  // Ajouter tous les niveaux précédents
  for (let i = 0; i < currentLevel; i++) {
    path.push(hierarchyValues[i][0]); // On prend la première valeur de chaque niveau précédent
  }
  
  // Ajouter la valeur actuelle
  path.push(currentValue);
  
  return path.join('/');
}