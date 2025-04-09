import { getAuthConfig } from '@/lib/auth';
import { createSimpleImporter } from '@/modules/simple-importer';
import { FlexibleProcessedData } from '@/types/sankey';
import { SimpleImporter } from './importer';
import { AuthConfig, ImportResponse, ImportConfiguration, DEFAULT_IMPORT_CONFIG } from './types';

// Fonction utilitaire pour nettoyer les noms d'assets
function sanitizeAssetName(name: string): string {
  if (!name) return '';
  return name.trim()
    .replace(/[^\w\s]/gi, '_')  // Remplacer les caractères spéciaux par _
    .replace(/\s+/g, '_')       // Remplacer les espaces par _
    .replace(/__+/g, '_')       // Remplacer les _ multiples par un seul
    .replace(/^_|_$/g, '');     // Supprimer les _ au début et à la fin
}

// Fonction pour récupérer les assets existants
async function getExistingAssets(): Promise<any[]> {
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  try {
    console.log('Récupération des assets avec auth config:', {
      baseUrl: authConfig.baseUrl,
      hasToken: !!authConfig.token
    });

    const response = await fetch('/api/assets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Config': JSON.stringify(authConfig)
      }
    });

    if (!response.ok) {
      console.error(`Erreur lors de la récupération des assets: ${response.status} ${response.statusText}`);
      return []; // Retourner un tableau vide plutôt que de lancer une erreur
    }

    const data = await response.json();
    
    // Vérifier que data est un tableau
    if (!data || !Array.isArray(data)) {
      console.error('La réponse API n\'est pas un tableau d\'assets:', data);
      
      // Si nous avons un objet assets dans la réponse
      if (data && typeof data === 'object' && Array.isArray(data.assets)) {
        console.log('Utilisation du tableau assets à l\'intérieur de la réponse');
        return data.assets;
      }
      
      // Dernière tentative - voir si nous pouvons extraire les assets d'une autre façon
      if (data && typeof data === 'object') {
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log('Extraction d\'un tableau à partir de la réponse');
          return possibleArrays[0];
        }
      }
      
      // Si tout échoue, retourner un tableau vide
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des assets:', error);
    // Retourner un tableau vide plutôt que de lancer une erreur
    return [];
  }
}

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

export async function importFlexibleData(data: FlexibleProcessedData & { originalData?: any[] }): Promise<ImportResponse> {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      return { success: false, message: 'Non authentifié' };
    }

    // Initialiser l'importateur
    const importer = new SimpleImporter(authConfig);
    console.log('⚙️ Système d\'importation initialisé');
    
    // S'assurer que le système d'agrégation est initialisé
    console.log('🔄 Initialisation du système d\'agrégation...');
    importer.initAggregationSystem(); // Rendre cette méthode publique
    
    // Si les données incluent des nodes, utiliser l'importation flexible
    if (data.hierarchyData?.nodes) {
      console.log(`Importation flexible avec ${data.hierarchyData.nodes.length} nœuds`);
      
      // Pré-traitement des données: enrichir les assets avec les informations originales
      // Notamment le type d'énergie provenant directement de l'Excel
      if (data.originalData) {
        data.hierarchyData.nodes = data.hierarchyData.nodes.map(node => {
          // Chercher les données originales correspondantes par nom
          const originalDataItem = data.originalData?.find((item: any) => 
            item.name === node.name || 
            item.machine === node.name ||
            sanitizeAssetName(item.name || '') === sanitizeAssetName(node.name) ||
            sanitizeAssetName(item.machine || '') === sanitizeAssetName(node.name)
          );
          
          if (originalDataItem) {
            console.log(`Enrichissement du nœud "${node.name}" avec les données Excel originales (type_energie: ${originalDataItem.type_energie || 'non défini'})`);
            return {
              ...node,
              // Ajouter un champ originalData pour stocker les données Excel
              originalData: {
                ...originalDataItem,
                type_energie: originalDataItem.type_energie || originalDataItem.type
              }
            };
          }
          return node;
        });
      }
      
      const importResult = await importer.importFlexibleData(data);
      
      // S'assurer que toutes les agrégations en attente sont traitées à la fin
      console.log('🔄 Finalisation de toutes les agrégations en attente...');
      const aggResult = await importer.finalizePendingAggregations();
      console.log(`📊 Bilan des agrégations: ${aggResult.success} succès, ${aggResult.errors} erreurs`);
      
      return importResult;
    } 
    // Sinon, utiliser une importation standard
    else {
      return { success: false, message: 'Format de données non pris en charge' };
    }
  } catch (error) {
    console.error('Erreur lors de l\'importation flexible:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'importation flexible',
      error
    };
  }
}

