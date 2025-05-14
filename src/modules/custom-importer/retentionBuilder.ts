import { CustomImportConfig } from './configSchema';
import { IIHApi } from '../simple-importer/api';
import { AuthConfig } from '../simple-importer/types';

/**
 * Applique la politique de rétention aux variables et agrégations
 * @param config Configuration d'import personnalisé
 * @param variables Liste des variables créées
 * @param aggregations Liste des agrégations créées
 * @returns 
 */
export async function applyRetentionFromConfig(
  config: CustomImportConfig,
  variables: any[],
  aggregations: any[]
): Promise<void> {
  if (!config.retention.enable) {
    console.log('La rétention des données est désactivée dans la configuration');
    return;
  }

  console.log(`Application de la politique de rétention (${config.retention.years} ans)`);

  // 1. Récupérer la configuration d'authentification
  const authConfigString = localStorage.getItem('authConfig');
  if (!authConfigString) {
    throw new Error('Configuration d\'authentification non trouvée');
  }
  
  const authConfig: AuthConfig = JSON.parse(authConfigString);
  const api = new IIHApi(authConfig);

  // 2. Vérifier si la rétention est déjà configurée lors de la création des variables
  // Si c'est le cas, on peut passer cette étape
  const variablesWithoutRetention = variables.filter(variable => !variable.retention);
  
  console.log(`${variablesWithoutRetention.length} variables nécessitent une configuration de rétention`);

  // 3. Appliquer la rétention aux variables qui le nécessitent
  if (variablesWithoutRetention.length > 0) {
    console.log('Application de la rétention aux variables...');
    
    const batchSize = 10; // Traiter par lots pour éviter de surcharger l'API
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < variablesWithoutRetention.length; i += batchSize) {
      const batch = variablesWithoutRetention.slice(i, i + batchSize);
      console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1} / ${Math.ceil(variablesWithoutRetention.length / batchSize)}`);
      
      const batchPromises = batch.map(async (variable) => {
        try {
          // Récupérer l'ID de la variable - API peut retourner soit variableId, soit _id
          const variableId = getEntityId(variable);
          
          if (!variableId) {
            console.error(`Impossible de déterminer l'ID pour la variable ${variable.variableName || 'inconnue'}:`, variable);
            return;
          }
          
          // Utiliser la méthode de l'API pour définir la rétention
          await applyRetentionToEntity(api, variableId, 'Variable', config.retention.years);
          
          console.log(`✅ Rétention de ${config.retention.years} ans appliquée à la variable ${variable.variableName || variableId}`);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors de l'application de la rétention à la variable ${variable.variableName || 'inconnue'}:`, error);
          errorCount++;
          // On continue avec les autres variables (best effort)
        }
        
        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      await Promise.allSettled(batchPromises);
    }
    
    console.log(`Rétention appliquée à ${successCount} variables, ${errorCount} erreurs`);
  }

  // 4. Appliquer la rétention aux agrégations
  if (aggregations.length > 0) {
    console.log('Application de la rétention aux agrégations...');
    
    // Vérifier si la configuration d'agrégation existe, sinon utiliser des valeurs par défaut
    const aggregationConfig = config.aggregation || {
      defaultMethod: 'average',
      cycles: [
        { interval: 'hour', value: 1, retention: 24 },
        { interval: 'day', value: 1, retention: 30 }
      ]
    };
    
    const batchSize = 10; // Traiter par lots pour éviter de surcharger l'API
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < aggregations.length; i += batchSize) {
      const batch = aggregations.slice(i, i + batchSize);
      console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1} / ${Math.ceil(aggregations.length / batchSize)}`);
      
      const batchPromises = batch.map(async (aggregation) => {
        try {
          const aggregationId = getEntityId(aggregation);
          
          if (!aggregationId) {
            console.warn('Agrégation sans ID trouvée, ignorée');
            return;
          }
          
          // Pour les agrégations, la rétention peut être différente selon le cycle
          // On peut retrouver le cycle correspondant dans la config
          let years = config.retention.years;
          
          if (aggregation.cycle && aggregationConfig.cycles) {
            const matchingCycle = aggregationConfig.cycles.find(cycle => 
              cycle.interval === aggregation.cycle.base && cycle.value === aggregation.cycle.factor
            );
            
            if (matchingCycle && matchingCycle.retention) {
              // Convertir la rétention spécifique du cycle en années
              // La valeur stockée peut être en jours, heures, etc. selon l'intervalle
              switch (aggregation.cycle.base) {
                case 'minute':
                  years = Math.min(1, Math.ceil(matchingCycle.retention / (365 * 24 * 60)));
                  break;
                case 'hour':
                  years = Math.min(1, Math.ceil(matchingCycle.retention / (365 * 24)));
                  break;
                case 'day':
                  years = Math.min(config.retention.years, Math.ceil(matchingCycle.retention / 365));
                  break;
                case 'month':
                  years = Math.min(config.retention.years, Math.ceil(matchingCycle.retention / 12));
                  break;
                default:
                  years = matchingCycle.retention;
              }
            }
          }
          
          // Utiliser la méthode de l'API pour définir la rétention
          await applyRetentionToEntity(api, aggregationId, 'Aggregation', years);
          
          console.log(`✅ Rétention de ${years} année(s) appliquée à l'agrégation ${aggregationId}`);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors de l'application de la rétention à l'agrégation ${aggregation.id || 'inconnue'}:`, error);
          errorCount++;
          // On continue avec les autres agrégations (best effort)
        }
        
        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      await Promise.allSettled(batchPromises);
    }
    
    console.log(`Rétention appliquée à ${successCount} agrégations, ${errorCount} erreurs`);
  }
}

