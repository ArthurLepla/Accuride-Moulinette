import { AuthConfig, ImportResponse, IIHVariable, IIHVariableResponse, BulkCreateVariablesResponse, ENERGY_TYPES, EnergyTypeConfig, ImportConfiguration, DEFAULT_IMPORT_CONFIG, GetAllVariablesResponse, BasicVariableInfo } from './types';
import { IIHApi } from './api';
import { FlexibleProcessedData, HierarchyNode } from '@/types/sankey';
import { normalizeTagVariable } from './normalizeTagVariable';
import { normalizeRuleVariable } from './normalizeRuleVariable';
import { sanitizeNameForVariable, extractEnergyTypeFromAsset, normalizeEnergyType } from './helpers';

// Après les imports, avant la classe SimpleImporter
const RETENTION_CONFIG = {
  dataRetention: {
    sourceTypeId: "variable",
    settings: {
      timeSettings: {
        timeRange: {
          base: "year",  // Utilisation de "year" au lieu de "day"
          factor: 7,     // 7 ans directement
          iso8601: "P7Y" // Reste inchangé car déjà en années
        }
      }
    }
  },
  inherited: null
};

// *** NEW FUNCTION: Add this function to synchronize aggregation IDs with localStorage ***
// *** UPDATED: Replaced with user-provided implementation for improved matching ***
export function updateIIHStructureWithAggregations(processedVariables: IIHVariableResponse[], iihStructure?: any) {
  try {
    console.log("[importer.ts] Début mise à jour des agrégations dans localStorage...");
    
    // Vérifier si des variables ont des agrégations
    let variablesWithAggregations = processedVariables.filter(v => v.metadata?.aggregations);
    console.log(`[importer.ts] ${variablesWithAggregations.length} variables sur ${processedVariables.length} ont des agrégations`);
    
    if (variablesWithAggregations.length === 0) {
      console.log("[importer.ts] Aucune variable avec agrégations à synchroniser.");
      return iihStructure; // Return the passed structure unchanged
    }
    
    // Récupérer la structure depuis localStorage si elle n'est pas fournie
    let localIihStructure = iihStructure;
    if (!localIihStructure) {
      const iihStructureStr = localStorage.getItem('iihStructure');
      if (!iihStructureStr) {
        console.warn("[importer.ts] Pas de structure iihStructure dans localStorage");
        return null;
      }
      localIihStructure = JSON.parse(iihStructureStr);
    }

    const nodes = localIihStructure.hierarchyData?.nodes;
    
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      console.warn("[importer.ts] Structure de nœuds invalide dans iihStructure");
      return localIihStructure; // Return the structure as is
    }
    
    console.log(`[importer.ts] ${nodes.length} nœuds trouvés dans iihStructure`);

    // Créer une map des variables par nom et type d'énergie pour une recherche plus efficace
    const variableMap = new Map();
    variablesWithAggregations.forEach(variable => {
      // Extraire le type d'énergie du nom de la variable (si possible)
      const nameParts = variable.variableName.split('_');
      let energyType = '';
      
      // Format attendu: Consommation_elec_MachineName or similar
      if (nameParts.length >= 2 && nameParts[0].toLowerCase() === 'consommation') {
        energyType = nameParts[1].toLowerCase();
      }
      
      // Clé composite: type d'énergie + nom (pour éviter les confusions)
      const key = `${energyType}:${variable.variableName}`;
      variableMap.set(key, variable);
      
      // Ajouter aussi une variante sans le type d'énergie au cas où
      variableMap.set(variable.variableName, variable);
    });

    // Parcourir tous les nœuds et tenter de faire correspondre avec des variables
    let updatedCount = 0;
    
    nodes.forEach((node: any) => { // Specify 'any' type for node or define a proper interface
      // Ne traiter que les nœuds de type "Machine"
      // Check multiple possible properties indicating the level/type
      const isMachineNode = node.levelName === "Machine" || 
                            node.metadata?.level === "Machine" || 
                            node.metadata?.type === "machine" ||
                            (typeof node.level === 'number' && node.level === 5); // Assuming level 5 is Machine

      if (!isMachineNode) {
        return;
      }
      
      const nodeName = node.name;
      // Try to get energy type from multiple potential metadata fields
      const energyType = (node.metadata?.energyType || 
                          node.metadata?.rawEnergyType || 
                          node.metadata?.Energie || // Added common variations
                          node.metadata?.energy || 
                          '').toLowerCase();
      
      // Clean the node name for matching variable names
      const sanitizedNodeName = nodeName.replace(/[\s-/]+/g, '_'); // More robust sanitization
      
      // Essayer plusieurs formats de noms de variables qui pourraient correspondre à ce nœud
      const possibleVariableNames = [
        `Consommation_${energyType}_${sanitizedNodeName}`, // Sanitized name
        `Consommation_${energyType}_${nodeName}`,         // Original name
        `Consommation_${sanitizedNodeName}`,              // Sanitized name without energy type
        `Consommation_${nodeName}`,                       // Original name without energy type
        // Consider adding more variants based on actual variable naming patterns if needed
      ];
      
      // Recherche de correspondance dans l'ordre des noms possibles
      let matchedVariable = null;
      for (const varName of possibleVariableNames) {
        // Essayer avec le type d'énergie + nom variable
        const compositeKey = `${energyType}:${varName}`;
        if (variableMap.has(compositeKey)) {
          matchedVariable = variableMap.get(compositeKey);
          console.log(`[importer.ts] Correspondance trouvée pour nœud ${nodeName} via clé composite: ${compositeKey}`);
          break;
        }
        
        // Essayer juste avec le nom variable
        if (variableMap.has(varName)) {
          matchedVariable = variableMap.get(varName);
          console.log(`[importer.ts] Correspondance trouvée pour nœud ${nodeName} via nom variable: ${varName}`);
          break;
        }
      }
      
      // Si une variable correspondante est trouvée et qu'elle a des agrégations
      if (matchedVariable && matchedVariable.metadata?.aggregations) {
        console.log(`[importer.ts] Mise à jour du nœud ${nodeName} avec les agrégations de la variable ${matchedVariable.variableName}`);
        
        // S'assurer que metadata existe
        if (!node.metadata) {
          node.metadata = {};
        }
        
        // Créer ou mettre à jour la propriété variable dans les métadonnées du nœud
        // Ensure we don't overwrite other potentially useful info in node.metadata.variable
        const currentVariableMetadata = node.metadata.variable || {};
        
        node.metadata.variable = {
          ...currentVariableMetadata, // Preserve existing data if any
          id: matchedVariable.variableId,
          name: matchedVariable.variableName, // Update name just in case it differs slightly
          aggregations: matchedVariable.metadata.aggregations // Add/overwrite aggregations
        };
        
        updatedCount++;
      } else if (isMachineNode) {
          // Log if a machine node didn't find a matching variable with aggregations
          // console.log(`[importer.ts] Pas de variable correspondante avec agrégations trouvée pour le nœud Machine: ${nodeName}`);
      }
    });

    // If we received a structure as input, always return it, whether modified or not
    if (iihStructure) {
      console.log(`[importer.ts] Retour de la structure mise à jour avec ${updatedCount} nœuds modifiés`);
      return localIihStructure;
    }
    
    // Otherwise, only save to localStorage if we made changes
    if (updatedCount > 0) {
      localStorage.setItem('iihStructure', JSON.stringify(localIihStructure));
      console.log(`[importer.ts] ✅ Structure mise à jour dans localStorage avec agrégations pour ${updatedCount} nœuds Machine`);
    } else {
      console.warn("[importer.ts] Aucun nœud Machine mis à jour avec des agrégations dans localStorage");
    }
    
    return localIihStructure;
  } catch (error) {
    console.error("[importer.ts] Erreur lors de la mise à jour des agrégations dans localStorage:", error);
    return iihStructure || null;
  }
}
// *** END UPDATED FUNCTION ***

// Interface to represent the structure of aggregation data fetched from the API
interface AggregationInfo { 
  id: string; 
  type?: string; // Likely 'Sum', 'Average', etc.
  cycle?: { base: string; factor: number };
  sourceId?: string; // Add sourceId if it's typically returned by getAggregationsForVariable
  // Add other relevant properties if needed based on the actual API response
}

/**
 * Classe d'importation simplifié pour IIH Essentials
 */
export class SimpleImporter {
  private api: IIHApi;
  private _allAssets: Map<string, any> = new Map();
  private _importConfig: ImportConfiguration;
  private authConfig: AuthConfig; // Ajout de la propriété authConfig
  // Ajout des propriétés pour la file d'attente d'agrégations
  private aggregationQueue: Array<{
    variableId: string;
    variableName: string;
    aggregationType: string;
    base: string;
    factor: number;
  }> = [];
  private BATCH_SIZE = 10; // Nombre d'agrégations à traiter en une fois

  /**
   * Constructeur de la classe d'importation
   * @param authConfig Configuration d'authentification
   * @param importConfig Configuration d'import personnalisée (optionnel)
   */
  constructor(authConfig: AuthConfig, importConfig?: Partial<ImportConfiguration>) {
    this.api = new IIHApi(authConfig);
    this.authConfig = authConfig; // Initialisation de authConfig
    
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

  // Méthode pour initialiser la cache d'assets
  private initAllAssets(assets: any[]): void {
    this._allAssets.clear();
    
    if (assets && assets.length > 0) {
      assets.forEach(asset => {
        if (asset && asset.assetId) {
          this._allAssets.set(asset.assetId, asset);
        }
      });
      console.log(`Cache initialisée avec ${this._allAssets.size} assets`);
    }
  }

  async importTestAsset(): Promise<ImportResponse> {
    try {
      // 1. Récupérer l'asset racine
      console.log('Récupération de l\'asset racine...');
      const rootAsset = await this.api.getRootAsset();
      console.log('Asset racine récupéré:', rootAsset);

      // 2. Créer l'asset de test
      console.log('Création de l\'asset de test...');
      const newAsset = await this.api.createAsset({
        name: 'Test Asset',
        parentId: rootAsset.assetId,
        type: 'asset',
        description: 'Asset de test créé par le nouvel importateur',
        metadata: {
          createdBy: 'SimpleImporter',
          testAsset: true
        }
      });

      console.log('Asset de test créé avec succès:', newAsset);

      return {
        success: true,
        message: 'Asset de test créé avec succès',
        asset: newAsset
      };
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import',
        error
      };
    }
  }

  async importFlexibleData(data: FlexibleProcessedData): Promise<ImportResponse> {
    try {
      console.log('Démarrage de l\'import flexible avec stratégie top-down...');
      
      // 1. Récupérer l'asset racine
      console.log('Récupération de l\'asset racine...');
      const rootAsset = await this.api.getRootAsset();
      console.log('Asset racine récupéré:', rootAsset);
      
      // 2. Déterminer le nombre total de niveaux et la structure
      const { hierarchyData } = data;
      const totalLevels = hierarchyData.levels.length;
      console.log(`Structure hiérarchique avec ${totalLevels} niveaux détectée`);
      
      // 3. Stocker les assets créés pour référence future
      const createdAssets = new Map<string, any>();
      
      // 4. Stratégie top-down : créer d'abord les assets de niveau supérieur
      // puis descendre niveau par niveau
      // *** LOG AJOUTÉ ***
      console.log(`[Import Flexible] Démarrage de la boucle de création des niveaux (0 à ${totalLevels - 1})...`);
      
      for (let level = 0; level < totalLevels; level++) {
        const currentLevelName = hierarchyData.levels[level].level;
        const nodesInCurrentLevel = hierarchyData.nodes.filter(node => node.level === currentLevelName);
        
        // *** LOG AJOUTÉ ***
        console.log(`[Import Flexible] Niveau ${level}: Filtrage terminé. ${nodesInCurrentLevel.length} nœuds trouvés pour le niveau \"${currentLevelName}\". Démarrage de la boucle des nœuds...`);
        
        // Traiter tous les nœuds de ce niveau
        for (const node of nodesInCurrentLevel) {
          // Trouver le parent de ce nœud
          let parentId = rootAsset.assetId; // Par défaut, utiliser la racine
          
          // Si ce n'est pas le premier niveau, trouver le parent dans les liens
          if (level > 0) {
            const parentLinks = hierarchyData.links.filter(link => link.target === node.id);
            if (parentLinks.length > 0) {
              const parentNodeId = parentLinks[0].source;
              const parentAsset = createdAssets.get(parentNodeId);
              if (parentAsset) {
                parentId = parentAsset.assetId;
              } else {
                console.warn(`⚠️ Parent non trouvé pour le nœud ${node.name}, utilisation de la racine comme parent`);
              }
            }
          }
          
          // Déterminer les types de niveaux pour ce nœud
          const isFirstLevel = level === 0;
          const isLastLevel = level === totalLevels - 1;
          const isOneBeforeLastLevel = level === totalLevels - 2;
          
          // Détecter le type d'énergie à partir du nom du nœud (pour les niveaux inférieurs)
          let energyType = 'défaut';
          if (isLastLevel || isOneBeforeLastLevel) {
            const nodeName = node.name.toLowerCase();
            if (nodeName.includes('elec')) energyType = 'Elec';
            else if (nodeName.includes('eau')) energyType = 'Eau';
            else if (nodeName.includes('gaz')) energyType = 'Gaz';
            else if (nodeName.includes('air')) energyType = 'Air';
            
            // Si on a détecté un type d'énergie, le mentionner
            if (energyType !== 'défaut') {
              console.log(`Type d'énergie détecté pour ${node.name}: ${energyType}`);
            }
          }
          
          // Créer l'asset
          // *** LOG AJOUTÉ ***
          console.log(`[Import Flexible] Préparation de la création de l'asset: ${node.name} (Node ID: ${node.id}, Niveau: ${level + 1}/${totalLevels}), Recherche du parent...`);
          
          // *** FIX LINTER: Déclarer assetPayload en dehors du try ***
          let assetPayload: any = null; // Initialiser à null ou un type approprié
          
          try {
            // Enrichir les métadonnées avec le type d'énergie si détecté
            const metadata = {
              level: node.levelName,
              position: `${level + 1}/${totalLevels}`,
              nodeId: node.id,
              ...node.metadata
            };
            
            // Ajouter explicitement le type d'énergie aux métadonnées s'il a été détecté
            if (energyType !== 'défaut') {
              metadata.energyType = energyType;
            }
            
            // *** LOG AJOUTÉ ***
            // *** FIX LINTER: Assigner à la variable déclarée en dehors ***
            assetPayload = {
              name: node.name,
              parentId: parentId,
              type: isLastLevel ? 'machine' : 'asset',
              description: `${node.levelName}: ${node.name}`,
              metadata: metadata
            };
            console.log(`[Import Flexible] Tentative de création de l'asset "${node.name}" avec le payload suivant:`, JSON.stringify(assetPayload));
            
            const asset = await this.api.createAsset(assetPayload);
            
            // Stocker l'asset créé pour référence future
            createdAssets.set(node.id, asset);
            // *** LOG AJOUTÉ ***
            console.log(`[Import Flexible] ✅ Asset créé: ${node.name} (IIH ID: ${asset.assetId}), stocké dans la map avec la clé de nœud: ${node.id}`);
          } catch (error) {
            // *** LOG MODIFIÉ pour inclure le payload ***
            console.error(`[Import Flexible] ❌ Échec de la création de l'asset '${node.name}': ${error instanceof Error ? error.message : String(error)}. Payload tenté:`, assetPayload);
          }
        }
      }
      
      console.log(`Import terminé avec succès. ${createdAssets.size} assets créés.`);
      return {
        success: true,
        message: `Import terminé avec succès. ${createdAssets.size} assets créés.`,
        assets: Array.from(createdAssets.values())
      };
    } catch (error) {
      console.error('Erreur lors de l\'import flexible:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import flexible',
        error
      };
    }
  }

