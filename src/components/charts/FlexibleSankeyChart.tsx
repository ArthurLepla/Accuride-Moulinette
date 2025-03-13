import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { HierarchyData } from '@/types/sankey';

interface FlexibleSankeyChartProps {
  data: HierarchyData;
}

// Fonction utilitaire pour vérifier si un objet est vide
const isEmptyObject = (obj: any): boolean => {
  return obj === null || 
    obj === undefined || 
    (typeof obj === 'object' && Object.keys(obj).length === 0);
};

export default function FlexibleSankeyChart({ data }: FlexibleSankeyChartProps) {
  const [option, setOption] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Vérification des données
      if (isEmptyObject(data) || 
          !Array.isArray(data.nodes) || 
          !Array.isArray(data.links) || 
          data.nodes.length === 0) {
        setError("Données insuffisantes pour afficher le graphique");
        return;
      }

      // Étape 1: Créer des objets de nœuds simples avec noms uniques (ECharts utilise les noms comme IDs)
      const processedNodes = [];
      const nodeNamesById: Record<string, string> = {}; // Mapping original ID -> Nom affiché
      const nodeNameMap = new Map<string, boolean>(); // Pour vérifier l'unicité des noms
      
      // Traiter chaque nœud pour s'assurer que les noms sont uniques
      for (const node of data.nodes) {
        if (!node || typeof node.name !== 'string' || !node.id) continue;
        
        // S'assurer que le nom est unique
        let uniqueName = node.name;
        let counter = 1;
        while (nodeNameMap.has(uniqueName)) {
          uniqueName = `${node.name}_${counter}`;
          counter++;
        }
        
        // Enregistrer le nom
        nodeNameMap.set(uniqueName, true);
        nodeNamesById[node.id] = uniqueName;
        
        // Ajouter le nœud avec son nom unique
        processedNodes.push({
          name: uniqueName,
          itemStyle: {
            color: node.itemStyle?.color || '#999'
          }
        });
      }
      
      // Étape 2: Créer des liens qui utilisent les noms uniques
      const processedLinks = [];
      
      for (const link of data.links) {
        if (!link || !link.source || !link.target || typeof link.value !== 'number' || link.value <= 0) {
          continue;
        }
        
        const sourceName = nodeNamesById[link.source];
        const targetName = nodeNamesById[link.target];
        
        // Vérifier que les noms source et cible existent
        if (!sourceName || !targetName || sourceName === targetName) {
          continue;
        }
        
        processedLinks.push({
          source: sourceName,
          target: targetName,
          value: Math.max(1, Math.round(link.value)), // Assurer une valeur entière positive
          lineStyle: {
            color: 'source',
            opacity: 0.4
          }
        });
      }
      
      // Vérifier s'il reste des données valides
      if (processedNodes.length === 0 || processedLinks.length === 0) {
        setError("Données insuffisantes après traitement pour afficher le graphique");
        return;
      }

      // Construire l'option pour ECharts
      const sankeyOption = {
        title: {
          text: 'Diagramme de flux hiérarchique',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        animation: false, // Désactiver l'animation pour améliorer la performance
        series: [
          {
            type: 'sankey',
            emphasis: {
              focus: 'adjacency'
            },
            nodeAlign: 'left',
            data: processedNodes,
            links: processedLinks,
            label: {
              position: 'right'
            },
            layoutIterations: 32, // Réduire pour améliorer la performance
            nodeWidth: 20,
            nodePadding: 30
          }
        ]
      };

      setOption(sankeyOption);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la préparation du graphique Sankey:", err);
      setError("Une erreur s'est produite lors de la préparation du graphique");
    }
  }, [data]);

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">{error}</p>
      </div>
    );
  }

  // Afficher un message de chargement si l'option n'est pas encore prête
  if (!option) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">Préparation du graphique...</p>
      </div>
    );
  }

  // Utiliser try-catch pour éviter les erreurs d'exécution
  try {
    return (
      <div className="w-full h-[600px]">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  } catch (err) {
    console.error("Erreur lors du rendu du graphique Sankey:", err);
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">Erreur lors du rendu du graphique</p>
      </div>
    );
  }
} 