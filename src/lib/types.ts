export interface Asset {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  children?: Asset[];
}

export interface Variable {
  id: string;
  name: string;
  assetId: string;
  dataType: string;
  unit?: string;
  value?: any;
  timestamp?: string;
}

export interface Aggregation {
  id: string;
  aggregation: string;
  sourceId: string;
  cycle: {
    base: 'second' | 'minute' | 'hour' | 'day';
    factor: number;
  };
  provideAsVariable: boolean;
  publishMqtt: boolean;
}

export type EnergyType = 'Elec' | 'Gaz' | 'Air' | 'Eau';

export interface ExcelData {
  sector: string;
  workshop?: string | null;
  machine: string;
  type: EnergyType;
  variables?: any;
}

export interface AuthConfig {
  iedIp: string;
  authToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  config: AuthConfig | null;
}

export interface IIHAsset {
  id: string;
  assetId: string;
  name: string;
  type: 'machine' | 'sector' | 'workshop';
  energyType?: EnergyType;
  variable?: {
    id: string;
    name: string;
    aggregations: {
      [key: string]: {
        id: string;
        type: string;
        cycle: {
          base: string;
          factor: number;
        };
      };
    };
  };
}

export interface IIHStructure {
  sectors: {
    [key: string]: {
      id: string;
      assetId: string;
      name: string;
      type: 'sector';
      workshops: {
        [key: string]: {
          id: string;
          assetId: string;
          name: string;
          type: 'workshop';
          machines: {
            [key: string]: IIHAsset;
          };
        };
      };
    };
  };
  rootMachines: {
    [key: string]: IIHAsset;
  };
} 