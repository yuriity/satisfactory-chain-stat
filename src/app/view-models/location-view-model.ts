import { computed, signal, type Signal } from '@angular/core';
import {
  Location,
  ConsumptionRecord,
  ProductionRecord,
} from '../models/location';
import { Resource } from '../models/resource';

export class LocationViewModel {
  private _id: string;
  private _name = signal<string>('');
  private _resourceSourceIds = signal<string[]>([]);
  private _consumption = signal<ConsumptionRecord[]>([]);
  private _production = signal<ProductionRecord[]>([]);

  get id(): string {
    return this._id;
  }

  // Public read-only signals
  readonly name: Signal<string> = this._name.asReadonly();
  readonly resourceSourceIds: Signal<string[]> =
    this._resourceSourceIds.asReadonly();
  readonly consumption: Signal<ConsumptionRecord[]> =
    this._consumption.asReadonly();
  readonly production: Signal<ProductionRecord[]> =
    this._production.asReadonly();

  // Computed signals for derived data
  readonly totalConsumption = computed(() => {
    return this._consumption().reduce((total, item) => total + item.amount, 0);
  });

  readonly totalProduction = computed(() => {
    return this._production().reduce((total, item) => total + item.amount, 0);
  });

  constructor(location: Location | null) {
    if (!location) {
      this._id = crypto.randomUUID();
      this._name.set(`New location ${this._id.substring(0, 4)}`);
    } else {
      if (!location) {
        throw new Error('Location cannot be null or undefined');
      }
      if (!location.id) {
        throw new Error('Location id cannot be null, undefined or empty');
      }
      if (!location.name || location.name.trim() === '') {
        throw new Error('Location name cannot be null, undefined or empty');
      }

      this._id = location.id;
      this._name.set(location.name);

      // Store resource source IDs
      this._resourceSourceIds.set([...location.resourceSources]);

      // Set consumption and production with default empty arrays if not provided
      this._consumption.set(location.consumption || []);
      this._production.set(location.production || []);
    }
  }

  // Get the plain Location object from this view model
  toLocation(): Location {
    return {
      id: this._id,
      name: this._name(),
      resourceSources: this._resourceSourceIds(),
      consumption: this._consumption(),
      production: this._production(),
    };
  }

  // Methods to update the view model
  setName(name: string): void {
    this._name.set(name);
  }

  addConsumptionRecord(resource: Resource, amount: number): void {
    const record: ConsumptionRecord = { resource, amount };
    this._consumption.update((current) => [...current, record]);
  }

  updateConsumptionRecord(resource: Resource, amount: number): void {
    this._consumption.update((current) => {
      const index = current.findIndex(
        (r) => r.resource.className === resource.className
      );
      if (index !== -1) {
        const updated = [...current];
        updated[index] = { resource, amount };
        return updated;
      }
      return current;
    });
  }

  removeConsumptionRecord(resource: Resource): void {
    this._consumption.update((current) =>
      current.filter((r) => r.resource.className !== resource.className)
    );
  }

  addProductionRecord(resource: Resource, amount: number): void {
    const record: ProductionRecord = { resource, amount };
    this._production.update((current) => [...current, record]);
  }

  updateProductionRecord(resource: Resource, amount: number): void {
    this._production.update((current) => {
      const index = current.findIndex(
        (r) => r.resource.className === resource.className
      );
      if (index !== -1) {
        const updated = [...current];
        updated[index] = { resource, amount };
        return updated;
      }
      return current;
    });
  }

  removeProductionRecord(resource: Resource): void {
    this._production.update((current) =>
      current.filter((r) => r.resource.className !== resource.className)
    );
  }

  addResourceSource(sourceId: string): void {
    this._resourceSourceIds.update((current) => [...current, sourceId]);
  }

  removeResourceSource(sourceId: string): void {
    this._resourceSourceIds.update((current) =>
      current.filter((id) => id !== sourceId)
    );
  }
}
