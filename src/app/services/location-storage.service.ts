import { Injectable } from '@angular/core';
import {
  Location,
  ConsumptionRecord,
  ProductionRecord,
} from '../models/location';
import { Resource } from '../models/resource';
import { calculateConsumption } from '../utils/calculate-consupmtion';

export interface ExportData {
  version: string;
  exportDate: string;
  locations: Location[];
}

@Injectable({
  providedIn: 'root',
})
export class LocationStorageService {
  private readonly STORAGE_KEY = 'satisfactory-chain-stat-locations';
  private readonly CURRENT_VERSION = '1.0.0';

  /**
   * Load locations from local storage
   * @returns Array of locations or null if not found
   */
  public loadFromStorage(): Location[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return null;
      }

      const parsedData = JSON.parse(data);

      // Validate the data structure
      if (!Array.isArray(parsedData)) {
        console.warn('Invalid locations data in localStorage');
        return null;
      }

      // Reconstruct Resource instances in consumption and production arrays
      const locationsWithResources =
        this.reconstructResourceInstances(parsedData);

      // Recalculate consumption for loaded data
      calculateConsumption(locationsWithResources);

      return locationsWithResources;
    } catch (error) {
      console.error('Error loading locations from localStorage:', error);
      return null;
    }
  }

  /**
   * Save locations to local storage
   * @param locations Array of locations to save
   */
  public saveToStorage(locations: Location[]): void {
    try {
      const dataToStore = JSON.stringify(locations);
      localStorage.setItem(this.STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error('Error saving locations to localStorage:', error);
    }
  }

  /**
   * Clear locations from local storage
   */
  public clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing locations from localStorage:', error);
    }
  }

  /**
   * Export locations as JSON file
   * @param locations Array of locations to export
   * @param filename Optional filename for the export
   */
  public exportToJson(locations: Location[], filename?: string): void {
    try {
      const exportData: ExportData = {
        version: this.CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        locations,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        filename ||
        `satisfactory-locations-${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting locations to JSON:', error);
      throw new Error('Failed to export locations');
    }
  }

  /**
   * Import locations from JSON file
   * @param file The JSON file to import
   * @returns Promise that resolves to the imported locations
   */
  public async importFromJson(file: File): Promise<Location[]> {
    return new Promise((resolve, reject) => {
      if (!file.type.includes('json')) {
        reject(new Error('File must be a JSON file'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);

          // Validate the import data structure
          const locations = this.validateImportData(data);

          // Reconstruct Resource instances
          const locationsWithResources =
            this.reconstructResourceInstances(locations);

          // Recalculate consumption for imported data
          calculateConsumption(locationsWithResources);

          resolve(locationsWithResources);
        } catch (error) {
          console.error('Error parsing imported JSON:', error);
          reject(new Error('Invalid JSON file format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate imported data structure
   * @param data The imported data to validate
   * @returns Array of validated locations
   */
  private validateImportData(data: any): Location[] {
    // Check if it's the new export format with metadata
    if (data.version && data.locations && Array.isArray(data.locations)) {
      return this.validateLocationsArray(data.locations);
    }

    // Check if it's a direct array of locations (legacy format)
    if (Array.isArray(data)) {
      return this.validateLocationsArray(data);
    }

    throw new Error('Invalid import data format');
  }

  /**
   * Validate array of locations
   * @param locations Array to validate
   * @returns Validated array of locations
   */
  private validateLocationsArray(locations: any[]): Location[] {
    return locations.map((location, index) => {
      if (!location.id || typeof location.id !== 'string') {
        throw new Error(`Invalid location ID at index ${index}`);
      }

      if (!location.name || typeof location.name !== 'string') {
        throw new Error(`Invalid location name at index ${index}`);
      }

      if (!Array.isArray(location.resourceSources)) {
        throw new Error(`Invalid resourceSources at index ${index}`);
      }

      // Ensure location has all required properties with defaults
      return {
        id: location.id,
        name: location.name,
        resourceSources: location.resourceSources || [],
        cardPositionX: location.cardPositionX || 0,
        cardPositionY: location.cardPositionY || 0,
        consumption: location.consumption || [],
        production: location.production || [],
        // Include any other location properties with defaults
      } as Location;
    });
  }

  /**
   * Reconstruct Resource instances from plain objects
   * @param locations Array of locations with plain resource objects
   * @returns Array of locations with proper Resource instances
   */
  private reconstructResourceInstances(locations: any[]): Location[] {
    return locations.map((location) => ({
      ...location,
      consumption: this.reconstructResourceRecords(location.consumption),
      production: this.reconstructProductionRecords(location.production),
    }));
  }

  /**
   * Reconstruct Resource instances in consumption records
   * @param records Array of consumption records with plain resource objects
   * @returns Array of consumption records with proper Resource instances
   */
  private reconstructResourceRecords(
    records?: any[]
  ): ConsumptionRecord[] | undefined {
    if (!records || !Array.isArray(records)) {
      return records;
    }

    return records.map((record) => ({
      ...record,
      resource: this.reconstructResource(record.resource),
    }));
  }

  /**
   * Reconstruct Resource instances in production records
   * @param records Array of production records with plain resource objects
   * @returns Array of production records with proper Resource instances
   */
  private reconstructProductionRecords(
    records?: any[]
  ): ProductionRecord[] | undefined {
    if (!records || !Array.isArray(records)) {
      return records;
    }

    return records.map((record) => ({
      ...record,
      resource: this.reconstructResource(record.resource),
    }));
  }

  /**
   * Reconstruct a single Resource instance from a plain object
   * @param resourceData Plain object with resource data
   * @returns Resource instance
   */
  private reconstructResource(resourceData: any): Resource {
    if (resourceData instanceof Resource) {
      return resourceData;
    }

    // Create new Resource instance from plain object data
    return new Resource(
      resourceData.className,
      resourceData.displayName,
      resourceData.description
    );
  }

  /**
   * Check if local storage is available
   * @returns True if localStorage is available
   */
  public isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
