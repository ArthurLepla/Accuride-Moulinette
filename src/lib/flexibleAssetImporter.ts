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

// Nouvelle interface pour le cache des connexions
interface ConnectionCache {
  connections: any[];
  connectionMap: Map<string, any>;
  tagMap: Map<string, Map<string, any>>;
  loaded: boolean;
}

// Cache global pour les connexions et tags
const connectionCache: ConnectionCache = {
  connections: [],
  connectionMap: new Map(),
  tagMap: new Map(),
  loaded: false
};

// Cache pour les assets déjà vérifiés
const assetExistenceCache = new Map<string, any>();

// Cache pour les variables déjà vérifiées
const variableExistenceCache = new Map<string, any>();

// Statistiques d'importation pour le suivi global
const importStats = {
  totalAssets: 0,
  successfulVariables: 0,
  failedVariables: 0,
  retriedVariables: 0,
  pendingAggregations: 0,
  errors: new Map<string, number>() // Type d'erreur -> nombre d'occurrences
};

// Contrôle de débit pour les requêtes API
const requestQueue = new Map<string, Promise<any>>();
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3; // Limite de requêtes simultanées

async function executeWithRateLimit(key: string, operation: () => Promise<any>): Promise<any> {
  // Si opération déjà en cours avec cette clé, attendre le résultat
  if (requestQueue.has(key)) {
    return requestQueue.get(key);
  }
  
  // Attendre si trop de requêtes actives
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Exécuter l'opération
  activeRequests++;
  
  const operationPromise = operation()
    .catch(error => {
      // Si erreur de verrouillage de base, retenter avec backoff exponentiel
      if (typeof error === 'string' && error.includes("database is locked") || 
          error?.toString?.().includes("database is locked")) {
        console.log(`⏱️ Base de données verrouillée, nouvelle tentative dans 500ms pour ${key}`);
        return new Promise(resolve => setTimeout(resolve, 500))
          .then(() => executeWithRateLimit(key, operation));
      }
      throw error;
    })
    .finally(() => {
      // Libérer les ressources
      activeRequests--;
      requestQueue.delete(key);
    });
  
  // Mémoriser l'opération en cours
  requestQueue.set(key, operationPromise);
  
  return operationPromise;
}

