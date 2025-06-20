import { Resource } from './resource';

export interface Location {
  id: string;
  name: string;
  resourceSources: Array<string>;
  consumption?: ConsumptionRecord[];
  production?: ProductionRecord[];
  cardPositionX?: number;
  cardPositionY?: number;
}

export interface ConsumptionRecord {
  resource: Resource;
  amount: number;
}

export interface ProductionRecord {
  resource: Resource;
  amount: number;
  consumption: number;
}
