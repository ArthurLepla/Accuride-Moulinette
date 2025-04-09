// Import shared types and API from simple-importer
import { AuthConfig, ImportResponse, IIHVariable, IIHVariableResponse, BulkCreateVariablesResponse, ENERGY_TYPES, EnergyTypeConfig, GetAllVariablesResponse, BasicVariableInfo, IIHAsset } from '../simple-importer/types';
import { IIHApi } from './api';
// Import CustomImportConfig specifically from this module's types
import { CustomImportConfig, LevelVariableConfig, PatternBlock, PlaceholderKey } from './types';
// Keep Sankey types import if needed
import { FlexibleProcessedData } from '@/types/sankey'; 
// Import helpers from simple-importer
import { normalizeTagVariable } from '../simple-importer/normalizeTagVariable';
import { normalizeRuleVariable } from '../simple-importer/normalizeRuleVariable';
import { sanitizeNameForVariable, extractEnergyTypeFromAsset, normalizeEnergyType } from '../simple-importer/helpers';

// Use configured retention years
// const RETENTION_CONFIG = { /* ... */ };

// Remove updateIIHStructureWithAggregations if it's specific to the old Sankey/localStorage flow
// export function updateIIHStructureWithAggregations(...) { ... }

interface AggregationInfo { 
    id: string; 
    sourceId: string; // Link back to the variable
    variableName: string;
    cycle: string; // e.g., Hour, Day
}

// Define a type for the raw data rows
type RawImportRow = Record<string, string>;

// Define a type for the assets we will build for IIH
/*
interface IIHAsset { 
  name: string; // Original name from the sheet
  parentId: string | null; // IIH ID of the parent, or null for root
  iihId?: string; // Populated after creation by IIH API
  path?: string; // Internal unique path used during creation (e.g., level1/level2/level3)
  // Store metadata needed for variable creation or other logic
  metadata?: { 
    levelIndex: number; // Hierarchy level (1-based)
    levelName: string; // Name of the level column
    originalRow?: RawImportRow; // Reference to the source row (only for leaf nodes)
    energyType?: string; // Normalized energy type
    adapterId?: string; // Resolved Adapter ID for this asset
    [key: string]: any; // Allow other metadata
  } 
}
*/

// Copied determineEnergyUnit function from simple-importer/helpers.ts
// It uses the imported ENERGY_TYPES constants
function determineEnergyUnit(energyType: string): string {
  const config = ENERGY_TYPES[energyType];
  return config ? config.unit : 'kWh'; // Default to kWh if type unknown
}

/**
 * Classe d'importation personnalisable pour IIH Essentials
 */
// Rename SimpleImporter to CustomImporter
export class CustomImporter {
  private api: IIHApi;
  private _config: CustomImportConfig; // Store the custom config
  private authConfig: AuthConfig; 
  private BATCH_SIZE = 10; // Batch size for API calls
  // Cache for created assets (mapping unique hierarchy path -> IIHAsset with iihId)
  private createdAssetsCache: Map<string, IIHAsset> = new Map();

  /**
   * Constructeur de la classe d'importation personnalisable
   * @param authConfig Configuration d'authentification
   * @param config Configuration d'import personnalisée
   */
  // Update constructor to accept CustomImportConfig
  constructor(authConfig: AuthConfig, config: CustomImportConfig) {
    this.api = new IIHApi(authConfig);
    this.authConfig = authConfig; 
    this._config = config; // Assign the custom config
    
    console.log('CustomImporter initialisé avec la configuration:', {
      authConfig: { baseUrl: authConfig.baseUrl, /* mask token */ hasToken: !!authConfig.token },
      config: this._config
    });
    
    // Validate essential config parts
    if (!this._config.hierarchy?.levels || this._config.hierarchy.levels.length === 0) {
        throw new Error("Configuration de hiérarchie invalide : aucun niveau défini.");
    }
  }

