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
    return name.trim().replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '');
  };

  // Fonction pour générer un ID unique
  const generateValidId = (level: number, name: string): string => {
    const cleanedName = cleanName(name);
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
      const nodeId = generateValidId(config.level, cleanedValue);

      // Création du nœud s'il n'existe pas
      if (!nodes.has(nodeId)) {
        const metadata: { level: string; energyType?: string; rawEnergyType?: string } = {
          level: config.name
        };

        // Si c'est le dernier niveau et qu'une colonne de type d'énergie est spécifiée
        if (i === levelConfigs.length - 1 && config.energyTypeColumn) {
          const rawEnergyType = row[config.energyTypeColumn];
          metadata.rawEnergyType = rawEnergyType;
          metadata.energyType = normalizeEnergyType(rawEnergyType);
        }

        nodes.set(nodeId, {
          id: nodeId,
          name: cleanedValue,
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

  // Construction des données hiérarchiques
  const hierarchyData: HierarchyData = {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
    levels: levelConfigs.map(config => ({
      level: config.level,
      name: config.name
    }))
  };

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
}

function buildFlexibleTreeData(hierarchyData: HierarchyData): TreeNode {
  const root: TreeNode = {
    name: "Entreprise",
    children: []
  };

  // Vérifier si nous avons des données
  if (hierarchyData.nodes.length === 0) {
    return root;
  }

  // Groupe les nœuds par niveau
  const nodesByLevel = new Map<number, Map<string, TreeNode>>();
  hierarchyData.levels.forEach(level => {
    nodesByLevel.set(level.level, new Map());
  });

  // Initialise les nœuds de premier niveau
  const firstLevelNodes = hierarchyData.nodes.filter(node => node.level === hierarchyData.levels[0].level);
  firstLevelNodes.forEach(node => {
    const levelMap = nodesByLevel.get(node.level);
    if (levelMap) {
      levelMap.set(node.id, {
        name: node.name,
        children: []
      });
    }
  });

  // Construit l'arbre en suivant les liens
  hierarchyData.links.forEach(link => {
    const sourceNode = hierarchyData.nodes.find(n => n.id === link.source);
    const targetNode = hierarchyData.nodes.find(n => n.id === link.target);

    if (!sourceNode || !targetNode) {
      console.warn('Nœud source ou cible manquant pour le lien:', link);
      return;
    }

    const sourceLevelMap = nodesByLevel.get(sourceNode.level);
    const targetLevelMap = nodesByLevel.get(targetNode.level);

    if (!sourceLevelMap || !targetLevelMap) {
      console.warn('Map de niveau manquante pour:', sourceNode.level, targetNode.level);
      return;
    }

    const sourceTreeNode = sourceLevelMap.get(sourceNode.id);
    if (!sourceTreeNode) {
      console.warn('Nœud source non trouvé dans la map:', sourceNode.id);
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
  const firstLevelMap = nodesByLevel.get(hierarchyData.levels[0].level);
  if (firstLevelMap) {
    root.children = Array.from(firstLevelMap.values());
  }

  return root;
}

function buildFlexibleTreemapData(hierarchyData: HierarchyData): TreemapData[] {
  const treemapData: TreemapData[] = [];
  const firstLevel = hierarchyData.levels[0].level;

  // Groupe par premier niveau
  const topLevelNodes = hierarchyData.nodes.filter(node => node.level === firstLevel);

  topLevelNodes.forEach(node => {
    let totalValue = 0;
    const children: TreemapData[] = [];

    // Trouve tous les liens sortants
    hierarchyData.links
      .filter(link => link.source === node.id)
      .forEach(link => {
        totalValue += link.value;
        const targetNode = hierarchyData.nodes.find(n => n.id === link.target);
        if (targetNode) {
          children.push({
            name: targetNode.name,
            value: link.value
          });
        }
      });

    treemapData.push({
      name: node.name,
      value: totalValue,
      children: children.length > 0 ? children : undefined
    });
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