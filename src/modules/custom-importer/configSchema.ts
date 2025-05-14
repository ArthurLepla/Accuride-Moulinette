// Interfaces pour l'import personnalisé IIH

/**
 * Represents a block in a naming pattern (either fixed text or a placeholder).
 */
export interface PatternBlock {
  id: string; // Unique ID for DndKit
  type: PatternBlockType;
  value: string; // Either the fixed text or the PlaceholderKey
}

/**
 * Defines possible placeholders for naming patterns.
 */
export type PlaceholderKey = 'assetName' | 'energyType' | 'levelName';

/**
 * Types of pattern blocks.
 */
export type PatternBlockType = 'text' | 'placeholder';

export interface CustomHierarchyLevel {
  name: string; // Nom du niveau (ex: "Secteur", "Atelier", "Machine")
  excelColumn: string; // Colonne Excel associée à ce niveau
}

export interface CustomVariableAggregationConfig {
  cycle: string; // ex: "5min", "1h", "1d"
  retention: number; // en années
}

export interface CustomVariableConfig {
  nameTemplate: string; // ex: "Consommation_Elec_{assetName}"
  dataType: string; // ex: "Float"
  unit: string; // ex: "kWh"
  adapterId: string;
  topicTemplate: string; // ex: "{assetName}"
  tagTemplate: string; // ex: "{assetName}_conso"
  aggregations: CustomVariableAggregationConfig[];
  retention: number; // en années
}

/**
 * Represents a rule for determining the unit of a variable based on a condition.
 */
export interface UnitRule {
  conditionField: string; // généralement "energyType"
  conditionValue: string; // ex: "elec", "gaz"
  unit?: string; // unité fixe si unitSource n'est pas "column"
  unitSource?: 'column'; // si l'unité vient d'une colonne
  unitColumn?: string; // colonne Excel pour l'unité
}

/**
 * Configuration for a generic variable defined at a specific hierarchy level.
 */
export interface LevelVariableConfig {
  id: string; // Unique ID for this variable config within the level
  baseName: string; // Conceptual name, e.g., "Consommation"
  displayNamePatternBlocks: PatternBlock[]; // Pattern to build the final display name
  dataType: 'Float' | 'Double' | 'Integer' | 'String' | 'Boolean';
  // Unit configuration
  unitSource: 'auto' | 'column' | 'ruleBased' | 'none'; // 'auto' might use global energy type, 'none' means no unit
  unitColumn?: string; // Used if unitSource is 'column' or in UnitRule
  unitRules?: UnitRule[]; // Used if unitSource is 'ruleBased'
  defaultUnit?: string; // Used if unitSource is 'ruleBased' and no rule matches
  defaultUnitColumn?: string; // Used if unitSource is 'ruleBased', no rule matches, and default is column-based
}

/**
 * Represents the mapping of a generic variable (defined per level) to a specific IIH tag.
 */
export interface TagMapping {
  levelIndex: number;           // Index of the hierarchy level
  variableId: string;           // ID of the LevelVariableConfig this mapping refers to
  selectedTag: string;          // The actual IIH tag name selected (e.g., "conso", "etat")
  connectionName?: string;      // The connection name for the tag
  tagPath?: string;             // The full path of the tag if needed
}

/**
 * Configuration d'un cycle d'agrégation
 */
export interface AggregationCycle {
  interval: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  value: number;  // ex: 5 minutes, 1 heure, etc.
  retention: number; // Nombre d'unités à conserver
}

/**
 * Configuration d'agrégation
 */
export interface AggregationConfig {
  defaultMethod: 'average' | 'sum' | 'min' | 'max' | 'count' | 'last';
  cycles: AggregationCycle[];
}

/**
 * Represents the complete configuration for a custom import process.
 */
export interface CustomImportConfig {
  selectedAdapterId: string | null;
  hierarchy: {
    levels: {
      columnName: string;
      levelVariables: LevelVariableConfig[]; // Uses updated LevelVariableConfig
    }[];
    energyTypeColumn?: string;
  };
  variables: Record<string, any>; // Placeholder for future use
  retention: {
    enable: boolean;
    years: number;
  };
  mappings?: Record<string, string>; 
  tagMappings: TagMapping[]; // Added for the new mapping step
  aggregation?: AggregationConfig; // Configuration d'agrégation
}

/** Default values for Retention Configuration */
export const DEFAULT_RETENTION_CONFIG = {
  enable: false,
  years: 0
};
