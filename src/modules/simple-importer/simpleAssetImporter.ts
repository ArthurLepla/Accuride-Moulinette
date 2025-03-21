import { getAuthConfig } from '@/lib/auth';
import { createSimpleImporter } from '@/modules/simple-importer';
import { FlexibleProcessedData } from '@/types/sankey';
import { SimpleImporter } from './importer';
import { AuthConfig, ImportResponse, ImportConfiguration } from './types';

export async function importSimpleTestAsset() {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    console.log('Configuration d\'authentification récupérée:', {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token
    });

    const importer = createSimpleImporter(
      authConfig.baseUrl,
      authConfig.token,
      authConfig.iedIp
    );

    return await importer.importTestAsset();
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import',
      error
    };
  }
}

export async function importFlexibleData(data: FlexibleProcessedData, providedAuthConfig?: AuthConfig) {
  try {
    // Utiliser la configuration fournie ou la récupérer si non fournie
    const authConfig = providedAuthConfig || getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    console.log('Configuration d\'authentification pour import flexible:', {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token,
      source: providedAuthConfig ? 'fournie par paramètre' : 'récupérée automatiquement'
    });

    const importer = createSimpleImporter(
      authConfig.baseUrl,
      authConfig.token,
      authConfig.iedIp
    );

    return await importer.importFlexibleData(data);
  } catch (error) {
    console.error('Erreur lors de l\'import flexible:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import flexible',
      error
    };
  }
}

/**
 * Crée des variables pour tous les assets de niveau 5
 * @param assets Liste d'assets
 * @param importConfig Configuration personnalisée pour l'import (optionnel)
 * @returns Résultat de l'opération
 */
export async function createVariablesForLevel5Assets(
  assets: any[],
  importConfig?: Partial<ImportConfiguration>
): Promise<ImportResponse> {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    console.log('Configuration d\'authentification récupérée pour création de variables:', {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token,
      importConfig
    });

    const importer = createSimpleImporter(
      authConfig.baseUrl,
      authConfig.token,
      authConfig.iedIp,
      importConfig
    );

    return await importer.createVariablesForLevel5Assets(assets);
  } catch (error) {
    console.error('Erreur lors de la création des variables:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables',
      error
    };
  }
}

/**
 * Crée des variables pour tous les niveaux d'assets
 * @param assets Liste d'assets
 * @param importConfig Configuration personnalisée pour l'import (optionnel)
 * @param providedAuthConfig Configuration d'authentification (optionnel)
 * @returns Résultat de l'opération
 */
export async function createVariablesHierarchiques(
  assets: any[],
  importConfig?: Partial<ImportConfiguration>,
  providedAuthConfig?: AuthConfig
): Promise<ImportResponse> {
  try {
    console.log('Création de variables hiérarchiques pour tous les niveaux...');
    console.log(`Nombre total d'assets : ${assets.length}`);
    
    // Utiliser la configuration fournie ou la récupérer si non fournie
    const authConfig = providedAuthConfig || getAuthConfig();
    console.log('Configuration d\'authentification:', {
      baseUrl: authConfig?.baseUrl,
      hasToken: !!authConfig?.token,
      source: providedAuthConfig ? 'fournie par paramètre' : 'récupérée automatiquement'
    });
    
    // Vérifier que la configuration est disponible
    if (!authConfig) {
      throw new Error('Configuration d\'authentification manquante');
    }

    // Afficher des exemples d'assets pour le débogage
    if (assets.length > 0) {
      console.log('Exemple d\'asset:', JSON.stringify(assets[0], null, 2).slice(0, 500) + '...');
    }
    
    // Créer un importateur avec la configuration personnalisée
    const importer = createSimpleImporter(
      authConfig.baseUrl,
      authConfig.token,
      authConfig.iedIp,
      importConfig
    );
    
    // Créer les variables pour tous les niveaux
    return await importer.createVariablesForAllAssets(assets);
  } catch (error) {
    console.error('Erreur lors de la création des variables hiérarchiques:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables hiérarchiques',
      error
    };
  }
} 