  /**
   * Builds the IIH asset structure based on raw data and hierarchy config.
   * Creates the assets in IIH via API and populates the cache with created assets (including IIH IDs).
   * @param rawData Array of data rows from the imported file.
   */
  private async buildAndCreateIIHAssets(rawData: RawImportRow[]): Promise<Map<string, IIHAsset>> {
    console.log(`Début construction hiérarchie depuis ${rawData.length} lignes.`);
    // Use a temporary type that includes the array path for building
    type AssetBuildData = Partial<IIHAsset> & { pathArray?: string[], parentPathString?: string };
    const assetsToCreateMap = new Map<string, AssetBuildData>(); // Map<pathString, assetBuildData>
    this.createdAssetsCache.clear();

    // Pass 1: Build the desired asset structure map from raw data
    for (const row of rawData) {
      let currentParentPathString: string | null = null;
      let currentPathArray: string[] = [];

      for (let i = 0; i < this._config.hierarchy.levels.length; i++) {
        const levelConfig = this._config.hierarchy.levels[i];
        const assetName = row[levelConfig.columnName]?.trim();

        if (!assetName) {
          console.warn(`Nom manquant pour niveau ${i + 1} (colonne ${levelConfig.columnName}) dans la ligne:`, row);
          break; // Stop processing this row if a hierarchy level is missing
        }
        
        const sanitizedNamePart = sanitizeNameForVariable(assetName);
        currentPathArray.push(sanitizedNamePart);
        const currentPathString = currentPathArray.join('/');

        // Only add if not already processed (path is unique identifier before creation)
        if (!assetsToCreateMap.has(currentPathString)) {
          const newAsset: AssetBuildData = {
            name: assetName, 
            // parentId will be resolved later using parentPathString
            pathArray: [...currentPathArray], // Store the path as an array
            parentPathString: currentParentPathString || '', // Store parent path string for lookup
            metadata: { 
              levelIndex: i, // Store level index
              levelName: levelConfig.columnName, // Store level column name
              originalRow: row // Store the row that defined this asset path first
            }
          };
          
          // --- Leaf Node Specific Metadata --- 
          if (i === this._config.hierarchy.levels.length - 1) {
             // Resolve Adapter ID from global config
             if (this._config.selectedAdapterId) {
                 newAsset.metadata!.adapterId = this._config.selectedAdapterId;
             }
             // Resolve Energy Type
             if (this._config.hierarchy.energyTypeColumn && row[this._config.hierarchy.energyTypeColumn]) {
                 newAsset.metadata!.energyType = normalizeEnergyType(row[this._config.hierarchy.energyTypeColumn]);
             }
          }
          assetsToCreateMap.set(currentPathString, newAsset);
        }
        currentParentPathString = currentPathString; // Update parent path for the next level
      }
    }

    // Prepare array for the API call, matching AssetToCreateHierarchically structure
    const assetsToCreateApiInput = Array.from(assetsToCreateMap.values()).map(assetData => ({
        name: assetData.name,
        parentId: assetData.parentPathString, // Still temporary, API method will resolve this
        metadata: assetData.metadata,
        path: assetData.pathArray // Pass the array path
    }));

    console.log(`Tentative de création de ${assetsToCreateApiInput.length} assets uniques via API...`);

    if (assetsToCreateApiInput.length > 0) {
       try {
         console.log('Appel de this.api.createAssetsHierarchically...');
         // Pass the correctly typed array to the API method
         const createdIIHAssets: IIHAsset[] = await this.api.createAssetsHierarchically(assetsToCreateApiInput);
         
         // --- Update Cache with API Results --- 
         this.createdAssetsCache.clear(); 
         if (createdIIHAssets && createdIIHAssets.length > 0) {
             // Now process the API results (which are correctly typed as imported IIHAsset)
             createdIIHAssets.forEach((createdAsset: IIHAsset) => { // Explicitly use imported IIHAsset type
                 // Find the original build data using a matching logic (e.g., matching name and level if path is unreliable)
                 const originalBuildData = Array.from(assetsToCreateMap.values()).find(buildData => 
                     buildData.name === createdAsset.name && 
                     buildData.metadata?.levelIndex === createdAsset.metadata?.levelIndex
                 );
                 
                 // Use the path string from the original build data as the primary cache key
                 const cacheKey = originalBuildData ? (originalBuildData.pathArray || []).join('/') : null;

                 if (cacheKey && createdAsset.assetId) { // Use assetId instead of iihId 
                     // Merge original metadata with API result
                     const mergedAsset: IIHAsset = {
                       ...(originalBuildData || {}), // Keep original data like pathArray, metadata etc.
                       ...createdAsset, // Overwrite with API results (assetId, actual parentId, etc.)
                       assetId: createdAsset.assetId // Ensure assetId is correctly assigned
                     };
                     // Optionally remove temporary build properties if they exist on the merged object
                     // delete (mergedAsset as any).pathArray; 
                     // delete (mergedAsset as any).parentPathString;
                     this.createdAssetsCache.set(cacheKey, mergedAsset);
                 } else {
                     console.warn(`Asset créé via API ne peut être mis en cache (clé='${cacheKey}', assetId='${createdAsset.assetId}'):`, createdAsset);
                 }
             });
             console.log(`${this.createdAssetsCache.size} assets créés via API et mis en cache.`);
         } else {
             console.warn('this.api.createAssetsHierarchically n\'a retourné aucun asset créé.');
         }

       } catch (error: any) {
         console.error("Erreur lors de l'appel API pour la création des assets:", error);
         const apiErrorMessage = error?.response?.data?.message || error?.message || 'Erreur inconnue API';
         throw new Error(`Échec de la création de la hiérarchie d'assets via API: ${apiErrorMessage}`);
       }
    }

    console.log(`Construction/Création hiérarchie terminée. ${this.createdAssetsCache.size} assets dans le cache.`);
    return this.createdAssetsCache;
  }
  
