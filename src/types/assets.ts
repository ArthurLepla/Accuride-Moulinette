export interface IIHAssetBase {
  assetId: string;
  name: string;
  parentId: string;
  hasChildren: boolean;
  sortOrder: number;
  variables?: IIHVariable[];
}

export interface IIHAssetResponse {
  assets: IIHAssetBase[];
}

export interface AssetNode {
  id: string;
  name: string;
  parentId: string;
  hasChildren: boolean;
  type: 'root' | 'parent' | 'child';
  children: AssetNode[];
  variables?: IIHVariable[];
  details?: any;
}

export interface IIHVariable {
  id: string;
  name: string;
  dataType: string;
  unit?: string;
  description?: string;
  aggregations?: IIHAggregation[];
}

export interface IIHAggregation {
  id: string;
  aggregation: string;
  sourceId: string;
  cycle: {
    base: string;
    factor: number;
  };
  provideAsVariable: boolean;
  publishMqtt: boolean;
}

export interface AssetTreeState {
  expandedNodes: Set<string>;
  selectedNode: string | null;
  expandedVariables: Set<string>;
} 