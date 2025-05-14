import type { CustomVariableConfig, CustomImportConfig, AggregationConfig } from './configSchema';
import { PlaceholderKey, PatternBlock, PatternBlockType, LevelVariableConfig } from './configSchema';
// Types principaux pour l'import personnalisé IIH

export * from './configSchema';

// Types additionnels pour le frontend flexible-import

export interface LevelVariableConfig {
  levelName: string;
  variables: CustomVariableConfig[];
}

export type PatternBlockType = 'text' | 'placeholder';

export interface PatternBlock {
  type: PatternBlockType;
  value: string;
}

export type PlaceholderKey = 'assetName' | 'variableName' | string;

export interface InitialHierarchyConfig {
  levels: { columnName: string }[];
  energyTypeColumn?: string;
}

// Définition des valeurs par défaut pour l'agrégation
export const DEFAULT_AGGREGATION_CONFIG: AggregationConfig = {
  defaultMethod: 'average',
  cycles: [
    { interval: 'hour', value: 1, retention: 24 },  // 24 heures 
    { interval: 'day', value: 1, retention: 30 }    // 30 jours
  ]
};

// Valeur par défaut pour la rétention
export const DEFAULT_RETENTION_CONFIG = {
  enable: true,
  years: 6,
};

// Valeur par défaut pour la configuration d'import personnalisé
export const DEFAULT_CUSTOM_IMPORT_CONFIG: CustomImportConfig = {
  selectedAdapterId: null,
  hierarchy: {
    levels: [],
    energyTypeColumn: undefined
  },
  variables: {},
  retention: DEFAULT_RETENTION_CONFIG,
  tagMappings: [],
  aggregation: DEFAULT_AGGREGATION_CONFIG
};

export interface UnitRule {
  conditionField: string; // ex: 'energyType'
  conditionValue: string; // ex: 'elec', 'gaz', etc.
  unit?: string;          // unité fixe
  unitSource?: 'fixed' | 'column';
  unitColumn?: string;    // nom de la colonne si unitSource === 'column'
}

// Ré-export des types pour faciliter l'import
export type {
  CustomImportConfig, 
  CustomVariableConfig, 
  LevelVariableConfig,
  PlaceholderKey,
  PatternBlock,
  PatternBlockType
}; 