  /**
   * Formats a variable name based on a pattern and asset context.
   * Uses LevelVariableConfig pattern if provided, otherwise global pattern.
   */
  private formatVariableName(asset: IIHAsset, levelVarConfig?: LevelVariableConfig): string {
    // Use level-specific pattern BLOCKS if available, otherwise global string pattern
    const blocks = levelVarConfig?.namePatternBlocks;
    
    let constructedName = '';
    if (blocks && blocks.length > 0) {
      // Construct name from blocks
      constructedName = blocks.map(block => {
        if (block.type === 'text') {
          return block.value.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize
        }
        if (block.type === 'placeholder') {
          switch (block.value as PlaceholderKey) { // Cast value to PlaceholderKey
            case 'assetName':
              return sanitizeNameForVariable(asset.name);
            case 'energyType':
              return asset.metadata?.energyType ?? '';
            case 'levelName':
              return sanitizeNameForVariable(asset.metadata?.levelName || '');
            // Add cases for other placeholders if defined
            default:
              return ''; // Ignore unknown placeholders
          }
        }
        return '';
      }).filter(part => part).join('_'); // Join valid parts with underscore
      
    } else {
      // Fallback to global pattern if no blocks defined for the level
      const pattern = this._config.variables.namePattern || '{assetName}_Variable';
      constructedName = pattern;
      const metadata = asset.metadata; 
      constructedName = constructedName.replace(/\{assetName\}/g, sanitizeNameForVariable(asset.name));
      constructedName = constructedName.replace(/\{levelName\}/g, sanitizeNameForVariable(metadata?.levelName || '')); 
      constructedName = constructedName.replace(/\{energyType\}/g, metadata?.energyType ?? '' ); 
      constructedName = constructedName.replace(/[_]{2,}/g, '_'); // Clean up underscores
    }

    return constructedName.replace(/^_|_$/g, '') || `Var_${asset.assetId || asset.name}`; // Use assetId instead of iihId
  }

