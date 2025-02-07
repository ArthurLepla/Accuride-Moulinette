import React from 'react';
import ReactECharts from 'echarts-for-react';
import { SankeyData } from '../../types/sankey';
import './NetworkGraph.css';

interface NetworkGraphProps {
  data: SankeyData;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const option = {
    title: {
      text: 'Visualisation en Graphe',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      className: 'network-tooltip',
      formatter: (params: any) => {
        const { data } = params;
        return `
          <div class="tooltip-content">
            <div class="tooltip-title">${data.name}</div>
            <div class="tooltip-detail">
              ${data.category ? `Type: ${data.category}` : ''}
              ${data.value ? `<br>Valeur: ${data.value}` : ''}
            </div>
          </div>
        `;
      }
    },
    legend: {
      data: ['Secteurs', 'Ateliers', 'Machines'],
      top: 60,
      icon: 'circle',
      className: 'network-legend'
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: 'Graph Network',
      type: 'graph',
      layout: 'force',
      zoom: 0.3,
      center: ['50%', '50%'],
      data: data.nodes.map(node => ({
        id: node.id,
        name: node.name,
        symbolSize: node.value ? Math.sqrt(node.value) * 5 + 20 : 30,
        category: node.category === 'sector' ? 0 : node.category === 'workshop' ? 1 : 2,
        value: node.value,
        itemStyle: {
          color: node.category === 'sector' ? '#e31a1c' : 
                 node.category === 'workshop' ? '#33a02c' : '#1f78b4',
          borderWidth: 2,
          borderColor: 'white'
        },
        label: {
          show: true,
          position: 'right',
          distance: 15,
          fontSize: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: [6, 10],
          borderRadius: 4,
          color: '#333',
          className: 'network-label'
        },
        className: 'network-node'
      })),
      links: data.links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value,
        lineStyle: {
          width: Math.log(link.value + 1) * 2,
          curveness: 0.3,
          opacity: 0.6,
          color: '#999'
        },
        className: 'network-link'
      })),
      categories: [
        { name: 'Secteurs' },
        { name: 'Ateliers' },
        { name: 'Machines' }
      ],
      roam: true,
      draggable: true,
      force: {
        repulsion: 2500,
        edgeLength: 600,
        gravity: 0.01,
        friction: 0.1
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        },
        label: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    }]
  };

  return (
    <div className="network-container">
      <ReactECharts option={option} style={{ height: '600px' }} />
    </div>
  );
}; 