# Plan d'implémentation pour rendre l'adapterId et les tags configurables

Je vais vous présenter un plan détaillé des modifications à apporter pour permettre à l'utilisateur de sélectionner l'adapterId et de configurer les mappings de tags avant l'import. Voici les fichiers à modifier et les changements nécessaires:

## 1. Création d'une nouvelle structure de configuration dans `types.ts`

**Fichier:** `src/modules/simple-importer/types.ts`

Vous devez ajouter une nouvelle interface pour stocker la configuration d'importation:

```typescript
// Configuration pour l'import
export interface ImportConfiguration {
  adapterId: string;
  tagMappings: {
    consumption: string;      // Tag pour la consommation
    productionPcs: string;    // Tag pour la production en pièces
    productionKg: string;     // Tag pour la production en kg
    ipeTag: string;           // Tag pour IPE
    ipeKgTag: string;         // Tag pour IPE en kg
    sensorStatus: string;     // Tag pour l'état du capteur
  };
  // Autres configurations potentielles
  defaultEnergyType?: string; // Type d'énergie par défaut si non détecté
}

// Configuration par défaut
export const DEFAULT_IMPORT_CONFIG: ImportConfiguration = {
  adapterId: "913c0a4389d24496bb5222368d573b1b", // ID par défaut actuel
  tagMappings: {
    consumption: "conso",
    productionPcs: "prod",
    productionKg: "prod_kg",
    ipeTag: "ipe",
    ipeKgTag: "ipe_kg",
    sensorStatus: "etat"
  },
  defaultEnergyType: "elec"
};
```

## 2. Création d'une API pour récupérer les adapters disponibles

**Nouveau fichier:** `src/app/api/adapters/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import nodeFetch from 'node-fetch';
import https from 'https';
import http from 'http';

// Agents pour les requêtes HTTP/HTTPS
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent();

export async function GET() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    const headersList = headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    
    // Construction de l'URL
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'http://' + baseUrl;
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Adapters`;
    console.log('URL pour récupérer les adapters:', url);
    
    // Déterminer quel agent utiliser selon le protocole
    const agent = baseUrl.startsWith('https') ? httpsAgent : httpAgent;
    
    // Effectuer la requête à l'API IIH
    const response = await nodeFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      },
      agent: agent,
      timeout: 10000 // Timeout après 10 secondes
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur lors de la récupération des adapters:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `Erreur API IIH: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération des adapters:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}
```

**Nouveau fichier:** `src/app/api/adapters/[id]/browse/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import nodeFetch from 'node-fetch';
import https from 'https';
import http from 'http';

// Agents pour les requêtes HTTP/HTTPS
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    const adapterId = params.id;
    if (!adapterId) {
      return NextResponse.json(
        { error: 'ID d\'adapter manquant' },
        { status: 400 }
      );
    }
    
    const headersList = headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    
    // Construction de l'URL
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'http://' + baseUrl;
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Adapters/${adapterId}/browse`;
    console.log(`URL pour parcourir l'adapter ${adapterId}:`, url);
    
    // Déterminer quel agent utiliser selon le protocole
    const agent = baseUrl.startsWith('https') ? httpsAgent : httpAgent;
    
    // Effectuer la requête à l'API IIH
    const response = await nodeFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      },
      agent: agent,
      timeout: 15000 // Timeout après 15 secondes car le browsing peut prendre du temps
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la navigation dans l'adapter ${adapterId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `Erreur API IIH: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la navigation dans l\'adapter:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}
```

## 3. Mise à jour du fichier d'API pour utiliser les classes IIH

**Fichier:** `src/modules/simple-importer/api.ts`

Ajoutez des méthodes pour récupérer les adapters et les tags:

```typescript
// Ajouter ces méthodes à la classe IIHApi

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
```

## 4. Mise à jour de l'importateur pour utiliser la configuration personnalisée

**Fichier:** `src/modules/simple-importer/importer.ts`

Modifiez la classe SimpleImporter pour accepter et utiliser la configuration d'import:

```typescript
// Dans la classe SimpleImporter, ajoutez un paramètre de configuration

private _importConfig: ImportConfiguration;

