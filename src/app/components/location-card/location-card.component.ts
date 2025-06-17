import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resource } from '../../models/resource';
import {
  Location,
  ConsumptionRecord,
  ProductionRecord,
} from '../../models/location';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'scs-location-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss',
})
export class LocationCardComponent {
  private locationsService = inject(LocationsService);

  // Input for the location (required, never undefined)
  public location = input.required<Location>();

  // Computed signals for consumption and production for safe null handling
  protected consumption = computed(() => this.location().consumption || []);
  protected production = computed(() => this.location().production || []);

  // Helper method to get resource display name
  protected getResourceName(resource: Resource): string {
    return resource?.displayName || '';
  }

  // Helper method to get resource icon URL
  protected getResourceIconUrl(resource: Resource): string {
    return resource?.getSmallIconUrl() || '';
  }

  // Handle edit button click
  protected onEditClick(): void {
    console.log(`Editing location: ${this.location().id}`);
    this.locationsService.editLocation(this.location());
  }
}