// Fonction pour nettoyer les noms d'assets
function sanitizeAssetName(name: string | undefined): string {
  if (!name) {
    throw new Error('Le nom de l\'asset ne peut pas être vide ou undefined');
  }
  
  return name
    .trim()
    .replace(/[']/g, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u017F\s_-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

// Déclaration préalable de toutes les fonctions
function logDebug(message: string, data?: any): void {
  // On peut activer/désactiver les logs de debug en modifiant cette condition
  const DEBUG = false;
  if (DEBUG) {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

// Améliorer la fonction de recherche de connexion pour les assets
function findConnectionForAsset(asset: any): any {
  let connection = null;
  
  // Garder trace de toutes les connexions potentielles pour faciliter le débogage
  const potentialMatches: any[] = [];
  
  // 1. Rechercher avec le nom exact de l'asset
  connection = connectionCache.connectionMap.get(asset.name);
  if (connection) {
    console.log(`✅ Connexion exacte trouvée: ${connection.connectionName} pour l'asset: ${asset.name}`);
    return connection;
  }
  
  // 2. Si pas trouvé, essayer des stratégies plus souples
  
  // Essayer de trouver une connexion dont le nom est contenu dans le nom de l'asset
  Array.from(connectionCache.connectionMap.entries()).forEach(([connName, conn]) => {
    if (asset.name.includes(connName)) {
      potentialMatches.push({ name: connName, connection: conn, type: 'inclusion' });
    }
  });
  
  // Essayer l'inverse: un asset dont le nom est contenu dans la connexion
  Array.from(connectionCache.connectionMap.entries()).forEach(([connName, conn]) => {
    if (connName.includes(asset.name)) {
      potentialMatches.push({ name: connName, connection: conn, type: 'inclusion inverse' });
    }
  });
  
  // Sélectionner la meilleure correspondance si plusieurs trouvées
  if (potentialMatches.length > 0) {
    // Trier par longueur pour favoriser les correspondances les plus longues
    potentialMatches.sort((a, b) => b.name.length - a.name.length);
    
    // Utiliser la première (meilleure) correspondance
    connection = potentialMatches[0].connection;
    console.log(`📍 Connexion trouvée par ${potentialMatches[0].type}: ${potentialMatches[0].name} pour l'asset: ${asset.name}`);
    
    // Log des autres correspondances potentielles
    if (potentialMatches.length > 1) {
      console.log(`ℹ️ Autres correspondances possibles pour ${asset.name}: ${potentialMatches.slice(1).map(m => m.name).join(', ')}`);
    }
  }
  
  // Fallback: Si aucune connexion n'est trouvée mais qu'il existe au moins une connexion, utiliser la première
  if (!connection && connectionCache.connections.length > 0) {
    // Sélectionner une connexion par défaut (première disponible)
    connection = connectionCache.connections[0];
    console.log(`⚠️ Aucune connexion spécifique trouvée pour l'asset: ${asset.name}. Utilisation de la connexion par défaut: ${connection.connectionName}`);
  }
  
  return connection;
}

// Nouvelle fonction pour pré-charger toutes les connexions et tags
async function preloadConnectionsAndTags() {
  // Si déjà chargé, retourner
  if (connectionCache.loaded) {
    return;
  }

  console.log('🔄 Pré-chargement des connexions et tags...');
  
  try {
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`/api/adapters/79894682fe424b409d954bd6cf0fda6b/connections`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Config': JSON.stringify(authConfig)
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des connexions: ${await response.text()}`);
    }

    const data = await response.json();
    connectionCache.connections = data.connections || [];
    
    // Organiser les connexions et tags dans des maps pour accès rapide
    for (const connection of connectionCache.connections) {
      connectionCache.connectionMap.set(connection.connectionName, connection);
      
      // Créer une map pour les tags de cette connexion
      const tagMapForConnection = new Map();
      for (const tag of connection.tags) {
        tagMapForConnection.set(tag.name, tag);
      }
      connectionCache.tagMap.set(connection.connectionName, tagMapForConnection);
    }
    
    connectionCache.loaded = true;
    console.log(`✅ ${connectionCache.connections.length} connexions chargées avec leurs tags`);
  } catch (error) {
    console.error('❌ Erreur lors du pré-chargement des connexions:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Résoudre les erreurs de référence non trouvées en déclarant correctement les fonctions
async function getExistingAsset(name: string, parentId: string) {
  // Vérifier si on a déjà cherché cet asset
  const cacheKey = `${parentId}:${name}`;
  if (assetExistenceCache.has(cacheKey)) {
    return assetExistenceCache.get(cacheKey);
  }

  try {
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
      console.warn(`⚠️ Erreur recherche assets sous ${parentId}`);
      assetExistenceCache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();
    if (!data.children) {
      assetExistenceCache.set(cacheKey, null);
      return null;
    }

    const sanitizedName = sanitizeAssetName(name);
    const existingAsset = data.children.find((child: any) => 
      sanitizeAssetName(child.name) === sanitizedName
    );
    
    // Mettre en cache le résultat (même si null)
    assetExistenceCache.set(cacheKey, existingAsset || null);
    return existingAsset || null;
  } catch (error) {
    console.error('❌ Erreur recherche asset:', error instanceof Error ? error.message : error);
    assetExistenceCache.set(cacheKey, null);
    return null;
  }
}

// Système de gestion des tentatives pour les variables échouées
const failedVariableAttempts = new Map<string, { retryCount: number, nextRetry: number, error: any }>();

// Améliorer la fonction getExistingVariable pour gérer correctement les réponses invalides
async function getExistingVariable(assetId: string, variableName: string) {
  // Vérifier si on a déjà cherché cette variable
  const cacheKey = `${assetId}:${variableName.toLowerCase()}`;
  if (variableExistenceCache.has(cacheKey)) {
    return variableExistenceCache.get(cacheKey);
  }

  try {
    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    const response = await executeWithRateLimit(
      `getVariable:${cacheKey}`, 
      () => fetch(`/api/variables/${assetId}`, {
        headers: {
          'X-Auth-Config': JSON.stringify(authConfig)
        }
      })
    );

    if (!response.ok) {
      console.warn(`⚠️ API a retourné ${response.status} pour la recherche de variables sur l'asset ${assetId}`);
      variableExistenceCache.set(cacheKey, null);
      return null;
    }

    const variables = await response.json();
    
    // Validation explicite de la structure de la réponse
    if (!Array.isArray(variables)) {
      console.error(`⚠️ Réponse API invalide pour les variables de l'asset ${assetId}. Attendu: Array, Reçu:`, 
        typeof variables, variables);
      variableExistenceCache.set(cacheKey, null);
      return null;
    }
    
    const existingVariable = variables.find((variable: any) => 
      variable.variableName.toLowerCase() === variableName.toLowerCase()
    );
    
    // Mettre en cache le résultat (même si null)
    variableExistenceCache.set(cacheKey, existingVariable || null);
    return existingVariable || null;
  } catch (error) {
    console.error(`❌ Erreur recherche variable ${variableName} pour asset ${assetId}:`, 
      error instanceof Error ? error.message : error);
    
    // Mise en cache conditionnelle en cas d'erreur
    variableExistenceCache.set(cacheKey, null);
    
    // Mise à jour des statistiques d'erreur
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    importStats.errors.set(errorType, (importStats.errors.get(errorType) || 0) + 1);
    
    return null;
  }
}

async function createOrGetAsset(params: CreateAssetParams) {
  const sanitizedName = sanitizeAssetName(params.name);
  
  const existingAsset = await getExistingAsset(sanitizedName, params.parentId);
  if (existingAsset) {
    return existingAsset;
  }

  console.log(`📍 Création asset: ${sanitizedName}`);
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
    throw new Error(`Erreur création asset: ${errorText}`);
  }

  const newAsset = await response.json();
  return newAsset;
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

// Optimisation du processus de création d'agrégations en lots
// Créer un système de file d'attente pour les agrégations
interface AggregationRequest {
  variableId: string;
  variableName: string;
  aggregationType: string;
  base: string;
  factor: number;
}

// File d'attente pour les agrégations
const aggregationQueue: AggregationRequest[] = [];
const BATCH_SIZE = 10; // Nombre d'agrégations à traiter en une fois

// Fonction pour traiter la file d'attente des agrégations
async function processAggregationQueue() {
  if (aggregationQueue.length === 0) {
    return;
  }

  console.log(`🔄 Traitement par lot de ${Math.min(BATCH_SIZE, aggregationQueue.length)} agrégations...`);
  
  // Prendre les N premières demandes de la file
  const batch = aggregationQueue.splice(0, BATCH_SIZE);
  
  // Traiter les demandes en parallèle
  await Promise.all(batch.map(async (request) => {
    try {
      await createAggregation(
        request.variableId,
        request.aggregationType,
        request.base,
        request.factor
      );
    } catch (error) {
      console.error(`❌ Erreur création agrégation pour ${request.variableName}:`, error instanceof Error ? error.message : error);
    }
  }));
  
  // Traiter le reste de la file si nécessaire
  if (aggregationQueue.length > 0) {
    await processAggregationQueue();
  }
}

// Fonction optimisée pour ajouter des agrégations à la file d'attente
async function createAggregationsOptimized(variableId: string, variableName: string) {
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

  // Ajouter les demandes d'agrégation à la file d'attente
  for (const interval of timeIntervals) {
    aggregationQueue.push({
      variableId,
      variableName,
      aggregationType: interval.type,
      base: interval.base,
      factor: interval.factor
    });
  }
  
  // Si la file d'attente atteint une certaine taille, la traiter immédiatement
  if (aggregationQueue.length >= BATCH_SIZE) {
    await processAggregationQueue();
  }
  
  // Retourner un objet simulé avec les agrégations prévues
  // (les vraies agrégations seront créées de manière asynchrone)
  const simulatedAggregations: { [key: string]: any } = {};
  for (const interval of timeIntervals) {
    simulatedAggregations[interval.name] = {
      id: `pending_${variableId}_${interval.name}`,
      type: interval.type,
      cycle: {
        base: interval.base,
        factor: interval.factor
      }
    };
  }

  return simulatedAggregations;
}

// Modifier la fonction createAggregations pour utiliser la version optimisée
async function createAggregations(variableId: string, variableName: string) {
  // Utiliser la version optimisée avec file d'attente
  return createAggregationsOptimized(variableId, variableName);
}

// Fonction pour récupérer les détails d'un asset
async function getAssetDetails(assetId: string) {
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`/api/assets/${assetId}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des détails de l'asset: ${await response.text()}`);
  }

  return await response.json();
}

// Améliorer la fonction createOrGetTagVariable pour gérer les différents types d'IPE
async function createOrGetTagVariable(assetId: string, name: string, tagName: string, dataType: string = 'FLOAT32', unit: string | null = null, description?: string, createAggs: boolean = false) {
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  
  try {
    // Vérifier si la variable existe déjà (utilise déjà le cache via getExistingVariable)
    const existingVariable = await getExistingVariable(assetId, name);
    if (existingVariable) {
      logDebug(`Variable existante trouvée: ${name}`);
      return {
        ...existingVariable,
        aggregations: createAggs ? await createAggregations(existingVariable.variableId, name) : undefined
      };
    }

    // S'assurer que les connexions sont préchargées
    if (!connectionCache.loaded) {
      await preloadConnectionsAndTags();
    }

    // Récupérer les informations de l'asset pour le nom de la connection
    const asset = await executeWithRateLimit(
      `getAssetDetails:${assetId}`,
      () => getAssetDetails(assetId)
    );
    
    logDebug('Asset trouvé pour la variable', asset);

    const authConfig = getAuthConfig();
    if (!authConfig) {
      throw new Error('Non authentifié');
    }

    // Utiliser la fonction helper pour trouver la connexion
    const connection = findConnectionForAsset(asset);
    
    if (!connection) {
      console.error(`⚠️ Connexion non trouvée pour l'asset: ${asset.name}. Connexions disponibles:`, 
        Array.from(connectionCache.connectionMap.keys()).join(', '));
      
      // Lorsqu'aucune connexion n'est trouvée, vérifier si nous avons au moins une connexion disponible
      if (connectionCache.connections.length > 0) {
        console.log(`🔄 Utilisation de la première connexion disponible: ${connectionCache.connections[0].connectionName} pour l'asset: ${asset.name}`);
        // Utiliser la première connexion disponible comme fallback
        const fallbackConnection = connectionCache.connections[0];
        
        // Continuer avec cette connexion
        const tagsForConnection = connectionCache.tagMap.get(fallbackConnection.connectionName);
        let tag = tagsForConnection?.get(tagName);
        
        // Si le tag exact n'existe pas, on essaie des alternatives
        if (!tag) {
          if (tagsForConnection && tagsForConnection.size > 0) {
            // Utiliser le premier tag disponible qui correspond au type demandé
            let candidateTag = null;
            
            // Recherche d'un tag similaire
            if (tagName.includes('prod')) {
              // Convertir l'itérateur en tableau pour éviter les problèmes de compilation
              const tagEntries = Array.from(tagsForConnection.entries());
              for (const [tagKey, tagValue] of tagEntries) {
                if (tagKey.includes('prod')) {
                  candidateTag = tagValue;
                  console.log(`🔄 Tag alternatif 'prod' trouvé: ${tagKey} pour la connexion ${fallbackConnection.connectionName}`);
                  break;
                }
              }
            } else if (tagName.includes('IPE')) {
              // Convertir l'itérateur en tableau pour éviter les problèmes de compilation
              const tagEntries = Array.from(tagsForConnection.entries());
              for (const [tagKey, tagValue] of tagEntries) {
                if (tagKey.includes('IPE')) {
                  candidateTag = tagValue;
                  console.log(`🔄 Tag alternatif 'IPE' trouvé: ${tagKey} pour la connexion ${fallbackConnection.connectionName}`);
                  break;
                }
              }
            } else if (tagName.includes('conso')) {
              // Convertir l'itérateur en tableau pour éviter les problèmes de compilation
              const tagEntries = Array.from(tagsForConnection.entries());
              for (const [tagKey, tagValue] of tagEntries) {
                if (tagKey.includes('conso')) {
                  candidateTag = tagValue;
                  console.log(`🔄 Tag alternatif 'conso' trouvé: ${tagKey} pour la connexion ${fallbackConnection.connectionName}`);
                  break;
                }
              }
            }
            
            if (candidateTag) {
              tag = candidateTag;
            } else {
              // Si aucun tag similaire, prendre le premier tag disponible
              const firstTag = Array.from(tagsForConnection.values())[0];
              console.log(`⚠️ Aucun tag similaire à ${tagName} trouvé. Utilisation du premier tag disponible: ${firstTag.name}`);
              tag = firstTag;
            }
          }
        }
        
        if (tag) {
          // Construire l'objet de variable avec le tag fallback
          return createVariableWithTag(assetId, name, fallbackConnection, tag, dataType, unit, description, createAggs);
        }
      }
      
      // Si nous arrivons ici, c'est qu'aucun fallback n'a fonctionné
      return null;
    }

    // Récupérer la map des tags pour cette connexion
    const tagsForConnection = connectionCache.tagMap.get(connection.connectionName);
    
    // Stratégies de recherche de tag (en utilisant le cache)
    let tag = null;
    
    // 1. Rechercher le tag exact
    tag = tagsForConnection?.get(tagName);
    
    // 2. Si pas trouvé et que c'est un tag de production ou IPE, essayer les variantes
    if (!tag) {
      // Créer des tableaux pour stocker toutes les variantes trouvées
      let foundTags: { name: string, tag: any }[] = [];
      
      if (tagName === 'prod' || tagName === 'prod_quantite') {
        const alternativeNames = ['prod', 'prod_quantite', 'prod_kg'];
        for (const altName of alternativeNames) {
          const altTag = tagsForConnection?.get(altName);
          if (altTag) {
            foundTags.push({ name: altName, tag: altTag });
          }
        }
      } else if (tagName === 'prod_kg') {
        const alternativeNames = ['prod_kg', 'prod', 'prod_quantite'];
        for (const altName of alternativeNames) {
          const altTag = tagsForConnection?.get(altName);
          if (altTag) {
            foundTags.push({ name: altName, tag: altTag });
          }
        }
      } else if (tagName === 'IPE' || tagName === 'IPE_quantite') {
        const alternativeNames = ['IPE', 'IPE_quantite', 'IPE_kg'];
        for (const altName of alternativeNames) {
          const altTag = tagsForConnection?.get(altName);
          if (altTag) {
            foundTags.push({ name: altName, tag: altTag });
          }
        }
      } else if (tagName === 'IPE_kg') {
        const alternativeNames = ['IPE_kg', 'IPE', 'IPE_quantite'];
        for (const altName of alternativeNames) {
          const altTag = tagsForConnection?.get(altName);
          if (altTag) {
            foundTags.push({ name: altName, tag: altTag });
          }
        }
      } else if (tagName === 'conso') {
        // Pour la consommation, chercher exactement 'conso'
        const altTag = tagsForConnection?.get('conso');
        if (altTag) {
          foundTags.push({ name: 'conso', tag: altTag });
        }
      } else if (tagName === 'etat') {
        // Pour l'état capteur, chercher exactement 'etat'
        const altTag = tagsForConnection?.get('etat');
        if (altTag) {
          foundTags.push({ name: 'etat', tag: altTag });
        }
      }
      
      // Maintenant, choisir le tag le plus approprié en fonction de la variante demandée
      if (foundTags.length > 0) {
        // Utiliser le premier tag trouvé
        tag = foundTags[0].tag;
        console.log(`🔍 Tag alternatif trouvé: ${foundTags[0].name} au lieu de ${tagName} pour la connexion ${connection.connectionName}`);
        
        // Si plusieurs tags trouvés, on log les alternatives pour debugging
        if (foundTags.length > 1) {
          console.log(`💡 Autres tags possibles pour ${tagName}: ${foundTags.slice(1).map(t => t.name).join(', ')}`);
        }
      }
    }
    
    if (!tag) {
      // Afficher les tags disponibles pour faciliter le débogage
      const availableTags = Array.from(tagsForConnection?.keys() || []).join(', ');
      console.error(`⚠️ Tag ${tagName} non trouvé pour la connexion ${connection.connectionName}. Tags disponibles: ${availableTags}`);
      
      // Tenter de trouver un tag de secours
      if (tagsForConnection && tagsForConnection.size > 0) {
        // Utiliser le premier tag disponible comme dernier recours
        const fallbackTag = Array.from(tagsForConnection.values())[0];
        console.log(`⚠️ Utilisation du tag de secours: ${fallbackTag.name} pour ${name}`);
        tag = fallbackTag;
      } else {
        // Vraiment aucun tag disponible
        return null;
      }
    }

    return createVariableWithTag(assetId, name, connection, tag, dataType, unit, description, createAggs);
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la variable ${name} pour l'asset ${assetId}:`, 
      error instanceof Error ? error.message : error);
    
    // Mise à jour des statistiques d'erreur
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    importStats.errors.set(errorType, (importStats.errors.get(errorType) || 0) + 1);
    
    return null;
  }
}

// Nouvelle fonction pour extraire la logique de création de variable avec un tag
async function createVariableWithTag(
  assetId: string, 
  name: string, 
  connection: any, 
  tag: any, 
  dataType: string, 
  unit: string | null, 
  description?: string, 
  createAggs: boolean = false
) {
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }
  
  // Construire l'objet de variable pour l'API
  const body = {
    variableName: name,
    assetId,
    dataType,
    description: description || `Variable ${name} créée automatiquement`,
    unit,
    store: true,
    adapterId: '79894682fe424b409d954bd6cf0fda6b',
    topic: tag.topic,
    connected: false,
    sourceType: 'Tag',
    tag: {
      adapterId: '79894682fe424b409d954bd6cf0fda6b',
      connectionName: connection.connectionName,
      tagName: tag.name, // Utiliser le nom du tag trouvé, qui peut être différent de celui demandé
      dataType: tag.dataType || dataType,
      topic: tag.topic,
      connected: false
    },
    retention: {
      settings: {
        timeSettings: {
          timeRange: {
            base: "year",
            factor: 6
          }
        }
      }
    }
  };

  logDebug(`Création de la variable`, body);

  // Utiliser le contrôle de débit pour la création de la variable
  const createResponse = await executeWithRateLimit(
    `createVariable:${assetId}:${name}`,
    () => fetch('/api/variables', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Config': JSON.stringify(authConfig)
      },
      body: JSON.stringify(body)
    })
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Erreur lors de la création de la variable: ${errorText}`);
  }

  const newVariable = await createResponse.json();
  console.log(`✅ Variable créée: ${name} pour l'asset: ${connection.connectionName} (tag: ${tag.name})`);

  // Mettre en cache la nouvelle variable
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  variableExistenceCache.set(cacheKey, newVariable);

  // Créer les agrégations si demandé
  if (createAggs) {
    // Utiliser le contrôle de débit pour les agrégations aussi
    const aggregations = await executeWithRateLimit(
      `createAggregations:${newVariable.variableId}`,
      () => createAggregations(newVariable.variableId, name)
    );
    
    return {
      ...newVariable,
      aggregations
    };
  }

  return newVariable;
}