  /**
   * Prepares a single IIHVariable payload based on asset and level variable config.
   */
  private prepareLevelVariable(asset: IIHAsset, levelVarConfig: LevelVariableConfig): IIHVariable | null {
    const variableName = this.formatVariableName(asset, levelVarConfig);
    const metadata = asset.metadata;
    const originalRow = metadata?.originalRow; // Row that first defined this asset path
    const adapterId = this._config.selectedAdapterId;

    if (!adapterId) {
      console.warn(`Skipping variable '${variableName}' for asset '${asset.name}': No global Adapter ID selected.`);
      return null;
    }

    if (!asset.assetId) { // Use assetId instead of iihId
      console.warn(`Skipping variable '${variableName}' for asset '${asset.name}': Asset IIH ID is missing.`);
      return null;
    }

    // --- Determine Unit --- 
    let unit: string = '';
    if (levelVarConfig.unitSource === 'column' && levelVarConfig.unitColumn && originalRow && originalRow[levelVarConfig.unitColumn] !== undefined) {
        unit = String(originalRow[levelVarConfig.unitColumn]);
    } else { // 'auto' or column not found
        unit = determineEnergyUnit(metadata?.energyType || '');
    }

    // --- Determine Node ID (Using Global Config for now) --- 
    // Node ID often depends on the variable name itself or a specific column
    // Using the level-specific dataColumn here might be incorrect for OPC UA Node IDs.
    // Stick to global config logic for Node ID source for now.
    let nodeIdValue: string = '';
    const nodeIdColumn = this._config.variables.nodeIdColumn;
    if (this._config.variables.nodeIdSource === 'column' && nodeIdColumn && originalRow && originalRow[nodeIdColumn] !== undefined) {
        nodeIdValue = String(originalRow[nodeIdColumn]); 
    } else { // 'auto' or column not specified/found in global config
        nodeIdValue = `ns=2;s=${sanitizeNameForVariable(variableName)}`; // Default OPC UA style Node ID
    }

    // --- Determine DataType --- 
    const dataType = levelVarConfig.dataType || 'Float'; 

    // --- Get Data Column Value (Removed as dataColumn is removed) --- 
    // const dataValue = originalRow && levelVarConfig.dataColumn ? originalRow[levelVarConfig.dataColumn] : undefined;
    
    const description = `${asset.name} - ${levelVarConfig.displayName} (Niveau ${metadata?.levelIndex !== undefined ? metadata.levelIndex + 1 : '?'})`;

    // Prepare Partial Variable Object 
    const partialVariable: Partial<IIHVariable> = {
        variableName: variableName,
        unit: unit, 
        assetId: asset.assetId, 
        adapterId: adapterId, 
        description: description, 
        dataType: dataType, 
        sourceType: 'Tag', 
        tag: { 
             tagName: nodeIdValue, 
             connectionName: sanitizeNameForVariable(asset.name), 
             adapterId: adapterId, 
             dataType: dataType as string 
        },
        // Remove metadata related to dataColumn
        // metadata: { levelVariableId: levelVarConfig.id, sourceDataColumn: levelVarConfig.dataColumn, sourceDataValue: dataValue }
    };

    // Call Normalizer 
    // Ensure normalizeTagVariable handles the structure correctly
    try {
      return normalizeTagVariable(
          partialVariable as IIHVariable, // Need to cast carefully
          adapterId, 
          {} // No extra options needed currently
      );
    } catch (normError: any) {
       console.error(`Error normalizing tag variable '${variableName}' for asset '${asset.name}':`, normError);
       return null; // Return null if normalization fails
    }
  }

