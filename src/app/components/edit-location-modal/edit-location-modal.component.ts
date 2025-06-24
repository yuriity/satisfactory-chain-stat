import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  input,
  output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ResourceSelectorComponent } from '../resource-selector/resource-selector.component';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';
import { Resource } from '../../models/resource';

@Component({
  selector: 'scs-edit-location-modal',
  imports: [CommonModule, FormsModule, ResourceSelectorComponent],
  templateUrl: './edit-location-modal.component.html',
  styles: [
    `
      .form-check-container {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        padding: 0.5rem;
      }

      .input-group .flex-grow-1 {
        flex: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLocationModalComponent {
  // Input signals
  location = input<Location>();

  // Output signals
  locationSaved = output<Location>();

  // Protected signals
  protected editableLocation = signal<Location | null>(null);

  // Computed signals
  protected isFormValid = computed(() => {
    const location = this.editableLocation();
    if (!location) return false;

    // Location name validation: can't be empty, null, or just whitespace
    const name = location.name?.trim();
    return !!(name && name.length > 0);
  });

  protected availableLocations = computed(() => {
    const currentLocationId = this.editableLocation()?.id;
    return this.locationsService
      .locations()
      .filter((location) => location.id !== currentLocationId);
  });

  // Dependency injection
  private activeModal = inject(NgbActiveModal);
  protected locationsService = inject(LocationsService);

  constructor() {
    effect(() => {
      const loc = this.location();
      if (loc) {
        // Create a deep copy with default arrays if they don't exist
        this.editableLocation.set({
          ...loc,
          consumption: [...(loc.consumption || [])],
          production: [...(loc.production || [])],
          resourceSources: [...(loc.resourceSources || [])],
        });
      }
    });
  }

  // Method to set location data (for modal service usage)
  setLocation(location: Location): void {
    this.editableLocation.set({
      ...location,
      consumption: [...(location.consumption || [])],
      production: [...(location.production || [])],
      resourceSources: [...(location.resourceSources || [])],
    });
  }

  protected updateLocationName(newName: string): void {
    this.editableLocation.update((current) =>
      current ? { ...current, name: newName } : null
    );
  }

  // Resource Sources Management
  protected isResourceSourceSelected(locationId: string): boolean {
    const location = this.editableLocation();
    return location?.resourceSources?.includes(locationId) || false;
  }

  protected toggleResourceSource(locationId: string, isChecked: boolean): void {
    this.editableLocation.update((current) => {
      if (!current) return null;

      let resourceSources = [...(current.resourceSources || [])];

      if (isChecked) {
        // Add the location ID if not already present
        if (!resourceSources.includes(locationId)) {
          resourceSources.push(locationId);
        }
      } else {
        // Remove the location ID
        resourceSources = resourceSources.filter((id) => id !== locationId);
      }

      return {
        ...current,
        resourceSources,
      };
    });
  }

  // Inbound (Consumption) Management
  protected addInboundResource(): void {
    this.editableLocation.update((current) => {
      if (!current) return null;

      const consumption = [...(current.consumption || [])];
      consumption.push({
        resource: null as any, // Will be set when user selects a resource
        amount: 0,
      });

      return {
        ...current,
        consumption,
      };
    });
  }

  protected removeInboundResource(index: number): void {
    this.editableLocation.update((current) => {
      if (!current || !current.consumption) return current;

      const consumption = [...current.consumption];
      consumption.splice(index, 1);

      return {
        ...current,
        consumption,
      };
    });
  }

  protected updateInboundResource(
    index: number,
    resource: Resource | null
  ): void {
    this.editableLocation.update((current) => {
      if (!current || !current.consumption || !resource) return current;

      const consumption = [...current.consumption];
      consumption[index] = {
        ...consumption[index],
        resource,
      };

      return {
        ...current,
        consumption,
      };
    });
  }

  protected updateInboundAmount(index: number, amount: number): void {
    this.editableLocation.update((current) => {
      if (!current || !current.consumption) return current;

      const consumption = [...current.consumption];
      consumption[index] = {
        ...consumption[index],
        amount,
      };

      return {
        ...current,
        consumption,
      };
    });
  }

  // Outbound (Production) Management
  protected addOutboundResource(): void {
    this.editableLocation.update((current) => {
      if (!current) return null;

      const production = [...(current.production || [])];
      production.push({
        resource: null as any, // Will be set when user selects a resource
        amount: 0,
        consumption: 0,
      });

      return {
        ...current,
        production,
      };
    });
  }

  protected removeOutboundResource(index: number): void {
    this.editableLocation.update((current) => {
      if (!current || !current.production) return current;

      const production = [...current.production];
      production.splice(index, 1);

      return {
        ...current,
        production,
      };
    });
  }

  protected updateOutboundResource(
    index: number,
    resource: Resource | null
  ): void {
    this.editableLocation.update((current) => {
      if (!current || !current.production || !resource) return current;

      const production = [...current.production];
      production[index] = {
        ...production[index],
        resource,
      };

      return {
        ...current,
        production,
      };
    });
  }

  protected updateOutboundAmount(index: number, amount: number): void {
    this.editableLocation.update((current) => {
      if (!current || !current.production) return current;

      const production = [...current.production];
      production[index] = {
        ...production[index],
        amount,
      };

      return {
        ...current,
        production,
      };
    });
  }

  protected saveLocation(): void {
    const location = this.editableLocation();
    if (location && this.isFormValid()) {
      // Trim the location name before saving
      const locationToSave = {
        ...location,
        name: location.name.trim(),
      };

      this.locationSaved.emit(locationToSave);
      this.activeModal.close(locationToSave);
    }
  }

  protected cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}
