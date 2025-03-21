import { AuthConfig, ImportResponse, IIHVariable, IIHVariableResponse, BulkCreateVariablesResponse, ENERGY_TYPES, EnergyTypeConfig, ImportConfiguration, DEFAULT_IMPORT_CONFIG } from './types';
import { IIHApi } from './api';
import { FlexibleProcessedData, HierarchyNode } from '@/types/sankey';

/**
 * Classe d'importation simplifié pour IIH Essentials
 */
export class SimpleImporter {
  private api: IIHApi;
  private _allAssets: Map<string, any> = new Map();
  private _importConfig: ImportConfiguration;

  /**
   * Constructeur de la classe d'importation
   * @param authConfig Configuration d'authentification
   * @param importConfig Configuration d'import personnalisée (optionnel)
   */
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
      for (let level = 0; level < totalLevels; level++) {
        const currentLevelName = hierarchyData.levels[level].level;
        const nodesInCurrentLevel = hierarchyData.nodes.filter(node => node.level === currentLevelName);
        
        console.log(`Traitement du niveau ${level + 1}/${totalLevels} (${hierarchyData.levels[level].name}) - ${nodesInCurrentLevel.length} nœuds`);
        
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
          console.log(`Création de l'asset: ${node.name} (niveau ${level + 1}/${totalLevels})`);
          
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
            
            const asset = await this.api.createAsset({
              name: node.name,
              parentId: parentId,
              type: isLastLevel ? 'machine' : 'asset',
              description: `${node.levelName}: ${node.name}`,
              metadata: metadata
            });
            
            // Stocker l'asset créé pour référence future
            createdAssets.set(node.id, asset);
            console.log(`✅ Asset créé: ${node.name} (ID: ${asset.assetId})`);
          } catch (error) {
            console.error(`❌ Erreur lors de la création de l'asset ${node.name}:`, error);
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
   * Crée des variables en masse pour les assets de niveau 5
   * @param assets Liste des assets pour lesquels créer des variables
   * @returns Résultat de l'opération
   */
  async createVariablesForLevel5Assets(assets: any[]): Promise<ImportResponse> {
    try {
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
      
      return {
        success: result.success.length > 0,
        message: `Création de variables terminée: ${result.success.length} variables créées, ${result.errors?.length || 0} erreurs`,
        variables: result.success
      };
    } catch (error) {
      console.error('Erreur lors de la création des variables:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables',
        error
      };
    }
  }
  
  /**
   * Traite la création de variables en lots
   * @param variables Variables à créer
   * @returns Résultats de l'opération
   */
  private async processVariableCreation(variablesToCreate: IIHVariable[]): Promise<{
    success: IIHVariableResponse[];
    errors: any[];
  }> {
    const batchSize = 50; // Limite pour éviter des requêtes trop volumineuses
    const allResults: {
      success: IIHVariableResponse[];
      errors: Array<{
        errorKey: string;
        message: string;
        variableName: string;
        assetId: string;
      }>;
    } = {
      success: [],
      errors: []
    };
    
    for (let i = 0; i < variablesToCreate.length; i += batchSize) {
      const batch = variablesToCreate.slice(i, i + batchSize);
      console.log(`Création du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(variablesToCreate.length/batchSize)} (${batch.length} variables)`);
      
      try {
        const result = await this.api.createVariablesBulk(batch);
        
        if (result.results) allResults.success.push(...result.results);
        if (result.errors) allResults.errors.push(...(result.errors || []));
        
        console.log(`Lot ${Math.floor(i/batchSize) + 1}: ${result.results?.length || 0} variables créées, ${result.errors?.length || 0} erreurs`);
      } catch (error) {
        console.error(`Erreur lors de la création du lot ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    // Analyser les résultats
    this.analyzeVariableCreationResults(allResults);
    
    return allResults;
  }

  /**
   * Prépare les données pour la création en masse de variables
   * @param assets Liste des assets de niveau 5
   * @returns Liste des variables à créer
   */
  private prepareVariablesBulkCreation(assets: any[]): IIHVariable[] {
    const variables: IIHVariable[] = [];
    
    assets.forEach(asset => {
      // Améliorations pour extraire le type d'énergie
      let energyType = 'défaut';
      
      console.log(`Analyse de l'asset "${asset.name}" (${asset.assetId}) pour détection du type d'énergie:`);
      console.log(`Métadonnées disponibles:`, JSON.stringify(asset.metadata || {}, null, 2));
      
      // Vérification systématique des métadonnées avec différentes clés possibles
      const possibleMetadataKeys = [
        'energyType', 'energy_type', 'type', 'energie', 'typeEnergie', 'type_energie',
        'fluide', 'TypeFluide', 'type_fluide', 'energie_type'
      ];
      
      for (const key of possibleMetadataKeys) {
        if (asset.metadata && asset.metadata[key]) {
          energyType = asset.metadata[key];
          console.log(`Type d'énergie trouvé dans metadata.${key}: ${energyType}`);
          break;
        }
      }
      
      // Recherche directe des valeurs dans n'importe quelle clé des métadonnées
      if (energyType === 'défaut' && asset.metadata) {
        const metadataString = JSON.stringify(asset.metadata).toLowerCase();
        if (metadataString.includes('elec')) {
          energyType = 'Elec';
          console.log(`Type d'énergie 'Elec' trouvé dans les métadonnées`);
        } else if (metadataString.includes('gaz')) {
          energyType = 'Gaz';
          console.log(`Type d'énergie 'Gaz' trouvé dans les métadonnées`);
        } else if (metadataString.includes('eau')) {
          energyType = 'Eau';
          console.log(`Type d'énergie 'Eau' trouvé dans les métadonnées`);
        } else if (metadataString.includes('air')) {
          energyType = 'Air';
          console.log(`Type d'énergie 'Air' trouvé dans les métadonnées`);
        }
      }
      
      // Si toujours pas trouvé, recherche dans la description
      if (energyType === 'défaut' && asset.description) {
        const description = asset.description.toLowerCase();
        if (description.includes('elec')) energyType = 'Elec';
        else if (description.includes('eau')) energyType = 'Eau';
        else if (description.includes('gaz')) energyType = 'Gaz';
        else if (description.includes('air')) energyType = 'Air';
        
        if (energyType !== 'défaut') {
          console.log(`Type d'énergie '${energyType}' trouvé dans la description: "${asset.description}"`);
        }
      }
      
      // Si toujours pas trouvé, recherche dans le nom (insensible à la casse)
      if (energyType === 'défaut') {
        const name = asset.name.toLowerCase();
        if (name.includes('elec')) {
          energyType = 'Elec';
          console.log(`Type d'énergie 'Elec' trouvé dans le nom: "${asset.name}"`);
        }
        else if (name.includes('eau')) {
          energyType = 'Eau';
          console.log(`Type d'énergie 'Eau' trouvé dans le nom: "${asset.name}"`);
        }
        else if (name.includes('gaz')) {
          energyType = 'Gaz';
          console.log(`Type d'énergie 'Gaz' trouvé dans le nom: "${asset.name}"`);
        }
        else if (name.includes('air')) {
          energyType = 'Air';
          console.log(`Type d'énergie 'Air' trouvé dans le nom: "${asset.name}"`);
        }
      }
      
      // Si toujours pas trouvé, utiliser le type par défaut et le notifier
      if (energyType === 'défaut') {
        console.warn(`⚠️ Impossible de déterminer le type d'énergie pour l'asset "${asset.name}" (${asset.assetId}). Utilisation de la valeur par défaut.`);
      } else {
        console.log(`Type d'énergie final pour "${asset.name}": ${energyType}`);
      }
      
      const assetName = asset.name;
      const assetId = asset.assetId;
      
      // Déterminer l'unité en fonction du type d'énergie
      const unit = this.determineEnergyUnit(energyType);
      
      // Création des variables avec configuration complète
      variables.push(this.createConsumptionVariable(assetId, assetName, energyType, unit));
      variables.push(this.createSensorStatusVariable(assetId, assetName));
    });
    
    return variables;
  }
  
