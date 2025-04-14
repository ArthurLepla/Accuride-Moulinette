import { FlexibleProcessedData, HierarchyNode } from '@/types/sankey';

// ... (keep all existing types like AuthConfig, ImportResponse, IIHVariable, etc.)

// Define types for the pattern builder
export type PatternBlockType = 'text' | 'placeholder';
// Define valid placeholder keys
export type PlaceholderKey = 'assetName' | 'energyType' | 'levelName'; 

export interface PatternBlock {
  id: string; 
  type: PatternBlockType;
  value: string; // Holds text or PlaceholderKey
}

/**
 * Configuration for a single variable definition at a specific hierarchy level.
 */
export interface LevelVariableConfig {
  id: string; // Internal ID for React keys
  displayName: string; 
  namePatternBlocks: PatternBlock[]; 
  unitSource: 'auto' | 'column';
  unitColumn?: string;
  dataType?: 'Double' | 'String' | 'Integer' | 'Boolean' | 'Float'; 
}

/**
 * Configuration for a custom import process.
 * Aims for flexibility while maintaining reasonable defaults for simplicity.
 */
export interface CustomImportConfig {
  // Selected Adapter ID for tag creation
  selectedAdapterId: string | null;
  
  hierarchy: {
    // Array of column names defining the hierarchy levels, order matters.
    levels: Array<{ 
      columnName: string; 
      levelVariables: LevelVariableConfig[]; 
    }>; 
    // Optional: Column containing Energy Type information (used for unit 'auto' and potentially naming)
    energyTypeColumn?: string; 
  };
  variables: {
    // Global settings - keep namePattern string here for now
    namePattern: string; 
    // How to determine the unit for variables.
    unitSource: 'auto' | 'column'; 
    // Column name if unitSource is 'column'.
    unitColumn?: string;
    // Whether to automatically create Sum aggregations for consumption tags.
    createAggregations: boolean;
    // How to generate the Node ID for Tags.
    // 'auto': Generates ns=2;s=SanitizedVariableName
    // 'column': Reads Node ID from the specified column.
    nodeIdSource: 'auto' | 'column';
    // Column name if nodeIdSource is 'column'.
    nodeIdColumn?: string; 
  };
  retention: {
      // Enable data retention application?
      enable: boolean;
      // Number of years for data retention.
      years: number; 
  };
  mappings: {
    // Keep as placeholders for now
    tagRenaming: Array<{ original: string; new: string }>;
  };
}

// Default configuration providing sensible starting points
export const DEFAULT_CUSTOM_IMPORT_CONFIG: CustomImportConfig = {
  selectedAdapterId: null, // Default to null, user must select
  hierarchy: {
    levels: [], // Initialize with empty levels array
  },
  variables: {
    namePattern: 'Consommation_{energyType}_{assetName}', 
    unitSource: 'auto', 
    createAggregations: true,
    nodeIdSource: 'auto', // Default to automatic Node ID generation
  },
  retention: {
      enable: true, // Enable retention by default
      years: 7,     // Default to 7 years
  },
  mappings: {
    tagRenaming: [],
  },
};

/**
 * Represents the response structure for import operations.
 */
export interface ImportResponse {
  success: boolean;
  message?: string;
  error?: any; // Can be string, Error object, or other types
  // Add other relevant fields if the actual API response includes them, e.g.:
  // createdAssetCount?: number;
  // createdVariableCount?: number;
}

// Add other necessary types below if they are missing or need adjustment 

// Add the definition for InitialHierarchyConfig here and export it
export interface InitialHierarchyConfig {
  levels: Array<{ 
    columnName: string; 
    // Note: levelVariables are NOT part of the initial config passed as prop,
    // they are managed within the configurator's state.
  }>;
  energyTypeColumn?: string;
} 