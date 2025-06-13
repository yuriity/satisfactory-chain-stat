import { Location } from '../models/location';

export function calculateConsumption(locations: Location[]): void {
  clearConsumption(locations);

  for (const consamptionLocation of locations) {
    if (
      consamptionLocation.consumption === undefined ||
      consamptionLocation.resourceSources.length === 0
    )
      continue;

    if (
      consamptionLocation.resourceSources === undefined ||
      consamptionLocation.resourceSources.length === 0
    )
      continue;

    for (const sourceId of consamptionLocation.resourceSources) {
      const productionLocation = locations.find(
        (loc) =>
          loc.id === sourceId && loc.production && loc.production.length > 0
      );

      if (!productionLocation) continue;

      // Create a Map of consumption records keyed by resource className
      // Create a Map of consumption records only if consumption exists
      const consumptionMap = new Map(
        consamptionLocation.consumption?.map((consumptionRecord) => [
          consumptionRecord.resource.className,
          consumptionRecord,
        ]) || []
      );

      for (const prodRecord of productionLocation.production ?? []) {
        const consumptionAmount =
          consumptionMap.get(prodRecord.resource.className)?.amount || 0;
        prodRecord.consumption += consumptionAmount;
      }
    }
  }
}

function clearConsumption(locations: Location[]): void {
  for (const location of locations) {
    if (location.production && location.production.length > 0) {
      for (const prodRecord of location.production) {
        prodRecord.consumption = 0;
      }
    }
  }
}
