// Types pour la configuration
export interface AuthConfig {
  baseUrl: string;
  token: string;
  iedIp: string;
  authToken?: string;
}

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
    // Tags pour les différents types d'énergie
    consumptionElec?: string; // Tag pour la consommation électrique
    consumptionGaz?: string;  // Tag pour la consommation de gaz
    consumptionEau?: string;  // Tag pour la consommation d'eau
    consumptionAir?: string;  // Tag pour la consommation d'air
    // Nouveaux tags pour IPE par type d'énergie
    ipeElecTag?: string;      // Tag pour IPE électricité
    ipeGazTag?: string;       // Tag pour IPE gaz
    ipeEauTag?: string;       // Tag pour IPE eau
    ipeAirTag?: string;       // Tag pour IPE air
    ipeKgElecTag?: string;    // Tag pour IPE kg électricité
    ipeKgGazTag?: string;     // Tag pour IPE kg gaz
    ipeKgEauTag?: string;     // Tag pour IPE kg eau
    ipeKgAirTag?: string;     // Tag pour IPE kg air
    ipe?: string;               // <-- AJOUT: Tag IPE générique (pour L5 si activé)
    productionPcsL5?: string; // Tag pour la production en pièces au niveau 5 si activé
  };
  // Autres configurations potentielles
  defaultEnergyType?: string; // Type d'énergie par défaut si non détecté
  includeIpeProdOnLastLevel?: boolean; // <-- AJOUT
}

// Configuration par défaut
export const DEFAULT_IMPORT_CONFIG: ImportConfiguration = {
  adapterId: "913c0a4389d24496bb5222368d573b1b", // ID par défaut actuel
  tagMappings: {
    consumption: "conso",
    productionPcs: "prod_quantite",
    productionKg: "prod_kg",
    ipeTag: "ipe",
    ipeKgTag: "ipe_kg",
    sensorStatus: "etat",
    // Valeurs par défaut pour les tags spécifiques par type d'énergie
    consumptionElec: "conso_elec",
    consumptionGaz: "conso_gaz",
    consumptionEau: "conso_eau",
    consumptionAir: "conso_air",
    // Nouveaux tags IPE par type d'énergie
    ipeElecTag: "IPE_elec_quantite",
    ipeGazTag: "IPE_gaz_quantite",
    ipeEauTag: "IPE_eau_quantite",
    ipeAirTag: "IPE_air_quantite",
    ipeKgElecTag: "IPE_elec_kg",
    ipeKgGazTag: "IPE_gaz_kg",
    ipeKgEauTag: "IPE_eau_kg",
    ipeKgAirTag: "IPE_air_kg",
    ipe: "ipe", // <-- AJOUT
    productionPcsL5: "prod", // <-- AJOUT pour L5
  },
  defaultEnergyType: "elec",
  includeIpeProdOnLastLevel: false, // <-- AJOUT (désactivé par défaut)
};

// Types pour les assets
export interface IIHAsset {
  assetId: string;
  name: string;
  parentId?: string;
  type?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Types pour les variables
export interface IIHVariable {
  variableName: string;
  dataType: 'Double' | 'String' | 'Integer' | 'Boolean' | 'Float';
  assetId: string;
  unit?: string;
  description?: string;
  adapterId?: string;
  connectionName?: string;
  topic?: string;
  sourceType?: 'Tag' | 'Rule' | 'None';
  formula?: string;
  rule?: {
    formula: string;
    tags?: any[]; // Tableau de tags requis par l'API IIH
  };
  tag?: {
    adapterId: string;
    connectionName: string;
    tagName: string;
    dataType: string;
  };
  store?: boolean;
  // Ajouter le support pour la configuration de rétention des données
  retention?: {
    settings: {
      timeSettings: {
        timeRange: {
          base: string;
          factor: number;
        }
      }
    }
  };
}

export interface IIHVariableResponse {
  variableId: string;
  variableName: string;
  assetId: string;
  dataType: string;
  unit?: string;
  description?: string;
  metadata?: any;
  aspectId?: string;
  aspectName?: string;
  adapterId?: string;
  topic?: string;
  store?: boolean;
  sourceType?: string;
  tag?: {
    adapterId?: string;
    connectionName?: string;
    tagName?: string;
    dataType?: string;
  };
  connected?: boolean;
  formula?: string;
  rule?: {
    formula: string;
    tags?: any[];
  };
}

export interface BulkCreateVariablesResponse {
  results: IIHVariableResponse[];
  errors?: {
    errorKey: string;
    message: string;
    variableName: string;
    assetId: string;
  }[];
}

// Types pour les réponses
export interface ImportResponse {
  success: boolean;
  message: string;
  asset?: IIHAsset;
  assets?: IIHAsset[];
  variables?: IIHVariableResponse[];
  error?: any;
  stats?: {
    totalAssets?: number;
    processedAssets?: number;
    totalVariables?: number;
    createdVariables?: number;
    failedVariables?: number;
    pendingAggregations?: number;
    aggregationsSuccess?: number; // Nombre d'agrégations créées avec succès
    aggregationsErrors?: number;  // Nombre d'erreurs lors de la création d'agrégations
  };
}

// Définir une nouvelle interface pour représenter les types d'énergies et leur configuration
export interface EnergyTypeConfig {
  name: string;        // Nom normalisé
  tag: string;         // Tag à utiliser (ex: "conso_elec")
  unit: string;        // Unité (kWh, m³, etc.)
  formulaPrefix?: string; // Préfixe pour les formules (si applicable)
}

// Configuration des types d'énergie
export const ENERGY_TYPES: Record<string, EnergyTypeConfig> = {
  'elec': { name: 'électricité', tag: 'conso_elec', unit: 'kWh' },
  'gaz': { name: 'gaz', tag: 'conso_gaz', unit: 'kWh' },
  'air': { name: 'air', tag: 'conso_air', unit: 'm³' },
  'eau': { name: 'eau', tag: 'conso_eau', unit: 'm³' }
};

// Définir une interface pour les métadonnées des assets
export interface AssetMetadata {
  level?: number;
  position?: string;
  energyType?: string;
  path?: string[];
  // Autres métadonnées potentielles
}

// *** ADDED Interfaces for getAllVariables response ***
export interface BasicVariableInfo {
    id?: string; 
    variableId?: string; 
    _id?: string; 
    name?: string; 
    variableName?: string; 
    dataType?: string;
    // Include other potential properties based on actual API responses
    metadata?: Record<string, any>; // Add metadata as it's often used
    assetId?: string; // Asset ID is also common
    unit?: string; // Unit might be present
    sourceType?: string; // Source type (Tag, Rule, etc.)
    retention?: any; // Retention settings
}

export interface GetAllVariablesResponse {
  success: boolean;
  message: string;
  variables: BasicVariableInfo[];
} 