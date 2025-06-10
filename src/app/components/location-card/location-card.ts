import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Location,
  ConsumptionRecord,
  ProductionRecord,
} from '../../models/location';
import { Resource } from '../../models/resource';

@Component({
  selector: 'scs-location-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-card.html',
  styleUrl: './location-card.scss',
})
export class LocationCardComponent {
  // Input for the location data (required, never undefined)
  public location = input.required<Location>();

  // Signals for consumption and production records
  protected consumptionRecords = signal<ConsumptionRecord[]>([]);
  protected productionRecords = signal<ProductionRecord[]>([]);

  constructor() {
    // Set up an effect to update records when location changes
    effect(() => {
      const loc = this.location();
      this.consumptionRecords.set(loc.consumption || []);
      this.productionRecords.set(loc.production || []);
    });
  }

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
    // Implement edit functionality here
  }
}