  /**
   * Finalise toutes les agrégations en attente dans la file
   * Méthode publique pour pouvoir être appelée depuis l'extérieur
   * @returns Résumé des résultats
   */
  public async finalizePendingAggregations(): Promise<{ success: number; errors: number }> {
    if (this.aggregationQueue.length === 0) {
      console.log("✅ Aucune agrégation en attente à traiter");
      return { success: 0, errors: 0 };
    }
    
    console.log(`⏳ Traitement final des agrégations en attente (${this.aggregationQueue.length})...`);
    
    // Traiter toutes les agrégations restantes
    let totalSuccess = 0;
    let totalErrors = 0;
    
    // Traiter par lots pour éviter de surcharger l'API
    while (this.aggregationQueue.length > 0) {
      // Attendre un court délai entre les lots pour réduire la charge
      if (totalSuccess + totalErrors > 0) {
        console.log("Pause de 1 seconde entre les lots d'agrégations...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Traiter le prochain lot
      const batchSize = Math.min(this.BATCH_SIZE, this.aggregationQueue.length);
      console.log(`Traitement du lot ${Math.floor((totalSuccess + totalErrors) / this.BATCH_SIZE) + 1}: ${batchSize} agrégations`);
      
      // Prendre les N premières demandes de la file
      const batch = this.aggregationQueue.splice(0, batchSize);
      
      // Stats pour ce lot
      let batchSuccess = 0;
      let batchErrors = 0;
      
      // Traiter les demandes en parallèle avec limitation
      const results = await Promise.allSettled(batch.map(async (request) => {
        try {
          // Vérifier d'abord si l'agrégation existe déjà pour éviter les erreurs de duplicats
          const exists = await this.checkIfAggregationExists(
            request.variableId, 
            request.base, 
            request.factor
          );
          
          if (exists) {
            console.log(`ℹ️ Agrégation ${request.base} ${request.factor} existe déjà pour ${request.variableName}`);
            batchSuccess++;
            return { exists: true };
          }
          
          const aggregationData = {
            aggregation: request.aggregationType,
            sourceId: request.variableId,
            cycle: {
              base: request.base,
              factor: request.factor
            },
            provideAsVariable: true
          };

          console.log(`Tentative de création d'agrégation pour ${request.variableName} (${request.variableId}): ${request.base} ${request.factor}`);
          
          const result = await this.api.createAggregation(aggregationData);
          
          console.log(`✅ Agrégation créée pour ${request.variableName}: ${request.base} ${request.factor}, ID: ${result.id || 'non disponible'}`);
          batchSuccess++;
          return result;
        } catch (error) {
          batchErrors++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ Erreur création agrégation pour ${request.variableName} (${request.variableId}): ${errorMessage}`);
          
          // Analyser l'erreur pour des messages spécifiques
          if (errorMessage.includes('There is already an aggregation with this cycle')) {
            console.log(`ℹ️ Une agrégation avec ce cycle existe déjà pour ${request.variableName}`);
          } else if (errorMessage.includes('Variable not found')) {
            console.error(`⚠️ Variable ${request.variableId} non trouvée dans IIH`);
          } else if (errorMessage.includes('factor is invalid')) {
            console.error(`⚠️ Facteur ${request.factor} invalide pour la base ${request.base}`);
          }
          
          return { error: errorMessage };
        }
      }));
      
      // Mettre à jour les totaux
      totalSuccess += batchSuccess;
      totalErrors += batchErrors;
      
      // Résumé des résultats de ce lot
      console.log(`Résultat du lot: ${batchSuccess}/${batch.length} succès, ${batchErrors} erreurs`);
    }
    
    // Résumé final
    console.log(`🏁 Traitement des agrégations terminé: ${totalSuccess} succès, ${totalErrors} erreurs`);
    return { success: totalSuccess, errors: totalErrors };
  }

  /**
   * Vérifie si une agrégation existe déjà pour une variable
   * @param variableId ID de la variable
   * @param base Base de l'agrégation (second, minute, hour, day)
   * @param factor Facteur de l'agrégation
   * @returns true si l'agrégation existe déjà
   */
  private async checkIfAggregationExists(
    variableId: string, 
    base: string, 
    factor: number
  ): Promise<boolean> {
    try {
      // Récupérer les agrégations existantes
      const aggregations = await this.api.getAggregationsForVariable(variableId);
      
      // Vérifier si une agrégation avec ce cycle existe déjà
      return aggregations.some(agg => 
        agg.cycle && 
        agg.cycle.base === base && 
        agg.cycle.factor === factor
      );
    } catch (error) {
      console.error(`Erreur lors de la vérification des agrégations existantes pour ${variableId}:`, error);
      return false; // En cas d'erreur, on suppose que l'agrégation n'existe pas
    }
  }

  /**
   * Initialise le système d'agrégation
   * Méthode publique pour pouvoir être appelée depuis l'extérieur
   */
  public initAggregationSystem(): void {
    this.aggregationQueue = [];
    console.log('Système d\'agrégation initialisé');
  }

  /**
   * Crée des variables en masse pour les assets de niveau 5
   * @param assets Liste des assets pour lesquels créer des variables
   * @returns Résultat de l'opération
   */
  async createVariablesForLevel5Assets(assets: any[]): Promise<ImportResponse> {
    try {
      // Initialiser le système d'agrégation
      this.initAggregationSystem();
      
      console.log('Démarrage de la création de variables pour les assets de niveau 5...');
      console.log(`Nombre total d'assets reçus: ${assets.length}`);
      
      // Initialiser la cache d'assets pour les opérations hiérarchiques
      this.initAllAssets(assets);
      
      // Log de debug pour examiner la structure des assets
      if (assets.length > 0) {
        console.log('Structure du premier asset:', JSON.stringify(assets[0], null, 2));
        console.log('Métadonnées des assets:');
        assets.slice(0, 5).forEach(asset => {
          console.log(`Asset ${asset.name} (${asset.assetId}):`, 
            asset.metadata ? JSON.stringify(asset.metadata) : "pas de métadonnées");
        });
      }
      
      // Stratégie de la feuille : Identifier les assets qui ne sont pas des parents
      // 1. Identifier les parents (assets qui sont référencés comme parentId)
      const parentIds = new Set<string>();
      assets.forEach(asset => {
        if (asset.parentId) {
          parentIds.add(asset.parentId);
        }
      });
      
      // 2. Niveau 5 = assets qui ne sont pas des parents (feuilles)
      const level5Assets = assets.filter(asset => !parentIds.has(asset.assetId));
      console.log(`Stratégie feuille: ${level5Assets.length} assets de niveau 5 identifiés`);
      
      if (level5Assets.length === 0) {
        console.warn("⚠️ Aucun asset de niveau 5 identifié avec la stratégie des feuilles");
        console.log("Essai d'identification via d'autres méthodes...");
        
        // Méthode alternative : utiliser le type machine
        const machineAssets = assets.filter(asset => asset.type === 'machine');
        if (machineAssets.length > 0) {
          console.log(`Stratégie type 'machine': ${machineAssets.length} assets de niveau 5 identifiés`);
          
          // 2. Préparer les variables à créer pour les machines
          const variablesToCreate = this.prepareVariablesBulkCreation(machineAssets);
          
          console.log(`${variablesToCreate.length} variables à créer pour ${machineAssets.length} assets de type machine`);
          
          // Traiter les variables par lots
          const result = await this.processVariableCreation(variablesToCreate);
          
          return {
            success: result.success.length > 0,
            message: `Création de variables terminée via la méthode alternative (type machine): ${result.success.length} variables créées, ${result.errors?.length || 0} erreurs`,
            variables: result.success
          };
        }
        
        return {
          success: true,
          message: 'Aucun asset de niveau 5 trouvé. Aucune variable créée.',
          variables: []
        };
      }
      
      // Afficher les assets de niveau 5 identifiés
      console.log('Assets de niveau 5 identifiés:');
      level5Assets.forEach((asset, index) => {
        console.log(`${index + 1}. ${asset.name} (${asset.assetId}), type: ${asset.type}`);
      });
      
      // 2. Préparer les variables à créer
      const variablesToCreate = this.prepareVariablesBulkCreation(level5Assets);
      
      console.log(`${variablesToCreate.length} variables à créer pour ${level5Assets.length} assets`);
      
      // 3. Création des variables en lots
      const result = await this.processVariableCreation(variablesToCreate);
      
      // Process remaining aggregations at the end
      await this.finalizePendingAggregations();
      
      // NEW: Update localStorage with the new aggregation IDs
      // Make sure 'result.success' contains the variables with updated metadata including aggregations
      if (result.success && result.success.length > 0) {
          console.log("[importer.ts] Calling updateIIHStructureWithAggregations after Level 5 processing.");
          updateIIHStructureWithAggregations(result.success);
      } else {
          console.log("[importer.ts] No successful variable creations to update localStorage after Level 5 processing.");
      }

      return {
        success: result.success.length > 0,
        message: `Création de variables terminée: ${result.success.length} variables créées, ${result.errors?.length || 0} erreurs`,
        variables: result.success,
        stats: {
          totalAssets: level5Assets.length,
          processedAssets: level5Assets.length,
          totalVariables: variablesToCreate.length,
          createdVariables: result.success.length,
          failedVariables: result.errors?.length || 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la création des variables:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables',
        error,
        stats: {
          totalAssets: 0,
          processedAssets: 0,
          totalVariables: 0,
          createdVariables: 0,
          failedVariables: 0
        }
      };
    }
  }
  
  // Détection de la meilleure variable existante 
  private async detectBestExistingVariable(variableName: string, assetId: string, typeFilter: string = ''): Promise<any> {
    try {
      const existingVariables = await this.api.getVariablesForAsset(assetId);
      if (!existingVariables || existingVariables.length === 0) {
        return null;
      }
      
      // Recherche exacte d'abord
      const exactMatch = existingVariables.find((v: any) => 
        v.name.toLowerCase() === variableName.toLowerCase() && 
        (typeFilter === '' || v.sourceType === typeFilter)
      );
      
      if (exactMatch) {
        console.log(`Variable correspondante exacte trouvée: ${exactMatch.name} (ID: ${exactMatch.id})`);
        return exactMatch;
      }
      
      // Recherche par inclusion
      const partialMatch = existingVariables.find((v: any) => 
        v.name.toLowerCase().includes(variableName.toLowerCase()) && 
        (typeFilter === '' || v.sourceType === typeFilter)
      );
      
      if (partialMatch) {
        console.log(`Variable correspondante partielle trouvée: ${partialMatch.name} (ID: ${partialMatch.id})`);
        return partialMatch;
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la détection de la variable existante ${variableName}:`, error);
      return null;
    }
  }

  private async processVariableCreation(variables: IIHVariable[]): Promise<{ 
    success: IIHVariableResponse[]; 
    errors: Array<{
      errorKey?: string;
      message: string;
      variableName?: string;
      assetId?: string;
      batchIndex?: number;
      variables?: string[];
    }>; 
  }> {
    if (!variables || variables.length === 0) {
      console.log('❌ DEBUG: Aucune variable à créer, impossible de planifier des agrégations');
      return { success: [], errors: [] };
    }
    
    console.log(`🔍 DEBUG: Traitement de la création de ${variables.length} variables...`);
    
    // Limiter le nombre de variables par batch (recommandation IIH: max 100)
    const batchSize = 50;
    const batches = [];
    
    // Diviser les variables en lots
    for (let i = 0; i < variables.length; i += batchSize) {
      batches.push(variables.slice(i, i + batchSize));
    }
    
    console.log(`🔍 DEBUG: Variables divisées en ${batches.length} lots de max ${batchSize} variables`);
    
    type ErrorType = {
      errorKey?: string;
      message: string;
      variableName?: string;
      assetId?: string;
      batchIndex?: number;
      variables?: string[];
      variableId?: string;  // Ajout de cette propriété
    };

    const results: { 
      success: IIHVariableResponse[]; 
      errors: ErrorType[];
    } = {
      success: [],
      errors: []
    };
    
    // Statistiques pour le suivi des agrégations
    let aggregationsQueued = 0;
    let aggregationsProcessed = 0;
    
    // Tracer la taille de la file d'attente d'agrégation au début
    console.log(`🔍 DEBUG: Taille de la file d'agrégation au début: ${this.aggregationQueue.length}`);
    
    // Tracer quelques exemples de variables pour déboguer
    if (variables.length > 0) {
      console.log(`🔍 DEBUG: Exemples de variables à créer:`);
      variables.slice(0, 3).forEach((v, i) => {
        console.log(`🔍 DEBUG: Variable ${i+1}: "${v.variableName}" (${v.assetId}), type: ${v.dataType}, sourceType: ${v.sourceType}`);
      });
    }
    
    // Traiter chaque lot
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔍 DEBUG: Traitement du lot ${i + 1}/${batches.length} (${batch.length} variables)`);
      
      try {
        console.log(`🔍 DEBUG: Envoi du lot ${i + 1} à l'API...`);
        const result = await this.api.createVariablesBulk(batch);
        console.log(`🔍 DEBUG: Réponse reçue pour le lot ${i + 1}`);
        
        if (result.results && result.results.length > 0) {
          // Pour chaque variable créée, appliquer la rétention
          console.log(`✅ DEBUG: Lot ${i + 1}: ${result.results.length} variables créées avec succès`);
          
          // Planifier les agrégations pour chaque variable créée - AVEC LOGS EXPLICITES
          console.log(`🔄 DEBUG: DÉBUT: Planification des agrégations pour ${result.results.length} variables`);
          
          for (const variable of result.results) {
            try {
              // Appliquer la rétention
              console.log(`🔍 DEBUG: Application de la rétention pour "${variable.variableName}" (${variable.variableId})...`);
              await this.applyDataRetention(variable.variableId);
              
              // Déterminer le type d'agrégation approprié pour cette variable
              const aggregationType = this.determineAggregationType(variable.dataType);
              console.log(`⚙️ DEBUG: Création d'agrégations pour la variable "${variable.variableName}" (ID: ${variable.variableId}), type: ${aggregationType}`);
              
              // Créer des agrégations en utilisant le système de file d'attente
              const aggregationResult = await this.createAggregationsForVariable(variable.variableId, variable.variableName, aggregationType);
              const numAggregations = Object.keys(aggregationResult.aggregations || {}).length;
              aggregationsQueued += numAggregations;
              
              // *** CORRECTION ICI: Ajouter les agrégations récupérées aux métadonnées de la variable ***
              if (numAggregations > 0) {
                // Assurer l'existence de l'objet metadata sur la variable retournée par l'API
                if (!variable.metadata) {
                   variable.metadata = {};
                }
                variable.metadata.aggregations = aggregationResult.aggregations;
                console.log(`[importer.ts] ✅ DEBUG: Agrégations ajoutées aux métadonnées pour ${variable.variableName}`, variable.metadata.aggregations);
              } else {
                console.log(`[importer.ts] ℹ️ DEBUG: Aucune agrégation créée ou retournée pour ${variable.variableName}`);
              }
              // *** FIN CORRECTION ***

              // Corrected log statement (removed duplicate incorrect one)
              console.log(`✅ DEBUG: ${numAggregations} agrégations potentiellement créées/vérifiées pour \"${variable.variableName}\"`);
              console.log(`🔍 DEBUG: Taille actuelle de la file d'agrégation: ${this.aggregationQueue.length}`);
            } catch (error) {
              // Corrected error logging
              console.error(`❌ DEBUG: Erreur lors de la création d'agrégations pour ${variable.variableName}:`, error);
              results.errors.push({
                errorKey: 'AggregationError',
                message: `Erreur lors de la création des agrégations: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                // Corrected property names in error object
                variableName: variable.variableName,
                variableId: variable.variableId
              });
            }
          }
          
          console.log(`🔄 DEBUG: FIN: Planification des agrégations terminée pour le lot ${i + 1}`);
          console.log(`🔍 DEBUG: Taille de la file d'agrégation après planification: ${this.aggregationQueue.length}`);
          
          // Traiter les agrégations si le lot est suffisamment grand
          if (this.aggregationQueue.length > 0) {
            console.log(`⚙️ DEBUG: Traitement intermédiaire de ${this.aggregationQueue.length} agrégations en attente...`);
            const aggResult = await this.processAggregationQueue();
            aggregationsProcessed += aggResult.success;
            console.log(`✅ DEBUG: Traitement intermédiaire d'agrégations terminé: ${aggResult.success} succès, ${aggResult.errors} erreurs`);
          } else {
            console.log(`⚠️ DEBUG: Aucune agrégation en attente à traiter après la planification!`);
          }
          
          results.success = [...results.success, ...result.results];
          console.log(`✅ DEBUG: ${result.results.length} variables traitées avec succès dans le lot ${i + 1}`);
        } else {
          console.log(`⚠️ DEBUG: Aucune variable créée avec succès dans le lot ${i + 1}`);
        }
        
        if (result.errors && result.errors.length > 0) {
          // Ajouter les erreurs
          results.errors = [...results.errors, ...result.errors as ErrorType[]];
          console.error(`❌ DEBUG: ${result.errors.length} erreurs dans le lot ${i + 1}`);
          
          // Afficher les premières erreurs pour déboguer
          result.errors.slice(0, 3).forEach((err, idx) => {
            console.error(`❌ DEBUG: Erreur ${idx+1}: ${err.message} (variable: ${err.variableName})`);
          });
        }
        
      } catch (error) {
        console.error(`❌ DEBUG: Erreur lors du traitement du lot ${i + 1}:`, error);
        // Stocker l'erreur pour chaque variable du lot
        const errorInfo: ErrorType = {
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          batchIndex: i,
          variables: batch.map(v => v.variableName)
        };
        results.errors.push(errorInfo);
      }
      
      // Pause entre les lots pour éviter surcharge
      if (i < batches.length - 1) {
        console.log('⏸️ DEBUG: Pause de 1 seconde entre les lots...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Bilan final des statistiques
    console.log(`📊 DEBUG: BILAN FINAL:`);
    console.log(`📊 DEBUG: Variables créées: ${results.success.length}`);
    console.log(`📊 DEBUG: Erreurs variables: ${results.errors.length}`);
    console.log(`📊 DEBUG: Agrégations planifiées: ${aggregationsQueued}`);
    console.log(`📊 DEBUG: Agrégations traitées: ${aggregationsProcessed}`);
    console.log(`📊 DEBUG: Agrégations en attente: ${this.aggregationQueue.length}`);
    
    // Finaliser toutes les agrégations restantes
    if (this.aggregationQueue.length > 0) {
      console.log(`⚙️ DEBUG: Finalisation de ${this.aggregationQueue.length} agrégations restantes en attente...`);
      const finalAggResult = await this.finalizePendingAggregations();
      console.log(`🏁 DEBUG: Agrégations finalisées: ${finalAggResult.success} succès, ${finalAggResult.errors} erreurs`);
    } else {
      console.log(`✅ DEBUG: Aucune agrégation restante à traiter`);
    }
    
    return results;
  }
  
  /**
   * Prépare les données pour la création en masse de variables
   * @param assets Liste des assets de niveau 5
   * @returns Liste des variables à créer
   */
  private prepareVariablesBulkCreation(assets: any[]): IIHVariable[] {
    const variables: IIHVariable[] = [];

    assets.forEach(asset => {
      // --- CORRECTION ---
      // Extraire le type d'énergie DIRECTEMENT des métadonnées de l'asset 
      // telles qu'elles étaient au moment de la préparation (ou de la création).
      // On utilise une cascade de vérifications pour être sûr.
      let energyType = 'défaut'; // Valeur par défaut
      let source = 'défaut';
      if (asset.metadata) {
         if (asset.metadata.energyType && ['Elec', 'Gaz', 'Eau', 'Air'].includes(asset.metadata.energyType)) {
             energyType = asset.metadata.energyType; // Prend la valeur capitalisée ('Eau')
             source = 'metadata.energyType';
         } else if (asset.metadata.rawEnergyType) {
             // Si energyType n'était pas là ou pas valide, essayer rawEnergyType
             energyType = asset.metadata.rawEnergyType; // Prend la valeur brute ('eau')
             source = 'metadata.rawEnergyType';
         }
      }
      
      // Si on n'a toujours rien trouvé dans les métadonnées, utiliser le défaut global
      if (source === 'défaut') {
          energyType = this._importConfig.defaultEnergyType || 'elec';
          energyType = energyType.charAt(0).toUpperCase() + energyType.slice(1); // Assurer la capitalisation ('Elec')
          console.warn(`⚠️ Impossible de déterminer le type d'énergie depuis les métadonnées pour l'asset "${asset.name}" (${asset.assetId}). Utilisation du type par défaut: ${energyType}`);
          source = `config défaut (${energyType})`;
      }

      console.log(`Type d'énergie déterminé pour "${asset.name}" AVANT création variable: ${energyType} (Source: ${source})`);
      // --- FIN CORRECTION ---

      const assetName = asset.name;
      const assetId = asset.assetId;

      // Déterminer l'unité en fonction du type d'énergie déterminé ci-dessus
      const unit = this.determineEnergyUnit(energyType);

      // Création des variables avec configuration complète en utilisant le 'energyType' fiable
      variables.push(this.createConsumptionVariable(assetId, assetName, energyType, unit));
      variables.push(this.createSensorStatusVariable(assetId, assetName));
    });

    return variables;
  }
  
  /**
   * Crée une variable de consommation avec configuration tags
   */
  private createConsumptionVariable(assetId: string, assetName: string, energyType: string, unit: string): IIHVariable {
    console.log(`Création d'une variable de consommation pour l'asset "${assetName}" (ID: ${assetId}) avec le type d'énergie "${energyType}"`);
    
    // Normaliser le type d'énergie en minuscules pour correspondre aux clés de ENERGY_TYPES
    const energyTypeKey = normalizeEnergyType(energyType).toLowerCase();
    
    console.log(`Type d'énergie normalisé: "${energyTypeKey}"`);
    console.log(`Types d'énergie disponibles:`, Object.keys(ENERGY_TYPES));
    
    // Vérifier si le type d'énergie est reconnu dans la configuration
    if (ENERGY_TYPES[energyTypeKey]) {
      const config = ENERGY_TYPES[energyTypeKey];
      console.log(`✓ Type d'énergie reconnu dans la configuration: "${energyTypeKey}" (nom: ${config.name}, unité: ${config.unit})`);
      
      // Nettoyer le nom de l'asset pour éviter les caractères spéciaux dans le nom de la variable
      const cleanAssetName = this.sanitizeNameForVariable(assetName);
      
      // Construction du nom de la variable - IMPORTANT: Utiliser directement energyTypeKey au lieu de config.name
      // pour garantir la cohérence et éviter les confusions (par ex. 'eau' au lieu de 'électricité')
      const variableName = `Consommation_${energyTypeKey}_${cleanAssetName}`;
      
      console.log(`Variable de consommation créée: "${variableName}" (${config.unit})`);
      
      // IMPORTANT: Utiliser toujours le tag générique de consommation
      const topic = this._importConfig.tagMappings.consumption;
      
      return {
        variableName: variableName,
        dataType: 'Float' as const,
        assetId: assetId,
        unit: config.unit, // Utiliser l'unité définie dans la configuration
        description: `Consommation de ${config.name} pour ${assetName}`,
        // Utiliser la configuration personnalisée
        adapterId: this._importConfig.adapterId,
        connectionName: cleanAssetName,
        topic: topic,
        store: true,
        sourceType: "Tag",
        // Ajouter l'objet tag requis par l'API
        tag: {
          adapterId: this._importConfig.adapterId,
          connectionName: cleanAssetName,
          tagName: topic,
          dataType: 'Float'
        }
      };
    } 
    // Fallback pour les types d'énergie non reconnus
    else {
      console.log(`⚠️ Type d'énergie "${energyTypeKey}" non trouvé dans ENERGY_TYPES. Vérification supplémentaire...`);
      
      // Vérifier si c'est un problème de casse ou de format - Essai de détection par normalisation
      const detectedType = normalizeEnergyType(energyType);
      
      // Si la normalisation a trouvé un type connu, utiliser ce type
      if (detectedType && ENERGY_TYPES[detectedType.toLowerCase()]) {
        console.log(`✓ Type d'énergie détecté après normalisation: "${detectedType}"`);
        return this.createConsumptionVariable(assetId, assetName, detectedType, unit);
      }
      
      // Sinon, création d'une variable personnalisée
      console.log(`⚠️ Création d'une variable personnalisée pour le type d'énergie non reconnu "${energyType}"`);
      
      // Normaliser le type d'énergie pour la variable (première lettre majuscule, reste minuscule)
      const normalizedEnergyType = energyType === 'défaut' 
        ? 'Energie' 
        : energyType.charAt(0).toUpperCase() + energyType.slice(1).toLowerCase();
      
      // Nettoyer le nom de l'asset pour éviter les caractères spéciaux dans le nom de la variable
      const cleanAssetName = this.sanitizeNameForVariable(assetName);
      
      // Construction du nom de la variable
      const variableName = `Consommation_${normalizedEnergyType}_${cleanAssetName}`;
      
      console.log(`Variable de consommation personnalisée créée: "${variableName}" (${unit})`);
      
      // IMPORTANT: Utiliser toujours le tag générique de consommation
      const topic = this._importConfig.tagMappings.consumption;
      
      return {
        variableName: variableName,
        dataType: 'Float' as const,
        assetId: assetId,
        unit: unit,
        description: `Consommation d'énergie (${normalizedEnergyType}) pour ${assetName}`,
        // Utiliser la configuration personnalisée
        adapterId: this._importConfig.adapterId,
        connectionName: cleanAssetName,
        topic: topic,
        store: true,
        sourceType: "Tag",
        // Ajouter l'objet tag requis par l'API
        tag: {
          adapterId: this._importConfig.adapterId,
          connectionName: cleanAssetName,
          tagName: topic,
          dataType: 'Float'
        }
      };
    }
  }
  
  /**
   * Crée une variable d'état capteur
   */
  private createSensorStatusVariable(assetId: string, assetName: string): IIHVariable {
    // Nettoyer le nom de l'asset pour éviter les caractères spéciaux dans le nom de la variable
    const cleanAssetName = this.sanitizeNameForVariable(assetName);
    
    // Construction du nom de la variable
    const variableName = `Etat_capteur_${cleanAssetName}`;
    
    console.log(`Création de la variable d'état capteur: "${variableName}"`);
    
    // Définir le topic pour l'état du capteur
    const sensorTopic = this._importConfig.tagMappings.sensorStatus;
    
    return {
      variableName: variableName,
      dataType: 'String' as const,
      assetId: assetId,
      description: `État du capteur pour ${assetName}`,
      // Utiliser la configuration personnalisée
      adapterId: this._importConfig.adapterId,
      connectionName: cleanAssetName,
      topic: sensorTopic,
      store: true,
      sourceType: "Tag",
      // Ajouter l'objet tag requis par l'API
      tag: {
        adapterId: this._importConfig.adapterId,
        connectionName: cleanAssetName,
        tagName: sensorTopic,
        dataType: 'String'
      }
    };
  }
  
  /**
   * Nettoie un nom pour l'utiliser dans un nom de variable
   * Remplace les caractères spéciaux par des underscores
   */
  private sanitizeNameForVariable(name: string): string {
    return sanitizeNameForVariable(name);
  }
  
  /**
   * Détermine l'unité en fonction du type d'énergie
   * @param energyType Type d'énergie
   * @returns Unité appropriée
   */
  private determineEnergyUnit(energyType: string): string {
    // Normalisation du type pour comparaison insensible à la casse
    const normalizedType = energyType.toLowerCase();
    
    // Correspondance exacte prioritaire
    const energyUnitMap: Record<string, string> = {
      'elec': 'kWh',
      'electricité': 'kWh',
      'électricité': 'kWh',
      'gaz': 'm³',
      'eau': 'm³',
      'air': 'm³',
      'défaut': 'kWh'
    };
    
    // Vérifier les correspondances exactes
    for (const [key, unit] of Object.entries(energyUnitMap)) {
      if (normalizedType === key) {
        console.log(`Unité déterminée par correspondance exacte pour "${energyType}": ${unit}`);
        return unit;
      }
    }
    
    // Types d'énergie qui utilisent kWh
    if (normalizedType.includes('elec') || 
        normalizedType.includes('électric') || 
        normalizedType.includes('electric') ||
        normalizedType.includes('kw') || 
        normalizedType.includes('kwh')) {
      console.log(`Unité déterminée pour "${energyType}": kWh (détecté comme électricité)`);
      return 'kWh';
    }
    
    // Types d'énergie qui utilisent m³
    if (normalizedType.includes('eau') || 
        normalizedType.includes('water') ||
        normalizedType.includes('air') || 
        normalizedType.includes('gaz')) {
      console.log(`Unité déterminée pour "${energyType}": m³ (détecté comme fluide)`);
      return 'm³';
    }
    
    // Par défaut, utiliser kWh
    console.log(`Unité par défaut utilisée pour "${energyType}": kWh`);
    return 'kWh';
  }
  
  /**
   * Analyse les résultats de la création en masse
   * @param results Résultats de l'opération
   */
  private analyzeVariableCreationResults(results: {
    success: IIHVariableResponse[];
    errors: Array<{
      errorKey: string;
      message: string;
      variableName: string;
      assetId: string;
    }>;
  }): void {
    console.log(`Variables créées avec succès: ${results.success.length}`);
    
    if (results.errors && results.errors.length > 0) {
      console.warn(`Erreurs lors de la création de ${results.errors.length} variables:`);
      
      // Regrouper les erreurs par type pour une meilleure lisibilité
      const errorsGrouped = results.errors.reduce((groups: Record<string, any[]>, error) => {
        const errorKey = error.errorKey || 'Inconnu';
        if (!groups[errorKey]) groups[errorKey] = [];
        groups[errorKey].push(error);
        return groups;
      }, {});
      
      Object.entries(errorsGrouped).forEach(([errorType, errors]) => {
        console.warn(`Type d'erreur: ${errorType}, Nombre: ${errors.length}`);
        // Montrer un exemple d'erreur de ce type
        console.warn('Exemple:', errors[0]);
      });
    }
  }

  /**
   * Crée des variables pour tous les assets à tous les niveaux
   * @param assets Liste des assets pour lesquels créer des variables
   * @returns Résultat de l'opération
   */
  async createVariablesForAllAssets(assets: any[]): Promise<ImportResponse> {
    try {
      // Initialiser le système d'agrégation
      this.initAggregationSystem();
      
      console.log('Démarrage de la création de variables hiérarchiques pour tous les assets...');
      console.log(`Nombre total d'assets reçus: ${assets.length}`);
      
      // 0. Initialiser la cache d'assets pour les opérations hiérarchiques
      this.initAllAssets(assets);
      
      // 1. Classer les assets par niveau (1 à 5)
      const assetsByLevel = this.groupAssetsByLevel(assets);
      
      // Déterminer le véritable niveau maximum de la hiérarchie qui contient des assets
      const populatedLevels = Object.keys(assetsByLevel).map(Number).filter(k => assetsByLevel[k]?.length > 0);
      const trueMaxLevel = populatedLevels.length > 0 ? Math.max(...populatedLevels) : 0;
      console.log(`Niveau maximum réel de la hiérarchie avec des assets: ${trueMaxLevel}`);

      console.log('Répartition des assets par niveau:');
      Object.entries(assetsByLevel).forEach(([level, assetList]) => {
        console.log(`Niveau ${level}: ${assetList.length} assets`);
      });
      
      // 2. Créer les variables pour tous les niveaux
      let allVariablesToCreate: IIHVariable[] = [];
      
      // Commencer par le niveau 5 (le plus bas) pour pouvoir
      // construire les formules correctement pour les niveaux supérieurs
      for (let level = trueMaxLevel; level >= 1; level--) { // Modifier la boucle pour commencer à trueMaxLevel
        if (assetsByLevel[level] && assetsByLevel[level].length > 0) {
          console.log(`Préparation des variables pour les assets de niveau ${level}...`);
          
          // Créer différentes variables selon le niveau
          const variablesForLevel = await this.prepareVariablesForLevel(
            level, 
            assetsByLevel[level],
            assetsByLevel,
            trueMaxLevel // Passer le véritable niveau maximum
          );
          
          allVariablesToCreate = [...allVariablesToCreate, ...variablesForLevel];
          console.log(`${variablesForLevel.length} variables préparées pour le niveau ${level}`);
        }
      }
      
      console.log(`Total: ${allVariablesToCreate.length} variables à créer pour tous les niveaux`);
      
      // 3. Créer les variables en lots
      const results = await this.createVariablesInBatches(allVariablesToCreate);
      
      // Ensure all pending aggregations are processed before returning
      await this.finalizePendingAggregations();

      // NEW: Update localStorage after processing all assets
      // Corrected to use results.results based on BulkCreateVariablesResponse type
      if (results.results && results.results.length > 0) {
          console.log("[importer.ts] Calling updateIIHStructureWithAggregations after processing all assets.");
          updateIIHStructureWithAggregations(results.results);
      } else {
          console.log("[importer.ts] No successful variable creations to update localStorage after processing all assets.");
      }

      return {
        success: true,
        message: `Import hiérarchique terminé avec succès. ${results.results.length} variables créées.`,
        assets: assets,
        variables: results.results
      };
    } catch (error) {
      console.error('Erreur lors de la création des variables hiérarchiques:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables hiérarchiques',
        error
      };
    }
  }

  /**
   * Groupe les assets par niveau en utilisant la stratégie de la feuille
   * @param assets Liste de tous les assets
   * @returns Objet avec les assets regroupés par niveau
   */
  private groupAssetsByLevel(assets: any[]): Record<number, any[]> {
    const assetsByLevel: Record<number, any[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };
    
    console.log("Application de la stratégie de la feuille pour identifier tous les niveaux...");
    
    // 1. Identifier les parents (assets qui sont référencés comme parentId)
    const parentIds = new Set<string>();
    assets.forEach(asset => {
      if (asset.parentId) {
        parentIds.add(asset.parentId);
      }
    });
    
    // 2. Niveau 5 = assets qui ne sont pas des parents (feuilles)
    const level5Assets = assets.filter(asset => !parentIds.has(asset.assetId));
    assetsByLevel[5] = level5Assets;
    console.log(`Identifié ${level5Assets.length} assets de niveau 5 (feuilles)`);
    
    // 3. Créer un index des assets par ID pour faciliter la recherche
    const assetsById = new Map<string, any>();
    assets.forEach(asset => {
      assetsById.set(asset.assetId, asset);
    });
    
    // 4. Maintenant, pour chaque asset de niveau 5, remonter la chaîne des parents
    // pour déterminer les niveaux 4, 3, 2, 1
    const processedIds = new Set<string>(level5Assets.map(a => a.assetId));
    
    // Traiter chaque asset de niveau 5
    level5Assets.forEach(asset => {
      let currentAsset = asset;
      let currentLevel = 5;
      
      // Remonter la chaîne des parents
      while (currentAsset.parentId && currentLevel > 1) {
        const parentAsset = assetsById.get(currentAsset.parentId);
        if (!parentAsset) break;
        
        currentLevel--; // Remonter d'un niveau
        
        // Éviter les doublons
        if (!processedIds.has(parentAsset.assetId)) {
          assetsByLevel[currentLevel].push(parentAsset);
          processedIds.add(parentAsset.assetId);
        }
        
        currentAsset = parentAsset;
      }
    });
    
    // 5. Traiter les assets orphelins ou ceux dont la hiérarchie est incomplète
    assets.forEach(asset => {
      if (!processedIds.has(asset.assetId)) {
        // Essayer de déterminer le niveau par d'autres méthodes
        const level = this.determineAssetLevel(asset);
        if (level && level >= 1 && level <= 5) {
          assetsByLevel[level].push(asset);
          processedIds.add(asset.assetId);
          console.log(`Asset "${asset.name}" ajouté au niveau ${level} par la méthode alternative`);
        } else {
          // Par défaut, ajouter au niveau 3 si on ne peut pas déterminer
          assetsByLevel[3].push(asset);
          processedIds.add(asset.assetId);
          console.log(`Asset "${asset.name}" ajouté au niveau 3 par défaut (non classé)`);
        }
      }
    });
    
    return assetsByLevel;
  }

  /**
   * Détermine le niveau d'un asset 
   * @param asset Asset à analyser
   * @returns Niveau déterminé (1-5) ou undefined si impossible à déterminer
   */
  private determineAssetLevel(asset: any): number {
    // Stratégie 1: Vérification directe si disponible
    if (asset.metadata?.level) {
      // Si le level est stocké comme chaîne, tenter de le convertir
      if (typeof asset.metadata.level === 'string') {
        const match = asset.metadata.level.match(/\d+/);
        if (match) {
          const level = parseInt(match[0]);
          console.log(`Niveau ${level} détecté pour ${asset.name} via metadata.level (string)`);
          return level;
        }
      } else if (typeof asset.metadata.level === 'number') {
        console.log(`Niveau ${asset.metadata.level} détecté pour ${asset.name} via metadata.level (number)`);
        return asset.metadata.level;
      }
    }
    
    // Stratégie 2: Vérifier le format "X/Y" dans position
    if (asset.metadata?.position) {
      const parts = asset.metadata.position.split('/');
      if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
        const level = parseInt(parts[0]);
        console.log(`Niveau ${level} détecté pour ${asset.name} via metadata.position`);
        return level;
      }
    }
    
    // Stratégie 3: Vérifier s'il s'agit d'un asset de type machine (niveau 5)
    if (asset.type === 'machine') {
      console.log(`Niveau 5 détecté pour ${asset.name} (type machine)`);
      return 5;
    }
    
    // Stratégie 4: Essayer de déterminer à partir de la profondeur du chemin
    if (asset.metadata?.path && Array.isArray(asset.metadata.path)) {
      const level = Math.min(asset.metadata.path.length, 5);
      console.log(`Niveau ${level} détecté pour ${asset.name} via metadata.path (profondeur)`);
      return level;
    }
    
    // Stratégie 5: Analyse de la structure du parentId
    // Si un asset a un parent mais n'est pas un parent lui-même, c'est probablement un niveau 5
    if (asset.parentId && !this.isParentOfAnyAsset(asset.assetId)) {
      console.log(`Niveau 5 détecté pour ${asset.name} (feuille dans la hiérarchie)`);
      return 5;
    }
    
    // Stratégie 6: Analyse basée sur le nom de l'asset (noms fréquents à chaque niveau)
    const name = asset.name.toUpperCase();
    
    // Niveau 1 - Usine / Site
    if (name.includes('USINE') || name.includes('SITE') || name === 'USINE') {
      console.log(`Niveau 1 détecté pour ${asset.name} basé sur le nom`);
      return 1;
    }
    
    // Niveau 2 - Ateliers/Département
    if (name.includes('ATELIER') || name.includes('PRODUCTION') || 
        name.includes('FACILITIES') || name.includes('SUPPORT') ||
        name.includes('BATIMENT')) {
      console.log(`Niveau 2 détecté pour ${asset.name} basé sur le nom`);
      return 2;
    }
    
    // Niveau 3 - Lignes/Zones
    if (name.includes('LIGNE') || name.includes('LT') ||
        name.includes('PEINTURE') || name.includes('CHAUFFERIE') ||
        name.includes('GROUPE_FROID') || name.includes('AIR COMPRIME') ||
        name.includes('EAU')) {
      console.log(`Niveau 3 détecté pour ${asset.name} basé sur le nom`);
      return 3;
    }
    
    // Niveau 4 - Machines/Systèmes
    if (name.includes('MACHINE') || name.includes('PRESSE') ||
        name.includes('FOUR') || name.includes('TDE') ||
        name.includes('NSA') || name.includes('EXTERIEURS')) {
      console.log(`Niveau 4 détecté pour ${asset.name} basé sur le nom`);
      return 4;
    }
    
    // Stratégie 7: Détection basée sur la hiérarchie des assets
    const hierarchyDepth = this.calculateHierarchyDepth(asset);
    if (hierarchyDepth > 0) {
      console.log(`Niveau ${hierarchyDepth} détecté pour ${asset.name} basé sur la hiérarchie`);
      return hierarchyDepth;
    }
    
    // Attribution par défaut prudente - niveau 3 (milieu de la hiérarchie)
    console.log(`⚠️ Niveau par défaut (3) attribué pour l'asset: ${asset.name} (${asset.assetId})`);
    return 3;
  }
  
  /**
   * Vérifie si un asset est parent d'au moins un autre asset
   * @param assetId ID de l'asset à vérifier
   * @returns true si c'est un parent, false sinon
   */
  private isParentOfAnyAsset(assetId: string): boolean {
    // Pour déterminer si un asset est parent, on vérifie si son ID est utilisé comme parentId par d'autres assets
    return Array.from(this._allAssets.values()).some(asset => asset.parentId === assetId);
  }
  
  /**
   * Calcule la profondeur de la hiérarchie d'un asset
   * @param asset Asset à analyser
   * @returns Profondeur de la hiérarchie (1-5)
   */
  private calculateHierarchyDepth(asset: any): number {
    // On compte combien de fois on peut remonter la chaîne des parents
    let depth = 1;
    let currentAsset = asset;
    
    while (currentAsset.parentId && depth < 5) {
      const parent = this._allAssets.get(currentAsset.parentId);
      if (!parent) break;
      
      depth++;
      currentAsset = parent;
    }
    
    return depth;
  }

  /**
   * Prépare les variables pour un niveau spécifique
   * @param level Niveau des assets (1-5)
   * @param assetsOfLevel Assets du niveau spécifié
   * @param allAssetsByLevel Tous les assets groupés par niveau
   * @returns Liste des variables à créer
   */
  private async prepareVariablesForLevel(
    level: number, 
    assetsOfLevel: any[], 
    allAssetsByLevel: Record<number, any[]>,
    trueMaxLevel: number // Nouveau paramètre
  ): Promise<IIHVariable[]> {
    const variables: IIHVariable[] = [];
    
    for (const asset of assetsOfLevel) {
      // 1. Créer les variables de base pour tous les niveaux
      this.addBasicVariablesForAsset(asset, variables, trueMaxLevel); // Passer trueMaxLevel ici
      
      // 2. Pour les niveaux 1-4, ajouter/mettre à jour les formules pour les variables de type "rule"
      // COMMENT OUT: This block is no longer needed as consumption variables are now Tags
      /*
      if (level < 5) {
        await this.addRuleVariablesForAsset(asset, level, allAssetsByLevel, variables);
      }
      */
    }
    
    // COMMENT OUT: This verification is no longer needed for consumption variables
    /*
    // Vérification des variables de type Rule pour s'assurer qu'elles ont des formules valides
    const ruleVariables = variables.filter(v => v.sourceType === 'Rule');
    console.log(`Vérification de ${ruleVariables.length} variables de type Rule pour le niveau ${level}`);
    
    ruleVariables.forEach(v => {
      if (!v.formula || v.formula === '0') {
        console.warn(`⚠️ Variable Rule sans formule valide: ${v.variableName} (formule = "${v.formula}")`);
      } else {
        console.log(`✓ Variable Rule avec formule valide: ${v.variableName}`);
      }
    });
    */
    
    return variables;
  }

  /**
   * Ajoute les variables de base pour un asset
   * @param asset Asset pour lequel créer les variables
   * @param variables Tableau de variables à compléter
   * @param maxLevelNumber Le numéro du dernier niveau dans la hiérarchie actuelle // <- NOUVEAU PARAM
   */
  private addBasicVariablesForAsset(asset: any, variables: IIHVariable[], hierarchyMaxLevel: number): void { // <- NOUVEAU PARAM
    const assetName = asset.name;
    const assetId = asset.assetId;
    const sanitizedAssetName = this.sanitizeNameForVariable(assetName);
    const assetLevel = this.determineAssetLevel(asset);

    console.log(`[addBasicVariablesForAsset] Asset: ${assetName}, Niveau détecté: ${assetLevel}, Max Niveau Hiérarchie: ${hierarchyMaxLevel}`);

    // Pour les assets du DERNIER niveau de la hiérarchie
    if (assetLevel === hierarchyMaxLevel) {
      const assetEnergyType = this.getAssetEnergyType(asset);

      console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] Asset: ${assetName}, Type Energie: ${assetEnergyType}`);
      console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] Vérification config includeIpeProdOnLastLevel: ${this._importConfig.includeIpeProdOnLastLevel}`);

      // 1. Créer la variable de consommation (logique inchangée)
      if (ENERGY_TYPES[assetEnergyType]) {
        const config = ENERGY_TYPES[assetEnergyType];
        console.log(`Asset niveau 5: ${assetName} - Création variable consommation type ${assetEnergyType}`);
        const consumptionTopic = this._importConfig.tagMappings.consumption;
        variables.push({
          variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
          dataType: 'Float' as const,
          assetId: assetId,
          unit: config.unit,
          description: `Consommation de ${config.name} pour ${assetName}`,
          adapterId: this._importConfig.adapterId,
          connectionName: sanitizedAssetName,
          topic: consumptionTopic,
          sourceType: "Tag",
          store: true,
          tag: {
            adapterId: this._importConfig.adapterId,
            connectionName: sanitizedAssetName,
            tagName: consumptionTopic,
            dataType: 'Float'
          }
        });
      } else {
        console.warn(`[addBasicVariablesForAsset L5] ⚠️ Type d'énergie ${assetEnergyType} non trouvé dans ENERGY_TYPES pour ${assetName}, variable de consommation non créée.`);
      }

      // 2. Créer la variable d'état capteur
      const sensorTopic = this._importConfig.tagMappings.sensorStatus;
      variables.push({
        variableName: `Etat_capteur_${sanitizedAssetName}`,
        dataType: 'String' as const,
        assetId: assetId,
        description: `État du capteur pour ${assetName}`,
        adapterId: this._importConfig.adapterId,
        connectionName: sanitizedAssetName,
        topic: sensorTopic,
        sourceType: "Tag",
        store: true,
        tag: {
          adapterId: this._importConfig.adapterId,
          connectionName: sanitizedAssetName,
          tagName: sensorTopic,
          dataType: 'String'
        }
      });

      // --- Condition pour IPE et Production au DERNIER Niveau ---
      if (this._importConfig.includeIpeProdOnLastLevel) {
        console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel} - OPTION ACTIVE] Ajout IPE et Production pour ${assetName}`);
        console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] Tag Prod Pcs L5: ${this._importConfig.tagMappings.productionPcsL5}`);
        console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] Tag IPE: ${this._importConfig.tagMappings.ipe}`);

        // 3. Variable Production (pcs)
        const productionL5Topic = this._importConfig.tagMappings.productionPcsL5; // Utilise le tag spécifique L5
        if (productionL5Topic) {
          variables.push({
            variableName: `Production_${sanitizedAssetName}`,
            dataType: 'Float' as const,
            unit: "pcs",
            assetId: assetId,
            description: `Production pour ${assetName} (Niveau ${hierarchyMaxLevel} - L5 spécifique)`, 
            adapterId: this._importConfig.adapterId,
            connectionName: sanitizedAssetName,
            topic: productionL5Topic,
            sourceType: "Tag",
            store: true,
            tag: {
              adapterId: this._importConfig.adapterId,
              connectionName: sanitizedAssetName,
              tagName: productionL5Topic,
              dataType: 'Float'
            }
          });
           console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] ✅ Variable Production (L5 spécifique) ajoutée pour ${assetName} avec tag ${productionL5Topic}`);
        } else {
           console.warn(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] ⚠️ Tag manquant pour 'productionPcsL5'...`);
        }

        // 4. Variable IPE (générique) avec unité conditionnelle
        const ipeTopic = this._importConfig.tagMappings.ipe;
        if (ipeTopic) {
          let ipeUnit: string;
          if (assetEnergyType === 'elec') {
            ipeUnit = "kWh/pcs";
          } else if (['gaz', 'eau', 'air'].includes(assetEnergyType)) {
            ipeUnit = "m³/pcs";
          } else {
            ipeUnit = "unit/pcs";
          }
          console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] Type ${assetEnergyType} détecté, Unité IPE: ${ipeUnit}`);

          variables.push({
            variableName: `IPE_${sanitizedAssetName}`,
            dataType: 'Float' as const,
            unit: ipeUnit,
            assetId: assetId,
            description: `Indicateur de performance énergétique (${assetEnergyType}) pour ${assetName} (Niveau ${hierarchyMaxLevel} - L5 spécifique)`, 
            adapterId: this._importConfig.adapterId,
            connectionName: sanitizedAssetName,
            topic: ipeTopic,
            sourceType: "Tag",
            store: true,
            tag: {
              adapterId: this._importConfig.adapterId,
              connectionName: sanitizedAssetName,
              tagName: ipeTopic,
              dataType: 'Float'
            }
          });
          console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] ✅ Variable IPE ajoutée pour ${assetName} avec unité ${ipeUnit}`);
        } else {
          console.warn(`[addBasicVariablesForAsset L${hierarchyMaxLevel}] ⚠️ Tag manquant pour 'ipe'...`);
        }
      } else {
         console.log(`[addBasicVariablesForAsset L${hierarchyMaxLevel} - OPTION INACTIVE] Pas d'ajout IPE et Production pour ${assetName}`);
      }

    }
    // Pour les assets des niveaux 1 à hierarchyMaxLevel - 1 (Niveaux supérieurs)
    else {
      console.log(`Asset niveau ${assetLevel}: ${assetName} - Création des variables standardisées (Niveaux supérieurs 1-${hierarchyMaxLevel-1})`);
      // --- ICI : La logique existante pour les niveaux 1-4 doit être conservée ---\n

      // 1. Variables de consommation par type d'énergie (Type Tag)
      for (const [type, config] of Object.entries(ENERGY_TYPES)) {
         // ... code existant pour conso L1-4 ...
         // (Assurez-vous que ce code crée les variables ici)
         // Exemple simplifié:
         const mappingKey = `consumption${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof ImportConfiguration['tagMappings'];
         const specificTagName = this._importConfig.tagMappings[mappingKey];
         const tagName = specificTagName || `conso_${type}`;
         variables.push({
           variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
           dataType: 'Float' as const,
           assetId: assetId,
           unit: config.unit,
           description: `Consommation de ${config.name} pour ${assetName} (Tag L1-4)`,
           sourceType: "Tag",
           store: true,
           adapterId: this._importConfig.adapterId,
           connectionName: sanitizedAssetName,
           tag: {
             adapterId: this._importConfig.adapterId,
             connectionName: sanitizedAssetName,
             tagName: tagName,
             dataType: 'Float'
           }
         });
      }

      // 2. Variables de production et IPE (Type Tag avec tags spécifiques)
      // --- CORRECTION: Ajout d'un type explicite ---
      const productionVars: { variableName: string; dataType: 'Float'; unit: string; description: string; topic: string }[] = [
          {
            variableName: `Production_${sanitizedAssetName}`,
            dataType: 'Float' as const,
            unit: "pcs",
            description: `Production pour ${assetName}`,
            topic: this._importConfig.tagMappings.productionPcs
          },
          {
            variableName: `Production_kg_${sanitizedAssetName}`,
            dataType: 'Float' as const,
            unit: "kg",
            description: `Production en kg pour ${assetName}`,
            topic: this._importConfig.tagMappings.productionKg
          }
      ];
      // --- CORRECTION: Ajout d'un type explicite ---
      const ipeVarsByEnergyType: { variableName: string; dataType: 'Float'; unit: string; description: string; topic: string }[] = [];
      for (const energyType of ['elec', 'gaz', 'eau', 'air']) {
         // --- Assurez-vous que ce code est décommenté et fonctionnel ---
         const getTagMapping = (prefix: string, energyType: string, fallback: string) => {
            const key = `${prefix}${energyType.charAt(0).toUpperCase() + energyType.slice(1)}Tag` as keyof typeof this._importConfig.tagMappings;
            return this._importConfig.tagMappings[key] || fallback;
         };

         ipeVarsByEnergyType.push({
           variableName: `IPE_${energyType}_${sanitizedAssetName}`,
           dataType: 'Float' as const,
           // L'unité IPE dépend de l'énergie pour les niveaux 1-4 aussi ? Ou fixe ?
           // Supposons kWh/pcs pour Elec, m³/pcs pour les autres pour cohérence
           unit: energyType === 'elec' ? "kWh/pcs" : "m³/pcs",
           description: `Indicateur de performance énergétique (${energyType}) pour ${assetName}`,
           topic: getTagMapping('ipe', energyType, `ipe_${energyType}`)
         });

         ipeVarsByEnergyType.push({
           variableName: `IPE_kg_${energyType}_${sanitizedAssetName}`,
           dataType: 'Float' as const,
           // Unité pour IPE kg ? kWh/kg pour Elec, m³/kg pour autres ?
           unit: energyType === 'elec' ? "kWh/kg" : "m³/kg",
           description: `Indicateur de performance énergétique en kg (${energyType}) pour ${assetName}`,
           topic: getTagMapping('ipeKg', energyType, `ipe_kg_${energyType}`)
         });
         // --- Fin du code à décommenter/vérifier ---
      }
      const allVars = [...productionVars, ...ipeVarsByEnergyType];
      allVars.forEach(varConfig => {
        // --- Assurez-vous que ce code est décommenté et fonctionnel ---
        const topic = varConfig.topic;
        variables.push({
          // Utiliser les propriétés de varConfig
          variableName: varConfig.variableName,
          dataType: varConfig.dataType,
          unit: varConfig.unit,
          description: varConfig.description,
          // Propriétés communes
          assetId: assetId,
          adapterId: this._importConfig.adapterId,
          connectionName: sanitizedAssetName,
          sourceType: "Tag",
          store: true,
          tag: {
            adapterId: this._importConfig.adapterId,
            connectionName: sanitizedAssetName,
            tagName: topic, // Utiliser le topic de varConfig
            dataType: varConfig.dataType // Utiliser le dataType de varConfig
          }
        });
        // --- Fin du code à décommenter/vérifier ---
      });
      // --- FIN de la logique pour L1 à maxLevelNumber-1 ---
    }
  }
  
  /**
   * Récupère le type d'énergie d'un asset EN SE BASANT sur les métadonnées ou le type par défaut.
   * @param asset Asset à analyser (doit contenir asset.metadata.energyType ou asset.metadata.rawEnergyType si possible)
   * @returns Type d'énergie normalisé (clé dans ENERGY_TYPES) ou le type par défaut
   */
  private getAssetEnergyType(asset: any): string {
    const assetNameForLog = asset.name || 'Nom Inconnu';
    const assetIdForLog = asset.assetId || 'ID Inconnu';
    // MODIFICATION: Log de début ajusté
    console.log(`(getAssetEnergyType) Détection pour "${assetNameForLog}" (ID: ${assetIdForLog}) - Priorité Métadonnées`);

    let finalEnergyType: string | null = null;
    let source = "défaut";
    let rawValueFromMetadata: string | null = null; // Pour log

    // 1. Vérifier les métadonnées de l'asset (priorité)
    if (asset.metadata) {
      // Essayer d'abord avec energyType (qui est déjà normalisé en théorie)
      if (asset.metadata.energyType && ['Elec', 'Gaz', 'Eau', 'Air'].includes(asset.metadata.energyType)) {
        finalEnergyType = asset.metadata.energyType.toLowerCase(); // 'Elec' -> 'elec'
        rawValueFromMetadata = asset.metadata.energyType;
        source = `Metadata (energyType: "${rawValueFromMetadata}" -> "${finalEnergyType}")`;
      } 
      // Sinon, essayer avec rawEnergyType (valeur brute)
      else if (asset.metadata.rawEnergyType) {
        rawValueFromMetadata = asset.metadata.rawEnergyType;
        // Utiliser directement asset.metadata.rawEnergyType ici
        const normalized = normalizeEnergyType(asset.metadata.rawEnergyType); 
        if (['elec', 'gaz', 'eau', 'air'].includes(normalized)) {
          finalEnergyType = normalized;
          source = `Metadata (rawEnergyType: "${rawValueFromMetadata}" -> "${finalEnergyType}")`; 
        } else {
          console.warn(`  (getAssetEnergyType) ⚠️ Type "${rawValueFromMetadata}" depuis metadata.rawEnergyType non reconnu après normalisation ("${normalized}").`);
        }
      }
    }

    // 2. Si aucun type valide n'a été trouvé depuis les métadonnées, utiliser le type par défaut
    if (!finalEnergyType) {
      const defaultType = this._importConfig.defaultEnergyType || 'elec'; // Fallback sur 'elec' si default non défini
      finalEnergyType = defaultType; // Assign default type
      source = `Défaut (${finalEnergyType})`;
      console.warn(`  (getAssetEnergyType) ⚠️ Aucun type valide trouvé dans metadata pour "${assetNameForLog}". Utilisation défaut: ${finalEnergyType}`);
    }

    console.log(`  (getAssetEnergyType) ✓ Type final pour "${assetNameForLog}": "${finalEnergyType}" (Source: ${source})`);
    return finalEnergyType; // Retourne la clé normalisée ('elec', 'eau', etc.)
  }

  /**
   * Ajoute les variables de type "rule" pour les assets de niveau 1-4
   * @param asset Asset pour lequel créer les variables
   * @param level Niveau de l'asset
   * @param allAssetsByLevel Tous les assets groupés par niveau
   * @param variables Tableau de variables à compléter
   */
  private async addRuleVariablesForAsset(
    asset: any, 
    level: number, 
    allAssetsByLevel: Record<number, any[]>,
    variables: IIHVariable[]
  ): Promise<void> {
    const assetName = asset.name;
    const assetId = asset.assetId;
    const sanitizedAssetName = this.sanitizeNameForVariable(assetName);
    
    // Pour chaque type d'énergie, mettre à jour la variable de consommation existante pour en faire une variable de type "Rule"
    for (const [type, config] of Object.entries(ENERGY_TYPES)) {
      // Trouver tous les assets de niveau 5 qui sont des descendants de cet asset
      // et qui ont le type d'énergie correspondant
      const level5Descendants = await this.findLevel5DescendantsByEnergyType(
        asset, 
        type, 
        allAssetsByLevel
      );
      
      if (level5Descendants.length > 0) {
        console.log(`Mise à jour de la formule pour Consommation_${config.name}_${sanitizedAssetName} (niveau ${level}) - Type ${type} - ${level5Descendants.length} descendants`);
        
        // Construire la formule de somme des consommations avec les tags
        const { formula, tags } = this.buildSumFormula(level5Descendants, "conso", type);
        
        // Rechercher la variable de consommation existante pour ce type d'énergie
        const existingVarIndex = variables.findIndex(v => 
          v.assetId === assetId && 
          v.variableName === `Consommation_${config.name}_${sanitizedAssetName}` && 
          v.sourceType === "Rule"
        );
        
        if (existingVarIndex !== -1) {
          // Mettre à jour la formule dans la variable existante
          console.log(`✅ Mise à jour de la formule pour la variable existante: ${variables[existingVarIndex].variableName}`);
          variables[existingVarIndex].formula = formula;
          variables[existingVarIndex].rule = {
            formula: formula,
            tags: tags
          };
          // Ajouter la configuration de rétention si elle n'existe pas déjà
          if (!variables[existingVarIndex].retention) {
            variables[existingVarIndex].retention = {
              settings: {
                timeSettings: {
                  timeRange: {
                    base: "year",
                    factor: 6
                  }
                }
              }
            };
          }
        } else {
          // La variable n'existe pas encore, la créer
          console.log(`⚠️ Variable de consommation pour ${config.name} non trouvée, création d'une nouvelle variable`);
          variables.push({
            variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
            dataType: 'Float' as const,
            assetId: assetId,
            unit: config.unit,
            description: `Consommation de ${config.name} pour ${assetName}`,
            sourceType: "Rule",
            formula: formula,
            rule: {
              formula: formula,
              tags: tags
            },
            store: true,
            // Ajouter la configuration de rétention des données (6 ans comme dans flexibleAssetImporter)
            retention: {
              settings: {
                timeSettings: {
                  timeRange: {
                    base: "year",
                    factor: 6
                  }
                }
              }
            }
          });
        }
      } else {
        console.log(`⚠️ Aucun descendant trouvé pour ${assetName} de type ${type}, la formule restera à 0`);
      }
    }
  }

  /**
   * Trouve les assets de niveau 5 descendants d'un asset et filtrés par type d'énergie
   * @param asset Asset parent
   * @param energyType Type d'énergie à filtrer
   * @param allAssetsByLevel Tous les assets groupés par niveau
   * @returns Liste des assets de niveau 5 descendants
   */
  private async findLevel5DescendantsByEnergyType(
    asset: any, 
    energyType: string,
    allAssetsByLevel: Record<number, any[]>
  ): Promise<any[]> {
    // Récupérer tous les assets de niveau 5
    const level5Assets = allAssetsByLevel[5] || [];
    
    // Si aucun asset de niveau 5, retourner un tableau vide
    if (level5Assets.length === 0) {
      console.warn(`⚠️ Aucun asset de niveau 5 trouvé dans la hiérarchie.`);
      return [];
    }
    
    console.log(`Recherche de descendants de niveau 5 pour ${asset.name} (${asset.assetId}) de type ${energyType}...`);
    
    // Récupérer tous les descendants de l'asset, quel que soit leur niveau
    // puis filtrer pour ne garder que ceux de niveau 5
    const allDescendants = await this.findAllDescendants(asset, allAssetsByLevel);
    
    console.log(`Total de descendants pour ${asset.name}: ${allDescendants.length}`);
    
    // Filtrer pour ne garder que les assets de niveau 5
    const level5Descendants = allDescendants.filter(descendant => {
      return level5Assets.some(l5 => l5.assetId === descendant.assetId);
    });
    
    console.log(`Descendants de niveau 5 pour ${asset.name}: ${level5Descendants.length}`);
    
    // Si aucun descendant de niveau 5 n'est trouvé, on utilise une approche plus souple:
    // on prend tous les assets de niveau 5 qui ont cet asset comme ancêtre dans leur chemin
    let filteredLevel5Descendants = level5Descendants;
    if (level5Descendants.length === 0) {
      // Pour chaque asset de niveau 5, vérifier s'il est descendant de notre asset
      filteredLevel5Descendants = level5Assets.filter(level5Asset => {
        return this.isDescendantOf(level5Asset, asset);
      });
      console.log(`Approche alternative - Descendants de niveau 5 pour ${asset.name}: ${filteredLevel5Descendants.length}`);
    }
    
    // Si on a toujours 0 assets, retourner un tableau vide
    if (filteredLevel5Descendants.length === 0) {
      console.warn(`⚠️ Aucun descendant de niveau 5 trouvé pour ${asset.name} (${asset.assetId}) de type ${energyType}.`);
      return [];
    }
    
    // Filtrer maintenant par type d'énergie
    const filteredByEnergyType = filteredLevel5Descendants.filter(level5Asset => {
      const assetEnergyType = this.getAssetEnergyType(level5Asset);
      
      // Pour le type 'elec', on accepte aussi les assets sans type d'énergie spécifié
      // car c'est le type par défaut
      if (energyType === 'elec' && (assetEnergyType === 'défaut' || assetEnergyType === 'elec')) {
        return true;
      }
      
      return assetEnergyType === energyType;
    });
    
    console.log(`Descendants de niveau 5 pour ${asset.name} (${asset.assetId}) de type ${energyType}: ${filteredByEnergyType.length}`);
    
    return filteredByEnergyType;
  }
  
  /**
   * Trouve tous les descendants d'un asset, quel que soit leur niveau
   */
  private async findAllDescendants(asset: any, allAssetsByLevel: Record<number, any[]>): Promise<any[]> {
    // Récupérer tous les assets de tous les niveaux
    const allAssets: any[] = [];
    for (let level = 1; level <= 5; level++) {
      if (allAssetsByLevel[level]) {
        allAssets.push(...allAssetsByLevel[level]);
      }
    }
    
    // Fonction récursive pour trouver tous les descendants
    const findChildren = (parentId: string): any[] => {
      const children = allAssets.filter(a => a.parentId === parentId);
      let descendants = [...children];
      
      // Pour chaque enfant, trouver ses descendants
      children.forEach(child => {
        const childDescendants = findChildren(child.assetId);
        descendants.push(...childDescendants);
      });
      
      return descendants;
    };
    
    // Trouver tous les descendants de l'asset
    return findChildren(asset.assetId);
  }

  /**
   * Vérifie si un asset est descendant d'un autre
   * @param possibleDescendant Asset potentiellement descendant
   * @param possibleAncestor Asset potentiellement ancêtre
   * @returns true si c'est un descendant, false sinon
   */
  private isDescendantOf(possibleDescendant: any, possibleAncestor: any): boolean {
    // Si les deux assets sont identiques, ce n'est pas un descendant
    if (possibleDescendant.assetId === possibleAncestor.assetId) {
      return false;
    }
    
    // Méthode 1: Vérifier le chemin du asset si disponible
    if (possibleDescendant.metadata?.path && Array.isArray(possibleDescendant.metadata.path)) {
      return possibleDescendant.metadata.path.includes(possibleAncestor.assetId);
    }
    
    // Méthode 2: Vérifier la chaîne parentale récursivement
    let currentAsset = possibleDescendant;
    const checkedIds = new Set<string>(); // Pour éviter les boucles infinies
    
    while (currentAsset && currentAsset.parentId && !checkedIds.has(currentAsset.parentId)) {
      if (currentAsset.parentId === possibleAncestor.assetId) {
        return true;
      }
      
      // Marquer cet ID comme vérifié pour éviter les boucles
      checkedIds.add(currentAsset.parentId);
      
      // Récupérer le parent et continuer
      currentAsset = this._allAssets.get(currentAsset.parentId);
    }
    
    // Méthode 3: Vérifier en utilisant la position hiérarchique
    // Si la position est au format "X/Y", vérifier que X est supérieur au niveau de l'ancestor
    if (possibleDescendant.metadata?.position && possibleAncestor.metadata?.position) {
      const descendantParts = possibleDescendant.metadata.position.split('/');
      const ancestorParts = possibleAncestor.metadata.position.split('/');
      
      if (descendantParts.length === 2 && ancestorParts.length === 2) {
        const descendantLevel = parseInt(descendantParts[0]);
        const ancestorLevel = parseInt(ancestorParts[0]);
        
        // Un descendant doit avoir un niveau supérieur à son ancêtre
        if (!isNaN(descendantLevel) && !isNaN(ancestorLevel) && descendantLevel > ancestorLevel) {
          // C'est une heuristique approximative mais utile quand il n'y a pas d'information précise
          return true;
        }
      }
    }
    
    // Méthode 4: Vérifier les niveaux des assets
    const descendantLevel = this.determineAssetLevel(possibleDescendant);
    const ancestorLevel = this.determineAssetLevel(possibleAncestor);
    
    if (descendantLevel && ancestorLevel && descendantLevel > ancestorLevel) {
      // Plus la différence de niveau est importante, moins cette heuristique est fiable
      const levelDifference = descendantLevel - ancestorLevel;
      if (levelDifference === 1) {
        // Pour une différence de 1 niveau, on a plus de chances que ce soit un parent direct
        return possibleDescendant.parentId === possibleAncestor.assetId;
      } else {
        // Heuristique très approximative mais nécessaire pour les données mal structurées
        return true;
      }
    }
    
    // Par défaut, considérer qu'il n'y a pas de relation
    return false;
  }

  /**
   * Construit une formule sum() pour les variables de consommation
   * @param assets Assets pour lesquels construire la formule
   * @param tagName Non utilisé car nous utilisons la configuration
   * @param energyType Type d'énergie pour lequel construire la formule
   * @returns Formule de type sum() et les tags associés
   */
  private buildSumFormula(assets: any[], tagName: string, energyType: string): { 
    formula: string;
    tags: Array<{
      name: string;
      variableId: string;
      variableName: string;
      adapterId: string;
      connectionName: string;
      tagName: string;
      dataType: string;
    }>;
  } {
    console.log(`Construction d'une formule sum() pour ${assets.length} assets de type ${energyType}`);
    
    if (!assets || assets.length === 0) {
      console.warn('⚠️ Aucun asset pour construire la formule sum() - valeur par défaut "0"');
      return { 
        formula: "0",
        tags: []
      };
    }
    
    // Déterminer le type d'énergie normalisé pour le nom des variables
    const normalizedEnergyType = energyType === 'défaut' 
      ? 'Energie' 
      : energyType.charAt(0).toUpperCase() + energyType.slice(1).toLowerCase();
    
    // IMPORTANT: Toujours utiliser le tag générique de consommation, quelle que soit l'énergie
    const genericConsumptionTag = this._importConfig.tagMappings.consumption;
    console.log(`Utilisation du tag générique de consommation pour toutes les énergies: "${genericConsumptionTag}"`);
    
    // Construire les références aux variables existantes
    const tags = assets.map((asset, index) => {
      const sanitizedAssetName = this.sanitizeNameForVariable(asset.name);
      const variableName = `Consommation_${normalizedEnergyType}_${sanitizedAssetName}`;
      
      return {
        name: `var${index + 1}`,
        variableId: asset.assetId, // Utiliser l'ID de l'asset comme ID de variable temporaire
        variableName: variableName,
        adapterId: this._importConfig.adapterId, // Ajouter l'adapterId configuré
        connectionName: sanitizedAssetName, // Ajouter le connectionName
        tagName: genericConsumptionTag, // Utiliser le tag générique de consommation
        dataType: 'Float' // Ajouter le type de données
      };
    });
    
    // Si un seul asset, pas besoin d'utiliser sum()
    if (tags.length === 1) {
      const formula = tags[0].name; // Utiliser var1
      console.log(`Formule pour un seul asset: "${formula}"`);
      return { formula, tags };
    }
    
    // Pour plusieurs assets, utiliser sum() avec les références var1, var2, etc.
    const formula = `sum(${tags.map(t => t.name).join(', ')})`;
    console.log(`Formule sum() construite: "${formula}"`);
    return { formula, tags };
  }

  /**
   * Normalise une variable de type tag
   * @param variable Variable à normaliser
   * @returns Variable normalisée
   */
  private normalizeTagVariable(variable: IIHVariable): IIHVariable {
    return normalizeTagVariable(variable, this._importConfig.adapterId, this._importConfig.tagMappings);
  }

  /**
   * Normalise une variable de type rule
   * @param variable Variable à normaliser
   * @returns Variable normalisée
   */
  private normalizeRuleVariable(variable: IIHVariable): IIHVariable {
    return normalizeRuleVariable(variable);
  }

  /**
   * Crée les variables par lots pour optimiser les performances
   * @param variables Variables à créer
   * @returns Résultat de la création
   */
  private async createVariablesInBatches(variables: IIHVariable[]): Promise<BulkCreateVariablesResponse> {
    if (!variables || variables.length === 0) {
      console.warn('Aucune variable à créer');
      return { results: [] };
    }
    
    console.log(`Création de ${variables.length} variables par lots...`);

    // S'assurer que toutes les variables ont un sourceType défini
    const variablesWithSourceType = variables.map(v => {
      // Si pas de sourceType, définir "Tag" par défaut
      if (!v.sourceType) {
        console.log(`Variable sans sourceType: ${v.variableName}, définition de "Tag" par défaut`);
        return { ...v, sourceType: 'Tag' as const };
      }
      return v;
    });

    // Normaliser les variables selon leur type
    const normalizedVariables = variablesWithSourceType.map(v => {
      if (v.sourceType === 'Rule') {
        return this.normalizeRuleVariable(v);
      } else if (v.sourceType === 'Tag') {
        return this.normalizeTagVariable(v);
      }
      return v;
    });
    
    // Ajouter la rétention de 6 ans directement lors de la création des variables
    const variablesWithRetention = normalizedVariables.map(v => {
      if (!v.retention) {
        return {
          ...v,
          retention: {
            settings: {
              timeSettings: {
                timeRange: {
                  base: "year",
                  factor: 6
                }
              }
            }
          }
        };
      }
      return v;
    });
    
    // VALIDATION SUPPLÉMENTAIRE: Vérifier la cohérence des variables de type Rule
    const inconsistentRules = variablesWithRetention.filter(v => 
      v.sourceType === 'Rule' && 
      ((!v.rule || !v.formula) || (v.rule.formula !== v.formula))
    );
    
    if (inconsistentRules.length > 0) {
      console.warn(`⚠️ ${inconsistentRules.length} variables Rule incohérentes détectées - Correction automatique`);
      // Corriger automatiquement les incohérences
      inconsistentRules.forEach(v => {
        const formula = v.formula || v.rule?.formula || "0";
        console.log(`Correction de la variable Rule ${v.variableName}: formule = "${formula}"`);
        v.formula = formula;
        v.rule = {
          formula: formula,
          tags: v.rule?.tags || []
        };
      });
    }
    
    // Vérifier que toutes les variables de type Rule ont une formule
    const rulesWithoutFormula = variablesWithRetention.filter(v => 
      v.sourceType === 'Rule' && 
      (!v.rule || !v.rule.formula || v.rule.formula === '')
    );
    
    if (rulesWithoutFormula.length > 0) {
      console.warn(`⚠️ ${rulesWithoutFormula.length} variables de type Rule n'ont pas de formule définie`);
      rulesWithoutFormula.forEach(v => {
        console.warn(`  - ${v.variableName} (${v.assetId}): Attribution d'une formule par défaut "0"`);
        v.formula = "0";
        v.rule = { formula: "0", tags: [] };
      });
    }
    
    // Vérifier que toutes les variables de type Tag ont un objet tag
    const tagsWithoutTagObject = variablesWithRetention.filter(v => 
      v.sourceType === 'Tag' && !v.tag
    );
    
    if (tagsWithoutTagObject.length > 0) {
      console.warn(`⚠️ ${tagsWithoutTagObject.length} variables de type Tag n'ont pas d'objet tag - Correction automatique`);
      // Ajouter un objet tag vide pour les variables de type Tag
      tagsWithoutTagObject.forEach(v => {
        console.log(`Correction de la variable Tag ${v.variableName}: ajout d'un objet tag par défaut`);
        v.tag = {
          adapterId: v.adapterId || 'aad45fcc-9c89-469f-a152-83a992400da5',
          connectionName: v.connectionName || v.variableName,
          tagName: v.variableName,
          dataType: v.dataType === 'String' ? 'String' : 'Float'
        };
      });
    }
    
    // Vérifier l'adapterId
    const variablesWithoutAdapterId = variablesWithRetention.filter(v => !v.adapterId);
    if (variablesWithoutAdapterId.length > 0) {
      console.warn(`⚠️ ${variablesWithoutAdapterId.length} variables sans adapterId - Attribution d'un ID par défaut`);
      variablesWithoutAdapterId.forEach(v => {
        console.log(`Attribution d'un adapterId par défaut pour ${v.variableName}`);
        v.adapterId = 'aad45fcc-9c89-469f-a152-83a992400da5'; // ID standard pour les variables manuelles
      });
    }
    
    // Configuration finale des variables
    const configuredVariables = variablesWithRetention.map(v => {
      // Créer une nouvelle copie de la variable
      const configuredVar: IIHVariable = {...v};
      
      // Définir store si ce n'est pas déjà fait
      if (configuredVar.store === undefined) {
        configuredVar.store = true;
      }
      
      return configuredVar;
    });
    
    // Validation finale
    const invalidVariables = configuredVariables.filter(v => {
      // Vérifier les champs obligatoires
      if (!v.variableName || !v.assetId) {
        console.error(`❌ Variable invalide (nom ou assetId manquant): ${v.variableName || 'Sans nom'}`);
        return true;
      }
      
      // Vérifier les variables de type Rule
      if (v.sourceType === 'Rule' && (!v.rule || !v.rule.formula)) {
        console.error(`❌ Variable Rule invalide (formule manquante): ${v.variableName}`);
        return true;
      }
      
      return false;
    });
    
    if (invalidVariables.length > 0) {
      console.error(`❌ ${invalidVariables.length} variables invalides détectées et exclues`);
      // Exclure les variables invalides
      const validVariables = configuredVariables.filter(v => !invalidVariables.includes(v));
      console.log(`Envoi de ${validVariables.length} variables valides sur ${configuredVariables.length} totales`);
      configuredVariables.splice(0, configuredVariables.length, ...validVariables);
    }
    
    // Log des 2 premières variables pour vérification
    console.log('Échantillon des variables à créer:');
    configuredVariables.slice(0, 2).forEach((v, i) => {
      console.log(`- Variable ${i + 1}: ${v.variableName} (${v.sourceType}), adapterId=${v.adapterId}`);
    });

    try {
      // Diviser les variables en lots de 950 maximum pour éviter l'erreur "Bulk API limit exceeded" (limite de 1000)
      const batchSize = 950;
      const batches = [];
      
      for (let i = 0; i < configuredVariables.length; i += batchSize) {
        batches.push(configuredVariables.slice(i, i + batchSize));
      }
      
      console.log(`Variables divisées en ${batches.length} lots pour ne pas dépasser la limite de l'API (1000)`);
      
      // Résultats combinés
      const combinedResults: BulkCreateVariablesResponse = { results: [] };
      
      // Traiter chaque lot séquentiellement
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Traitement du lot ${i + 1}/${batches.length} (${batch.length} variables)`);
        
        const batchResults = await this.api.createVariablesBulk(batch);
        
        // Combiner les résultats
        if (batchResults.results) {
          combinedResults.results = [...combinedResults.results, ...batchResults.results];
        }
        
        // Combiner les erreurs si présentes
        if (batchResults.errors) {
          combinedResults.errors = combinedResults.errors || [];
          combinedResults.errors = [...combinedResults.errors, ...batchResults.errors];
        }
        
        console.log(`Lot ${i + 1} traité: ${batchResults.results.length} variables créées`);
        
        // Petite pause entre les lots pour éviter la surcharge
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`Création en lots terminée: ${combinedResults.results.length} variables créées au total`);
      return combinedResults;
    } catch (error) {
      console.error('Erreur lors de la création des variables en lots:', error);
      throw error;
    }
  }

  /**
   * Détermine le type d'agrégation approprié selon le type de données
   * @param dataType Type de données de la variable
   * @returns Type d'agrégation à utiliser
   */
  public determineAggregationType(dataType: string): string {
    // Les types numériques utilisent Sum comme dans flexibleAssetImporter
    const numericTypes = ['Double', 'Float', 'Integer', 'Int32', 'Int64'];
    if (numericTypes.includes(dataType)) {
      return 'Sum';  // Changé de 'Average' à 'Sum' pour correspondre à flexibleAssetImporter
    }
    
    // Pour les types non numériques, utiliser des agrégations appropriées
    if (dataType === 'String') {
      return 'Last'; // Prendre la dernière valeur
    }
    if (dataType === 'Boolean') {
      return 'Last'; // Prendre la dernière valeur
    }
    
    // Par défaut
    return 'Sum';  // Changé de 'Average' à 'Sum' pour correspondre à flexibleAssetImporter
  }

  /**
   * Valide que toutes les données nécessaires sont présentes avant de créer une agrégation
   */
  private async validateAggregationData(aggregationData: any): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`🔍 VALIDATION: Vérification des données d'agrégation:`, JSON.stringify(aggregationData, null, 2));

    // 1. Validation de base
    if (!aggregationData) {
      errors.push('Données d\'agrégation manquantes');
      return { isValid: false, errors, warnings };
    }

    // 2. Validation du sourceId
    if (!aggregationData.sourceId) {
      errors.push('sourceId manquant');
    } else {
      // Vérifier que la variable source existe
      try {
        const variable = await this.api.getVariablesForAsset(aggregationData.sourceId);
        if (!variable) {
          errors.push(`Variable source ${aggregationData.sourceId} introuvable`);
        }
      } catch (error) {
        warnings.push(`Impossible de vérifier l'existence de la variable source: ${error}`);
      }
    }

    // 3. Validation du type d'agrégation
    if (!aggregationData.aggregation) {
      errors.push('Type d\'agrégation manquant');
    } else {
      const validTypes = ['Sum', 'Average', 'Min', 'Max', 'Last'];
      if (!validTypes.includes(aggregationData.aggregation)) {
        errors.push(`Type d'agrégation invalide: ${aggregationData.aggregation}. Valeurs autorisées: ${validTypes.join(', ')}`);
      }
    }

    // 4. Validation du cycle
    if (!aggregationData.cycle) {
      errors.push('Cycle manquant');
    } else {
      // 4.1 Validation de la base
      if (!aggregationData.cycle.base) {
        errors.push('Base du cycle manquante');
      } else {
        const validBases = ['second', 'minute', 'hour', 'day'];
        const normalizedBase = aggregationData.cycle.base.toLowerCase().replace(/s$/, '');
        if (!validBases.includes(normalizedBase)) {
          errors.push(`Base du cycle invalide: ${aggregationData.cycle.base}. Valeurs autorisées: ${validBases.join(', ')}`);
        }
      }

      // 4.2 Validation du facteur
      if (!aggregationData.cycle.factor) {
        errors.push('Facteur du cycle manquant');
      } else if (typeof aggregationData.cycle.factor !== 'number') {
        errors.push('Le facteur doit être un nombre');
      } else {
        try {
          this.validateCycleFactor(aggregationData.cycle.base, aggregationData.cycle.factor);
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Facteur invalide pour la base donnée');
        }
      }
    }

    // 5. Validation des flags
    if (typeof aggregationData.provideAsVariable !== 'boolean') {
      warnings.push('provideAsVariable non spécifié, utilisation de la valeur par défaut: true');
      aggregationData.provideAsVariable = true;
    }

    if (typeof aggregationData.publishMqtt !== 'boolean') {
      warnings.push('publishMqtt non spécifié, utilisation de la valeur par défaut: false');
      aggregationData.publishMqtt = false;
    }

    // Log du résultat de la validation
    if (errors.length > 0) {
      console.error('❌ VALIDATION: Erreurs détectées:', errors);
    }
    if (warnings.length > 0) {
      console.warn('⚠️ VALIDATION: Avertissements:', warnings);
    }
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ VALIDATION: Données d\'agrégation valides');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Crée des agrégations pour une variable selon un schéma prédéfini
   * @param variableId ID de la variable
   * @param variableName Nom de la variable (pour les logs)
   * @param aggregationType Type d'agrégation à créer (Sum, Average, etc.)
   * @param forceCreate Si true, ignore les vérifications d'existence et force la création
   * @returns Résultat avec le nombre de succès, d'erreurs et les agrégations créées
   */
  async createAggregationsForVariable(
    variableId: string,
    variableName: string = 'Variable',
    aggregationType: string = 'Sum',
    forceCreate: boolean = false,
    // Add optional parameter for prefetched aggregations
    prefetchedAggregations?: AggregationInfo[] 
  ): Promise<{ success: boolean; message: string; variableId: string; aggregations: Record<string, { id: string; type: string }>; errors: string[]; skipped: string[] }> { // Updated return type
    const results = {
      success: true, // Assume success initially
      message: `Agrégations pour ${variableName} (${variableId})`,
      variableId: variableId,
      // This will hold the final state (existing + created)
      aggregations: {} as Record<string, { id: string; type: string }>, 
      errors: [] as string[],
      skipped: [] as string[]
    };

    console.log(`\n=== DÉBUT CRÉATION AGRÉGATIONS pour ${variableName} (ID: ${variableId}) ===`);

    // Statistiques pour le suivi
    let successCount = 0;
    let errorCount = 0;
    // Rename internal map to reflect it holds final state
    const finalAggregationsMap: Record<string, { id: string; type: string; cycle?: { base: string; factor: number }}> = {};

    // Intervalles de temps pour les agrégations
    const timeIntervals = [
      { name: '5min', base: 'minute', factor: 5 },
      { name: '1h', base: 'hour', factor: 1 },
      { name: '4h', base: 'hour', factor: 4 },
      { name: '8h', base: 'hour', factor: 8 },
      { name: '1d', base: 'day', factor: 1 }
    ];

    // Structure pour stocker les cycles existants
    const existingCycles = new Set<string>();
    
    // Use prefetched data if available and not forcing creation
    if (!forceCreate && prefetchedAggregations) {
        console.log(`[importer.ts] Utilisation de ${prefetchedAggregations.length} agrégations pré-récupérées pour ${variableName}`);
        prefetchedAggregations.forEach((aggregation: AggregationInfo) => { // Explicitly type here
            if (aggregation.cycle && aggregation.cycle.base && aggregation.cycle.factor) {
              const cycleKey = `${aggregation.cycle.base}_${aggregation.cycle.factor}`;
              const simpleCycleKey = `${aggregation.cycle.base}/${aggregation.cycle.factor}`; // Key format for results map
              existingCycles.add(cycleKey);
              // Pre-populate the final map with existing aggregations
              finalAggregationsMap[simpleCycleKey] = { 
                  id: aggregation.id, 
                  type: aggregation.type || aggregationType, // Use actual type if available
                  cycle: aggregation.cycle 
              };
              console.log(`🔍 Pré-récupérée: ${cycleKey} pour ${variableName} (ID: ${aggregation.id})`);
            }
        });
        console.log(`🔍 ${existingCycles.size} cycles existants identifiés via pré-récupération pour ${variableName}`);

    } else if (!forceCreate) {
      console.log(`[importer.ts] Aucune agrégation pré-récupérée fournie pour ${variableName}. Récupération initiale...`);
      // 1. Récupérer les agrégations existantes pour la variable
      console.log(`Envoi d\'une requête à l\'API pour récupérer les agrégations de ${variableName}`);
      
      try {
          const existingAggregations: AggregationInfo[] = await this.api.getAggregationsForVariable(variableId); // Type the result here
          console.log(`${existingAggregations.length} agrégations trouvées pour la variable ${variableId}`);
    
          // 2. Créer un ensemble des cycles existants pour faciliter la recherche
          existingAggregations.forEach((aggregation: AggregationInfo) => { // Explicitly type here
            if (aggregation.cycle && aggregation.cycle.base && aggregation.cycle.factor) {
              const cycleKey = `${aggregation.cycle.base}_${aggregation.cycle.factor}`;
              const simpleCycleKey = `${aggregation.cycle.base}/${aggregation.cycle.factor}`; // Key format for results map
              existingCycles.add(cycleKey);
               // Pre-populate the final map with existing aggregations
               finalAggregationsMap[simpleCycleKey] = { 
                   id: aggregation.id, 
                   type: aggregation.type || aggregationType, // Use actual type if available
                   cycle: aggregation.cycle 
               };
              console.log(`🔍 Agrégation existante trouvée: ${cycleKey} pour ${variableName}`);
            }
          });
          console.log(`🔍 ${existingCycles.size} agrégations existantes trouvées pour ${variableName}`);
      } catch (fetchError) {
          console.error(`[importer.ts] Erreur lors de la récupération initiale des agrégations pour ${variableId}:`, fetchError);
          const errorMessage = `Erreur récupération initiale: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`;
          results.errors.push(errorMessage);
          results.success = false; // Mark as failure if initial fetch fails
          // Return early as we cannot proceed reliably
          results.message += `. ${errorMessage}`;
          return results; 
      }
      
    } else {
      console.log(`⚠️ Mode force activé: création de toutes les agrégations sans vérifier l\'existence`);
    }

    // 3. Traiter tous les intervalles (ou seulement ceux qui n\'existent pas encore si !forceCreate)
    for (const interval of timeIntervals) {
      try {
        // Vérifier si cette agrégation existe déjà (sauf si forceCreate est true)
        const cycleKey = `${interval.base}_${interval.factor}`;
        if (!forceCreate && existingCycles.has(cycleKey)) {
          console.log(`ℹ️ L\'agrégation ${interval.name} (${cycleKey}) existe déjà pour ${variableName}, ignorée`);
          results.skipped.push(interval.name); // Record skipped aggregations
          continue;
        }

        console.log(`\n🔄 Création agrégation ${interval.name} pour ${variableName} (${variableId})`);
        
        const aggregationData = {
          aggregation: aggregationType,
          sourceId: variableId,
          cycle: {
            base: interval.base,
            factor: interval.factor
          },
          provideAsVariable: true,
          publishMqtt: false
        };

        console.log(`📤 Préparation de l'agrégation ${interval.name}`);
        
        let result;
        let success = false;
        
        // Essayer la méthode standard en premier
        try {
          result = await this.api.createAggregation(aggregationData);
          success = true;
        } catch (error) {
          // En cas d'échec, essayer la méthode personnalisée
          try {
            result = await this.api.createCustomAggregation(aggregationData);
            success = true;
          } catch (secondError) {
            console.error(`❌ Échec des deux méthodes pour ${interval.name}:`, secondError);
            throw new Error(`Échec de la création d'agrégation ${interval.name}: ${secondError}`);
          }
        }
        
        if (success && result?.id) { // Check if result and result.id exist
           const simpleCycleKey = `${interval.base}/${interval.factor}`; // Key format for results map
          // Add the newly created aggregation to the final map
          finalAggregationsMap[simpleCycleKey] = {
            id: result.id,
            type: aggregationType,
            cycle: {
              base: interval.base,
              factor: interval.factor
            }
          };
          
          successCount++;
          
          // Ajouter le cycle à la liste des cycles existants pour éviter les doublons lors de la boucle
          existingCycles.add(cycleKey);
          console.log(`✅ Agrégation ${interval.name} créée avec succès (ID: ${result.id})`); // Add success log
        }

        // Pause minimale pour éviter de surcharger l'API (réduite à 50ms au lieu de 300ms)
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Erreur création agrégation ${interval.name}:`, error);
        const errorMessage = `Erreur création ${interval.name}: ${error instanceof Error ? error.message : String(error)}`;
        results.errors.push(errorMessage); // Add specific error message
        errorCount++;
      }
    }

    console.log(`\n=== BILAN CRÉATION AGRÉGATIONS pour ${variableName} ===`);
    console.log(`✅ Nouvelles créations réussies: ${successCount}`);
    console.log(`❌ Erreurs de création: ${errorCount}`);
    console.log(`ℹ️ Agrégations existantes/ignorées: ${results.skipped.length}`);
    console.log(`📊 Total agrégations (existantes + créées): ${Object.keys(finalAggregationsMap).length}`);

    // Assign the final map (containing existing + newly created) to the results
    results.aggregations = finalAggregationsMap; 
    // Success is true only if there were NO errors during the process
    results.success = results.errors.length === 0; 
    results.message = `Traitement ${variableName}: ${successCount} créées, ${results.skipped.length} existantes, ${errorCount} erreurs. Total final: ${Object.keys(finalAggregationsMap).length}.`;

    return results;
  }

  /**
   * Traitement optimisé avec parallélisation limitée
   */
  private async processWithControlledParallelism<T, R>(
    items: T[], 
    processFn: (item: T) => Promise<R>, 
    maxConcurrent: number = 5
  ): Promise<{ results: R[], errors: Array<{ item: T, error: any }> }> {
    const results: R[] = [];
    const errors: Array<{ item: T, error: any }> = [];
    
    // Traitement par lots pour éviter trop de requêtes simultanées
    for (let i = 0; i < items.length; i += maxConcurrent) {
      const batch = items.slice(i, i + maxConcurrent);
      const promises = batch.map(item => 
        processFn(item).catch(error => {
          errors.push({ item, error });
          return null;
        })
      );
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter(Boolean) as R[]);
    }
    
    return { results, errors };
  }

  /**
   * Traite la file d'attente des agrégations par lots
   * @private
   */
  private async processAggregationQueue(): Promise<{success: number, errors: number}> {
    if (this.aggregationQueue.length === 0) {
      console.log("⚠️ AGGREGATION QUEUE: Aucune agrégation à traiter");
      return {success: 0, errors: 0};
    }

    console.log(`🔄 AGGREGATION QUEUE: Traitement par lot de ${Math.min(this.BATCH_SIZE, this.aggregationQueue.length)} agrégations...`);
    
    // Prendre les N premières demandes de la file
    const batch = this.aggregationQueue.splice(0, this.BATCH_SIZE);
    
    // Stats pour suivi
    let successCount = 0;
    let errorCount = 0;

    // Créer un Map pour suivre les variables déjà traitées et leurs agrégations existantes
    const existingAggregationsMap: Map<string, string[]> = new Map();
    
    // Traiter les demandes séquentiellement pour minimiser les erreurs
    for (const request of batch) {
      try {
        console.log(`📦 AGGREGATION: Traitement de l'agrégation pour ${request.variableName} (${request.base} ${request.factor})`);
        
        // Vérifier si nous avons déjà récupéré les agrégations pour cette variable
        if (!existingAggregationsMap.has(request.variableId)) {
          // Récupérer les agrégations existantes pour cette variable
          const existingAggregations = await this.api.getAggregationsForVariable(request.variableId);
          // Stocker les cycles existants sous forme "base_factor"
          // *** FIX: Filter out aggregations without a cycle before mapping ***
          const existingCycles = existingAggregations
              .filter((agg): agg is AggregationInfo & { cycle: { base: string; factor: number } } => !!agg.cycle) // Ensure cycle exists and provide type guard
              .map(agg => `${agg.cycle.base}_${agg.cycle.factor}`); // Now safe to access cycle properties
          existingAggregationsMap.set(request.variableId, existingCycles);
          
          console.log(`🔍 ${existingAggregations.length} agrégations existantes trouvées pour ${request.variableName}`);
        }
        
        // Récupérer les cycles existants pour cette variable
        const existingCycles = existingAggregationsMap.get(request.variableId) || [];
        
        // Vérifier si cette agrégation existe déjà
        const cycleKey = `${request.base}_${request.factor}`;
        if (existingCycles.includes(cycleKey)) {
          console.log(`ℹ️ L'agrégation ${request.base} ${request.factor} existe déjà pour ${request.variableName}, ignorée`);
          continue;
        }
        
        // Créer l'objet d'agrégation avec le format exact attendu par l'API
        const aggregationData = {
          aggregation: request.aggregationType,
          sourceId: request.variableId,
          cycle: {
            base: request.base,
            factor: request.factor
          },
          provideAsVariable: false,
          publishMqtt: false
        };

        console.log(`📤 AGGREGATION: Envoi de la requête:`, JSON.stringify(aggregationData, null, 2));
        
        const result = await this.api.createAggregation(aggregationData);
        console.log(`✅ AGGREGATION: Succès pour ${request.variableName} (${request.base} ${request.factor}):`, result);
        successCount++;
        
        // Ajouter le cycle créé à la liste des cycles existants
        existingCycles.push(cycleKey);
        existingAggregationsMap.set(request.variableId, existingCycles);
      } catch (error) {
        console.error(`❌ AGGREGATION: Erreur pour ${request.variableName} (${request.base} ${request.factor}):`, error);
        errorCount++;
      }
    }
    
    console.log(`📊 AGGREGATION QUEUE: Lot traité - ${successCount} succès, ${errorCount} erreurs`);
    console.log(`📦 AGGREGATION QUEUE: ${this.aggregationQueue.length} agrégations restantes dans la file`);
    
    // Si la file n'est pas vide, planifier le traitement du prochain lot
    if (this.aggregationQueue.length > 0) {
      console.log(`🔄 AGGREGATION QUEUE: Planification du prochain lot...`);
      await this.processAggregationQueue();
    }
    
    return {success: successCount, errors: errorCount};
  }

  private async applyDataRetention(variableId: string): Promise<void> {
    try {
      console.log(`Application de la rétention pour la variable ${variableId}...`);
      const retentionConfig = {
        ...RETENTION_CONFIG,
        dataRetention: {
          ...RETENTION_CONFIG.dataRetention,
          sourceId: variableId
        }
      };

      await this.api.applyRetention(variableId, retentionConfig);
      console.log(`✅ Rétention appliquée avec succès pour ${variableId}`);
    } catch (error: any) {
      console.error(`❌ Échec de l'application de la rétention pour ${variableId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les variables pour un asset
   * Méthode publique pour être appelée depuis l'extérieur
   * @param assetId ID de l'asset
   * @returns Liste des variables de l'asset
   */
  public async getVariablesForAsset(assetId: string): Promise<any[]> {
    console.log(`Récupération des variables pour l'asset ${assetId}...`);
    return await this.api.getVariablesForAsset(assetId);
  }

  /**
   * Récupère toutes les variables existantes dans le système
   * Méthode publique pour être appelée depuis l'extérieur
   * @returns Liste de toutes les variables
   */
  // *** Updated Method Signature and Return Type ***
  public async getAllVariables(): Promise<GetAllVariablesResponse> {
    console.log(`Récupération de toutes les variables...`);
    try {
      // Utiliser l'API pour récupérer toutes les variables
      const response = await this.api.getAllVariables();
      
      // Vérifier le succès de la réponse de l'API interne
      if (!response.success) {
        const message = `Échec de la récupération des variables: ${response.message}`;
        console.error(message);
        // Return the failure structure
        return { success: false, message: message, variables: [] }; 
      }
      
      // Vérifier que les variables existent et sont dans un tableau
      if (!response.variables || !Array.isArray(response.variables)) {
        const message = 'Format de réponse inattendu pour getAllVariables: variables manquantes ou format incorrect';
        console.error(message);
        // Return the failure structure
        return { success: false, message: message, variables: [] }; 
      }
      
      // Filtrer les variables invalides (sans ID)
      const originalCount = response.variables.length;
      const validVariables: BasicVariableInfo[] = response.variables.filter(variable => {
        const hasId = variable?.id || variable?.variableId || variable?._id;
        if (!hasId) {
          console.warn('Variable sans ID détectée:', variable);
        }
        return !!hasId;
      });
      
      let message = `${validVariables.length} variables valides récupérées`;
      if (validVariables.length !== originalCount) {
        const filteredCount = originalCount - validVariables.length;
        message += `. ${filteredCount} variables sans ID ont été filtrées`;
        console.warn(`${filteredCount} variables sans ID ont été filtrées`);
      }
      
      console.log(message);
      // Return the success structure with the filtered variables
      return { success: true, message: message, variables: validVariables }; 
    } catch (error) {
      const message = `Erreur lors de la récupération de toutes les variables: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      // Return the failure structure
      return { success: false, message: message, variables: [] }; 
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
    
    // Normaliser la base (la documentation utilise second/minute/hour/day)
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
   * Crée des agrégations pour plusieurs variables en parallèle par lots
   * Cette méthode traite les variables par lots pour accélérer le processus
   * @param variables Tableau de variables à traiter
   * @param batchSize Taille des lots (nombre de variables traitées en parallèle)
   * @returns Résultat contenant le nombre d'agrégations créées, les erreurs, etc.
   */
  async createAggregationsInBatches(
    variables: any[],
    aggregationType: string = 'Sum',
    batchSize: number = 5
  ): Promise<{ success: number; errors: number; aggregationsCreated: number }> {
    const results = { success: 0, errors: 0, aggregationsCreated: 0 };
    const allVariablesResults: any[] = [];

    for (let i = 0; i < variables.length; i += batchSize) {
      const batch = variables.slice(i, i + batchSize);
      console.log(`Traitement du batch d'agrégation ${i / batchSize + 1} / ${Math.ceil(variables.length / batchSize)}`);

      const batchPromises = batch.map(variable => 
        this.createAggregationsForVariable(
          variable.id || variable.variableId, // Use potential different ID fields
          variable.name || variable.variableName, // Use potential different name fields
          aggregationType
        )
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            allVariablesResults.push(result.value);
            // Treat the boolean 'success' from createAggregationsForVariable as 1 for success count
            results.success += result.value.success ? 1 : 0; 
            // Add the count of errors from the individual variable processing
            results.errors += result.value.errors.length; 
            // Add the count of actual aggregations created/found for this variable
            results.aggregationsCreated += Object.keys(result.value.aggregations).length;
          } else {
            // If the whole createAggregationsForVariable promise failed
            console.error("Échec du traitement d'une variable pour l'agrégation:", result.reason);
            results.errors += 1; // Increment error count for the failed variable processing
          }
        });

      } catch (error) {
        console.error("Erreur majeure lors du traitement d'un batch d'agrégation:", error);
        // Consider how to handle batch-level errors, maybe add batchSize to error count?
        results.errors += batch.length; // Assume all in batch failed if Promise.allSettled itself throws
      }
    }
    
    console.log(`Fin de la création des agrégations par batch. Succès: ${results.success}, Erreurs: ${results.errors}, Agrégations totales traitées/créées: ${results.aggregationsCreated}`);
    return results;
  }
} 