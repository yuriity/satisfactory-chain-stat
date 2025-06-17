import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseOffcanvasComponent } from '../base-offcanvas/base-offcanvas.component';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';

export interface EditLocationData {
  location: Location;
}

export interface EditLocationResult {
  action: 'save' | 'cancel';
  location?: Location;
}

@Component({
  selector: 'scs-edit-location-offcanvas',
  standalone: true,
  templateUrl: './edit-location-offcanvas.component.html',
  imports: [CommonModule, FormsModule],
})
export class EditLocationOffcanvasComponent extends BaseOffcanvasComponent<
  EditLocationData,
  EditLocationResult
> {
  // Dependency injection
  protected locationsService = inject(LocationsService);

  // Signal for the editable location (mutable copy)
  private editableLocationSignal = signal<Location | null>(null);

  // Public getter for the editable location
  public editableLocation = this.editableLocationSignal.asReadonly();

  constructor() {
    super();

    // Effect to watch for data changes and update editable location
    effect(() => {
      const data = this.data();
      if (data?.location) {
        // Create a mutable copy when data is available
        this.editableLocationSignal.set({ ...data.location });
      }
    });
  }

  public updateLocationName(newName: string): void {
    const location = this.editableLocationSignal();
    if (location) {
      this.editableLocationSignal.set({ ...location, name: newName });
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