constructor(authConfig: AuthConfig, importConfig?: Partial<ImportConfiguration>) {
  this.api = new IIHApi(authConfig);
  
  // Fusionner la configuration par défaut avec celle fournie
  this._importConfig = {
    ...DEFAULT_IMPORT_CONFIG,
    ...importConfig
  };
  
  console.log('SimpleImporter initialisé avec la configuration:', {
    authConfig: {
      baseUrl: authConfig.baseUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.token
    },
    importConfig: this._importConfig
  });
}

// Ensuite, mettez à jour toutes les méthodes qui utilisaient des valeurs codées en dur pour utiliser this._importConfig

private createConsumptionVariable(assetId: string, assetName: string, energyType: string, unit: string): IIHVariable {
  // [...]
  
  return {
    variableName: variableName,
    dataType: 'Double',
    assetId: assetId,
    unit: unit,
    description: `Consommation d'énergie (${normalizedEnergyType}) pour ${assetName}`,
    // Utiliser la configuration personnalisée
    adapterId: this._importConfig.adapterId,
    connectionName: cleanAssetName,
    topic: this._importConfig.tagMappings.consumption,
    store: true,
    sourceType: "Tag"
  };
}

private createSensorStatusVariable(assetId: string, assetName: string): IIHVariable {
  // [...]
  
  return {
    variableName: variableName,
    dataType: 'String',
    assetId: assetId,
    description: `État du capteur pour ${assetName}`,
    // Utiliser la configuration personnalisée
    adapterId: this._importConfig.adapterId,
    connectionName: cleanAssetName,
    topic: this._importConfig.tagMappings.sensorStatus,
    store: true,
    sourceType: "Tag"
  };
}

// De même pour les autres méthodes qui créent des variables
```

## 5. Mise à jour du simpleAssetImporter.ts pour prendre en compte la configuration

**Fichier:** `src/modules/simple-importer/simpleAssetImporter.ts`

```typescript
// Mettez à jour les fonctions pour accepter un paramètre de configuration