  /**
   * Crée une variable de consommation avec configuration tags
   */
  private createConsumptionVariable(assetId: string, assetName: string, energyType: string, unit: string): IIHVariable {
    // Normaliser le type d'énergie pour la variable (première lettre majuscule, reste minuscule)
    const normalizedEnergyType = energyType === 'défaut' 
      ? 'Energie' 
      : energyType.charAt(0).toUpperCase() + energyType.slice(1).toLowerCase();
    
    // Nettoyer le nom de l'asset pour éviter les caractères spéciaux dans le nom de la variable
    const cleanAssetName = this.sanitizeNameForVariable(assetName);
    
    // Construction du nom de la variable
    const variableName = `Consommation_${normalizedEnergyType}_${cleanAssetName}`;
    
    console.log(`Création de la variable de consommation: "${variableName}" (${unit})`);
    
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
  
  /**
   * Crée une variable d'état capteur
   */
  private createSensorStatusVariable(assetId: string, assetName: string): IIHVariable {
    // Nettoyer le nom de l'asset pour éviter les caractères spéciaux dans le nom de la variable
    const cleanAssetName = this.sanitizeNameForVariable(assetName);
    
    // Construction du nom de la variable
    const variableName = `Etat_capteur_${cleanAssetName}`;
    
    console.log(`Création de la variable d'état capteur: "${variableName}"`);
    
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
  
  /**
   * Nettoie un nom pour l'utiliser dans un nom de variable
   * Remplace les caractères spéciaux par des underscores
   */
  private sanitizeNameForVariable(name: string): string {
    // Remplacer les caractères spéciaux et espaces par des underscores
    let sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Éliminer les underscores multiples consécutifs
    sanitized = sanitized.replace(/_+/g, '_');
    
    // Supprimer les underscores au début et à la fin
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    return sanitized;
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
      console.log('Démarrage de la création de variables pour tous les assets...');
      console.log(`Nombre total d'assets reçus: ${assets.length}`);
      
      // 0. Initialiser la cache d'assets pour les opérations hiérarchiques
      this.initAllAssets(assets);
      
      // 1. Classer les assets par niveau (1 à 5)
      const assetsByLevel = this.groupAssetsByLevel(assets);
      
      console.log('Répartition des assets par niveau:');
      Object.entries(assetsByLevel).forEach(([level, assetList]) => {
        console.log(`Niveau ${level}: ${assetList.length} assets`);
      });
      
      // 2. Créer les variables pour tous les niveaux
      let allVariablesToCreate: IIHVariable[] = [];
      
      // Commencer par le niveau 5 (le plus bas) pour pouvoir
      // construire les formules correctement pour les niveaux supérieurs
      for (let level = 5; level >= 1; level--) {
        if (assetsByLevel[level] && assetsByLevel[level].length > 0) {
          console.log(`Préparation des variables pour les assets de niveau ${level}...`);
          
          // Créer différentes variables selon le niveau
          const variablesForLevel = await this.prepareVariablesForLevel(
            level, 
            assetsByLevel[level],
            assetsByLevel // Passer tous les assets par niveau pour les formules
          );
          
          allVariablesToCreate = [...allVariablesToCreate, ...variablesForLevel];
          console.log(`${variablesForLevel.length} variables préparées pour le niveau ${level}`);
        }
      }
      
      console.log(`Total: ${allVariablesToCreate.length} variables à créer pour tous les niveaux`);
      
      // 3. Créer les variables en lots
      const results = await this.createVariablesInBatches(allVariablesToCreate);
      
      return {
        success: results.results.length > 0,
        message: `Création de variables terminée: ${results.results.length} variables créées, ${results.errors?.length || 0} erreurs`,
        variables: results.results
      };
    } catch (error) {
      console.error('Erreur lors de la création des variables:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des variables',
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
  private determineAssetLevel(asset: any): number | undefined {
    // Stratégie 1: Vérifier dans les métadonnées
    if (asset.metadata?.level) {
      // Si le level est stocké comme chaîne, tenter de le convertir
      if (typeof asset.metadata.level === 'string') {
        const match = asset.metadata.level.match(/\d+/);
        if (match) {
          return parseInt(match[0]);
        }
      } else if (typeof asset.metadata.level === 'number') {
        return asset.metadata.level;
      }
    }
    
    // Stratégie 2: Vérifier le format "X/Y" dans position
    if (asset.metadata?.position) {
      const parts = asset.metadata.position.split('/');
      if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
        return parseInt(parts[0]);
      }
    }
    
    // Stratégie 3: Vérifier s'il s'agit d'un asset de type machine (niveau 5)
    if (asset.type === 'machine') {
      return 5;
    }
    
    // Stratégie 4: Essayer de déterminer à partir de la profondeur du chemin
    if (asset.metadata?.path && Array.isArray(asset.metadata.path)) {
      return asset.metadata.path.length;
    }
    
    // Stratégie 5: Analyse de la structure du parentId
    // Si un asset a un parent mais n'est pas un parent lui-même, c'est probablement un niveau 5
    if (asset.parentId && !this.isParentOfAnyAsset(asset.assetId)) {
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
    // Si l'asset a plusieurs ancêtres dans sa lignée
    const hierarchyDepth = this.calculateHierarchyDepth(asset);
    if (hierarchyDepth > 0) {
      console.log(`Niveau ${hierarchyDepth} détecté pour ${asset.name} basé sur la hiérarchie`);
      return hierarchyDepth;
    }
    
    // Stratégie 8: Attribution par défaut basée sur une heuristique
    // Si nous n'avons pas pu déterminer le niveau autrement,
    // attribuer un niveau par défaut en fonction du type d'asset
    if (asset.type === 'asset') {
      if (asset.description?.includes('niveau 5')) return 5;
      if (asset.description?.includes('niveau 4')) return 4;
      if (asset.description?.includes('niveau 3')) return 3;
      if (asset.description?.includes('niveau 2')) return 2;
      if (asset.description?.includes('niveau 1')) return 1;
      
      // Attribution par défaut prudente - niveau 3 (milieu de la hiérarchie)
      console.log(`Niveau 3 attribué par défaut pour ${asset.name}`);
      return 3;
    }
    
    // Toujours pas de niveau déterminé, on utilise le niveau 3 par défaut
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
    allAssetsByLevel: Record<number, any[]>
  ): Promise<IIHVariable[]> {
    const variables: IIHVariable[] = [];
    
    for (const asset of assetsOfLevel) {
      // 1. Créer les variables de base pour tous les niveaux
      this.addBasicVariablesForAsset(asset, variables);
      
      // 2. Pour les niveaux 1-4, ajouter/mettre à jour les formules pour les variables de type "rule"
      if (level < 5) {
        await this.addRuleVariablesForAsset(asset, level, allAssetsByLevel, variables);
      }
    }
    
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
    
    return variables;
  }

  /**
   * Ajoute les variables de base pour un asset
   * @param asset Asset pour lequel créer les variables
   * @param variables Tableau de variables à compléter
   */
  private addBasicVariablesForAsset(asset: any, variables: IIHVariable[]): void {
    const assetName = asset.name;
    const assetId = asset.assetId;
    const sanitizedAssetName = this.sanitizeNameForVariable(assetName);
    const assetLevel = this.determineAssetLevel(asset);
    
    console.log(`Création des variables pour ${assetName} (niveau ${assetLevel})`);
    
    // Pour les assets de niveau 5, créer uniquement la variable spécifique au type d'énergie de l'asset
    if (assetLevel === 5) {
      // Déterminer le type d'énergie pour cet asset
      const assetEnergyType = this.getAssetEnergyType(asset);
      
      if (ENERGY_TYPES[assetEnergyType]) {
        // Créer la variable de consommation pour le type d'énergie spécifique
        const config = ENERGY_TYPES[assetEnergyType];
        console.log(`Asset niveau 5: ${assetName} - Création variable consommation type ${assetEnergyType}`);
        
        variables.push({
          variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
          dataType: "Double",
          assetId: assetId,
          unit: config.unit,
          description: `Consommation de ${config.name} pour ${assetName}`,
          adapterId: "913c0a4389d24496bb5222368d573b1b",
          connectionName: sanitizedAssetName,
          topic: "conso", // Correct pour niveau 5
          sourceType: "Tag",
          store: true
        });
      }
      
      // Ajouter la variable d'état capteur
      variables.push({
        variableName: `Etat_capteur_${sanitizedAssetName}`,
        dataType: "String",
        assetId: assetId,
        description: `État du capteur pour ${assetName}`,
        adapterId: "913c0a4389d24496bb5222368d573b1b",
        connectionName: sanitizedAssetName,
        topic: "etat",
        sourceType: "Tag",
        store: true
      });
    } 
    // Pour les assets de niveaux 1-4, créer les 8 variables standardisées
    else {
      console.log(`Asset niveau ${assetLevel}: ${assetName} - Création des 8 variables standardisées`);
      
      // IMPORTANT: Les variables de consommation pour les niveaux 1-4 doivent être de type Rule
      // car elles agrègent les consommations des niveaux inférieurs
      
      // 1. Variables de consommation pour les 4 types d'énergie (Type Rule)
      for (const [type, config] of Object.entries(ENERGY_TYPES)) {
        // Les variables de consommation pour les niveaux 1-4 sont des règles qui somment les niveaux inférieurs
        variables.push({
          variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
          dataType: "Double",
          assetId: assetId,
          unit: config.unit,
          description: `Consommation de ${config.name} pour ${assetName} (règle d'agrégation)`,
          sourceType: "Rule",
          // Formule vide à remplir par addRuleVariablesForAsset
          formula: "0", // Formule par défaut, sera remplacée par addRuleVariablesForAsset
          rule: {
            formula: "0", // Sera mise à jour par la fonction dédiée à la construction des formules
            tags: []
          },
          store: true
        });
      }
      
      // 2. Variables de production et IPE (Type Tag avec tags spécifiques)
      // Ces variables sont des données d'entrée, pas des calculs
      const productionVars = [
        {
          variableName: `Production_${sanitizedAssetName}`,
          dataType: "Double" as "Double",
          unit: "pcs",
          description: `Production pour ${assetName}`,
          topic: this._importConfig.tagMappings.productionPcs // Tag personnalisé pour production
        },
        {
          variableName: `Production_kg_${sanitizedAssetName}`,
          dataType: "Double" as "Double",
          unit: "kg",
          description: `Production en kg pour ${assetName}`,
          topic: this._importConfig.tagMappings.productionKg // Tag personnalisé pour production en kg
        },
        {
          variableName: `IPE_${sanitizedAssetName}`,
          dataType: "Double" as "Double",
          unit: "kWh/pcs",
          description: `Indicateur de performance énergétique pour ${assetName}`,
          topic: this._importConfig.tagMappings.ipeTag // Tag personnalisé pour IPE
        },
        {
          variableName: `IPE_kg_${sanitizedAssetName}`,
          dataType: "Double" as "Double",
          unit: "kWh/kg",
          description: `Indicateur de performance énergétique en kg pour ${assetName}`,
          topic: this._importConfig.tagMappings.ipeKgTag // Tag personnalisé pour IPE en kg
        }
      ];
      
      // Ajouter les variables de production et IPE avec les tags spécifiques
      productionVars.forEach(varConfig => {
        variables.push({
          ...varConfig,
          assetId: assetId,
          adapterId: this._importConfig.adapterId, // Adapter ID personnalisé
          connectionName: sanitizedAssetName,
          sourceType: "Tag",
          store: true
        });
      });
    }
  }

  /**
   * Récupère le type d'énergie d'un asset
   * @param asset Asset à analyser
   * @returns Type d'énergie (clé dans ENERGY_TYPES ou 'défaut')
   */
  private getAssetEnergyType(asset: any): string {
    // Vérifier d'abord dans les métadonnées (recherche précise)
    if (asset.metadata?.energyType) {
      const type = asset.metadata.energyType.toLowerCase();
      // Vérifier si c'est l'un des types définis
      for (const [key, _] of Object.entries(ENERGY_TYPES)) {
        if (type.includes(key)) {
          return key;
        }
      }
    }
    
    // Recherche dans différentes propriétés de métadonnées
    const possibleMetadataKeys = [
      'energyType', 'energy_type', 'type', 'energie', 'typeEnergie', 'type_energie',
      'fluide', 'TypeFluide', 'type_fluide', 'energie_type'
    ];
    
    for (const key of possibleMetadataKeys) {
      if (asset.metadata && asset.metadata[key]) {
        const type = asset.metadata[key].toLowerCase();
        for (const [key, _] of Object.entries(ENERGY_TYPES)) {
          if (type.includes(key)) {
            return key;
          }
        }
      }
    }
    
    // Recherche dans les métadonnées complètes
    if (asset.metadata) {
      const metadataString = JSON.stringify(asset.metadata).toLowerCase();
      for (const [key, _] of Object.entries(ENERGY_TYPES)) {
        if (metadataString.includes(key)) {
          return key;
        }
      }
    }
    
    // Recherche dans le nom ou la description
    const searchFields = [
      asset.name || '',
      asset.description || ''
    ];
    
    for (const field of searchFields) {
      const fieldLower = field.toLowerCase();
      for (const [key, _] of Object.entries(ENERGY_TYPES)) {
        if (fieldLower.includes(key)) {
          return key;
        }
      }
    }
    
    // Type par défaut
    return 'elec';
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
        
        // Construire la formule de somme des consommations
        const formula = this.buildSumFormula(level5Descendants, "conso");
        
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
            tags: []
          };
        } else {
          // La variable n'existe pas encore, la créer
          console.log(`⚠️ Variable de consommation pour ${config.name} non trouvée, création d'une nouvelle variable`);
          variables.push({
            variableName: `Consommation_${config.name}_${sanitizedAssetName}`,
            dataType: "Double",
            assetId: assetId,
            unit: config.unit,
            description: `Consommation de ${config.name} pour ${assetName} (calculée)`,
            sourceType: "Rule",
            formula: formula,
            rule: {
              formula: formula,
              tags: []
            },
            store: true
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
      return [];
    }
    
    // Filtrer pour ne garder que les descendants du bon type d'énergie
    const descendants = level5Assets.filter(level5Asset => {
      // Vérifier si c'est un descendant
      const isDescendant = this.isDescendantOf(level5Asset, asset);
      
      // Vérifier le type d'énergie
      const assetEnergyType = this.getAssetEnergyType(level5Asset);
      const matchesEnergyType = assetEnergyType === energyType;
      
      return isDescendant && matchesEnergyType;
    });
    
    console.log(`Descendants de niveau 5 pour ${asset.name} (${asset.assetId}) de type ${energyType}: ${descendants.length}`);
    
    return descendants;
  }

  /**
   * Vérifie si un asset est descendant d'un autre
   * @param possibleDescendant Asset potentiellement descendant
   * @param possibleAncestor Asset potentiellement ancêtre
   * @returns true si c'est un descendant, false sinon
   */
  private isDescendantOf(possibleDescendant: any, possibleAncestor: any): boolean {
    // Méthode 1: Vérifier le chemin du asset si disponible
    if (possibleDescendant.metadata?.path && Array.isArray(possibleDescendant.metadata.path)) {
      return possibleDescendant.metadata.path.includes(possibleAncestor.assetId);
    }
    
    // Méthode 2: Vérifier si l'ancestor est dans la chaîne parentale
    if (possibleDescendant.parentId === possibleAncestor.assetId) {
      return true;
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
          // Vérifier si l'ancêtre est dans le même sous-arbre
          // Cette vérification est approximative - idéalement, vous voudriez une vraie vérification hiérarchique
          return true;
        }
      }
    }
    
    // Par défaut, si aucune information n'est disponible pour vérifier
    return false;
  }

  /**
   * Construit une formule de somme pour les assets de niveau 5
   * @param level5Assets Assets de niveau 5 à inclure dans la somme
   * @param tagName Nom du tag à utiliser
   * @returns Formule de somme au format attendu par l'API
   */
  private buildSumFormula(level5Assets: any[], tagName: string): string {
    const adapterId = "913c0a4389d24496bb5222368d573b1b";
    
    // Si aucun asset, retourner une formule vide ou une valeur par défaut
    if (level5Assets.length === 0) {
      console.warn("Aucun asset à inclure dans la formule de somme, utilisation de 0 comme valeur par défaut");
      return "0";
    }
    
    // Utiliser spécifiquement "conso" comme tagName pour les références dans la formule
    const actualTagName = "conso";
    
    // Construire la formule avec les références aux assets de niveau 5
    // Format IIH Essentials: sum((AdapterId).(AssetLevel5Name).tagName, (AdapterId).(AssetLevel5Name2).tagName, ...)
    // On utilise la fonction sum() plutôt que des opérateurs + pour plus de robustesse
    const formulaParts = level5Assets.map(asset => {
      // Nettoyer le nom de l'asset pour éviter les problèmes dans la formule
      const cleanAssetName = this.sanitizeNameForVariable(asset.name);
      
      // Récupérer l'ID de l'asset pour une référence plus stable (au cas où)
      const assetId = asset.assetId;
      
      // Format recommandé: (AdapterId).(AssetName).TagName
      // Ou encore mieux si possible: (AdapterId).(AssetId).TagName
      const reference = `(${adapterId}).(${cleanAssetName}).${actualTagName}`;
      
      return reference;
    });
    
    // S'assurer qu'il y a au moins un élément dans la formule
    if (formulaParts.length === 0) {
      return "0";
    }
    
    // Pour plus de robustesse, utiliser la fonction sum() plutôt que des opérateurs +
    // Cela évite des problèmes potentiels avec des valeurs nulles/NaN
    if (formulaParts.length === 1) {
      return formulaParts[0]; // Un seul élément, pas besoin de sum()
    } else {
      // Entourer la formule avec sum() pour plus de 1 élément
      return `sum(${formulaParts.join(', ')})`;
    }
  }

  /**
   * Normalise une variable de type Rule pour s'assurer qu'elle a la structure correcte
   * @param variable Variable à normaliser
   * @returns Variable normalisée
   */
  private normalizeRuleVariable(variable: IIHVariable): IIHVariable {
    // Si ce n'est pas une variable de type Rule, la retourner telle quelle
    if (variable.sourceType !== 'Rule') {
      return variable;
    }
    
    // Cloner la variable pour ne pas modifier l'original
    const normalizedVariable = { ...variable };
    
    // S'assurer que rule existe et contient la formule
    if (!normalizedVariable.rule) {
      console.log(`Ajout de la propriété rule manquante pour ${normalizedVariable.variableName}`);
      normalizedVariable.rule = { 
        formula: normalizedVariable.formula || '',
        tags: [] // Tableau vide requis par l'API
      };
    } else if (!normalizedVariable.rule.tags) {
      // S'assurer que rule.tags existe (requis par l'API IIH)
      console.log(`Ajout de la propriété rule.tags manquante pour ${normalizedVariable.variableName}`);
      normalizedVariable.rule.tags = [];
    }
    
    // S'assurer que formula existe aussi
    if (!normalizedVariable.formula && normalizedVariable.rule.formula) {
      console.log(`Ajout de la propriété formula manquante pour ${normalizedVariable.variableName}`);
      normalizedVariable.formula = normalizedVariable.rule.formula;
    }
    
    // Vérifier que la formule n'est pas vide
    if (!normalizedVariable.formula || normalizedVariable.formula === '') {
      console.warn(`⚠️ Variable de type Rule sans formule: ${normalizedVariable.variableName}`);
    }
    
    return normalizedVariable;
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

    // Normaliser les variables de type Rule pour s'assurer qu'elles ont la propriété rule
    const normalizedVariables = variables.map(v => this.normalizeRuleVariable(v));
    
    // Vérifier que toutes les variables de type Rule ont une formule
    const rulesWithoutFormula = normalizedVariables.filter(v => 
      v.sourceType === 'Rule' && 
      (!v.rule || !v.rule.formula)
    );
    
    if (rulesWithoutFormula.length > 0) {
      console.warn(`⚠️ ${rulesWithoutFormula.length} variables de type Rule n'ont pas de formule définie`);
      rulesWithoutFormula.forEach(v => {
        console.warn(`  - ${v.variableName} (${v.assetId})`);
      });
    }

    // Appliquer l'adapterId configuré aux variables de type Tag
    const configuredVariables = normalizedVariables.map(v => {
      if (v.sourceType === 'Tag' && this._importConfig.adapterId) {
        // Utiliser l'adapterId configuré par l'utilisateur
        v.adapterId = this._importConfig.adapterId;
        
        // Si la variable contient une référence de tag, mettre à jour également l'adapterId
        if ('tag' in v && typeof v.tag === 'object' && v.tag !== null) {
          (v.tag as any).adapterId = this._importConfig.adapterId;
        }
      }
      return v;
    });
    
    // Log des 2 premières variables pour vérification
    console.log('Échantillon des variables à créer:');
    configuredVariables.slice(0, 2).forEach((v, i) => {
      console.log(`- Variable ${i + 1}: ${v.variableName} (${v.sourceType}), adapterId=${v.adapterId}`);
    });

    try {
      const results = await this.api.createVariablesBulk(configuredVariables);
      return results;
    } catch (error) {
      console.error('Erreur lors de la création des variables en lots:', error);
      throw error;
    }
  }
} 