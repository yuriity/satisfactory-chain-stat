import { inject, Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { LOCATIONS } from './mock-locations';
import { calculateConsumption } from '../utils/calculate-consupmtion';
import { OffcanvasService } from './offcanvas.service';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private _editableLocation = signal<Location | undefined>(undefined);
  private locationsSignal = signal<Location[]>([]);
  private offcanvasService = inject(OffcanvasService);

  public readonly editableLocation = this._editableLocation.asReadonly();
  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    // const locationsCopy = this.locationsSignal().map(location => ({...location}));
    calculateConsumption(LOCATIONS);
    this.locationsSignal.set(LOCATIONS);
  }

  /**
   * Open the location editor offcanvas for a specific location
   * @param location The location to edit
   */
  public editLocation(location: Location): void {
    this._editableLocation.set({ ...location });
    this.offcanvasService.show('editLocationOffcanvas');
  }

  public resetLocationEdit(): void {
    this._editableLocation.set(undefined);
  }

  public saveEditableLocation(): void {
    const updatedLocations = [...this.locations()];
    const updatedLocation = updatedLocations.find(
      (location) => location.id === this._editableLocation()!.id
    );

    if (updatedLocation) {
      updatedLocation.name = this._editableLocation()!.name;
      updatedLocation.consumption = this._editableLocation()!.consumption;
      updatedLocation.production = this._editableLocation()!.production;
      updatedLocation.resourceSources =
        this._editableLocation()!.resourceSources;
    } else {
      updatedLocations.push(this._editableLocation()!);
    }

    this.locationsSignal.set(updatedLocations);
  }

  /**
   * Close the location editor offcanvas
   */
  public closeLocationEditor(): void {
    this.offcanvasService.hide();
  }
}
