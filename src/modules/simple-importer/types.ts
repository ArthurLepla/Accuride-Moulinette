// Types pour la configuration
export interface AuthConfig {
  baseUrl: string;
  token: string;
  iedIp: string;
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
    sensorStatus: "etat",
    // Valeurs par défaut pour les tags spécifiques par type d'énergie
    consumptionElec: "conso_elec",
    consumptionGaz: "conso_gaz",
    consumptionEau: "conso_eau",
    consumptionAir: "conso_air"
  },
  defaultEnergyType: "elec"
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
  dataType: 'Double' | 'String' | 'Integer' | 'Boolean' | 'Float' | 'Float32';
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
  store?: boolean;
}

export interface IIHVariableResponse {
  id: string;
  name: string;
  dataType: string;
  unit?: string;
  description?: string;
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