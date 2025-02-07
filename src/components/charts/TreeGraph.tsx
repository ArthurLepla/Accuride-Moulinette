import React from 'react';
import ReactECharts from 'echarts-for-react';
import { SankeyData } from '../../types/sankey';
import './TreeGraph.css';

interface TreeGraphProps {
  data: SankeyData;
}

export const TreeGraph: React.FC<TreeGraphProps> = ({ data }) => {
  const buildTree = () => {
    const root = {
      name: "Entreprise",
      children: [] as any[]
    };

    // Grouper par secteur
    const sectorsMap = new Map();
    data.nodes.forEach(node => {
      if (node.category === 'sector') {
        sectorsMap.set(node.id, {
          name: node.name,
          value: node.value,
          children: [],
          itemStyle: {
            color: '#e31a1c'
          },
          className: 'tree-node'
        });
      }
    });

    // Pour chaque secteur, identifier les machines directes et les ateliers
    sectorsMap.forEach((sector, sectorId) => {
      // 1. Trouver les machines directement liées au secteur
      const directMachines = data.nodes
        .filter(node => 
          node.category === 'machine' && 
          data.links.some(link => 
            link.source === sectorId && 
            link.target === node.id
          )
        )
        .map(machine => ({
          name: machine.name,
          value: machine.value || 1,
          itemStyle: { color: '#1f78b4' },
          className: 'tree-node'
        }));

      // 2. Trouver les ateliers et leurs machines
      const workshops = data.nodes
        .filter(node => 
          node.category === 'workshop' && 
          data.links.some(link => 
            link.source === sectorId && 
            link.target === node.id
          )
        );

      const workshopNodes = workshops.map(workshop => {
        // Trouver les machines de cet atelier
        const workshopMachines = data.nodes
          .filter(node => 
            node.category === 'machine' && 
            data.links.some(link => 
              link.source === workshop.id && 
              link.target === node.id
            )
          )
          .map(machine => ({
            name: machine.name,
            value: machine.value || 1,
            itemStyle: { color: '#1f78b4' },
            className: 'tree-node'
          }));

        return {
          name: workshop.name,
          value: workshop.value,
          children: workshopMachines,
          itemStyle: { color: '#33a02c' },
          className: 'tree-node'
        };
      });

      // 3. Combiner les machines directes et les ateliers
      sector.children = [
        ...directMachines,
        ...workshopNodes
      ];

      // Si le secteur n'a que des machines directes (pas d'ateliers),
      // ajuster la structure pour une meilleure visualisation
      if (workshopNodes.length === 0 && directMachines.length > 0) {
        sector.itemStyle.color = '#e31a1c';
      }
    });

    root.children = Array.from(sectorsMap.values());
    root.className = 'tree-node';
    return root;
  };

  const option = {
    title: {
      text: 'Visualisation en Arbre',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      className: 'tree-tooltip',
      formatter: (params: any) => {
        const { data } = params;
        const hasChildren = data.children && data.children.length > 0;
        return `
          <div class="tree-tooltip">
            <div class="tree-tooltip-title">${data.name}</div>
            <div class="tree-tooltip-detail">
              ${hasChildren ? `Éléments: ${data.children.length}` : ''}
              ${data.value ? `<div>Valeur: ${data.value}</div>` : ''}
            </div>
          </div>
        `;
      }
    },
    series: [{
      type: 'tree',
      data: [buildTree()],
      top: '10%',
      left: '8%',
      bottom: '8%',
      right: '20%',
      symbolSize: 10,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 14,
        distance: 5,
        className: 'tree-label'
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left',
          className: 'tree-label'
        }
      },
      emphasis: {
        focus: 'descendant'
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
      initialTreeDepth: 1,
      edgeStyle: {
        className: 'tree-edge'
      }
    }]
  };

  return (
    <div className="tree-container">
      <ReactECharts option={option} style={{ height: '600px' }} />
    </div>
  );
}; 