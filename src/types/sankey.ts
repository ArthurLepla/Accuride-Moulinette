export interface SankeyNode {
  id: string;
  name: string;
  category: 'machine' | 'sector' | 'workshop';
  itemStyle?: {
    color: string;
  };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: {
    color: string;
    opacity: number;
  };
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface TreemapData {
  name: string;
  value?: number;
  children?: TreemapData[];
}

export interface ProcessedData {
  sankeyData: SankeyData;
  treeData: any;
  treemapData: TreemapData[];
  summary: {
    totalRows: number;
    totalSecteurs: number;
    totalAteliers: number;
    totalMachines: number;
  };
} 