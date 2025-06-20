import { inject, Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { LOCATIONS } from './mock-locations';
import { calculateConsumption } from '../utils/calculate-consupmtion';
import { OffcanvasService } from './offcanvas.service';
import {
  EditLocationOffcanvasComponent,
  EditLocationData,
  EditLocationResult,
} from '../components/edit-location-offcanvas/edit-location-offcanvas.component';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private locationsSignal = signal<Location[]>([]);
  private offcanvasService = inject(OffcanvasService);

  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    calculateConsumption(LOCATIONS);
    this.locationsSignal.set(LOCATIONS);
  }

  /**
   * Open the location editor offcanvas for a specific location
   * @param location The location to edit
   */
  public async editLocation(location: Location): Promise<void> {
    const offcanvasRef = this.offcanvasService.open<
      EditLocationOffcanvasComponent,
      EditLocationData,
      EditLocationResult
    >(EditLocationOffcanvasComponent, {
      data: { location },
      backdrop: 'static',
      position: 'end',
      width: '450px',
    });

    try {
      const result = await offcanvasRef.afterClosed();

      if (result?.action === 'save' && result.location) {
        this.updateLocation(result.location);
      }
    } catch (dismissReason) {
      console.log('Edit location offcanvas was dismissed:', dismissReason);
    }
  }

  /**
   * Create a new location and open the editor offcanvas
   */
  public async newLocation(): Promise<void> {
    const newLocation: Location = {
      id: crypto.randomUUID(),
      name: 'New Location',
      resourceSources: [],
    };

    await this.editLocation(newLocation);
  }

  /**
   * Delete a location from the locations list
   * @param location The location to delete
   */
  public deleteLocation(location: Location): void {
    this.locationsSignal.update((locations) => {
      const updatedLocations = locations.filter(
        (loc) => loc.id !== location.id
      );

      calculateConsumption(updatedLocations);

      return updatedLocations;
    });
  }

  /**
   * Update the card position for a specific location
   * @param locationId The ID of the location to update
   * @param x The X coordinate position
   * @param y The Y coordinate position
   */
  public updateCardPosition(locationId: string, x: number, y: number): void {
    console.log(`Updating position for ${locationId}: (${x}, ${y})`);
    this.locationsSignal.update((locations) => {
      return locations.map((location) => {
        if (location.id === locationId) {
          return {
            ...location,
            cardPositionX: x,
            cardPositionY: y,
          };
        }
        return location;
      });
    });
  }

  private updateLocation(updatedLocation: Location): void {
    this.locationsSignal.update((locations) => {
      const existingLocationIndex = locations.findIndex(
        (loc) => loc.id === updatedLocation.id
      );

      let updatedLocations: Location[];
      if (existingLocationIndex >= 0) {
        // Update existing location
        updatedLocations = locations.map((loc) =>
          loc.id === updatedLocation.id ? updatedLocation : loc
        );
      } else {
        // Add new location
        updatedLocations = [...locations, updatedLocation];
      }

      calculateConsumption(updatedLocations);

      return updatedLocations;
    });
  }
}
