import { Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { Resource } from '../models/resource';
import { LOCATIONS } from './mock-locations';
import { calculateConsumption } from '../utils/calculate-consupmtion';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  // private _editableLocation = signal<Location | undefined>(undefined);
  private locationsSignal = signal<Location[]>([]);

  // public readonly editableLocation = this._editableLocation.asReadonly();
  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    // const locationsCopy = this.locationsSignal().map(location => ({...location}));
    calculateConsumption(LOCATIONS);
    this.locationsSignal.set(LOCATIONS);
  }

  // public selectLocationForEditing(location: Location): void {}
}
