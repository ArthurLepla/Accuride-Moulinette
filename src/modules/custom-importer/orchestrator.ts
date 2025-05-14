import { CustomImportConfig } from './configSchema';
import { buildAssetsFromConfig } from './assetBuilder';
import { buildVariablesFromConfig } from './variableBuilder';
import { buildAggregationsFromConfig } from './aggregationBuilder';
import { applyRetentionFromConfig } from './retentionBuilder';
import { saveCustomImportConfig } from './configStore';

/**
 * Importe des données selon la configuration personnalisée
 * @param config Configuration d'import personnalisé
 * @param excelData Données Excel à traiter
 * @returns Résultat de l'opération
 */
export async function importCustomData(
  config: CustomImportConfig,
  excelData: Record<string, any>[]
): Promise<{
  success: boolean;
  message: string;
  error?: string | Error;
  errors?: string[];
  assetsCount?: number;
  variablesCount?: number;
  aggregationsCount?: number;
}> {
  console.log('Démarrage de l\'import personnalisé avec la configuration:', config);
  console.log(`Données: ${excelData.length} lignes Excel à traiter`);
  
  const errors: string[] = [];
  let assets: any[] = [];
  let variables: any[] = [];
  let aggregations: any[] = [];

  try {
    // 1. Sauvegarder la configuration pour référence future
    saveCustomImportConfig(config);
    console.log('Configuration sauvegardée dans le localStorage');
    
    // 2. Créer les assets selon la hiérarchie
    console.log('Étape 1: Création des assets...');
    try {
      assets = await buildAssetsFromConfig(config, excelData);
      console.log(`✅ ${assets.length} assets créés avec succès`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la création des assets:', errorMessage);
      errors.push(`Erreur lors de la création des assets: ${errorMessage}`);
      return {
        success: false,
        message: 'Erreur lors de l\'import personnalisé',
        error: errorMessage,
        errors,
        assetsCount: 0,
        variablesCount: 0,
        aggregationsCount: 0
      };
    }
    
    // 3. Créer les variables pour chaque asset
    console.log('Étape 2: Création des variables...');
    try {
      variables = await buildVariablesFromConfig(config, assets, excelData);
      console.log(`✅ ${variables.length} variables créées avec succès`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la création des variables:', errorMessage);
      errors.push(`Erreur lors de la création des variables: ${errorMessage}`);
      return {
        success: false,
        message: 'Erreur lors de l\'import personnalisé',
        error: errorMessage,
        errors,
        assetsCount: assets.length,
        variablesCount: 0,
        aggregationsCount: 0
      };
    }
    
    // 4. Créer les agrégations pour les variables numériques
    console.log('Étape 3: Création des agrégations...');
    try {
      aggregations = await buildAggregationsFromConfig(config, variables);
      console.log(`✅ ${aggregations.length} agrégations créées avec succès`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la création des agrégations:', errorMessage);
      errors.push(`Erreur lors de la création des agrégations: ${errorMessage}`);
      return {
        success: false,
        message: 'Erreur lors de l\'import personnalisé',
        error: errorMessage,
        errors,
        assetsCount: assets.length,
        variablesCount: variables.length,
        aggregationsCount: 0
      };
    }
    
    // 5. Appliquer la politique de rétention
    console.log('Étape 4: Application de la politique de rétention...');
    try {
      await applyRetentionFromConfig(config, variables, aggregations);
      console.log('✅ Politique de rétention appliquée avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de l\'application de la politique de rétention:', errorMessage);
      errors.push(`Erreur lors de l\'application de la politique de rétention: ${errorMessage}`);
      return {
        success: false,
        message: 'Erreur lors de l\'import personnalisé',
        error: errorMessage,
        errors,
        assetsCount: assets.length,
        variablesCount: variables.length,
        aggregationsCount: aggregations.length
      };
    }
    
    // 6. Retourner un résumé de l'import
    return {
      success: true,
      message: `Import personnalisé réussi: ${assets.length} assets, ${variables.length} variables, ${aggregations.length} agrégations`,
      assetsCount: assets.length,
      variablesCount: variables.length,
      aggregationsCount: aggregations.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Erreur lors de l\'import personnalisé:', errorMessage);
    return {
      success: false,
      message: 'Erreur lors de l\'import personnalisé',
      error: errorMessage,
      errors,
      assetsCount: assets.length,
      variablesCount: variables.length,
      aggregationsCount: aggregations.length
    };
  }
} 