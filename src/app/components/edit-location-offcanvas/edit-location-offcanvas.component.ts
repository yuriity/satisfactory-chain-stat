import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseOffcanvasComponent } from '../base-offcanvas/base-offcanvas.component';
import { ResourceSelectorComponent } from '../resource-selector/resource-selector.component';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';
import { Resource } from '../../models/resource';

export interface EditLocationData {
  location: Location;
}

export interface EditLocationResult {
  action: 'save' | 'cancel';
  location?: Location;
}

@Component({
  selector: '[scs-edit-location-offcanvas]',
  standalone: true,
  templateUrl: './edit-location-offcanvas.component.html',
  imports: [CommonModule, FormsModule, ResourceSelectorComponent],
})
export class EditLocationOffcanvasComponent extends BaseOffcanvasComponent<
  EditLocationData,
  EditLocationResult
> {
  // Dependency injection
  protected readonly locationsService = inject(LocationsService);

  // Signal for the editable location (mutable copy)
  private editableLocationSignal = signal<Location | null>(null);

  // Public getter for the editable location
  public editableLocation = this.editableLocationSignal.asReadonly();

  // Computed signal for available locations (excluding the current one)
  protected availableLocations = computed(() => {
    const currentLocationId = this.editableLocation()?.id;
    return this.locationsService.locations().filter(
      (location) => location.id !== currentLocationId
    );
  });

  constructor() {
    super();

    // Effect to watch for data changes and update editable location
    effect(() => {
      const data = this.data();
      if (data?.location) {
        // Create a deep copy with default arrays if they don't exist
        this.editableLocationSignal.set({
          ...data.location,
          consumption: [...(data.location.consumption || [])],
          production: [...(data.location.production || [])],
          resourceSources: [...(data.location.resourceSources || [])],
        });
      }
    });
  }

  public updateLocationName(newName: string): void {
    const location = this.editableLocationSignal();
    if (location) {
      this.editableLocationSignal.set({ ...location, name: newName });
    }
  }

  // Resource Sources Management
  protected isResourceSourceSelected(locationId: string): boolean {
    const location = this.editableLocation();
    return location?.resourceSources?.includes(locationId) || false;
  }

  protected toggleResourceSource(locationId: string, isChecked: boolean): void {
    const location = this.editableLocationSignal();
    if (location) {
      let resourceSources = [...(location.resourceSources || [])];

      if (isChecked) {
        // Add the location ID if not already present
        if (!resourceSources.includes(locationId)) {
          resourceSources.push(locationId);
        }
      } else {
        // Remove the location ID
        resourceSources = resourceSources.filter((id) => id !== locationId);
      }

      this.editableLocationSignal.set({
        ...location,
        resourceSources,
      });
    }
  }

  // Inbound (Consumption) Management
  protected addInboundResource(): void {
    const location = this.editableLocationSignal();
    if (location) {
      const consumption = [...(location.consumption || [])];
      consumption.push({
        resource: null as any, // Will be set when user selects a resource
        amount: 0,
      });
      this.editableLocationSignal.set({
        ...location,
        consumption,
      });
    }
  }

  protected removeInboundResource(index: number): void {
    const location = this.editableLocationSignal();
    if (location && location.consumption) {
      const consumption = [...location.consumption];
      consumption.splice(index, 1);
      this.editableLocationSignal.set({
        ...location,
        consumption,
      });
    }
  }

  protected updateInboundResource(
    index: number,
    resource: Resource | null
  ): void {
    const location = this.editableLocationSignal();
    if (location && location.consumption && resource) {
      const consumption = [...location.consumption];
      consumption[index] = {
        ...consumption[index],
        resource,
      };
      this.editableLocationSignal.set({
        ...location,
        consumption,
      });
    }
  }

  protected updateInboundAmount(index: number, amount: number): void {
    const location = this.editableLocationSignal();
    if (location && location.consumption) {
      const consumption = [...location.consumption];
      consumption[index] = {
        ...consumption[index],
        amount,
      };
      this.editableLocationSignal.set({
        ...location,
        consumption,
      });
    }
  }

  // Outbound (Production) Management
  protected addOutboundResource(): void {
    const location = this.editableLocationSignal();
    if (location) {
      const production = [...(location.production || [])];
      production.push({
        resource: null as any, // Will be set when user selects a resource
        amount: 0,
        consumption: 0,
      });
      this.editableLocationSignal.set({
        ...location,
        production,
      });
    }
  }

  protected removeOutboundResource(index: number): void {
    const location = this.editableLocationSignal();
    if (location && location.production) {
      const production = [...location.production];
      production.splice(index, 1);
      this.editableLocationSignal.set({
        ...location,
        production,
      });
    }
  }

  protected updateOutboundResource(
    index: number,
    resource: Resource | null
  ): void {
    const location = this.editableLocationSignal();
    if (location && location.production && resource) {
      const production = [...location.production];
      production[index] = {
        ...production[index],
        resource,
      };
      this.editableLocationSignal.set({
        ...location,
        production,
      });
    }
  }

  protected updateOutboundAmount(index: number, amount: number): void {
    const location = this.editableLocationSignal();
    if (location && location.production) {
      const production = [...location.production];
      production[index] = {
        ...production[index],
        amount,
      };
      this.editableLocationSignal.set({
        ...location,
        production,
      });
    }
  }

  protected saveLocation(): void {
    const location = this.editableLocationSignal();
    if (location) {
      this.close({
        action: 'save',
        location,
      });
    }
  }

  protected closeOffcanvas(): void {
    this.close({
      action: 'cancel',
    });
  }
}
