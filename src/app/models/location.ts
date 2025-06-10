import { Resource } from './resource';

export interface Location {
  id: string;
  name: string;
  resourceSources: Array<Location>;
  consumption?: ConsumptionRecord[];
  production?: ProductionRecord[];
}

export interface ConsumptionRecord {
  resource: Resource;
  amount: number;
}

export interface ProductionRecord {
  resource: Resource;
  amount: number;
}
