import { CustomImportConfig } from './configSchema';
import { IIHApi } from '../simple-importer/api';
import { AuthConfig } from '../simple-importer/types';

/**
 * Construit les agrégations pour les variables selon la configuration
 * @param config Configuration d'import personnalisé
 * @param variables Liste des variables créées
 * @returns Liste des agrégations créées
 */
export async function buildAggregationsFromConfig(
  config: CustomImportConfig,
  variables: any[]
): Promise<any[]> {
  // Vérifier si la configuration d'agrégation existe, sinon utiliser des valeurs par défaut
  const aggregationConfig = config.aggregation || {
    defaultMethod: 'average',
    cycles: [
      { interval: 'hour', value: 1, retention: 24 },
      { interval: 'day', value: 1, retention: 30 }
    ]
  };

  console.log('Création des agrégations selon la configuration:', {
    defaultMethod: aggregationConfig.defaultMethod,
    cycles: aggregationConfig.cycles?.length
  });

  if (!variables || variables.length === 0) {
    console.warn('Aucune variable disponible pour créer des agrégations');
    return [];
  }

  // Log des variables reçues pour déboguer
  console.log(`Reçu ${variables.length} variables pour créer des agrégations:`, variables.map(v => ({
    name: v.variableName,
    id: v.variableId, // API returns variableId
    dataType: v.dataType
  })));

  if (!aggregationConfig.cycles || aggregationConfig.cycles.length === 0) {
    console.warn('Aucun cycle d\'agrégation défini dans la configuration');
    return [];
  }

  // 1. Récupérer la configuration d'authentification
  const authConfigString = localStorage.getItem('authConfig');
  if (!authConfigString) {
    throw new Error('Configuration d\'authentification non trouvée');
  }
  
  const authConfig: AuthConfig = JSON.parse(authConfigString);
  const api = new IIHApi(authConfig);

  // 2. Filtrer les variables pour ne garder que celles qui peuvent être agrégées
  const aggregatableVariables = variables.filter(variable => {
    // Les variables de type numérique peuvent être agrégées
    const isAggregatable = ['Float', 'Double', 'Int32', 'Integer', 'float', 'double', 'int32', 'integer', 'number'].includes(variable.dataType);
    
    // Si non agrégeable, logguer pour déboguer
    if (!isAggregatable) {
      console.log(`Variable ${variable.variableName} de type ${variable.dataType} non agrégeable`);
    }
    
    return isAggregatable;
  });

  if (aggregatableVariables.length === 0) {
    console.warn('Aucune variable de type numérique pour l\'agrégation');
    return [];
  }

  console.log(`Configuration d'agrégation pour ${aggregatableVariables.length} variables numériques`);
  
  // 3. Créer les agrégations pour chaque variable en lots
  const allAggregations: any[] = [];
  const batchSize = 10; // Traitement par lots de 10 variables maximum
  
  for (let i = 0; i < aggregatableVariables.length; i += batchSize) {
    const batch = aggregatableVariables.slice(i, i + batchSize);
    console.log(`Traitement du lot d'agrégation ${Math.floor(i / batchSize) + 1} / ${Math.ceil(aggregatableVariables.length / batchSize)} (${batch.length} variables)`);
    
    const batchPromises = batch.map(async (variable) => {
      try {
        // Déterminer la méthode d'agrégation appropriée
        const aggregationType = determineAggregationType(variable.dataType, aggregationConfig.defaultMethod);
        
        // Récupérer l'ID de la variable - API peut retourner soit variableId, soit _id
        const variableId = getVariableId(variable);
        
        if (!variableId) {
          console.error(`Impossible de déterminer l'ID pour la variable ${variable.variableName || 'inconnue'}:`, variable);
          return [];
        }
        
        console.log(`Création d'agrégations pour variable ${variable.variableName} (ID: ${variableId})`);
        
        // Vérifier d'abord si la variable a déjà des agrégations
        let existingAggregations: any[] = [];
        try {
          existingAggregations = await api.getAggregationsForVariable(variableId);
          console.log(`${existingAggregations.length} agrégations existantes trouvées pour ${variable.variableName}`);
        } catch (error) {
          console.warn(`Impossible de récupérer les agrégations existantes pour ${variable.variableName}:`, error);
          // Continuer quand même, on considère qu'il n'y a pas d'agrégations existantes
        }
        
        // Créer un ensemble des cycles existants pour faciliter la recherche
        const existingCycles = new Set<string>();
        existingAggregations.forEach((agg) => {
          if (agg.cycle && agg.cycle.base && agg.cycle.factor) {
            existingCycles.add(`${agg.cycle.base}_${agg.cycle.factor}`);
          }
        });
        
        // Pour chaque cycle d'agrégation configuré
        const variableAggregations: any[] = [];
        
        for (const cycle of aggregationConfig.cycles || []) {
          try {
            // Vérifier que le cycle a des valeurs valides
            if (!cycle.interval) {
              console.warn(`Cycle d'agrégation sans intervalle défini, utilisation de la valeur par défaut 'hour'`);
              cycle.interval = 'hour';
            }
            
            // Récupérer ou fournir des valeurs par défaut
            const intervalBase = cycle.interval;
            const intervalFactor = cycle.value || 1;
            
            // Vérifier si cette agrégation existe déjà
            const cycleKey = `${intervalBase}_${intervalFactor}`;
            if (existingCycles.has(cycleKey)) {
              console.log(`Agrégation ${intervalBase}/${intervalFactor} existe déjà pour ${variable.variableName}, ignorée`);
              continue;
            }
            
            console.log(`Création d'agrégation ${intervalBase}/${intervalFactor} pour ${variable.variableName} avec méthode ${aggregationType}`);
            
            // Préparer les données d'agrégation selon le format attendu par l'API
            const aggregationData = {
              aggregation: aggregationType,
              sourceId: variableId,
              cycle: {
                base: intervalBase,
                factor: intervalFactor
              },
              provideAsVariable: true,  // C'est important pour que l'agrégation soit visible comme variable
              publishMqtt: false        // Par défaut, ne pas publier sur MQTT
            };
            
            // Vérifier les données avant de procéder
            validateAggregationData(aggregationData);
            
            // Créer l'agrégation - essayer d'abord la méthode standard
            let aggregation;
            try {
              aggregation = await api.createAggregation(aggregationData);
            } catch (firstError) {
              // Si la méthode standard échoue, essayer la méthode personnalisée
              console.warn(`Méthode standard a échoué, tentative avec méthode personnalisée: ${firstError}`);
              try {
                if (typeof api.createCustomAggregation === 'function') {
                  aggregation = await api.createCustomAggregation(aggregationData);
                } else {
                  // Si la méthode personnalisée n'existe pas, relancer l'erreur originale
                  throw firstError;
                }
              } catch (secondError) {
                console.error(`Les deux méthodes de création ont échoué:`, secondError);
                throw new Error(`Impossible de créer l'agrégation ${intervalBase}/${intervalFactor}: ${secondError}`);
              }
            }
            
            if (aggregation && aggregation.id) {
              console.log(`✅ Agrégation ${intervalBase}/${intervalFactor} créée pour ${variable.variableName} (ID: ${aggregation.id})`);
              variableAggregations.push(aggregation);
              
              // Ajouter cette agrégation à la liste des cycles existants pour éviter les doublons
              existingCycles.add(cycleKey);
            } else {
              console.warn(`⚠️ Retour étrange pour l'agrégation ${intervalBase}/${intervalFactor} de ${variable.variableName}:`, aggregation);
            }
          } catch (cycleError) {
            console.error(`❌ Erreur lors de la création de l'agrégation ${cycle.interval} pour ${variable.variableName}:`, cycleError);
            // Continuer avec le cycle suivant (best effort)
          }
          
          // Petite pause pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return variableAggregations;
      } catch (error) {
        console.error(`❌ Erreur lors de la création des agrégations pour ${variable.variableName}:`, error);
        return []; // Retourner un tableau vide en cas d'erreur (best effort)
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Collecter les résultats réussis
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        allAggregations.push(...result.value);
      }
    }
  }
  
  console.log(`✅ Total de ${allAggregations.length} agrégations créées`);
  return allAggregations;
}

/**
 * Récupère l'ID d'une variable, peu importe où il est stocké
 */
function getVariableId(variable: any): string {
  // Chercher tous les endroits possibles où l'ID peut se trouver
  return variable.variableId || variable.id || variable._id || variable.sourceId || null;
}

/**
 * Détermine le type d'agrégation en fonction du type de données
 */
function determineAggregationType(dataType: string, defaultMethod: string = 'average'): string {
  const type = (dataType || '').toLowerCase();
  
  // Pour les types numériques, on peut utiliser différentes méthodes
  if (['float', 'double', 'int32', 'integer', 'number'].includes(type)) {
    // Utiliser la méthode par défaut ou 'average' si non spécifiée
    return defaultMethod || 'average';
  }
  
  // Pour les types booléens, on utilise souvent 'last'
  if (type === 'boolean') {
    return 'last';
  }
  
  // Pour les types string, on utilise généralement 'last'
  if (type === 'string') {
    return 'last';
  }
  
  // Par défaut, utiliser 'average'
  return defaultMethod || 'average';
}

/**
 * Valide les données d'agrégation avant création
 */
function validateAggregationData(data: any): void {
  if (!data) {
    throw new Error("Données d'agrégation manquantes");
  }
  
  if (!data.sourceId) {
    throw new Error("L'ID source (sourceId) est requis pour créer une agrégation");
  }
  
  if (!data.cycle || !data.cycle.base || data.cycle.factor === undefined) {
    throw new Error("Cycle d'agrégation incomplet");
  }
  
  // Valider que le facteur est un nombre positif
  if (typeof data.cycle.factor !== 'number' || data.cycle.factor <= 0) {
    throw new Error(`Le facteur de cycle doit être un nombre positif, reçu: ${data.cycle.factor}`);
  }
  
  // Valider la base du cycle
  const validBases = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  if (!validBases.includes(data.cycle.base)) {
    throw new Error(`Base de cycle invalide: ${data.cycle.base}. Doit être l'une des suivantes: ${validBases.join(', ')}`);
  }
} 