  /**
   * Main entry point for custom flexible import.
   */
  async importFlexibleData(rawData: RawImportRow[]): Promise<ImportResponse> {
    let createdVariables: IIHVariableResponse[] = [];
    let createdAggregations: AggregationInfo[] = [];
    let localErrors: string[] = [];
    let summary = { totalRows: rawData.length, assetCount: 0, variableCount: 0, aggregationCount: 0 }; 

    try {
      // 1. Build and Create IIH Asset Hierarchy
      const assetsCache = await this.buildAndCreateIIHAssets(rawData);
      summary.assetCount = assetsCache.size;
      if (assetsCache.size === 0) {
         throw new Error("Aucun asset n'a pu être créé à partir des données fournies."); 
      }
      
      // 2. Prepare Variable Creation Payloads for ALL Assets based on LevelVariableConfig
      console.log("Préparation des variables pour tous les niveaux..."); 
      const variablesToCreate: IIHVariable[] = [];
      
      // Iterate through all created/cached assets
      for (const asset of Array.from(assetsCache.values())) {
          const metadata = asset.metadata;
          const levelIndex = metadata?.levelIndex;

          // Check if levelIndex is valid and exists in config
          if (levelIndex !== undefined && levelIndex < this._config.hierarchy.levels.length) {
              const levelConfig = this._config.hierarchy.levels[levelIndex];
              
              // Iterate through variables defined for this level
              for (const levelVarConfig of levelConfig.levelVariables) {
                  try {
                      const variablePayload = this.prepareLevelVariable(asset, levelVarConfig);
                      if (variablePayload) { // Only add if preparation was successful
                          variablesToCreate.push(variablePayload);
                      }
                  } catch(prepError: any) {
                      console.error(`Erreur préparation variable ${levelVarConfig.displayName} pour asset ${asset.name}:`, prepError);
                      localErrors.push(`Erreur préparation variable ${levelVarConfig.displayName} (${asset.name}): ${prepError.message}`);
                  }
              }
          } else {
              console.warn(`Asset ${asset.name} manque de métadonnées valides (levelIndex) ou configuration de niveau associée.`);
          }
      }
      summary.variableCount = variablesToCreate.length;
      
      if (variablesToCreate.length === 0 && localErrors.length === 0) {
        console.warn("Aucune variable n'a pu être préparée pour la création.");
        return { 
            success: true, 
            message: "Importation terminée: Aucune variable valide définie ou préparée.",
            error: undefined 
        };
      }
      console.log(`${variablesToCreate.length} variables préparées pour la création.`);

      // 3. Create Variables in Batches
      if (variablesToCreate.length > 0) {
        // Ensure this.api.createVariablesInBatches is implemented!
        createdVariables = await this.createVariablesInBatches(variablesToCreate);
        summary.variableCount = createdVariables.length; // Update count based on actual creation
        console.log(`${createdVariables.length} variables créées avec succès (simulation ou réel).`);
      }

      // 4. Create Aggregations (Using Global Config for now)
      if (this._config.variables.createAggregations && createdVariables.length > 0) {
         console.log("Préparation et création des agrégations (basé sur la config globale)..."); 
         const varsForAgg = createdVariables.filter(v => v.sourceType === 'Tag'); 
         if (varsForAgg.length > 0) {    
           // Ensure this.api.createAggregations is implemented!
           createdAggregations = await this.createAggregationsForVariables(varsForAgg);
           summary.aggregationCount = createdAggregations.length;
           console.log(`${createdAggregations.length} agrégations créées (simulation ou réel).`);
         } else {
           console.log("Aucune variable éligible trouvée pour créer des agrégations."); 
         }
      } else if (this._config.variables.createAggregations) {
         console.log("Skipping aggregations as no variables were successfully created.");
      } else {
        console.log("Création d'agrégations désactivée dans la configuration globale.");
      }
      
      // 5. Apply Retention (Commented out)
      // ...

      // Final response construction
      const finalMessage = `Import terminé. Assets créés/vérifiés: ${summary.assetCount}, Variables créées: ${summary.variableCount}, Agrégations créées: ${summary.aggregationCount}. ${localErrors.length > 0 ? `Erreurs rencontrées: ${localErrors.length}` : ''}`;
      console.log(finalMessage);
      console.log("Erreurs détaillées (si applicable):", localErrors);
      
      return {
        success: localErrors.length === 0, 
        message: finalMessage, 
        error: localErrors.length > 0 ? localErrors.join('; ') : undefined, // Combine errors for message
      };

    } catch (error: any) {
      console.error("Échec critique du processus d'importation flexible:", error);
      localErrors.push(`Échec critique: ${error.message}`);
      return { 
        success: false, 
        message: `Échec critique de l'importation: ${error.message}`, 
        error: error 
      };
    } 
  }
  
  // --- Helper Methods --- 
  
  // Replace Mock - Implement actual API call
  private async createVariablesInBatches(variables: IIHVariable[]): Promise<IIHVariableResponse[]> {
      if (!variables || variables.length === 0) {
          console.warn("Aucune variable à créer dans createVariablesInBatches.");
          return [];
      }
      console.log(`Tentative de création réelle de ${variables.length} variables par lots...`);
      try {
          // Ensure IIHApi has createVariablesBulk implemented correctly
          const response: BulkCreateVariablesResponse = await this.api.createVariablesBulk(variables);
          console.log(`Appel API createVariablesBulk terminé. ${response.results?.length || 0} succès, ${response.errors?.length || 0} erreurs.`);
          
          // Return only the successfully created variables' details
          return response.results || []; 
      } catch (error: any) {
          console.error("Erreur majeure lors de l'appel API createVariablesBulk:", error);
          throw new Error(`Échec de la création des variables en lots: ${error.message}`);
          // Or return an empty array if you want to handle the error upstream:
          // return []; 
      }
  }

