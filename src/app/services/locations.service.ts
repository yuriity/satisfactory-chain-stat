import { inject, Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { Resource } from '../models/resource';
import { LOCATIONS } from './mock-locations';
import { calculateConsumption } from '../utils/calculate-consupmtion';
import { OffcanvasService } from './offcanvas.service';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  // private _editableLocation = signal<Location | undefined>(undefined);
  private locationsSignal = signal<Location[]>([]);
  private offcanvasService = inject(OffcanvasService);

  // public readonly editableLocation = this._editableLocation.asReadonly();
  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    // const locationsCopy = this.locationsSignal().map(location => ({...location}));
    calculateConsumption(LOCATIONS);
    this.locationsSignal.set(LOCATIONS);
  }

  // public selectLocationForEditing(location: Location): void {}

  /**
   * Open the location editor offcanvas for a specific location
   * @param locationId The ID of the location to edit
   */
  public editLocation(locationId: string): void {
    // Set any state needed for editing
    // ...

    // Then open the offcanvas
    this.offcanvasService.show('editLocationOffcanvas');
  }

  /**
   * Close the location editor offcanvas
   */
  public closeLocationEditor(): void {
    this.offcanvasService.hide();
  }
}