// Function to create variables for level 5 assets
export async function createVariablesForLevel5Assets(options?: { 
  typeFilter?: string 
}): Promise<ImportResponse> {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      return { success: false, message: 'Non authentifié' };
    }

    // Initialiser l'importateur
    const importer = new SimpleImporter(authConfig);
    
    // Récupérer les assets existants
    const assets = await getExistingAssets();
    
    // Enrichir les assets avec les données originales si disponibles
    // Essayer de récupérer les données Excel stockées dans le localStorage ou SessionStorage
    let originalData: any[] = [];
    try {
      const storedData = localStorage.getItem('importedExcelData') || sessionStorage.getItem('importedExcelData');
      if (storedData) {
        originalData = JSON.parse(storedData);
        console.log(`Données Excel originales récupérées: ${originalData.length} lignes`);
      }
    } catch (error) {
      console.warn('Pas de données Excel originales disponibles:', error);
    }
    
    // Enrichir les assets avec les informations originales
    if (originalData.length > 0) {
      assets.forEach((asset: any) => {
        // Chercher les données originales correspondantes par nom
        const originalDataItem = originalData.find((item: any) => 
          item.name === asset.name || 
          item.machine === asset.name ||
          sanitizeAssetName(item.name || '') === sanitizeAssetName(asset.name) ||
          sanitizeAssetName(item.machine || '') === sanitizeAssetName(asset.name)
        );
        
        if (originalDataItem) {
          console.log(`Enrichissement de l'asset "${asset.name}" avec les données Excel originales`);
          asset.originalData = {
            ...originalDataItem,
            type_energie: originalDataItem.type_energie || originalDataItem.type
          };
        }
      });
    }
    
    // Utiliser l'importateur pour créer les variables
    // La signature de la fonction createVariablesForLevel5Assets dans SimpleImporter 
    // n'accepte qu'un tableau d'assets et pas d'options
    return await importer.createVariablesForLevel5Assets(assets);
  } catch (error) {
    console.error('Erreur lors de la création des variables pour les assets de niveau 5:', error);
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
    
    // S'assurer que le système d'agrégation est initialisé
    console.log('🔄 Initialisation du système d\'agrégation...');
    importer.initAggregationSystem();
    
    // Créer les variables pour tous les niveaux
    const result = await importer.createVariablesForAllAssets(assets);
    
    // S'assurer que toutes les agrégations en attente sont traitées à la fin
    console.log('🔄 Finalisation de toutes les agrégations en attente...');
    const aggResult = await importer.finalizePendingAggregations();
    console.log(`📊 Bilan des agrégations: ${aggResult.success} succès, ${aggResult.errors} erreurs`);
    
    // Ajouter les statistiques d'agrégation au résultat
    if (result.stats) {
      // Utiliser une assertion de type pour éviter les erreurs du linter
      const stats = result.stats as any;
      stats.aggregationsSuccess = aggResult.success;
      stats.aggregationsErrors = aggResult.errors;
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la création des variables hiérarchiques:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables hiérarchiques',
      error
    };
  }
}

/**
 * Fonction de débogage pour créer des agrégations pour des variables existantes
 * Utile pour réessayer la création d'agrégations sans recréer les variables
 */