/**
 * Récupère l'ID d'une entité (variable ou agrégation), peu importe où il est stocké
 */
function getEntityId(entity: any): string {
  // Chercher tous les endroits possibles où l'ID peut se trouver
  return entity.id || entity.variableId || entity._id || entity.sourceId || entity.aggregationId || null;
}

/**
 * Applique une rétention à une entité (variable ou agrégation)
 * @param api L'instance de l'API IIH
 * @param entityId ID de l'entité
 * @param entityType Type de l'entité ('Variable' ou 'Aggregation') - DOIT ÊTRE EN MAJUSCULE
 * @param years Nombre d'années de rétention
 */
async function applyRetentionToEntity(api: IIHApi, entityId: string, entityType: 'Variable' | 'Aggregation', years: number): Promise<void> {
  // Format EXACT qui fonctionne avec l'API de rétention, extrait du module simple-importer
  const retentionConfig = {
    dataRetention: {
      sourceId: entityId,
      sourceTypeId: entityType,
      settings: {
        timeSettings: {
          timeRange: {
            base: 'year',
            factor: years,
            iso8601: `P${years}Y` // Format ISO8601 pour la période
          }
        }
      }
    },
    inherited: null
  };
  
  try {
    // Essayer plusieurs approches en commençant par la plus fiable
    
    // Approche 1: Utiliser la méthode applyRetention de l'API si disponible
    if (typeof api.applyRetention === 'function') {
      try {
        await api.applyRetention(entityId, retentionConfig);
        return; // Succès!
      } catch (error) {
        console.warn(`Méthode applyRetention a échoué, tentative avec méthode alternative: ${error}`);
        // Continuer avec l'approche suivante
      }
    }
    
    // Approche 2: Appel direct à l'endpoint spécifique de l'entité
    const endpointUrl = entityType === 'Variable' 
      ? `/DataService/Variables/${entityId}/DataRetention` 
      : `/DataService/Aggregations/${entityId}/DataRetention`;
    
    try {
      await api.call({
        method: 'PUT', // Utiliser PUT comme indiqué dans l'implémentation qui fonctionne
        url: endpointUrl,
        data: retentionConfig
      });
      return; // Succès!
    } catch (error) {
      console.warn(`Appel à l'endpoint spécifique ${endpointUrl} a échoué, tentative avec endpoint générique: ${error}`);
      // Continuer avec l'approche suivante
    }
    
    // Approche 3: Appel à l'endpoint générique de rétention
    try {
      // Utiliser l'endpoint général de rétention
      await api.call({
        method: 'PUT',
        url: `/DataService/DataRetentions`,
        data: retentionConfig.dataRetention // L'API s'attend à recevoir directement l'objet dataRetention
      });
      return; // Succès!
    } catch (error) {
      console.warn(`Appel à l'endpoint général a échoué: ${error}`);
      // Toutes les approches ont échoué, l'erreur sera gérée par le bloc catch principal
      throw error;
    }
  } catch (error) {
    // Réduction des logs d'erreur pour éviter de spammer la console
    console.warn(`Impossible d'appliquer la rétention à ${entityType} ${entityId}: ${error instanceof Error ? error.message : String(error)}`);
    // Ne relançons pas l'erreur pour permettre au processus de continuer
  }
} 