export async function createVariablesForLevel5Assets(
  assets: any[],
  importConfig?: Partial<ImportConfiguration>
) {
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

export async function createVariablesHierarchiques(
  assets: any[],
  importConfig?: Partial<ImportConfiguration>
): Promise<ImportResponse> {
  try {
    console.log('Création de variables hiérarchiques pour tous les niveaux...');
    console.log(`Nombre total d'assets : ${assets.length}`);
    
    // Récupérer la configuration d'authentification
    const authConfig = getAuthConfig();
    console.log('Configuration d\'authentification:', authConfig);
    
    // Vérifier que la configuration est disponible
    if (!authConfig) {
      throw new Error('Configuration d\'authentification manquante');
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
```

## 6. Mise à jour du fichier index.ts pour exporter la version modifiée

**Fichier:** `src/modules/simple-importer/index.ts`

```typescript
// Mettre à jour la fonction createSimpleImporter

export function createSimpleImporter(
  baseUrl: string, 
  token: string, 
  iedIp: string,
  importConfig?: Partial<ImportConfiguration>
) {
  return new SimpleImporter(
    {
      baseUrl,
      token,
      iedIp
    },
    importConfig
  );
}
```

## 7. Mise à jour du modal d'import pour permettre la configuration

**Fichier:** `src/components/FlexibleImportValidationModal.tsx`

C'est ici que se trouve la partie la plus significative, car nous allons ajouter une étape supplémentaire pour la configuration:

```tsx
// Importations supplémentaires
import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, X, RefreshCw, Settings } from 'lucide-react';
import { FlexibleProcessedData } from '@/types/sankey';
import { 
  importFlexibleData, 
  createVariablesHierarchiques, 
  ImportConfiguration,
  DEFAULT_IMPORT_CONFIG
} from '@/modules/simple-importer';
import { IIHApi } from '@/modules/simple-importer/api';
import { getAuthConfig } from '@/lib/auth';

// Modifier la liste des étapes pour ajouter une étape de configuration
const steps: Step[] = [
  // ... vos étapes existantes ...
  
  // Ajouter une nouvelle étape pour la configuration
  {
    title: "Configuration de l'import",
    description: "Configuration des paramètres d'import vers IIH",
    validate: () => {
      // Cette étape est toujours valide car elle permet de configurer
      return {
        isValid: true,
        errors: [],
        details: []
      };
    }
  }
];

// Dans le composant FlexibleImportValidationModal, ajoutez l'état pour la configuration
export function FlexibleImportValidationModal({ 
  isOpen, 
  onClose, 
  data, 
  rawData,
  onImportSuccess 
}: FlexibleImportValidationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<Array<{ isValid: boolean; errors: string[]; details?: any[] } | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ajoutez ces états pour la configuration
  const [adapters, setAdapters] = useState<any[]>([]);
  const [loadingAdapters, setLoadingAdapters] = useState(false);
  const [selectedAdapter, setSelectedAdapter] = useState<string>('');
  const [adapterTags, setAdapterTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [importConfig, setImportConfig] = useState<ImportConfiguration>({...DEFAULT_IMPORT_CONFIG});
  
  // Fonction pour charger les adapters disponibles
  const loadAdapters = async () => {
    try {
      setLoadingAdapters(true);
      setError(null);
      
      const authConfig = getAuthConfig();
      if (!authConfig) {
        throw new Error('Non authentifié');
      }
      
      const api = new IIHApi(authConfig);
      const adaptersData = await api.getAdapters();
      
      setAdapters(adaptersData);
      
      // Si on a des adapters et aucun n'est sélectionné, sélectionner le premier actif
      if (adaptersData.length > 0 && !selectedAdapter) {
        const activeAdapter = adaptersData.find(a => a.active) || adaptersData[0];
        setSelectedAdapter(activeAdapter.id);
        setImportConfig(prev => ({
          ...prev,
          adapterId: activeAdapter.id
        }));
        
        // Charger les tags pour cet adapter
        loadAdapterTags(activeAdapter.id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des adapters:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des adapters');
    } finally {
      setLoadingAdapters(false);
    }
  };
  
  // Fonction pour charger les tags d'un adapter
  const loadAdapterTags = async (adapterId: string) => {
    if (!adapterId) return;
    
    try {
      setLoadingTags(true);
      setError(null);
      
      const authConfig = getAuthConfig();
      if (!authConfig) {
        throw new Error('Non authentifié');
      }
      
      const api = new IIHApi(authConfig);
      const tagsData = await api.getAdapterTags(adapterId);
      
      setAdapterTags(tagsData);
    } catch (err) {
      console.error(`Erreur lors du chargement des tags pour l'adapter ${adapterId}:`, err);
      setError(err instanceof Error ? err.message : `Erreur lors du chargement des tags pour l'adapter ${adapterId}`);
    } finally {
      setLoadingTags(false);
    }
  };
  
  // Charger les adapters au montage du composant ou à l'ouverture du modal
  useEffect(() => {
    if (isOpen && currentStep === steps.length - 1) {
      loadAdapters();
    }
  }, [isOpen, currentStep]);
  
  // Gérer le changement d'adapter sélectionné
  const handleAdapterChange = (adapterId: string) => {
    setSelectedAdapter(adapterId);
    setImportConfig(prev => ({
      ...prev,
      adapterId
    }));
    
    // Charger les tags pour cet adapter
    loadAdapterTags(adapterId);
  };
  
  // Gérer le changement de mapping de tag
  const handleTagMappingChange = (tagKey: keyof ImportConfiguration['tagMappings'], value: string) => {
    setImportConfig(prev => ({
      ...prev,
      tagMappings: {
        ...prev.tagMappings,
        [tagKey]: value
      }
    }));
  };
  
  // Fonction pour rendre l'étape de configuration
  const renderConfigurationStep = () => {
    return (
      <div className="space-y-6">
        {/* Section Adapter */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Sélection de l'Adapter
          </h4>
          
          <div className="flex items-center gap-2 mb-4">
            <select
              className="bg-gray-700 text-white rounded px-3 py-2 flex-1"
              value={selectedAdapter}
              onChange={(e) => handleAdapterChange(e.target.value)}
              disabled={loadingAdapters}
            >
              {adapters.length === 0 && (
                <option value="">Aucun adapter disponible</option>
              )}
              {adapters.map(adapter => (
                <option key={adapter.id} value={adapter.id}>
                  {adapter.name} ({adapter.id}) {adapter.active ? '- Actif' : ''}
                </option>
              ))}
            </select>
            
            <button 
              className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              onClick={loadAdapters}
              disabled={loadingAdapters}
            >
              <RefreshCw className={`h-5 w-5 ${loadingAdapters ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {selectedAdapter && (
            <div className="bg-gray-900 p-3 rounded text-sm">
              <p className="text-gray-300">
                Adapter sélectionné: <span className="text-white font-medium">{adapters.find(a => a.id === selectedAdapter)?.name || selectedAdapter}</span>
              </p>
              {adapterTags.length > 0 && (
                <p className="text-gray-300 mt-1">
                  {adapterTags.length} tags disponibles
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Section Mapping de Tags */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Configuration des Tags</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tag de consommation */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag de consommation:</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.consumption}
                onChange={(e) => handleTagMappingChange('consumption', e.target.value)}
                list="consumption-tags"
              />
              <datalist id="consumption-tags">
                {adapterTags.map(tag => (
                  <option key={`consumption-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
            
            {/* Tag d'état capteur */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag d'état capteur:</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.sensorStatus}
                onChange={(e) => handleTagMappingChange('sensorStatus', e.target.value)}
                list="status-tags"
              />
              <datalist id="status-tags">
                {adapterTags.map(tag => (
                  <option key={`status-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
            
            {/* Tag de production (pcs) */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag de production (pcs):</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.productionPcs}
                onChange={(e) => handleTagMappingChange('productionPcs', e.target.value)}
                list="production-tags"
              />
              <datalist id="production-tags">
                {adapterTags.map(tag => (
                  <option key={`prod-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
            
            {/* Tag de production (kg) */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag de production (kg):</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.productionKg}
                onChange={(e) => handleTagMappingChange('productionKg', e.target.value)}
                list="production-kg-tags"
              />
              <datalist id="production-kg-tags">
                {adapterTags.map(tag => (
                  <option key={`prod-kg-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
            
            {/* Tag IPE */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag IPE:</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.ipeTag}
                onChange={(e) => handleTagMappingChange('ipeTag', e.target.value)}
                list="ipe-tags"
              />
              <datalist id="ipe-tags">
                {adapterTags.map(tag => (
                  <option key={`ipe-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
            
            {/* Tag IPE (kg) */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag IPE (kg):</label>
              <input
                type="text"
                className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                value={importConfig.tagMappings.ipeKgTag}
                onChange={(e) => handleTagMappingChange('ipeKgTag', e.target.value)}
                list="ipe-kg-tags"
              />
              <datalist id="ipe-kg-tags">
                {adapterTags.map(tag => (
                  <option key={`ipe-kg-${tag.tagName}`} value={tag.tagName} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
        
        {/* Section Type d'énergie par défaut */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Type d'énergie par défaut</h4>
          
          <select
            className="bg-gray-700 text-white rounded px-3 py-2 w-full"
            value={importConfig.defaultEnergyType || 'elec'}
            onChange={(e) => setImportConfig(prev => ({
              ...prev,
              defaultEnergyType: e.target.value
            }))}
          >
            <option value="elec">Électricité</option>
            <option value="gaz">Gaz</option>
            <option value="eau">Eau</option>
            <option value="air">Air</option>
          </select>
        </div>
      </div>
    );
  };
  
  // Mettre à jour la fonction handleImport pour utiliser la configuration
  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import des données hiérarchiques vers IIH
      const result = await importFlexibleData(data);
      
      if (result.success) {
        console.log('Import IIH réussi:', result);
        
        // Création des variables pour tous les niveaux d'assets
        if (result.assets && result.assets.length > 0) {
          console.log(`Création des variables hiérarchiques pour ${result.assets.length} assets...`);
          
          try {
            // Utiliser la configuration personnalisée pour la création des variables
            const variablesResult = await createVariablesHierarchiques(
              result.assets,
              importConfig // Passer la configuration
            );
            
            if (variablesResult.success) {
              console.log('Création des variables hiérarchiques réussie:', variablesResult);
              // Fusionner les résultats
              result.variables = variablesResult.variables;
              result.message += `. ${variablesResult.message}`;
            } else {
              console.warn('Échec de la création des variables hiérarchiques:', variablesResult.message);
              // Ajouter un message d'avertissement sans échouer l'opération complète
              result.message += `. Attention: ${variablesResult.message}`;
            }
          } catch (varError) {
            console.error('Erreur lors de la création des variables hiérarchiques:', varError);
            // Ne pas échouer l'opération principale si les variables ne peuvent pas être créées
            result.message += `. Échec de la création des variables: ${varError instanceof Error ? varError.message : 'erreur inconnue'}`;
          }
        } else {
          console.warn('Aucun asset créé, impossible de créer les variables');
          result.message += '. Aucun asset créé, impossible de créer les variables';
        }
        
        onImportSuccess?.();
      } else {
        throw new Error(result.message || 'Échec de l\'import IIH');
      }
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier le rendu pour inclure l'étape de configuration
  const renderStepContent = () => {
    // Si c'est l'étape de configuration, afficher l'interface de configuration
    if (currentStep === steps.length - 1) {
      return renderConfigurationStep();
    }
    
    // Sinon, afficher le contenu normal de l'étape
    return (
      <>
        {/* Validation results */}
        {stepResults[currentStep] && stepResults[currentStep]?.errors && stepResults[currentStep].errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreurs détectées</span>
            </div>
            <ul className="list-disc list-inside text-red-300">
              {stepResults[currentStep].errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Details */}
        {stepResults[currentStep]?.details && steps[currentStep].renderDetails && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {steps[currentStep].renderDetails(stepResults[currentStep]?.details!)}
          </div>
        )}
      </>
    );
  };

  // Mise à jour du rendu principal du composant
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Validation de l'import</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step indicator */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-2">{steps[currentStep].title}</h3>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between">
          <div className="flex-1">
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            
            {/* Navigation entre les étapes */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => setCurrentStep(prevStep => prevStep + 1)}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg ${
                  canProceed
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            )}
            
            {currentStep > 0 && currentStep < steps.length && (
              <button
                onClick={() => setCurrentStep(prevStep => prevStep - 1)}
                className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Précédent
              </button>
            )}
            
            {currentStep === steps.length - 1 && (
              <button
                onClick={handleImport}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Importer vers IIH
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
```

## 8. Mise à jour de la route de l'API pour la création en masse de variables

**Fichier:** `src/app/api/variables/bulk/route.ts`

```typescript
// Modification au début du POST pour prendre en compte l'adapterId configuré

export async function POST(request: Request) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    const variables = await request.json();

    if (!Array.isArray(variables)) {
      return NextResponse.json(
        { error: 'Format invalide. Un tableau de variables est attendu.' },
        { status: 400 }
      );
    }

    console.log(`Création en masse de ${variables.length} variables`);

    // Vérifier les champs requis et préparer les données pour l'API IIH
    const invalidVariables: Array<{
      variable: any;
      missing: string[];
    }> = [];
    const iihVariables = variables.map(variable => {
      // Vérification des champs requis
      if (!variable.variableName || !variable.assetId) {
        const missing = [];
        if (!variable.variableName) missing.push('variableName');
        if (!variable.assetId) missing.push('assetId');
        
        console.warn(`⚠️ Variable invalide: champs manquants [${missing.join(', ')}]:`, variable);
        invalidVariables.push({
          variable,
          missing
        });
        return null;
      }

      // Log pour le mapping de type de données
      const mappedDataType = mapDataType(variable.dataType || 'Float');
      if (mappedDataType !== variable.dataType) {
        console.log(`Conversion du type de données: ${variable.dataType} -> ${mappedDataType} pour ${variable.variableName}`);
      }

      // Préparer l'objet de base
      const iihVar: any = {
        variableName: variable.variableName,
        assetId: variable.assetId,
        description: variable.description || '',
        dataType: mappedDataType,
        store: true
      };
      
      // Ajouter l'unité si spécifiée
      if (variable.unit) {
        iihVar.unit = variable.unit;
      }
      
      // Configuration selon le type de source
      if (variable.sourceType === 'Rule') {
        // Configuration pour les règles
        iihVar.sourceType = 'Rule';
        
        if (variable.formula) {
          iihVar.formula = variable.formula;
          
          // Ajouter la propriété rule requise par l'API IIH
          iihVar.rule = {
            formula: variable.formula,
            tags: variable.rule?.tags || [] // Tableau vide requis par l'API
          };
        } else if (variable.rule && variable.rule.formula) {
          // Si formula n'est pas directement définie mais existe dans rule
          iihVar.formula = variable.rule.formula;
          iihVar.rule = {
            ...variable.rule,
            tags: variable.rule.tags || [] // Assurer que tags existe
          };
        } else {
          console.warn(`⚠️ Variable de type Rule sans formule: ${variable.variableName}`);
          invalidVariables.push({
            variable,
            missing: ['formula ou rule.formula']
          });
          return null;
        }
      } else {
        // Configuration par défaut ou pour les tags
        iihVar.sourceType = variable.sourceType || 'Tag';
        
        // Ajouter les propriétés spécifiques aux tags si nécessaire
        if (iihVar.sourceType === 'Tag') {
          // UTILISER L'ADAPTER ID FOURNI PAR L'UTILISATEUR
          iihVar.adapterId = variable.adapterId || "913c0a4389d24496bb5222368d573b1b";
          iihVar.connectionName = variable.connectionName || 
                                variable.assetName || 
                                variable.variableName.split('_').pop();
          
          // Utiliser le topic fourni par l'utilisateur
          iihVar.topic = variable.topic || "conso";
          
          // Configuration supplémentaire pour les tags
          iihVar.tag = {
            adapterId: iihVar.adapterId,
            connectionName: iihVar.connectionName,
            tagName: iihVar.topic,
            dataType: mappedDataType
          };
        }
      }
      
      return iihVar;
    }).filter(v => v !== null);

    // ... le reste du code reste inchangé ...
```

## Résumé des modifications

Ces modifications vous permettront d'ajouter une étape de configuration dans le processus d'import qui laissera à l'utilisateur le choix de l'adapterId et des mappings de tags. Voici un résumé des changements:

1. **Nouvelles structures de données dans `types.ts`**:
   - Une interface `ImportConfiguration` pour structurer les données de configuration
   - Une constante `DEFAULT_IMPORT_CONFIG` avec les valeurs par défaut

2. **Nouvelles API endpoints pour récupérer les adapters et leurs tags**:
   - `/api/adapters` - Récupère la liste des adapters disponibles
   - `/api/adapters/[id]/browse` - Récupère les tags disponibles pour un adapter spécifique

3. **Mise à jour de la classe IIHApi avec des méthodes pour récupérer les adapters et leurs tags**:
   - `getAdapters()` - Récupère tous les adapters disponibles
   - `getAdapterTags(adapterId)` - Récupère les tags pour un adapter spécifique

4. **Modifications de la classe SimpleImporter pour utiliser la configuration**:
   - Accepte un paramètre de configuration supplémentaire dans le constructeur
   - Utilise cette configuration lors de la création des variables

5. **Mise à jour des fonctions d'export**:
   - `createSimpleImporter` - Accepte maintenant un paramètre de configuration
   - `createVariablesForLevel5Assets` et `createVariablesHierarchiques` - Transmettent la configuration

6. **Ajout d'une étape de configuration dans le modal d'import**:
   - Une nouvelle étape pour configurer l'adapter et les mappings de tags
   - Des champs de sélection pour tous les paramètres importants
   - Des listes déroulantes avec auto-complétion pour faciliter le choix des tags

7. **Modifications de la route API de création en masse de variables**:
   - Utilise l'adapterId fourni par l'utilisateur plutôt qu'une valeur codée en dur

Ces modifications permettront aux utilisateurs de personnaliser complètement la configuration d'import, ce qui rendra votre outil beaucoup plus flexible et adapté à différents environnements IIH.