import { inject, Injectable, signal } from '@angular/core';
import { Location } from '../models/location';
import { LOCATIONS } from './mock-locations';
import { calculateConsumption } from '../utils/calculate-consupmtion';
import { ModalService } from './modal.service';
import { LocationStorageService } from './location-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private locationsSignal = signal<Location[]>([]);
  private modalService = inject(ModalService);
  private storageService = inject(LocationStorageService);

  public readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    this.initializeLocations();
  }

  /**
   * Initialize locations from storage or use mock data
   */
  private initializeLocations(): void {
    const storedLocations = this.storageService.loadFromStorage();

    if (storedLocations && storedLocations.length > 0) {
      this.locationsSignal.set(storedLocations);
    } else {
      calculateConsumption(LOCATIONS);
      this.locationsSignal.set(LOCATIONS);
      // Save initial mock data to storage
      this.saveToStorage();
    }
  }

  /**
   * Save current locations to local storage
   */
  private saveToStorage(): void {
    this.storageService.saveToStorage(this.locationsSignal());
  }

  /**
   * Open the location editor modal for a specific location
   * @param location The location to edit
   */
  public async editLocation(location: Location): Promise<void> {
    try {
      const result = await this.modalService.editLocation(location);

      if (result) {
        this.updateLocation(result);
      }
    } catch (error) {
      console.log('Edit location modal error:', error);
    }
  }

  /**
   * Create a new location and open the editor modal
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

    this.saveToStorage();
  }

  /**
   * Update the card position for a specific location
   * @param locationId The ID of the location to update
   * @param x The X coordinate position
   * @param y The Y coordinate position
   */
  public updateCardPosition(locationId: string, x: number, y: number): void {
    // console.log(`Updating position for ${locationId}: (${x}, ${y})`);
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

    this.saveToStorage();
  }

  /**
   * Export current locations to JSON file
   * @param filename Optional filename for the export
   */
  public exportLocations(filename?: string): void {
    this.storageService.exportToJson(this.locationsSignal(), filename);
  }

  /**
   * Import locations from JSON file
   * @param file The JSON file to import
   * @returns Promise that resolves when import is complete
   */
  public async importLocations(file: File): Promise<void> {
    try {
      const importedLocations = await this.storageService.importFromJson(file);
      this.locationsSignal.set(importedLocations);
      this.saveToStorage();
    } catch (error) {
      console.error('Error importing locations:', error);
      throw error;
    }
  }

  /**
   * Reset locations to initial mock data
   */
  public resetToMockData(): void {
    calculateConsumption(LOCATIONS);
    this.locationsSignal.set([...LOCATIONS]);
    this.saveToStorage();
  }

  /**
   * Clear all locations
   */
  public clearAllLocations(): void {
    this.locationsSignal.set([]);
    this.storageService.clearStorage();
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

    this.saveToStorage();
  }
}
