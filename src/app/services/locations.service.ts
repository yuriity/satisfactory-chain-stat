import { Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { Resource } from '../models/resource';
import { LOCATIONS } from './mock-locations';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  // private _editableLocation = signal<Location | undefined>(undefined);
  private locationsSignal = signal<Location[]>(LOCATIONS);

  // public readonly editableLocation = this._editableLocation.asReadonly();
  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {}

  // public selectLocationForEditing(location: Location): void {}
}
