export interface Location {
  id: string;
  name: string;
  resourceSources: Array<Location>;
  consumption?: ConsumptionRecord[];
  production?: ProductionRecord[];
}

export interface ConsumptionRecord {
  resourceClass: string;
  amount: number;
}

export interface ProductionRecord {
  resourceClass: string;
  amount: number;
}
