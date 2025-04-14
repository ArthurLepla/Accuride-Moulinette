import { AuthConfig, IIHAsset, IIHVariable, BulkCreateVariablesResponse, IIHVariableResponse } from '../simple-importer/types';
import { sanitizeNameForVariable } from '../simple-importer/helpers';
import https from 'https';
import nodeFetch, { RequestInit as NodeFetchRequestInit } from 'node-fetch';
import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';

// Define the interface for Aggregation data locally if not imported
// (This should have been copied from the original api.ts)
interface AggregationInfo { 
  id: string; 
  type?: string;
  cycle?: { base: string; factor: number };
  sourceId?: string;
}

// Define a specific interface for hierarchical asset creation input
interface AssetToCreateHierarchically extends Partial<IIHAsset> {
  path?: string[];
}

export class IIHApi {
  private authConfig: AuthConfig;
  private httpsAgent: https.Agent;
  private axios: AxiosInstance;

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig;
    
    // Créer un agent HTTPS qui ignore la vérification des certificats
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    console.log('IIHApi initialisé avec la configuration:', {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token
    });

    // Correction de la configuration Axios
    const axiosConfig: CreateAxiosDefaults = {
      baseURL: `https://${authConfig.iedIp}/iih-essentials`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.token}`
      },
      httpsAgent: this.httpsAgent // Utilisation de httpsAgent au lieu de agent
    };

    this.axios = axios.create(axiosConfig);
  }

  // Obtenir l'URL de base pour les requêtes API
  private getBaseApiUrl(): string {
    return `https://${this.authConfig.iedIp}/iih-essentials`;
  }

  async getRootAsset(): Promise<IIHAsset> {
    console.log('Tentative de récupération de l\'asset racine avec la configuration:', {
      baseUrl: this.authConfig.baseUrl,
      iedIp: this.authConfig.iedIp,
      hasToken: !!this.authConfig.token
    });

    try {
      const url = `${this.getBaseApiUrl()}/AssetService/Assets/Root?includeChildren=false&includeBreadcrumb=false`;
      console.log('URL de récupération de l\'asset racine:', url);
      
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erreur lors de la récupération de l'asset racine: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'asset racine:', error);
      throw error;
    }
  }

  async createAsset(asset: Partial<IIHAsset>): Promise<IIHAsset> {
    console.log('Tentative de création d\'asset avec la configuration:', {
      baseUrl: this.authConfig.baseUrl,
      iedIp: this.authConfig.iedIp,
      hasToken: !!this.authConfig.token,
      asset
    });

    try {
      const url = `${this.getBaseApiUrl()}/AssetService/Assets`;
      console.log('URL de création d\'asset:', url);
      
      const response = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(asset)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erreur lors de la création de l'asset: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la création d\'asset:', error);
      throw error;
    }
  }

  async createVariablesBulk(variables: IIHVariable[]): Promise<BulkCreateVariablesResponse> {
    console.log(`Tentative de création en masse de ${variables.length} variables`);

    try {
      // Prétraitement des variables pour corriger les problèmes connus
      const processedVariables = variables.map(variable => {
        // Clone pour éviter de modifier l'original
        const processed = {...variable};
        
        // Correction: Assurer que sourceType est correctement capitalisé (Tag -> tag)
        if (processed.sourceType === 'Tag') {
          processed.sourceType = 'Tag'; // Conserver la casse d'origine si c'est celle attendue par l'API
        }
        
        // Correction: Vérifier et normaliser la rétention
        if (processed.retention && processed.retention.settings?.timeSettings?.timeRange) {
          const { base, factor } = processed.retention.settings.timeSettings.timeRange;
          
          // Normaliser la base
          if (base) {
            processed.retention.settings.timeSettings.timeRange.base = base.toLowerCase();
          }
          
          // Vérifier que les paramètres de rétention sont valides
          if (base === 'year' && factor > 0) {
            // La configuration est valide, on la garde telle quelle
          } else if (base === 'day' && factor > 365) {
            // Convertir les jours en années si nécessaire
            processed.retention.settings.timeSettings.timeRange = {
              base: 'year',
              factor: Math.floor(factor / 365)
            };
          }
        }
        
        return processed;
      });

      const url = `${this.getBaseApiUrl()}/DataService/Variables/Bulk/Create`;
      console.log('URL de création en masse de variables:', url);
      
      const response = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(processedVariables)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erreur lors de la création en masse des variables: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la création en masse des variables:', error);
      throw error;
    }
  }

  /**
   * Récupère les assets enfants d'un asset donné
   * @param parentId ID de l'asset parent
   * @returns Liste des assets enfants
   */
  async getChildAssets(parentId: string): Promise<any[]> {
    try {
      console.log(`Récupération des assets enfants pour le parent: ${parentId}...`);
      const url = new URL(`/iih-essentials/AssetService/Assets?parentId=${parentId}`, `https://${this.authConfig.iedIp}`);
      
      const response = await this.fetchWithAuth(url.toString());
      const children = await response.json();
      
      console.log(`${children.length} enfants récupérés pour le parent ${parentId}`);
      return children;
    } catch (error) {
      console.error('Erreur lors de la récupération des assets enfants:', error);
      return [];
    }
  }

  /**
   * Récupère la hiérarchie complète des assets à partir d'un asset parent
   * @param parentId ID de l'asset parent (racine par défaut)
   * @param maxDepth Profondeur maximale de récursion
   * @returns Structure hiérarchique complète
   */
  async getAssetHierarchy(parentId?: string, maxDepth: number = 5): Promise<any> {
    const rootAsset = parentId ? await this.getAssetById(parentId) : await this.getRootAsset();
    if (!rootAsset) return null;
    
    console.log(`Récupération de la hiérarchie à partir de: ${rootAsset.name} (${rootAsset.assetId})`);
    
    async function buildHierarchy(asset: any, currentDepth: number, api: IIHApi): Promise<any> {
      if (currentDepth >= maxDepth) return asset;
      
      const children = await api.getChildAssets(asset.assetId);
      
      // Ajouter un chemin à chaque asset pour le suivi hiérarchique
      const assetWithPath = {
        ...asset,
        metadata: {
          ...asset.metadata,
          path: asset.metadata?.path || [],
          level: currentDepth + 1
        },
        children: []
      };
      
      if (children.length > 0) {
        assetWithPath.children = await Promise.all(
          children.map(async (child: any) => {
            // Ajouter l'ID du parent au chemin
            const childPath = [...(assetWithPath.metadata.path || []), asset.assetId];
            const childWithPath = {
              ...child,
              metadata: {
                ...child.metadata,
                path: childPath
              }
            };
            return buildHierarchy(childWithPath, currentDepth + 1, api);
          })
        );
      }
      
      return assetWithPath;
    }
    
    return buildHierarchy(rootAsset, 0, this);
  }

  /**
   * Récupère un asset par son ID
   * @param assetId ID de l'asset à récupérer
   * @returns Asset correspondant ou null si non trouvé
   */
  async getAssetById(assetId: string): Promise<any | null> {
    try {
      console.log(`Récupération de l'asset avec ID: ${assetId}...`);
      const url = new URL(`/iih-essentials/AssetService/Assets/${assetId}`, `https://${this.authConfig.iedIp}`);
      
      const response = await this.fetchWithAuth(url.toString());
      
      if (response.status === 404) {
        console.log(`Asset ${assetId} non trouvé`);
        return null;
      }
      
      const asset = await response.json();
      console.log(`Asset récupéré: ${asset.name} (${asset.assetId})`);
      return asset;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'asset ${assetId}:`, error);
      return null;
    }
  }

  // Méthode de base pour les requêtes avec authentification
  private async fetchWithAuth(url: string, options: NodeFetchRequestInit = {}): Promise<nodeFetch.Response> {
    // Désactiver temporairement la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authConfig.token}`
      };

      const mergedOptions: NodeFetchRequestInit = {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        },
        agent: this.httpsAgent
      };

      console.log(`Envoi d'une requête à ${url.split('?')[0]}`);
      const response = await nodeFetch(url, mergedOptions);
      
      return response;
    } finally {
      // Réactiver la vérification SSL
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }
  }

  /**
   * Récupère la liste des adapters disponibles
   * @returns Liste des adapters
   */
  async getAdapters(): Promise<any[]> {
    console.log('Récupération des adapters disponibles...');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify({
        baseUrl: this.authConfig.baseUrl,
        iedIp: this.authConfig.iedIp,
        authToken: this.authConfig.token
      })
    };

    const response = await fetch('/api/adapters', { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur lors de la récupération des adapters:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Erreur lors de la récupération des adapters: ${errorText}`);
    }

    const data = await response.json();
    return data.adapters || [];
  }

  /**
   * Récupère les tags disponibles pour un adapter donné
   * @param adapterId ID de l'adapter
   * @returns Liste des tags disponibles
   */
  async getAdapterTags(adapterId: string): Promise<any[]> {
    console.log(`Récupération des tags pour l'adapter ${adapterId}...`);

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify({
        baseUrl: this.authConfig.baseUrl,
        iedIp: this.authConfig.iedIp,
        authToken: this.authConfig.token
      })
    };

    const response = await fetch(`/api/adapters/${adapterId}/browse`, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la récupération des tags pour l'adapter ${adapterId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Erreur lors de la récupération des tags: ${errorText}`);
    }

    const data = await response.json();
    return data.tags || [];
  }

  /**
   * Crée une agrégation pour une variable
   * @param aggregationData Données de l'agrégation (type, sourceId, cycle)
   * @returns Agrégation créée
   */
  async createAggregation(aggregationData: any): Promise<any> {
    try {
      // Vérifier que les données sont complètes
      if (!aggregationData.sourceId || !aggregationData.cycle?.base || !aggregationData.cycle?.factor) {
        throw new Error("Données d'agrégation incomplètes");
      }
      
      // Vérifier que le facteur est valide selon la base
      this.validateCycleFactor(aggregationData.cycle.base, aggregationData.cycle.factor);
      
      const url = `${this.getBaseApiUrl()}/DataService/Aggregations`;
      console.log(`Création d'agrégation: ${aggregationData.cycle.base} ${aggregationData.cycle.factor} pour ${aggregationData.sourceId}`);
      
      const response = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(aggregationData)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status} - ${responseText}`);
        throw new Error(`Erreur lors de la création de l'agrégation: ${responseText}`);
      }
      
      // Convertir la réponse en JSON seulement si elle n'est pas vide
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn(`Impossible de parser la réponse: ${responseText}`);
        result = { success: true, message: "Agrégation créée mais réponse non parseable" };
      }
      
      console.log(`✅ Agrégation créée: ${aggregationData.cycle.base} ${aggregationData.cycle.factor} → ID: ${result.id || 'non disponible'}`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la création de l'agrégation:`, error);
      throw error;
    }
  }

  /**
   * Valide que le facteur est compatible avec la base du cycle
   * @param base Base du cycle (second, minute, hour, day)
   * @param factor Facteur du cycle
   * @throws Error si le facteur est invalide
   */
  private validateCycleFactor(base: string, factor: number): void {
    // Valeurs autorisées selon la documentation de l'API
    const allowedFactors: Record<string, number[]> = {
      'second': [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30],
      'minute': [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30],
      'hour': [1, 2, 3, 4, 6, 8, 12],
      'day': [1]
    };
    
    // Normaliser la base (la documentation utilise second/minute/hour/day, mais l'API pourrait accepter au singulier ou pluriel)
    const normalizedBase = base.toLowerCase().replace(/s$/, '');
    
    // Vérifier si la base est valide
    if (!allowedFactors[normalizedBase]) {
      throw new Error(`Base de cycle invalide: ${base}. Valeurs autorisées: second, minute, hour, day`);
    }
    
    // Vérifier si le facteur est valide pour cette base
    if (!allowedFactors[normalizedBase].includes(factor)) {
      throw new Error(`Facteur invalide: ${factor} pour la base ${base}. Valeurs autorisées: ${allowedFactors[normalizedBase].join(', ')}`);
    }
  }

  /**
   * Crée une agrégation en utilisant le point d'entrée personnalisé (comme dans flexibleAssetImporter)
   * @param aggregationData Données de l'agrégation
   * @returns Agrégation créée
   */
  async createCustomAggregation(aggregationData: any): Promise<any> {
    try {
      const url = `/api/aggregations`;
      console.log(`Création d'agrégation via endpoint personnalisé: ${aggregationData.cycle.base} ${aggregationData.cycle.factor} pour ${aggregationData.sourceId}`);
      
      // IMPORTANT: Conserver la structure exacte de AuthConfig avec token ET authToken
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Config': JSON.stringify({
          baseUrl: this.authConfig.baseUrl,
          iedIp: this.authConfig.iedIp,
          token: this.authConfig.token,
          authToken: this.authConfig.token  // Utiliser la même valeur si authToken n'est pas défini
        })
      };
      
      // Utiliser fetch directement plutôt que fetchWithAuth car c'est un endpoint Next.js local
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(aggregationData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur agrégation: ${errorText}`);  // Ajouter plus de détails dans le log d'erreur
        throw new Error(`Erreur lors de la création de l'agrégation: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Agrégation créée via endpoint personnalisé: ${aggregationData.cycle.base} ${aggregationData.cycle.factor} → ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la création de l'agrégation via endpoint personnalisé:`, error);
      throw error;
    }
  }

  /**
   * Configure la rétention des données pour une source
   * @param retentionData Données de rétention
   * @returns Résultat de l'opération
   */
  async setDataRetention(retentionData: any): Promise<any> {
    try {
      const url = `${this.getBaseApiUrl()}/DataService/DataRetentions`;
      
      // Créer une copie du retentionData pour éviter de modifier l'original
      const processedData = { ...retentionData };
      
      // Normaliser sourceTypeId - s'assurer que la première lettre est en majuscule
      if (processedData.sourceTypeId) {
        // Convertir les valeurs comme "variable" en "Variable" et "aggregation" en "Aggregation"
        const typeId = processedData.sourceTypeId.toLowerCase();
        if (typeId === 'variable') {
          processedData.sourceTypeId = 'Variable';
        } else if (typeId === 'aggregation') {
          processedData.sourceTypeId = 'Aggregation';
        } else if (typeId === 'tag') {
          processedData.sourceTypeId = 'Tag';
        } else if (typeId === 'rule') {
          processedData.sourceTypeId = 'Rule';
        }
      }
      
      // Si sourceTypeId n'est pas défini mais sourceType l'est, utiliser sourceType comme sourceTypeId
      if (!processedData.sourceTypeId && processedData.sourceType) {
        // Première lettre en majuscule pour sourceTypeId
        let sourceType = processedData.sourceType;
        if (typeof sourceType === 'string') {
          sourceType = sourceType.charAt(0).toUpperCase() + sourceType.slice(1).toLowerCase();
        }
        processedData.sourceTypeId = sourceType;
        delete processedData.sourceType; // Suppression de sourceType qui n'est pas attendu par l'API
      }
      
      // S'assurer que les paramètres de rétention sont valides
      if (processedData.settings?.timeSettings?.timeRange) {
        const { base, factor } = processedData.settings.timeSettings.timeRange;
        
        // Normaliser la base en minuscules
        if (base) {
          processedData.settings.timeSettings.timeRange.base = base.toLowerCase();
        }
        
        // Vérifier que le facteur est positif
        if (factor <= 0) {
          console.warn(`Facteur de rétention invalide: ${factor}, utilisera 1 par défaut`);
          processedData.settings.timeSettings.timeRange.factor = 1;
        }
      }
      
      console.log(`Configuration de la rétention pour ${processedData.sourceTypeId} ${processedData.sourceId}`);
      
      const response = await this.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de la configuration de la rétention:`, errorText);
        throw new Error(`Erreur lors de la configuration de la rétention: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Rétention configurée pour ${processedData.sourceTypeId} ${processedData.sourceId}`);
      return result;
    } catch (error) {
      console.error('Erreur lors de la configuration de la rétention:', error);
      throw error;
    }
  }

  /**
   * Récupère les agrégations existantes pour une variable
   * @param variableId ID de la variable (peut être id ou variableId)
   * @returns Liste des agrégations existantes
   */
  async getAggregationsForVariable(variableId: string): Promise<AggregationInfo[]> {
    try {
      if (!variableId) {
        console.warn("[API] ID de variable manquant pour récupérer les agrégations");
        return [];
      }
      
      console.log(`[API] Récupération des agrégations pour variableId: ${variableId}`);
      
      // Méthode avec filtre générique (plus probable):
      // Use fetchWithAuth, assuming it's the correct internal method for authenticated calls
      const url = `${this.getBaseApiUrl()}/DataService/Aggregations?sourceIds=[\"${encodeURIComponent(variableId)}\"]`;
      const response = await this.fetchWithAuth(url);
      let aggregations: AggregationInfo[] = [];
      
      if (response.ok) {
        const responseText = await response.text();
        try {
          const parsedAggregations = responseText ? JSON.parse(responseText) : [];
            if (Array.isArray(parsedAggregations)) {
              aggregations = parsedAggregations;
            }
          } catch (e) {
            console.error(`[API] Impossible de parser la réponse JSON pour les agrégations de ${variableId}: ${responseText}`, e);
            // Return empty array if parsing fails
            return [];
          }
      } else {
          console.error(`[API] Erreur API ${response.status} lors de la récupération des agrégations pour ${variableId}`);
          // Return empty array on API error
          return [];
      }
      
      console.log(`[API] ${aggregations.length} agrégation(s) brute(s) retournée(s) par l'API pour ${variableId}`);

      // *** ADDED: Filter results to only include aggregations matching the requested variableId ***
      const filteredAggregations = aggregations.filter((agg: AggregationInfo) => {
        if (!agg.sourceId) {
          // If sourceId is missing, we might want to log a different warning or include it based on requirements
          console.warn(`[API] Agrégation ${agg.id} retournée sans sourceId.`);
          return false; // Exclude aggregations without sourceId for safety
        }
        const match = agg.sourceId === variableId;
        // if (!match) {
             // Log the mismatch before filtering out - REMOVED THIS LOG
             // console.warn(`[API] Filtrage: Agrégation ${agg.id} (sourceId=${agg.sourceId}) ignorée car elle ne correspond pas à variableId=${variableId} demandé.`);
        return match;
      });

      // Check if the found aggregations actually belong to the *requested* variableId
      // This loop is now redundant because we filtered above, but we can keep it for extra safety or remove it.
      // Let's keep it for now but operate on filteredAggregations
      filteredAggregations.forEach((agg: AggregationInfo) => {
          if (agg.sourceId && agg.sourceId !== variableId) {
              // This warning should theoretically not trigger anymore due to the filter above
              console.warn(`[API] Vérification post-filtrage: Agrégation ${agg.id} trouvée pour sourceId=${agg.sourceId}, différent de variableId=${variableId}`);
          }
      });

      console.log(`[API] ${filteredAggregations.length} agrégations finales trouvées et validées pour ${variableId}`);
      return filteredAggregations; // Return the filtered array
    } catch (error) {
      console.error(`Erreur lors de la récupération des agrégations pour ${variableId}:`, error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  /**
   * Récupère les agrégations existantes pour plusieurs variables en un seul appel.
   * @param variableIds Liste des ID de variables.
   * @returns Une Map où les clés sont les variableId et les valeurs sont les listes d'agrégations correspondantes.
   */
  async getAggregationsForMultipleVariables(variableIds: string[]): Promise<Map<string, AggregationInfo[]>> {
    const resultsMap = new Map<string, AggregationInfo[]>();
    if (!variableIds || variableIds.length === 0) {
      return resultsMap; // Return empty map if no IDs provided
    }

    // Initialize map with empty arrays for all requested IDs
    variableIds.forEach(id => resultsMap.set(id, []));

    try {
      console.log(`[API] Récupération des agrégations pour ${variableIds.length} variableIds.`);
      
      // Construct the sourceIds query parameter: ["id1","id2",...]
      const sourceIdsQuery = JSON.stringify(variableIds.map(id => encodeURIComponent(id)));
      const url = `${this.getBaseApiUrl()}/DataService/Aggregations?sourceIds=${sourceIdsQuery}`;
      
      console.log(`[API] URL pour agrégations multiples: ${url}`);
      const response = await this.fetchWithAuth(url);
      
      let allAggregations: AggregationInfo[] = [];
      if (response.ok) {
        const responseText = await response.text();
        try {
          const parsedAggregations = responseText ? JSON.parse(responseText) : [];
          if (Array.isArray(parsedAggregations)) {
              allAggregations = parsedAggregations;
            }
          } catch (e) {
            console.error(`[API] Impossible de parser la réponse JSON pour les agrégations multiples: ${responseText}`, e);
            // Return the initialized map (empty arrays) if parsing fails
            return resultsMap;
          }
      } else {
          console.error(`[API] Erreur API ${response.status} lors de la récupération des agrégations multiples.`);
          // Return the initialized map (empty arrays) on API error
          return resultsMap;
      }

      console.log(`[API] ${allAggregations.length} agrégation(s) brute(s) retournée(s) par l'API pour le lot.`);

      // Group aggregations by sourceId
      allAggregations.forEach(agg => {
        if (agg.sourceId && resultsMap.has(agg.sourceId)) {
          // Ensure the aggregation structure matches AggregationInfo if needed
          const aggregationInfo: AggregationInfo = {
            id: agg.id,
            type: agg.type, // Assuming type exists, adjust if needed
            cycle: agg.cycle,
            sourceId: agg.sourceId
          };
          resultsMap.get(agg.sourceId)?.push(aggregationInfo);
        } else if (agg.sourceId) {
          console.warn(`[API] Agrégation ${agg.id} retournée pour sourceId ${agg.sourceId} non demandé dans le lot.`);
        } else {
           console.warn(`[API] Agrégation ${agg.id} retournée sans sourceId lors de la récupération multiple.`);
        }
      });

      console.log(`[API] Agrégations regroupées pour ${resultsMap.size} variableIds.`);
      return resultsMap;

    } catch (error) {
      console.error(`[API] Erreur majeure lors de la récupération des agrégations multiples:`, error);
      // Return the initialized map (empty arrays) in case of error
      return resultsMap; 
    }
  }

  /**
   * Récupère les variables pour un asset
   * @param assetId ID de l'asset
   * @returns Liste des variables de l'asset
   */
  async getVariablesForAsset(assetId: string): Promise<any[]> {
    console.log(`API: Récupération des variables pour l'asset ${assetId}...`);
    try {
      const url = `${this.getBaseApiUrl()}/DataService/Variables?assetIds=["${assetId}"]`;
      
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        console.error(`Erreur lors de la récupération des variables pour l'asset ${assetId}:`, response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      
      // Debug - Afficher la structure d'une variable pour comprendre le format
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Structure d'une variable (premier élément):`, JSON.stringify(data[0], null, 2).substring(0, 300) + '...');
      } else if (data && typeof data === 'object' && data.variables && data.variables.length > 0) {
        console.log(`Structure d'une variable (premier élément):`, JSON.stringify(data.variables[0], null, 2).substring(0, 300) + '...');
      }
      
      // Transformer les données pour garantir les propriétés requises
      let variables = [];
      
      if (Array.isArray(data)) {
        console.log(`${data.length} variables trouvées pour l'asset ${assetId}`);
        variables = data;
      } else if (data && Array.isArray(data.variables)) {
        console.log(`${data.variables.length} variables trouvées pour l'asset ${assetId}`);
        variables = data.variables;
      } else {
        console.error('Format de réponse inattendu pour les variables:', data);
        return [];
      }
      
      // Normaliser les variables pour garantir qu'elles ont toutes un ID et un nom
      const normalizedVariables = variables.map((variable: any) => {
        // Si la variable a déjà les bonnes propriétés, la retourner telle quelle
        if (variable.id && variable.name) return variable;
        
        // Sinon, chercher les propriétés dans différents champs possibles
        const id = variable.id || variable.variableId || variable._id;
        const name = variable.name || variable.variableName || 'Variable sans nom';
        
        return {
          ...variable,
          id: id,
          name: name
        };
      });
      
      return normalizedVariables;
    } catch (error) {
      console.error(`Erreur lors de la récupération des variables pour l'asset ${assetId}:`, error);
      return [];
    }
  }

  /**
   * Récupère toutes les variables du système
   * @returns Objet contenant un tableau de variables et un statut de succès
   */
  async getAllVariables(): Promise<{success: boolean; message: string; variables: any[]}> {
    try {
      console.log('Récupération de toutes les variables...');
      const url = new URL('/iih-essentials/DataService/Variables', `https://${this.authConfig.iedIp}`);
      
      const response = await this.fetchWithAuth(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la récupération des variables:', errorText);
        return { 
          success: false, 
          message: `Erreur lors de la récupération des variables: ${errorText}`,
          variables: [] 
        };
      }
      
      // Traiter la réponse
      const responseText = await response.text();
      let variables = [];
      
      try {
        if (responseText && responseText.trim()) {
          const data = JSON.parse(responseText);
          
          // Déterminer la structure de la réponse
          if (Array.isArray(data)) {
            // Format direct - tableau de variables
            variables = data;
            console.log(`${variables.length} variables récupérées (format tableau simple)`);
          } else if (data && typeof data === 'object') {
            // Format objet - chercher un tableau de variables
            if (Array.isArray(data.variables)) {
              // Format {variables: [...]}
              variables = data.variables;
              console.log(`${variables.length} variables récupérées (format objet.variables)`);
            } else {
              // Explorer l'objet pour trouver un tableau
              const arrayProperties = Object.entries(data)
                .filter(([_key, value]) => Array.isArray(value) && value.length > 0)
                .sort(([_key1, a], [_key2, b]) => (b as any[]).length - (a as any[]).length);
              
              if (arrayProperties.length > 0) {
                const [key, value] = arrayProperties[0];
                variables = value as any[];
                console.log(`${variables.length} variables récupérées (format objet.${key})`);
              } else {
                console.error('Aucun tableau trouvé dans la réponse API:', data);
              }
            }
          } else {
            console.error('Format de réponse non reconnu:', data);
          }
        } else {
          console.warn('Réponse API vide ou invalide');
        }
      } catch (error) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', error, 'Texte brut:', responseText);
      }
      
      console.log(`${variables.length} variables récupérées avec succès`);
      return { 
        success: true, 
        message: `${variables.length} variables récupérées avec succès`,
        variables: variables 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la récupération des variables:', errorMessage);
      return { 
        success: false, 
        message: `Erreur lors de la récupération des variables: ${errorMessage}`,
        variables: [] 
      };
    }
  }

  /**
   * Récupère toutes les agrégations du système
   * @returns Objet contenant un tableau d'agrégations et un statut de succès
   */
  async getAllAggregations(): Promise<{success: boolean; message: string; aggregations: any[]}> {
    try {
      console.log('Récupération de toutes les agrégations...');
      const url = new URL('/iih-essentials/DataService/Aggregations', `https://${this.authConfig.iedIp}`);
      
      const response = await this.fetchWithAuth(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la récupération des agrégations:', errorText);
        return { 
          success: false, 
          message: `Erreur lors de la récupération des agrégations: ${errorText}`,
          aggregations: [] 
        };
      }
      
      const aggregations = await response.json();
      console.log(`${aggregations.length} agrégations récupérées`);
      
      return { 
        success: true, 
        message: `${aggregations.length} agrégations récupérées avec succès`,
        aggregations: aggregations 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la récupération des agrégations:', errorMessage);
      return { 
        success: false, 
        message: `Erreur lors de la récupération des agrégations: ${errorMessage}`,
        aggregations: [] 
      };
    }
  }

  /**
   * Méthode générique pour les appels API
   */
  async call(config: {
    method: string;
    url: string;
    data?: any;
  }): Promise<any> {
    const response = await this.axios({
      method: config.method,
      url: config.url,
      data: config.data
    });
    return response.data;
  }

  /**
   * Méthode spécifique pour appliquer la rétention
   */
  async applyRetention(variableId: string, retentionConfig: any): Promise<void> {
    try {
      console.log(`Application de la rétention pour la variable ${variableId}...`);
      
      // S'assurer que sourceTypeId est correctement défini
      if (retentionConfig.dataRetention) {
        if (!retentionConfig.dataRetention.sourceTypeId && retentionConfig.dataRetention.sourceType) {
          retentionConfig.dataRetention.sourceTypeId = retentionConfig.dataRetention.sourceType;
          delete retentionConfig.dataRetention.sourceType;
        }
      }
      
      const url = `${this.getBaseApiUrl()}/DataService/Variables/${variableId}/DataRetention`;
      console.log(`URL pour la rétention: ${url}`);
      
      const response = await this.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(retentionConfig)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de l'application de la rétention:`, errorText);
        throw new Error(`Erreur lors de l'application de la rétention: ${errorText}`);
      }
      
      console.log(`✅ Rétention appliquée avec succès pour ${variableId}`);
    } catch (error) {
      console.error(`Erreur lors de l'application de la rétention pour ${variableId}:`, error);
      throw error;
    }
  }

  /**
   * Configure la rétention des données pour toutes les agrégations existantes
   * @param retentionDays Nombre de jours de rétention (par défaut 6 ans)
   * @returns Résultat de l'opération avec statistiques
   */
  async configureDataRetentionForAggregations(retentionDays: number = 6 * 365): Promise<{
    success: boolean;
    message: string;
    stats: {
      total: number;
      success: number;
      failed: number;
      skipped: number;
    }
  }> {
    console.log(`Configuration de la rétention des données à ${retentionDays} jours pour toutes les agrégations...`);
    
    // Statistiques
    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    try {
      // Récupérer toutes les variables
      const variablesResponse = await this.getAllVariables();
      if (!variablesResponse.success) {
        throw new Error(`Échec de la récupération des variables: ${variablesResponse.message}`);
      }
      
      const variables = variablesResponse.variables || [];
      
      // Pour chaque variable, récupérer et configurer ses agrégations
      for (const variable of variables) {
        try {
          // Récupérer les agrégations pour cette variable
          const aggregations = await this.getAggregationsForVariable(variable.id);
          
          for (const aggregation of aggregations) {
            stats.total++;
            
            try {
              // Configurer la rétention des données pour cette agrégation
              await this.setDataRetention({
                sourceId: aggregation.id,
                sourceTypeId: 'aggregation',
                settings: {
                  timeSettings: {
                    timeRange: {
                      base: 'year',
                      factor: 6  // 6 ans directement au lieu de convertir en jours
                    }
                  }
                }
              });
              
              stats.success++;
            } catch (error) {
              console.error(`Erreur lors de la configuration de la rétention pour l'agrégation ${aggregation.id}:`, error);
              stats.failed++;
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des agrégations pour la variable ${variable.id}:`, error);
        }
      }
      
      return {
        success: stats.success > 0,
        message: `Rétention configurée pour ${stats.success}/${stats.total} agrégations.`,
        stats
      };
    } catch (error) {
      console.error('Erreur lors de la configuration de la rétention des données:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stats
      };
    }
  }

  /**
   * Récupère la configuration de rétention des données pour une variable ou une agrégation
   * @param sourceId ID de la variable ou de l'agrégation
   * @param sourceType Type de source ('variable' ou 'aggregation')
   * @returns Configuration de rétention actuelle
   */
  async getDataRetention(sourceId: string, sourceType: 'variable' | 'aggregation'): Promise<any> {
    try {
      console.log(`Récupération de la configuration de rétention pour ${sourceType} ${sourceId}...`);
      
      // Construire l'URL selon le type de source
      let url: string;
      if (sourceType === 'variable') {
        url = `${this.getBaseApiUrl()}/DataService/Variables/${sourceId}/DataRetention`;
      } else if (sourceType === 'aggregation') {
        url = `${this.getBaseApiUrl()}/DataService/Aggregations/${sourceId}/DataRetention`;
      } else {
        throw new Error(`Type de source non pris en charge: ${sourceType}`);
      }
      
      console.log(`URL pour la récupération de la rétention: ${url}`);
      
      const response = await this.fetchWithAuth(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de la récupération de la configuration de rétention:`, errorText);
        throw new Error(`Erreur lors de la récupération de la configuration de rétention: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Configuration de rétention récupérée pour ${sourceType} ${sourceId}`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la configuration de rétention pour ${sourceType} ${sourceId}:`, error);
      throw error;
    }
  }

  /**
   * Crée des assets hiérarchiquement en résolvant les dépendances parent/enfant.
   * @param assetsToCreate Liste des assets à créer, avec parentId sous forme de chemin.
   * @returns Liste des assets créés avec leurs iihId.
   */
  async createAssetsHierarchically(assetsToCreate: AssetToCreateHierarchically[]): Promise<IIHAsset[]> {
    console.log(`Tentative de création hiérarchique de ${assetsToCreate.length} assets...`);

    if (!assetsToCreate || assetsToCreate.length === 0) {
      console.log("Aucun asset à créer.");
      return [];
    }

    // Map pour stocker les ID IIH des assets créés, indexés par leur chemin ('/'-separated string)
    const createdAssetsMap = new Map<string, string>(); // Map<pathString, iihId>
    const createdAssets: IIHAsset[] = []; // Array to store the final created assets
    const creationErrors: any[] = []; // Array to store errors during creation

    try {
      // 1. Récupérer l'asset racine pour les assets de premier niveau
      const rootAsset = await this.getRootAsset();
      const rootAssetId = rootAsset.assetId;
      console.log(`Asset racine récupéré: ${rootAsset.name} (ID: ${rootAssetId})`);
      createdAssetsMap.set('', rootAssetId); // La racine correspond au chemin vide

      // 2. Trier les assets par profondeur de chemin pour créer les parents avant les enfants
      assetsToCreate.sort((a, b) => (a.path || []).length - (b.path || []).length);

      console.log('Assets triés par profondeur:', assetsToCreate.map(a => ({ name: a.name, path: a.path })));

      // 3. Créer les assets un par un en résolvant le parentId
      for (const assetData of assetsToCreate) {
        const assetPath = assetData.path || []; 
        const parentPathArray = assetPath.slice(0, -1); 
        const parentPathString = parentPathArray.join('/');
        const currentPathString = assetPath.join('/');

        console.log(`Traitement de l'asset: ${assetData.name}, Path: ${currentPathString}, Parent Path: ${parentPathString}`);

        // Check if already created (based on path)
        if (createdAssetsMap.has(currentPathString)) {
           console.log(`  -> Asset avec chemin ${currentPathString} déjà traité/créé. Ignoré.`);
           continue;
        }

        // Déterminer le parentId IIH
        let parentId: string | null = null;
        if (assetPath.length === 0) {
          console.warn(`  Asset sans chemin trouvé: ${assetData.name}. Tentative d'utilisation de la racine.`);
          parentId = rootAssetId;
        } else if (parentPathArray.length === 0) {
          parentId = rootAssetId;
          console.log(`  Parent résolu pour ${assetData.name}: Racine (ID: ${parentId})`);
        } else {
          parentId = createdAssetsMap.get(parentPathString) || null;
          if (parentId) {
             console.log(`  Parent résolu pour ${assetData.name}: ${parentPathString} (ID: ${parentId})`);
          } else {
              console.error(`❌ Impossible de trouver le parentId IIH pour l'asset ${assetData.name} avec le chemin parent '${parentPathString}'. Ignoré.`);
              creationErrors.push({ assetName: assetData.name, path: currentPathString, error: 'Parent ID not found in cache' });
              continue; // Skip this asset if parent cannot be resolved
          }
        }

        // Préparer les données pour la création (sans le chemin temporaire et avec le vrai parentId)
        const assetToCreateApi: Partial<IIHAsset> = {
          ...assetData,
          name: sanitizeNameForVariable(assetData.name || ''),
          parentId: parentId,
        };
        delete (assetToCreateApi as any).path; // Use type assertion to delete path

        try {
          console.log(`  Création de l'asset: ${assetToCreateApi.name} avec parentId: ${parentId}...`);
          const createdAsset = await this.createAsset(assetToCreateApi);
          console.log(`  ✅ Asset créé: ${createdAsset.name} (ID IIH: ${createdAsset.assetId})`);

          createdAssetsMap.set(currentPathString, createdAsset.assetId); // Store ID by path
          createdAssets.push(createdAsset); // Add to the list of successfully created assets

        } catch (createError: any) {
          console.error(`  ❌ Erreur lors de la création de l'asset ${assetData.name}:`, createError);
          creationErrors.push({ assetName: assetData.name, path: currentPathString, error: createError?.message || createError });
        }
        // Add a small delay between asset creations
        await new Promise(resolve => setTimeout(resolve, 50)); 
      } // End for loop

      console.log(`Création hiérarchique terminée. ${createdAssets.length} assets créés sur ${assetsToCreate.length} demandés.`);
      if (creationErrors.length > 0) {
          console.error("Erreurs rencontrées lors de la création hiérarchique:", creationErrors);
          // Optionally throw an error or handle partial success
          // throw new Error(`Failed to create ${creationErrors.length} assets hierarchically.`);
      }
      return createdAssets;

    } catch (error: any) {
      console.error('Erreur majeure lors de la création hiérarchique des assets:', error);
      // Return potentially partially created assets along with reporting the major error
      if (creationErrors.length > 0) {
          console.error("Erreurs cumulées avant l'erreur majeure:", creationErrors);
      }
      throw new Error(`Échec majeur de la création hiérarchique: ${error.message}`); 
      // Or return createdAssets if partial success is acceptable:
      // return createdAssets; 
    }
  }
} 