// Modification de createOrGetVariable pour inclure le mécanisme de reprise
async function createOrGetVariable(assetId: string, name: string, dataType: string = 'DOUBLE', unit: string | null = null, description?: string, createAggs: boolean = false) {
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  
  // Vérifier si on a déjà trop tenté pour cette variable
  if (failedVariableAttempts.has(cacheKey)) {
    const attempt = failedVariableAttempts.get(cacheKey)!;
    if (attempt.retryCount >= 3) {
      console.error(`🛑 Abandon de la création après 3 échecs: ${name} (dernier échec: ${attempt.error})`);
      importStats.failedVariables++;
      return null;
    }
    
    // Attendre le délai de backoff
    if (Date.now() < attempt.nextRetry) {
      const waitTime = attempt.nextRetry - Date.now();
      console.log(`⏱️ Attente de ${waitTime}ms avant nouvelle tentative pour ${name}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Incrémenter le compteur de variables réessayées
    importStats.retriedVariables++;
    console.log(`🔄 Tentative #${attempt.retryCount + 1} pour ${name}`);
  }
  
  try {
    // Vérifier si la variable existe déjà
    const existingVariable = await getExistingVariable(assetId, name);
    if (existingVariable) {
      return {
        ...existingVariable,
        aggregations: createAggs ? await createAggregations(existingVariable.variableId, name) : undefined
      };
    }

    // Déterminer le type de tag en fonction du nom de la variable
    let tagName = '';
    let tagVariant = ''; // Indique une préférence de variante (quantite vs kg)
    
    if (name.startsWith('Consommation_')) {
      tagName = 'conso';
    } else if (name.startsWith('Production_')) {
      // Détecter si on veut prod_quantite ou prod_kg en fonction du libellé
      if (name.toLowerCase().includes('kg') || name.toLowerCase().includes('kilo')) {
        tagName = 'prod_kg';
        tagVariant = 'kg';
      } else {
        tagName = 'prod_quantite';
        tagVariant = 'quantite';
      }
    } else if (name.startsWith('IPE_')) {
      // Détecter si on veut IPE_quantite ou IPE_kg
      if (name.toLowerCase().includes('kg') || name.toLowerCase().includes('kilo')) {
        tagName = 'IPE_kg';
        tagVariant = 'kg';
      } else {
        tagName = 'IPE_quantite';
        tagVariant = 'quantite';
      }
    } else if (name.startsWith('EtatCapteur_')) {
      tagName = 'etat';
    }

    console.log(`🔍 Variable ${name} - Tag sélectionné: ${tagName} (variante: ${tagVariant || 'standard'})`);

    // Utiliser createOrGetTagVariable pour créer la variable
    const result = await executeWithRateLimit(
      `createVariable:${cacheKey}`,
      () => createOrGetTagVariable(assetId, name, tagName, dataType, unit, description, createAggs)
    );
    
    if (result) {
      // Succès - supprimer toute trace d'échec précédent
      failedVariableAttempts.delete(cacheKey);
      importStats.successfulVariables++;
    }
    
    return result;
  } catch (error) {
    // Gérer l'échec avec backoff exponentiel
    const attempt = failedVariableAttempts.get(cacheKey) || { retryCount: 0, nextRetry: 0, error: null };
    attempt.retryCount++;
    attempt.error = error;
    
    // Calculer le délai de backoff (500ms, 2s, 8s)
    const backoffTime = Math.pow(4, attempt.retryCount) * 125;
    attempt.nextRetry = Date.now() + backoffTime;
    
    failedVariableAttempts.set(cacheKey, attempt);
    console.warn(`⚠️ Échec de création pour ${name}, nouvelle tentative #${attempt.retryCount} dans ${backoffTime}ms`);
    
    // Si moins de 3 échecs, on réessaye immédiatement
    if (attempt.retryCount < 3) {
      console.log(`🔁 Réessai immédiat pour ${name} (tentative #${attempt.retryCount})`);
      return createOrGetVariable(assetId, name, dataType, unit, description, createAggs);
    }
    
    return null;
  }
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

export async function importFlexibleAssetsToIIH(data: FlexibleProcessedData) {
  // Pré-charger les connexions et tags
  await preloadConnectionsAndTags();

  const { hierarchyData } = data;
  const createdAssets = new Map<string, any>();
  // Stocker les références aux nœuds pour la deuxième passe
  const nodeMap = new Map<string, { node: HierarchyNode, asset: any, level: number, isOneBeforeLastLevel: boolean }>();

  // Récupérer l'asset racine
  const rootAsset = await getRootAsset();
  console.log('Import vers IIH démarré...');

  // Déterminer le nombre total de niveaux dans la hiérarchie
  const totalLevels = hierarchyData.levels.length;
  console.log(`Hiérarchie avec ${totalLevels} niveaux détectée.`);

  // PREMIÈRE PASSE: Créer tous les assets et leurs variables de base
  // Fonction récursive pour créer les assets
  async function createAssetsRecursively(node: HierarchyNode, parentId: string) {
    try {
      // Créer l'asset actuel
      const asset = await createOrGetAsset({
        name: node.name,
        parentId,
        type: 'asset',
        metadata: {
          level: node.levelName
        }
      });

      if (!asset) {
        console.error(`❌ Échec de création de l'asset: ${node.name}`);
        return null;
      }

      createdAssets.set(node.id, asset);
      importStats.totalAssets++;

      // Identifier le niveau de l'asset dans la hiérarchie
      const currentLevelIndex = hierarchyData.levels.findIndex(level => level.level === node.level);
      
      // Calculer la position exacte dans la hiérarchie (1-indexed)
      const levelPosition = currentLevelIndex + 1;
      
      // Déterminer les types de niveaux
      const isFirstLevel = levelPosition === 1;
      const isLastLevel = levelPosition === totalLevels;
      const isOneBeforeLastLevel = levelPosition === totalLevels - 1;
      const isIntermediateLevel = !isFirstLevel && !isLastLevel && !isOneBeforeLastLevel;
      
      console.log(`Asset: ${node.name} - Niveau ${levelPosition}/${totalLevels} (${isFirstLevel ? 'Premier' : isLastLevel ? 'Dernier' : isOneBeforeLastLevel ? 'Avant-dernier' : 'Intermédiaire'})`);
      
      // Enregistrer les informations du nœud pour la deuxième passe
      nodeMap.set(node.id, {
        node,
        asset,
        level: levelPosition,
        isOneBeforeLastLevel
      });
      
      // Trouver les enfants pour déterminer si c'est un nœud terminal
      const childLinks = hierarchyData.links.filter(link => link.source === node.id);
      const childNodes = childLinks.map(link => 
        hierarchyData.nodes.find(n => n.id === link.target)
      ).filter(n => n !== undefined) as HierarchyNode[];

      // Variables pour stocker tous les attributs
      let prodVar: any = null;
      let prodKgVar: any = null;
      let ipeVar: any = null;
      let ipeKgVar: any = null;
      let stateVar: any = null;
      // Variables de consommation
      let consoVar: any = null;

      // Ajouter des attributs pour tous les niveaux sauf le premier
      if (!isFirstLevel) {
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

        try {
          // Créer les variables - Utiliser des promises indépendantes pour chaque variable
          // mais les traiter une par une pour éviter les problèmes de verrou de base de données
          
          // Variable de consommation - seulement pour le dernier niveau
          if (isLastLevel) {
            // Revenir à l'ancienne version avec une seule variable de consommation basée sur le type d'énergie détecté
            const consoVarName = `Consommation_${energyType}_${sanitizeAssetName(node.name)}`;
            consoVar = await createOrGetVariable(
              asset.assetId,
              consoVarName,
              'FLOAT32',
              getUnitForEnergyType(energyType),
              `Consommation énergétique (${energyType})`,
              true
            );
            
            // Pause pour réduire la contention
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Variables de production pour tous les niveaux sauf le premier
          const prodVarName = `Production_${sanitizeAssetName(node.name)}`;
          prodVar = await createOrGetVariable(
            asset.assetId,
            prodVarName,
            'FLOAT32',
            'pcs',
            'Production (quantité)',
            true
          );

          // Attendre un peu entre les créations pour réduire la contention
          await new Promise(resolve => setTimeout(resolve, 100));

          const prodKgVarName = `Production_kg_${sanitizeAssetName(node.name)}`;
          prodKgVar = await createOrGetVariable(
            asset.assetId,
            prodKgVarName,
            'FLOAT32',
            'kg',
            'Production (kg)',
            true
          );

          // Attendre un peu entre les créations pour réduire la contention
          await new Promise(resolve => setTimeout(resolve, 100));

          // Variables IPE pour tous les niveaux sauf le premier
          const ipeVarName = `IPE_${sanitizeAssetName(node.name)}`;
          ipeVar = await createOrGetVariable(
            asset.assetId,
            ipeVarName,
            'FLOAT32',
            'kWh/pcs',
            'Indicateur de Performance Énergétique (kWh/pcs)',
            true
          );

          // Attendre un peu entre les créations pour réduire la contention
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const ipeKgVarName = `IPE_kg_${sanitizeAssetName(node.name)}`;
          ipeKgVar = await createOrGetVariable(
            asset.assetId,
            ipeKgVarName,
            'FLOAT32',
            'kWh/kg',
            'Indicateur de Performance Énergétique (kWh/kg)',
            true
          );

          // État capteur uniquement pour le dernier niveau
          if (isLastLevel) {
            // Attendre un peu entre les créations pour réduire la contention
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const stateVarName = `EtatCapteur_${sanitizeAssetName(node.name)}`;
            stateVar = await createOrGetVariable(
              asset.assetId,
              stateVarName,
              'STRING',
              null,
              'État du capteur de la machine'
            );
          }

          // Log des statistiques périodiquement
          if (importStats.successfulVariables % 10 === 0 || importStats.failedVariables % 5 === 0) {
            console.log(`📊 Statistiques d'importation:
              - Assets créés: ${importStats.totalAssets}
              - Variables créées: ${importStats.successfulVariables}
              - Variables en échec: ${importStats.failedVariables}
              - Variables réessayées: ${importStats.retriedVariables}
              - Agrégations en attente: ${aggregationQueue.length}
              - Erreurs fréquentes: ${Array.from(importStats.errors.entries()).map(([type, count]) => `${type}: ${count}`).join(', ')}
            `);
          }

          // Mettre à jour les métadonnées du nœud avec les IDs des variables
          node.metadata = {
            ...node.metadata,
            energyType,
            assetId: asset.assetId,
            type: isLastLevel ? 'machine' : 'group',
            levelPosition, // Stocker la position du niveau
            totalLevels,   // Stocker le nombre total de niveaux
            variable: consoVar ? {
              id: consoVar.variableId,
              name: consoVar.variableName,
              energyType: energyType,
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
              name: prodVar.variableName,
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
            productionKgVariable: prodKgVar ? {
              id: prodKgVar.variableId,
              name: prodKgVar.variableName,
              aggregations: prodKgVar.aggregations ? Object.entries(prodKgVar.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
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
              name: ipeVar.variableName,
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
            ipeKgVariable: ipeKgVar ? {
              id: ipeKgVar.variableId,
              name: ipeKgVar.variableName,
              aggregations: ipeKgVar.aggregations ? Object.entries(ipeKgVar.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
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
              id: stateVar.variableId,
              name: stateVar.variableName
            } : undefined
          };
        } catch (error) {
          console.error(`❌ Erreur création variables pour asset ${node.name}:`, error instanceof Error ? error.message : error);
        }
      }

      // Traiter les enfants de manière récursive
      // Pour tous les niveaux, traiter séquentiellement pour éviter
      // de surcharger l'API avec trop de requêtes simultanées
      for (const childNode of childNodes) {
        await createAssetsRecursively(childNode, asset.assetId);
      }

      return asset;
    } catch (error) {
      console.error(`❌ Erreur traitement nœud ${node.name}:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  // Commencer par les nœuds de premier niveau
  const topLevelNodes = hierarchyData.nodes.filter(
    node => node.level === hierarchyData.levels[0].level
  );

  // Pour le premier niveau, on peut traiter les branches principales en parallèle
  await Promise.all(
    topLevelNodes.map(node => createAssetsRecursively(node, rootAsset.assetId))
  );

  console.log(`Première passe terminée: création des assets et variables de base. ${createdAssets.size} assets créés.`);
  
  // DEUXIEME PASSE: Créer les variables d'agrégation qui dépendent d'autres variables
  console.log(`Démarrage de la seconde passe: création des règles d'agrégation...`);
  
  // Récupérer tous les nœuds de l'avant-dernier niveau
  const beforeLastLevelNodes = Array.from(nodeMap.entries())
    .filter(([_, nodeInfo]) => nodeInfo.isOneBeforeLastLevel)
    .map(([nodeId, nodeInfo]) => ({ nodeId, ...nodeInfo }));
  
  // Traiter par lots pour ne pas surcharger l'API
  const RULE_BATCH_SIZE = 5;
  for (let i = 0; i < beforeLastLevelNodes.length; i += RULE_BATCH_SIZE) {
    const batch = beforeLastLevelNodes.slice(i, i + RULE_BATCH_SIZE);
    await Promise.all(batch.map(async ({ nodeId, node, asset }) => {
      try {
        console.log(`📊 Création des règles d'agrégation pour le niveau avant-dernier: ${node.name}`);
        
        // Trouver les enfants
        const childLinks = hierarchyData.links.filter(link => link.source === nodeId);
        const childNodeIds = childLinks.map(link => link.target);
        
        // Pour chaque type d'énergie, créer une variable dédiée
        const energyTypes = ['Elec', 'Gaz', 'Eau', 'Air'];
        
        // Récupérer les variables de consommation par type d'énergie
        for (const energyType of energyTypes) {
          const consoVarName = `Consommation_${energyType}_${sanitizeAssetName(node.name)}`;
          console.log(`📊 Création de la règle de consommation pour ${energyType}: ${consoVarName}`);
          
          // Récupérer les variables enfants de ce type d'énergie
          const childConsumptionVariables = [];
          
          // Récupérer les informations des variables enfants en parallèle
          const childVariablePromises = childNodeIds.map(async childId => {
            const childNodeInfo = nodeMap.get(childId);
            if (childNodeInfo) {
              const childNode = childNodeInfo.node;
              const childAsset = childNodeInfo.asset;
              
              // Chercher la variable de consommation de cet enfant pour ce type d'énergie
              const childVarName = `Consommation_${energyType}_${sanitizeAssetName(childNode.name)}`;
              const childVars = await getExistingVariable(childAsset.assetId, childVarName);
              
              if (childVars) {
                console.log(`📊 Trouvé variable de consommation ${energyType} pour l'enfant ${childNode.name}: ${childVars.variableName}`);
                return {
                  name: `var${childConsumptionVariables.length + 1}`,
                  variableId: childVars.variableId,
                  variableName: childVars.variableName
                };
              } else {
                console.log(`⚠️ Variable de consommation ${energyType} non trouvée pour l'enfant ${childNode.name}`);
                return null;
              }
            }
            return null;
          });
          
          // Attendre que toutes les recherches de variables soient terminées
          const childVarsResults = await Promise.all(childVariablePromises);
          
          // Filtrer les résultats null
          childConsumptionVariables.push(...childVarsResults.filter(v => v !== null));
          
          // Que faire si aucune variable de consommation enfant n'est trouvée?
          let consoVar;
          if (childConsumptionVariables.length > 0) {
            // Créer une formule qui somme toutes les variables (var1 + var2 + var3 + ...)
            const formula = childConsumptionVariables.map((v, i) => `var${i + 1}`).join(' + ');
            
            console.log(`📊 Création de la règle d'agrégation ${energyType} avec la formule: ${formula} (${childConsumptionVariables.length} variables)`);
            
            // Créer la variable de consommation agrégée pour ce niveau et ce type d'énergie
            consoVar = await createOrGetAggregatedVariable(
              asset.assetId,
              consoVarName,
              formula,
              childConsumptionVariables.map((v, i) => ({
                name: `var${i + 1}`,
                variableId: v.variableId,
                variableName: v.variableName
              })),
              'FLOAT32',
              getUnitForEnergyType(energyType),
              `Consommation énergétique (${energyType}) agrégée des sous-niveaux (${childConsumptionVariables.length} variables)`,
              true
            );
          } else {
            console.log(`⚠️ Aucune variable de consommation ${energyType} n'a été trouvée pour les enfants de ${node.name}.`);
            
            // Créer une règle vide (0 + 0) pour respecter le sourceType = "Rule"
            console.log(`📊 Création d'une règle avec valeur constante pour: ${consoVarName}`);
            
            // Créer une règle avec constante
            consoVar = await createRuleWithConstant(
              asset.assetId,
              consoVarName,
              'FLOAT32', 
              getUnitForEnergyType(energyType),
              `Consommation énergétique (${energyType}) du niveau ${node.name} (pas d'enfants avec des variables de consommation)`,
              true
            );
          }
          
          // Mettre à jour les métadonnées avec cette nouvelle variable
          if (consoVar) {
            const metadataKey = `variable_${energyType.toLowerCase()}`;
            if (!node.metadata) {
              node.metadata = {};
            }
            
            node.metadata[metadataKey] = {
              id: consoVar.variableId,
              name: consoVar.variableName,
              energyType: energyType,
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
            };
          }
          
          // Petite pause entre les types d'énergie pour ne pas surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      } catch (error) {
        console.error(`❌ Erreur création règles d'agrégation pour ${node.name}:`, error instanceof Error ? error.message : error);
      }
    }));
    
    // Petite pause entre les lots pour ne pas surcharger l'API
    if (i + RULE_BATCH_SIZE < beforeLastLevelNodes.length) {
      console.log(`Pause de 1 seconde entre les lots...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Après la création de tous les assets et variables, traiter toutes les agrégations en attente
  console.log(`⏳ Traitement final des agrégations en attente (${aggregationQueue.length})...`);
  await processAggregationQueue();
  
  console.log(`✅ Import terminé avec succès. ${createdAssets.size} assets créés.`);
  return {
    success: true,
    message: `Import terminé avec succès. ${createdAssets.size} assets créés. Les règles d'agrégation ont été configurées.`,
    assets: Array.from(createdAssets.values())
  };
}

// Fonction pour obtenir l'unité en fonction du type d'énergie
function getUnitForEnergyType(energyType: string): string {
  switch (energyType.toLowerCase()) {
    case 'elec':
    case 'gaz':
      return 'kWh';
    case 'eau':
      return 'm3';
    case 'air':
      return 'm3';
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

/**
 * Crée une variable qui agrège d'autres variables existantes (via une formule)
 */
async function createOrGetAggregatedVariable(
  assetId: string, 
  name: string, 
  formula: string, 
  variables: { name: string, variableId: string, variableName: string }[],
  dataType: string = 'FLOAT32', 
  unit: string | null = null, 
  description?: string,
  createAggs: boolean = false
) {
  // Vérifier si la variable existe déjà
  const existingVariable = await getExistingVariable(assetId, name);
  if (existingVariable) {
    return {
      ...existingVariable,
      aggregations: createAggs ? await createAggregations(existingVariable.variableId, name) : undefined
    };
  }

  // Créer une nouvelle variable avec la règle (formule)
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  // Construire les tags pour la règle basés sur les variables existantes
  const tags = variables.map(v => ({
    name: v.name,
    variableId: v.variableId,
    variableName: v.variableName,
    dataType: dataType
  }));

  // Construire l'objet de variable pour l'API
  const body = {
    variableName: name,
    assetId,
    dataType,
    description: description || `Variable ${name} créée automatiquement (agrégation)`,
    unit,
    store: true,
    sourceType: 'Rule',
    rule: {
      formula,
      tags: tags
    },
    connected: false,
    retention: {
      settings: {
        timeSettings: {
          timeRange: {
            base: "year",
            factor: 6
          }
        }
      }
    }
  };

  logDebug(`Création variable Rule d'agrégation`, body);

  const createResponse = await fetch('/api/variables', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify(body)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Erreur création variable Rule d'agrégation: ${errorText}`);
  }

  const newVariable = await createResponse.json();
  console.log(`✅ Variable Rule d'agrégation créée: ${name}`);

  // Mettre en cache la nouvelle variable
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  variableExistenceCache.set(cacheKey, newVariable);

  // Créer les agrégations
  const aggregations = await createAggregations(newVariable.variableId, name);
  return {
    ...newVariable,
    aggregations
  };
}

// Nouvelle fonction pour créer une variable de type règle avec constante
async function createRuleWithConstant(
  assetId: string, 
  name: string,
  dataType: string = 'FLOAT32', 
  unit: string | null = null, 
  description?: string,
  createAggs: boolean = false
) {
  // Vérifier si la variable existe déjà
  const existingVariable = await getExistingVariable(assetId, name);
  if (existingVariable) {
    return {
      ...existingVariable,
      aggregations: createAggs ? await createAggregations(existingVariable.variableId, name) : undefined
    };
  }

  // On va créer une variable de type Rule avec une formule constante
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  // Construire l'objet de variable pour l'API
  const body = {
    variableName: name,
    assetId,
    dataType,
    description: description || `Variable ${name} créée automatiquement (formule constante)`,
    unit,
    store: true,
    sourceType: 'Rule',
    rule: {
      formula: "0", // Valeur constante zéro
      constants: [
        {
          name: "c1",
          value: 0
        }
      ]
    },
    connected: false
  };

  logDebug(`Création variable Rule constante`, body);

  const createResponse = await fetch('/api/variables', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify(body)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Erreur création variable Rule constante: ${errorText}`);
  }

  const newVariable = await createResponse.json();
  console.log(`✅ Variable Rule constante créée: ${name}`);

  // Mettre en cache la nouvelle variable
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  variableExistenceCache.set(cacheKey, newVariable);

  // Créer les agrégations si demandé
  if (createAggs) {
    const aggregations = await createAggregations(newVariable.variableId, name);
    return {
      ...newVariable,
      aggregations
    };
  }

  return newVariable;
}

// Ajouter une fonction pour vérifier périodiquement l'état de l'importation
async function checkImportStatus(createdAssets: Map<string, any>) {
  // Compteurs pour les statistiques
  let stats = {
    totalAssets: createdAssets.size,
    totalVariables: 0,
    totalAggregations: 0,
    pendingAggregations: aggregationQueue.length,
    failedVariables: 0
  };

  console.log(`\n📊 Statistiques d'importation :`);
  console.log(`- Assets créés : ${stats.totalAssets}`);
  console.log(`- Agrégations en attente : ${stats.pendingAggregations}`);
  
  return stats;
}

// Corriger les erreurs de type en ajoutant une vérification pour les propriétés possiblement nulles
function buildMetadataWithVariable(variable: any, propName: string) {
  if (!variable) return undefined;
  
  return {
    id: variable.variableId,
    name: variable.variableName,
    aggregations: variable.aggregations ? Object.entries(variable.aggregations).reduce<{ [key: string]: Aggregation }>((acc, [key, agg]: [string, any]) => ({
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
  };
}

// Sauvegarder l'état de l'importation pour reprendre en cas d'erreur
function saveImportState(createdAssets: Map<string, any>, nodeMap: Map<string, any>) {
  const state = {
    assets: Array.from(createdAssets.entries()),
    nodes: Array.from(nodeMap.entries()),
    aggregationQueue: [...aggregationQueue]
  };
  
  try {
    localStorage.setItem('import_state', JSON.stringify(state));
    console.log('État d\'importation sauvegardé localement');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'état:', error);
  }
}

// Récupérer l'état d'importation précédent si disponible
function loadImportState(): { assets: Map<string, any>, nodes: Map<string, any>, queue: AggregationRequest[] } | null {
  try {
    const stateJson = localStorage.getItem('import_state');
    if (!stateJson) return null;
    
    const state = JSON.parse(stateJson);
    return {
      assets: new Map(state.assets),
      nodes: new Map(state.nodes),
      queue: state.aggregationQueue
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'état:', error);
    return null;
  }
}

// Modifier createRuleVariable pour utiliser le cache
async function createRuleVariable(assetId: string, name: string, formula: string, tags: {
  name: string;
  adapterId: string;
  connectionName: string;
  tagName: string;
  dataType: string;
}[], dataType: string = 'Float', unit: string | null = null, description?: string) {
  // Vérifier si la variable existe déjà (utilise déjà le cache via getExistingVariable)
  const existingVariable = await getExistingVariable(assetId, name);
  if (existingVariable) {
    return existingVariable;
  }

  // Récupérer les informations de l'asset
  const asset = await getAssetDetails(assetId);
  
  const authConfig = getAuthConfig();
  if (!authConfig) {
    throw new Error('Non authentifié');
  }

  // S'assurer que les connexions sont préchargées
  if (!connectionCache.loaded) {
    await preloadConnectionsAndTags();
  }

  // Vérifier et corriger les tags si nécessaire (en utilisant le cache)
  const validatedTags = [];
  
  for (const tag of tags) {
    // Trouver la connexion correspondante
    const connection = connectionCache.connectionMap.get(tag.connectionName);
    
    if (!connection) {
      console.error(`⚠️ Connexion ${tag.connectionName} non trouvée pour la variable Rule ${name}`);
      continue;
    }
    
    // Récupérer la map des tags pour cette connexion
    const tagsForConnection = connectionCache.tagMap.get(tag.connectionName);
    
    // Vérifier si le tag demandé existe
    let foundTag = tagsForConnection?.get(tag.tagName);
    
    if (!foundTag) {
      // Si le tag n'existe pas, essayer de trouver des alternatives
      const alternativeTags = [];
      
      if (tag.tagName === 'prod' || tag.tagName === 'prod_quantite') {
        alternativeTags.push('prod_quantite', 'prod_kg', 'prod');
      } else if (tag.tagName === 'prod_kg') {
        alternativeTags.push('prod_kg', 'prod_quantite', 'prod');
      } else if (tag.tagName === 'IPE' || tag.tagName === 'IPE_quantite') {
        alternativeTags.push('IPE_quantite', 'IPE_kg', 'IPE');
      } else if (tag.tagName === 'IPE_kg') {
        alternativeTags.push('IPE_kg', 'IPE', 'IPE_quantite');
      } else if (tag.tagName === 'conso') {
        alternativeTags.push('conso');
      }
      
      for (const altTag of alternativeTags) {
        const alt = tagsForConnection?.get(altTag);
        if (alt) {
          foundTag = alt;
          console.log(`🔄 Tag alternatif trouvé: ${altTag} au lieu de ${tag.tagName} pour la connexion ${tag.connectionName}`);
          break;
        }
      }
    }
    
    if (foundTag) {
      // Ajouter le tag validé
      validatedTags.push({
        ...tag,
        tagName: foundTag.name,
        dataType: foundTag.dataType || tag.dataType,
        topic: foundTag.topic
      });
    } else {
      console.error(`⚠️ Tag ${tag.tagName} non trouvé pour la connexion ${tag.connectionName}`);
    }
  }
  
  // Si on n'a pas assez de tags validés, on ne peut pas créer la variable Rule
  if (validatedTags.length < 2) {
    throw new Error(`Impossible de créer la variable Rule ${name}: pas assez de tags valides (${validatedTags.length}/2)`);
  }

  // Construire l'objet de variable pour l'API
  const body = {
    variableName: name,
    assetId,
    dataType,
    description: description || `Variable ${name} créée automatiquement`,
    unit,
    store: true,
    sourceType: 'Rule',
    rule: {
      formula,
      tags: validatedTags
    },
    connected: false
  };

  logDebug(`Création variable Rule`, body);

  const createResponse = await fetch('/api/variables', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify(authConfig)
    },
    body: JSON.stringify(body)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Erreur création variable Rule: ${errorText}`);
  }

  const newVariable = await createResponse.json();
  console.log(`✅ Variable Rule créée: ${name}`);

  // Mettre en cache la nouvelle variable
  const cacheKey = `${assetId}:${name.toLowerCase()}`;
  variableExistenceCache.set(cacheKey, newVariable);

  // Créer les agrégations
  const aggregations = await createAggregations(newVariable.variableId, name);
  return {
    ...newVariable,
    aggregations
  };
}