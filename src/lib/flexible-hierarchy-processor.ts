import { HierarchyData, FlexibleProcessedData, TreemapData, HierarchyNode, HierarchyLink } from "@/types/sankey";
import { getColorByLevel } from "@/lib/utils";

interface ExcelRowFlexible {
  [key: string]: string;
}

interface LevelConfig {
  name: string;
  columnName: string;
  level: number;
  energyTypeColumn?: string; // Colonne contenant le type d'énergie (uniquement pour le dernier niveau)
}

interface TreeNode {
  name: string;
  children: TreeNode[];
  value?: number;
}

// Fonction pour normaliser le type d'énergie
function normalizeEnergyType(energyType: string): string {
  const normalized = energyType.toLowerCase().trim();
  
  if (normalized.includes('elec') || normalized.includes('électric')) return 'Elec';
  if (normalized.includes('gaz')) return 'Gaz';
  if (normalized.includes('eau')) return 'Eau';
  if (normalized.includes('air') || normalized.includes('comprim')) return 'Air';
  
  return 'Unknown';
}

export function processFlexibleHierarchy(
  data: ExcelRowFlexible[],
  levelConfigs: LevelConfig[]
): FlexibleProcessedData {
  try {
    // Validation des configurations
    if (!levelConfigs.length) {
      throw new Error("Au moins un niveau de hiérarchie doit être défini");
    }

    // Trie les niveaux par ordre croissant
    levelConfigs.sort((a, b) => a.level - b.level);

    // Maps pour stocker les nœuds et liens
    const nodes: Map<string, HierarchyNode> = new Map();
    const links: Map<string, HierarchyLink> = new Map();
    const levelCounts: { [levelName: string]: number } = {};

    // Fonction pour nettoyer les noms
    const cleanName = (name: string): string => {
      if (!name || typeof name !== 'string') return '';
      return name.trim().replace(/[^a-zA-Z0-9\u00C0-\u017F\s_-]/g, '');
    };

    // Fonction pour générer un ID unique
    const generateValidId = (level: number, name: string): string => {
      const cleanedName = cleanName(name);
      if (!cleanedName) return `l${level}_empty_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return `l${level}_${cleanedName.toLowerCase().replace(/\s+/g, '_')}`;
    };

    // Traitement des données
    data.forEach((row) => {
      let previousLevelId: string | null = null;

      // Parcours des niveaux dans l'ordre
      for (let i = 0; i < levelConfigs.length; i++) {
        const config = levelConfigs[i];
        const value = row[config.columnName];

        if (!value) continue;

        const cleanedValue = cleanName(value);
        if (!cleanedValue) continue; // Ignorer les valeurs vides après nettoyage
        
        const nodeId = generateValidId(config.level, cleanedValue);

        // Création du nœud s'il n'existe pas
        if (!nodes.has(nodeId)) {
          const metadata: { level: string; energyType?: string; rawEnergyType?: string } = {
            level: config.name
          };

          // Si c'est le dernier niveau et qu'une colonne de type d'énergie est spécifiée
          if (i === levelConfigs.length - 1 && config.energyTypeColumn) {
            const rawEnergyType = row[config.energyTypeColumn] || '';
            metadata.rawEnergyType = rawEnergyType;
            metadata.energyType = normalizeEnergyType(rawEnergyType);
          }

          nodes.set(nodeId, {
            id: nodeId,
            name: cleanedValue || `Niveau ${config.level} - Item ${nodes.size + 1}`,
            level: config.level,
            levelName: config.name,
            metadata,
            itemStyle: {
              color: getColorByLevel(config.level)
            }
          });

          // Mise à jour des compteurs
          levelCounts[config.name] = (levelCounts[config.name] || 0) + 1;
        }

        // Création du lien avec le niveau précédent
        if (previousLevelId) {
          const linkId = `${previousLevelId}-${nodeId}`;
          if (!links.has(linkId)) {
            links.set(linkId, {
              source: previousLevelId,
              target: nodeId,
              value: 1,
              lineStyle: {
                color: 'source',
                opacity: 0.4
              }
            });
          } else {
            const link = links.get(linkId)!;
            link.value += 1;
          }
        }

        previousLevelId = nodeId;
      }
    });

    // Valider les liens - s'assurer que les source et target existent
    const validLinks = Array.from(links.values()).filter(link => 
      nodes.has(link.source) && nodes.has(link.target)
    );

    // Construction des données hiérarchiques
    let hierarchyData: HierarchyData = {
      nodes: Array.from(nodes.values()),
      links: validLinks,
      levels: levelConfigs.map(config => ({
        level: config.level,
        name: config.name
      }))
    };

    // Normaliser les données pour éviter les problèmes avec ECharts Sankey
    hierarchyData = normalizeSankeyData(hierarchyData);

    // Construction du treemap
    const treemapData = buildFlexibleTreemapData(hierarchyData);

    return {
      hierarchyData,
      treeData: buildFlexibleTreeData(hierarchyData),
      treemapData,
      summary: {
        totalRows: data.length,
        levelCounts
      }
    };
  } catch (error) {
    console.error("Erreur dans processFlexibleHierarchy:", error);
    // Retourner des données vides mais valides en cas d'erreur
    return {
      hierarchyData: { nodes: [], links: [], levels: [] },
      treeData: { name: "Entreprise", children: [] },
      treemapData: [],
      summary: {
        totalRows: 0,
        levelCounts: {}
      }
    };
  }
}

function buildFlexibleTreeData(hierarchyData: HierarchyData): TreeNode {
  const root: TreeNode = {
    name: "Entreprise",
    children: []
  };

  // Vérifier si nous avons des données valides
  if (!hierarchyData || 
      !Array.isArray(hierarchyData.nodes) || 
      !Array.isArray(hierarchyData.links) || 
      !Array.isArray(hierarchyData.levels) ||
      hierarchyData.nodes.length === 0 ||
      hierarchyData.levels.length === 0) {
    return root;
  }

  // Groupe les nœuds par niveau
  const nodesByLevel = new Map<number, Map<string, TreeNode>>();
  hierarchyData.levels.forEach(level => {
    if (level && typeof level.level === 'number') {
      nodesByLevel.set(level.level, new Map());
    }
  });

  // Initialise les nœuds de premier niveau
  const firstLevelValue = hierarchyData.levels[0]?.level;
  if (typeof firstLevelValue !== 'number') {
    return root;
  }

  const firstLevelNodes = hierarchyData.nodes.filter(node => 
    node && node.id && node.name && node.level === firstLevelValue
  );
  
  firstLevelNodes.forEach(node => {
    const levelMap = nodesByLevel.get(node.level);
    if (levelMap) {
      levelMap.set(node.id, {
        name: node.name,
        children: []
      });
    }
  });

  // Créer un Map des nœuds pour une recherche plus rapide
  const nodesMap = new Map();
  hierarchyData.nodes.forEach(node => {
    if (node && node.id) {
      nodesMap.set(node.id, node);
    }
  });

  // Construit l'arbre en suivant les liens
  hierarchyData.links.forEach(link => {
    if (!link || !link.source || !link.target || typeof link.value !== 'number' || link.value <= 0) {
      return;
    }

    const sourceNode = nodesMap.get(link.source);
    const targetNode = nodesMap.get(link.target);

    if (!sourceNode || !targetNode || !sourceNode.level || !targetNode.level) {
      return;
    }

    const sourceLevelMap = nodesByLevel.get(sourceNode.level);
    const targetLevelMap = nodesByLevel.get(targetNode.level);

    if (!sourceLevelMap || !targetLevelMap) {
      return;
    }

    const sourceTreeNode = sourceLevelMap.get(sourceNode.id);
    if (!sourceTreeNode) {
      return;
    }

    const targetTreeNode: TreeNode = {
      name: targetNode.name,
      children: [],
      value: link.value
    };

    sourceTreeNode.children.push(targetTreeNode);
    targetLevelMap.set(targetNode.id, targetTreeNode);
  });

  // Ajoute les nœuds de premier niveau à la racine
  const firstLevelMap = nodesByLevel.get(firstLevelValue);
  if (firstLevelMap) {
    root.children = Array.from(firstLevelMap.values());
  }

  return root;
}

function buildFlexibleTreemapData(hierarchyData: HierarchyData): TreemapData[] {
  // Validation des données d'entrée
  if (!hierarchyData || 
      !Array.isArray(hierarchyData.nodes) || 
      !Array.isArray(hierarchyData.links) || 
      !Array.isArray(hierarchyData.levels) ||
      hierarchyData.nodes.length === 0 ||
      hierarchyData.levels.length === 0) {
    return []; // Retourner un tableau vide si les données sont invalides
  }

  const treemapData: TreemapData[] = [];
  
  // Vérifier que levels existe et contient au moins un élément
  if (hierarchyData.levels.length === 0) {
    return treemapData;
  }
  
  const firstLevel = hierarchyData.levels[0].level;

  // Groupe par premier niveau
  const topLevelNodes = hierarchyData.nodes.filter(node => node && node.level === firstLevel);

  // Créer un Map des nœuds pour une recherche plus rapide
  const nodesMap = new Map();
  hierarchyData.nodes.forEach(node => {
    if (node && node.id) {
      nodesMap.set(node.id, node);
    }
  });

  topLevelNodes.forEach(node => {
    if (!node || !node.id || !node.name) return;

    let totalValue = 0;
    const children: TreemapData[] = [];

    // Trouve tous les liens sortants
    hierarchyData.links
      .filter(link => link && link.source === node.id && link.target && typeof link.value === 'number')
      .forEach(link => {
        // Vérifier que la valeur est valide et que le nœud cible existe
        if (link.value <= 0 || !nodesMap.has(link.target)) return;

        totalValue += link.value;
        const targetNode = nodesMap.get(link.target);
        if (targetNode && targetNode.name) {
          children.push({
            name: targetNode.name,
            value: link.value
          });
        }
      });

    // Ajouter le nœud au treemap seulement s'il a une valeur ou des enfants
    if (totalValue > 0 || children.length > 0) {
      treemapData.push({
        name: node.name,
        value: totalValue || 1, // Assurer une valeur minimum de 1
        children: children.length > 0 ? children : undefined
      });
    }
  });

  return treemapData;
}

export function validateFlexibleHierarchyData(
  data: ExcelRowFlexible[],
  levelConfigs: LevelConfig[]
): string[] {
  const errors: string[] = [];

  // Vérifie la configuration des niveaux
  if (!levelConfigs.length) {
    errors.push("Au moins un niveau de hiérarchie doit être défini");
  }

  // Vérifie que les niveaux sont uniques
  const levels = new Set(levelConfigs.map(config => config.level));
  if (levels.size !== levelConfigs.length) {
    errors.push("Les niveaux doivent être uniques");
  }

  // Vérifie que les colonnes existent dans les données
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    levelConfigs.forEach(config => {
      if (!columns.includes(config.columnName)) {
        errors.push(`La colonne "${config.columnName}" n'existe pas dans les données`);
      }
    });
  }

  return errors;
}

