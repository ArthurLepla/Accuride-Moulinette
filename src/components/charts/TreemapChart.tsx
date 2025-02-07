import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { SankeyData } from '../../types/sankey';
import './TreemapChart.css';

interface TreemapChartProps {
  data: SankeyData;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ data }) => {
  const [treemapLevel, setTreemapLevel] = useState<'sector' | 'workshop' | 'machine'>('sector');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);

  // Composant Breadcrumb
  const Breadcrumb = () => {
    const selectedNode = data.nodes.find(n => n.id === selectedWorkshop);
    const parentNode = selectedNode ? data.nodes.find(n => 
      data.links.some(l => l.source === n.id && l.target === selectedNode.id)
    ) : data.nodes.find(n => n.id === selectedSector);

    const BreadcrumbItem = ({ 
      node, 
      isActive = false, 
      isClickable = true,
      showArrow = true 
    }) => (
      <>
        <button
          onClick={() => {
            if (!isClickable) return;
            if (!node) {
              setTreemapLevel('sector');
              setSelectedSector(null);
              setSelectedWorkshop(null);
            } else if (node.category === 'sector') {
              setTreemapLevel('workshop');
              setSelectedSector(node.id);
              setSelectedWorkshop(null);
            } else if (node.category === 'workshop') {
              setTreemapLevel('machine');
              setSelectedWorkshop(node.id);
            }
          }}
          className={`
            flex items-center px-3 py-1.5 rounded-lg transition-all duration-200
            ${isClickable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
            ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {!node ? 'Vue générale' : node.name}
        </button>
        {showArrow && (
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        )}
      </>
    );

    return (
      <div className="absolute top-4 left-6 flex items-center space-x-2 font-medium z-10">
        <BreadcrumbItem 
          node={null}
          isActive={treemapLevel === 'sector'}
          showArrow={!!parentNode || !!selectedNode}
        />
        
        {parentNode && (
          <BreadcrumbItem 
            node={parentNode}
            isActive={treemapLevel === 'workshop'}
            showArrow={!!selectedNode}
          />
        )}
        
        {selectedNode && (
          <BreadcrumbItem 
            node={selectedNode}
            isActive={true}
            isClickable={false}
            showArrow={false}
          />
        )}
      </div>
    );
  };

  const buildHierarchy = () => {
    let treeData;
    
    if (treemapLevel === 'sector') {
      // Vue des secteurs
      treeData = data.nodes
        .filter(node => node.category === 'sector')
        .map(sector => ({
          name: sector.name,
          id: sector.id,
          value: Math.max(100, data.links
            .filter(link => link.source === sector.id)
            .reduce((sum, link) => sum + (link.value || 1), 0)),
          itemStyle: {
            color: '#e31a1c'
          },
          className: 'treemap-node'
        }));
    } else if (treemapLevel === 'workshop' && selectedSector) {
      // Identifier les machines directement liées au secteur
      const directMachines = data.nodes
        .filter(node => 
          node.category === 'machine' && 
          data.links.some(link => 
            link.source === selectedSector && 
            link.target === node.id
          )
        );

      // Récupérer les ateliers du secteur
      const workshops = data.nodes
        .filter(node => 
          node.category === 'workshop' && 
          data.links.some(link => 
            link.source === selectedSector && 
            link.target === node.id
          )
        );

      // Combiner les ateliers et les machines directes
      treeData = [
        ...workshops.map(workshop => ({
          name: workshop.name,
          id: workshop.id,
          value: Math.max(100, data.links
            .filter(link => link.source === workshop.id)
            .reduce((sum, link) => sum + (link.value || 1), 0)),
          itemStyle: {
            color: '#33a02c'
          },
          className: 'treemap-node'
        })),
        ...directMachines.map(machine => ({
          name: machine.name,
          id: machine.id,
          value: Math.max(100, machine.value || 1),
          itemStyle: {
            color: '#1f78b4'
          },
          className: 'treemap-node'
        }))
      ];
    } else if (treemapLevel === 'machine' && selectedWorkshop) {
      // Vue des machines d'un atelier
      treeData = data.nodes
        .filter(node => 
          node.category === 'machine' && 
          data.links.some(link => 
            link.source === selectedWorkshop && 
            link.target === node.id
          )
        )
        .map(machine => ({
          name: machine.name,
          id: machine.id,
          value: Math.max(100, machine.value || 1),
          itemStyle: {
            color: '#1f78b4'
          },
          className: 'treemap-node'
        }));
    }

    if (!treeData || treeData.length === 0) {
      return [{
        name: "Aucune donnée",
        value: 100,
        itemStyle: {
          color: '#ccc'
        },
        className: 'treemap-node'
      }];
    }

    return treeData;
  };

  const handleTreemapClick = (params: any) => {
    const clickedNode = data.nodes.find(n => n.id === params.data.id);
    
    if (treemapLevel === 'sector') {
      setSelectedSector(params.data.id);
      setTreemapLevel('workshop');
    } else if (treemapLevel === 'workshop' && clickedNode?.category === 'workshop') {
      setSelectedWorkshop(params.data.id);
      setTreemapLevel('machine');
    }
  };

  const option = {
    title: {
      text: `Visualisation en Treemap - ${
        treemapLevel === 'sector' ? 'Secteurs' :
        treemapLevel === 'workshop' ? 'Ateliers et Machines' : 'Machines'
      }`,
      left: 'center',
      top: 60, // Ajusté pour laisser de la place au breadcrumb
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      className: 'treemap-tooltip',
      formatter: (info: any) => {
        const value = info.value;
        const name = info.data.name;
        const level = treemapLevel === 'sector' ? 'Secteur' :
                     treemapLevel === 'workshop' ? 'Atelier/Machine' : 'Machine';
        return `
          <div class="treemap-tooltip">
            <div class="treemap-tooltip-title">${name}</div>
            <div class="treemap-tooltip-detail">
              <div>Type: ${level}</div>
              ${value ? `<div>Valeur: ${value}</div>` : ''}
            </div>
          </div>
        `;
      }
    },
    series: [{
      type: 'treemap',
      name: 'Entreprise',
      width: '90%',
      height: '80%',
      top: '15%',
      left: '5%',
      roam: false,
      nodeClick: 'link',
      breadcrumb: {
        show: false
      },
      data: buildHierarchy(),
      visualDimension: 1,
      visualMin: 0,
      visualMax: 1,
      itemStyle: {
        borderWidth: 1,
        borderColor: '#fff',
        gapWidth: 2,
        borderRadius: 2
      },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        position: 'inside',
        padding: 5,
        className: 'treemap-label'
      },
      upperLabel: {
        show: true,
        height: 30,
        color: '#333',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        padding: [4, 8]
      },
      emphasis: {
        label: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      levels: [{
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
          gapWidth: 4
        }
      }]
    }]
  };

  return (
    <div className="treemap-container">
      <Breadcrumb />
      <ReactECharts 
        option={option} 
        style={{ height: '600px' }}
        onEvents={{
          click: handleTreemapClick
        }}
      />
    </div>
  );
}; 