  // Replace Mock - Implement actual API calls for aggregations
  private async createAggregationsForVariables(variables: IIHVariableResponse[]): Promise<AggregationInfo[]> {
      if (!variables || variables.length === 0) {
          console.log("Aucune variable fournie pour créer des agrégations.");
          return [];
      }
      
      console.log(`Tentative de création d'agrégations pour ${variables.length} variables...`);
      const createdAggregations: AggregationInfo[] = [];
      const aggregationErrors: string[] = [];
      
      // Define standard intervals 
      const timeIntervals = [
          { name: '5min', base: 'minute', factor: 5 },
          { name: '1h', base: 'hour', factor: 1 },
          { name: '4h', base: 'hour', factor: 4 },
          { name: '8h', base: 'hour', factor: 8 },
          { name: '1d', base: 'day', factor: 1 }
      ];

      // Process variables sequentially or in small controlled batches to avoid API rate limits
      for (const variable of variables) {
          if (!variable.variableId) {
              console.warn(`Variable ${variable.variableName} manque de variableId, impossible de créer des agrégations.`);
              continue;
          }
          
          // Determine aggregation type (e.g., Sum for numeric)
          // Assuming simple 'Sum' for numeric types for now
          const aggregationType = ['Float', 'Integer', 'Double'].includes(variable.dataType || '') ? 'Sum' : 'Last';

          console.log(`  Traitement agrégations pour: ${variable.variableName} (ID: ${variable.variableId}, Type: ${aggregationType})`);

          // Check existing aggregations for this variable first to avoid duplicates
          let existingAggregations: any[] = [];
          try {
            existingAggregations = await this.api.getAggregationsForVariable(variable.variableId);
          } catch (fetchError: any) {
            console.error(`  Erreur récupération agrégations existantes pour ${variable.variableId}:`, fetchError);
            aggregationErrors.push(`FetchAggError (${variable.variableId}): ${fetchError.message}`);
            // Decide if you want to continue or skip this variable
            continue; 
          }

          const existingCycles = new Set(
            existingAggregations
              .filter(agg => agg.cycle) // Ensure cycle exists
              .map(agg => `${agg.cycle.base}_${agg.cycle.factor}`)
          );
          console.log(`  Agrégations existantes trouvées: ${existingCycles.size}`);

          // Create aggregations for standard intervals if they don't exist
          for (const interval of timeIntervals) {
              const cycleKey = `${interval.base}_${interval.factor}`;
              if (existingCycles.has(cycleKey)) {
                  // console.log(`    Agrégation ${interval.name} existe déjà, ignorée.`);
                  continue; // Skip if already exists
              }

              const aggregationData = {
                  aggregation: aggregationType,
                  sourceId: variable.variableId,
                  cycle: {
                      base: interval.base,
                      factor: interval.factor
                  },
                  provideAsVariable: true, // Usually true to see it in Grafana etc.
                  publishMqtt: false
              };

              try {
                  console.log(`    Tentative création agrégation ${interval.name}...`);
                  // Ensure IIHApi has createAggregation implemented correctly
                  const createdAgg = await this.api.createAggregation(aggregationData);
                  if (createdAgg?.id) {
                      createdAggregations.push({
                          id: createdAgg.id,
                          sourceId: variable.variableId,
                          variableName: variable.variableName,
                          cycle: `${interval.base}/${interval.factor}` // Store cycle representation
                      });
                      console.log(`    ✅ Agrégation ${interval.name} créée (ID: ${createdAgg.id})`);
                      existingCycles.add(cycleKey); // Add to set to avoid re-creation attempts within this run
                  } else {
                     console.warn(`    ⚠️ Création agrégation ${interval.name} n'a pas retourné d'ID.`);
                     aggregationErrors.push(`CreateAggWarning (${variable.variableId} - ${interval.name}): No ID returned`);
                  }
                   // Add a small delay between API calls
                  await new Promise(res => setTimeout(res, 50)); 
              } catch (error: any) {
                  console.error(`    ❌ Erreur création agrégation ${interval.name}:`, error);
                  aggregationErrors.push(`CreateAggError (${variable.variableId} - ${interval.name}): ${error.message}`);
              }
          } // End loop through intervals
           await new Promise(res => setTimeout(res, 100)); // Delay between variables
      } // End loop through variables

      console.log(`Création d'agrégations terminée. ${createdAggregations.length} créées, ${aggregationErrors.length} erreurs rencontrées.`);
      if(aggregationErrors.length > 0) {
          console.error("Erreurs d'agrégation:", aggregationErrors);
      }
      return createdAggregations;
  }

} // End of CustomImporter class 