// Fonction pour normaliser les données Sankey et éviter les erreurs
function normalizeSankeyData(data: HierarchyData): HierarchyData {
  try {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      return { nodes: [], links: [], levels: [] };
    }

    // Vérifier que tous les nœuds ont un id et un nom unique
    const nodeMap = new Map<string, HierarchyNode>();
    const nodeNameSet = new Set<string>();
    
    const normalizedNodes = data.nodes
      .filter(node => node && typeof node.id === 'string' && typeof node.name === 'string')
      .map(node => {
        // S'assurer que les noms sont uniques
        let uniqueName = node.name;
        let counter = 1;
        while (nodeNameSet.has(uniqueName)) {
          uniqueName = `${node.name} (${counter})`;
          counter++;
        }
        nodeNameSet.add(uniqueName);
        
        const normalizedNode = {
          ...node,
          name: uniqueName
        };
        
        nodeMap.set(node.id, normalizedNode);
        return normalizedNode;
      });

    // S'assurer que tous les liens référencent des nœuds existants et ont une valeur positive
    const normalizedLinks = data.links
      .filter(link => 
        link && 
        typeof link.source === 'string' && 
        typeof link.target === 'string' && 
        nodeMap.has(link.source) && 
        nodeMap.has(link.target) && 
        link.source !== link.target && // Éviter les boucles
        typeof link.value === 'number' && 
        link.value > 0
      )
      .map(link => ({
        ...link,
        value: Math.max(1, Math.round(link.value)) // S'assurer que la valeur est un entier positif
      }));

    return {
      nodes: normalizedNodes,
      links: normalizedLinks,
      levels: Array.isArray(data.levels) ? data.levels : []
    };
  } catch (error) {
    console.error("Erreur lors de la normalisation des données Sankey:", error);
    return { nodes: [], links: [], levels: [] };
  }
} 