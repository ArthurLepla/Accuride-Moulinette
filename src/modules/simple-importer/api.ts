import { AuthConfig, IIHAsset, IIHVariable, BulkCreateVariablesResponse } from './types';

export class IIHApi {
  private authConfig: AuthConfig;

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig;
    console.log('IIHApi initialisé avec la configuration:', {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token
    });
  }

  async getRootAsset(): Promise<IIHAsset> {
    console.log('Tentative de récupération de l\'asset racine avec la configuration:', {
      baseUrl: this.authConfig.baseUrl,
      iedIp: this.authConfig.iedIp,
      hasToken: !!this.authConfig.token
    });

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify({
        baseUrl: this.authConfig.baseUrl,
        iedIp: this.authConfig.iedIp,
        authToken: this.authConfig.token
      })
    };

    console.log('Headers de la requête:', headers);

    const response = await fetch('/api/assets/root?includeChildren=false&includeBreadcrumb=false', { headers });

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
  }

  async createAsset(asset: Partial<IIHAsset>): Promise<IIHAsset> {
    console.log('Tentative de création d\'asset avec la configuration:', {
      baseUrl: this.authConfig.baseUrl,
      iedIp: this.authConfig.iedIp,
      hasToken: !!this.authConfig.token,
      asset
    });

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify({
        baseUrl: this.authConfig.baseUrl,
        iedIp: this.authConfig.iedIp,
        authToken: this.authConfig.token
      })
    };

    console.log('Headers de la requête:', headers);

    const response = await fetch('/api/assets', {
      method: 'POST',
      headers,
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
  }

  async createVariablesBulk(variables: IIHVariable[]): Promise<BulkCreateVariablesResponse> {
    console.log(`Tentative de création en masse de ${variables.length} variables`);

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Config': JSON.stringify({
        baseUrl: this.authConfig.baseUrl,
        iedIp: this.authConfig.iedIp,
        authToken: this.authConfig.token
      })
    };

    console.log('Headers de la requête:', headers);

    const response = await fetch('/api/variables/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify(variables)
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
  }

  /**
   * Récupère les assets enfants d'un asset donné
   * @param parentId ID de l'asset parent
   * @returns Liste des assets enfants
   */
  async getChildAssets(parentId: string): Promise<any[]> {
    try {
      console.log(`Récupération des assets enfants pour le parent: ${parentId}...`);
      const url = new URL(`/DataService/Assets?parentId=${parentId}`, this.authConfig.baseUrl);
      
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
      const url = new URL(`/DataService/Assets/${assetId}`, this.authConfig.baseUrl);
      
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
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authConfig.token}`
    };

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    };

    console.log(`Envoi d'une requête à ${url.split('?')[0]}`);
    return fetch(url, mergedOptions);
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
} 