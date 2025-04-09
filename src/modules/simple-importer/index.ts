import { SimpleImporter } from './importer';
import { getAuthConfig } from '@/lib/auth';
import { importSimpleTestAsset, importFlexibleData, createVariablesForLevel5Assets, createVariablesHierarchiques } from './simpleAssetImporter';
import { ImportConfiguration } from './types';

// Export the updateIIHStructureWithAggregations function from importer.ts
import { updateIIHStructureWithAggregations } from './importer';

export * from './types';
export * from './api';
export { SimpleImporter } from './importer';
export { 
  importSimpleTestAsset, 
  importFlexibleData, 
  createVariablesForLevel5Assets,
  createVariablesHierarchiques
} from './simpleAssetImporter';
export { updateIIHStructureWithAggregations }; // Export the function

/**
 * Crée une instance de SimpleImporter avec la configuration fournie
 */
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
      iedIp,
      authToken: token
    },
    importConfig
  );
}

// Export des types utiles
export type { ImportConfiguration } from './types';
export { DEFAULT_IMPORT_CONFIG } from './types'; 