import ReactECharts from 'echarts-for-react';
import { HierarchyData } from '@/types/sankey';

interface FlexibleSankeyChartProps {
  data: HierarchyData;
}

export default function FlexibleSankeyChart({ data }: FlexibleSankeyChartProps) {
  const option = {
    title: {
      text: 'Diagramme de flux hiérarchique',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        emphasis: {
          focus: 'adjacency'
        },
        nodeAlign: 'left',
        data: data.nodes.map(node => ({
          name: node.name,
          itemStyle: {
            color: node.itemStyle?.color
          }
        })),
        links: data.links.map(link => ({
          source: data.nodes.find(n => n.id === link.source)?.name || '',
          target: data.nodes.find(n => n.id === link.target)?.name || '',
          value: link.value,
          lineStyle: {
            color: 'source',
            opacity: 0.4
          }
        })),
        label: {
          position: 'right'
        },
        layoutIterations: 64,
        nodeWidth: 20,
        nodePadding: 30
      }
    ]
  };

  return (
    <div className="w-full h-[600px]">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
} 