export async function createAggregationsForExistingVariables(): Promise<ImportResponse> {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      return { success: false, message: 'Non authentifié' };
    }

    // Initialiser l'importateur
    const importer = new SimpleImporter(authConfig);
    console.log('⚙️ Système d\'importation initialisé (version optimisée)');

    // Récupération de tous les assets
    console.log('🔍 Récupération des assets existants...');
    
    // Collection de toutes les variables à traiter
    const allVariables = new Map();
    let totalVariables = 0;
    
    try {
      // Récupérer directement toutes les variables du système pour un traitement plus efficace
      const variables = await importer.getAllVariables();
      
      if (!variables || !Array.isArray(variables)) {
        throw new Error('Erreur de format pour les variables récupérées, tableau attendu');
      }
      
      console.log(`✅ ${variables.length} variables récupérées directement du système`);
      
      // Stocker toutes les variables uniques par ID
      for (const variable of variables) {
        const variableId = variable?.id || variable?.variableId || variable?._id;
        
        if (!variableId) {
          console.warn(`⚠️ Variable sans ID, ignorée:`, JSON.stringify(variable));
          continue;
        }
        
        // Stocker uniquement les variables uniques
        if (!allVariables.has(variableId)) {
          allVariables.set(variableId, variable);
          totalVariables++;
        }
      }
      
      console.log(`🔄 ${totalVariables} variables uniques identifiées pour traitement`);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération directe des variables:', error);
      return { 
        success: false, 
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
    
    // Traitement par lots des variables
    console.log('📊 Démarrage du traitement par lots des variables...');
    
    try {
      // Convertir la Map en tableau pour le traitement par lots
      const variablesToProcess = Array.from(allVariables.values());
      
      // Utiliser la nouvelle méthode de traitement par lots
      const batchResult = await importer.createAggregationsInBatches(
        variablesToProcess,
        'Sum', // Type d'agrégation par défaut (sera remplacé par variable)
        5      // Taille des lots (5 variables en parallèle)
      );
      
      console.log(`📊 Bilan final: ${batchResult.success} variables traitées, ${batchResult.aggregationsCreated} agrégations créées, ${batchResult.errors} erreurs`);
      
      // Finaliser toutes les agrégations en attente (si nécessaire)
      console.log(`🔄 Finalisation des agrégations en attente...`);
      const aggResult = await importer.finalizePendingAggregations();
      console.log(`📊 Bilan final des agrégations: ${aggResult.success} succès, ${aggResult.errors} erreurs`);
      
      return {
        success: true,
        message: `${batchResult.success} variables traitées, ${batchResult.aggregationsCreated + aggResult.success} agrégations créées au total`,
        stats: {
          totalVariables: totalVariables,
          aggregationsSuccess: batchResult.aggregationsCreated + aggResult.success,
          aggregationsErrors: batchResult.errors + aggResult.errors
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors du traitement par lots:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        error
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création d\'agrégations pour les variables existantes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      error
    };
  }
}

/**
 * Fonction exportée pour créer des agrégations pour toutes les variables existantes
 * @returns Résultat de l'opération
 */
export async function createAggregationsForAll(): Promise<{ 
  success: boolean; 
  message: string; 
  aggregationsByVariableId: Map<string, Record<string, { id: string; type: string }>>;
  errors: any[];
}> {
  try {
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    // Initialiser l'importateur
    const importer = new SimpleImporter(authConfig);
    console.log('[simpleAssetImporter] ⚙️ Système d\'importation initialisé pour créer les agrégations');

    // Récupérer toutes les variables existantes
    console.log('[simpleAssetImporter] Récupération de toutes les variables...');
    // Define a basic type for the variable structure returned by getAllVariables
    interface BasicVariableInfo { 
        id?: string; 
        variableId?: string; 
        _id?: string; 
        name?: string; 
        variableName?: string; 
        dataType?: string;
        // Add other potential properties if known
    }
    // Define the expected response structure from getAllVariables
    interface GetAllVariablesResponse {
      success: boolean;
      message: string;
      variables: BasicVariableInfo[];
    }
    const variablesResponse: GetAllVariablesResponse = await importer.getAllVariables();

    if (!variablesResponse.success || !variablesResponse.variables || variablesResponse.variables.length === 0) {
      console.warn('[simpleAssetImporter] Aucune variable trouvée ou erreur lors de la récupération', variablesResponse.message);
      return { 
        success: false, 
        message: variablesResponse.message || 'Aucune variable trouvée pour créer les agrégations.', 
        aggregationsByVariableId: new Map(),
        errors: [{ message: variablesResponse.message || 'No variables found' }]
      };
    }

    const variables = variablesResponse.variables;
    console.log(`[simpleAssetImporter] ${variables.length} variables trouvées.`);

    const allAggregationsMap = new Map<string, Record<string, { id: string; type: string }>>();
    const allErrors: any[] = [];
    let processedCount = 0;

    // Traiter les variables par lots pour éviter de surcharger l'API
    const batchSize = 10; // Ajuster si nécessaire
    for (let i = 0; i < variables.length; i += batchSize) {
      const batch = variables.slice(i, i + batchSize);
      console.log(`[simpleAssetImporter] Traitement du lot d'agrégation ${i / batchSize + 1} / ${Math.ceil(variables.length / batchSize)} (${batch.length} variables)`);

      // Define the expected result structure from the mapped promise
      type AggregationResult = {
        variableId: string | null;
        aggregations: Record<string, { id: string; type: string }>;
        errors: string[];
      };

      const batchPromises = batch.map(async (variable: BasicVariableInfo): Promise<AggregationResult> => {
        const variableId = variable.id || variable.variableId || variable._id;
        const variableName = variable.name || variable.variableName || 'Variable inconnue';

        if (!variableId) {
          console.warn(`[simpleAssetImporter] Variable sans ID ignorée: ${variableName}`);
          return { variableId: null, aggregations: {}, errors: ['Variable without ID'] };
        }

        try {
          // Déterminer le type d'agrégation basé sur le dataType
          const aggregationType = importer.determineAggregationType(variable.dataType || 'Float');
          
          // Appeler la fonction mise à jour qui retourne les détails des agrégations
          const result = await importer.createAggregationsForVariable(
            variableId,
            variableName,
            aggregationType,
            false // Ne pas forcer la création, vérifier d'abord
          );

          // Retourner seulement l'ID et les agrégations/erreurs pertinentes
          return { 
            variableId: result.variableId, 
            aggregations: result.aggregations, 
            errors: result.errors 
          };
        } catch (error) {
          const errorMessage = `Erreur création agrégation pour ${variableName}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`[simpleAssetImporter] ${errorMessage}`);
          return { variableId: variableId, aggregations: {}, errors: [errorMessage] };
        }
      });

      // Attendre la fin du lot
      const batchResults = await Promise.allSettled(batchPromises);

      // Traiter les résultats du lot
      batchResults.forEach((result: PromiseSettledResult<AggregationResult>) => {
        processedCount++;
        if (result.status === 'fulfilled' && result.value.variableId) {
          const { variableId, aggregations, errors } = result.value;
          if (Object.keys(aggregations).length > 0) {
             allAggregationsMap.set(variableId, aggregations);
          }
          if (errors && errors.length > 0) {
            allErrors.push(...errors.map((e: string) => ({ variableId, error: e })));
          }
        } else if (result.status === 'rejected') {
          console.error('[simpleAssetImporter] Erreur inattendue dans Promise.allSettled:', result.reason);
          allErrors.push({ variableId: 'batch_error', error: result.reason });
        } else if (result.status === 'fulfilled' && !result.value.variableId) {
          // Variable ignorée (pas d'ID)
          if (result.value.errors.length > 0) allErrors.push(...result.value.errors);
        }
      });
      
      // Petite pause entre les lots
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    const finalSuccess = allErrors.length === 0;
    const finalMessage = `Traitement de ${processedCount} variables terminé. ${allAggregationsMap.size} variables avec agrégations. ${allErrors.length} erreurs.`;
    console.log(`[simpleAssetImporter] ${finalMessage}`);

    return {
      success: finalSuccess,
      message: finalMessage,
      aggregationsByVariableId: allAggregationsMap,
      errors: allErrors
    };

  } catch (error) {
    const errorMessage = `Erreur majeure dans createAggregationsForAll: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[simpleAssetImporter] ${errorMessage}`);
    return {
      success: false,
      message: errorMessage,
      aggregationsByVariableId: new Map(),
      errors: [{ message: errorMessage }]
    };
  }
}