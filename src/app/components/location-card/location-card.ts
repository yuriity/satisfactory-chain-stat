import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Location,
  ConsumptionRecord,
  ProductionRecord,
} from '../../models/location';
import { Resource } from '../../models/resource';
import { ResourcesService } from '../../services/resources.service';

@Component({
  selector: 'scs-location-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-card.html',
  styleUrl: './location-card.scss',
})
export class LocationCardComponent {
  // Input for the location data
  public location = input<Location | undefined>(undefined);

  // Signals for consumption and production records
  protected consumptionRecords = signal<ConsumptionRecord[]>([]);
  protected productionRecords = signal<ProductionRecord[]>([]);

  // Resource mapping
  protected resourceMap = signal<Map<string, Resource>>(
    new Map<string, Resource>()
  );

  constructor(private resourcesService: ResourcesService) {
    // Set up an effect to update resource map when resources change
    effect(() => {
      const resources = this.resourcesService.resources();
      const map = new Map<string, Resource>();
      resources.forEach((resource) => map.set(resource.className, resource));
      this.resourceMap.set(map);
    });

    // Set up an effect to update records when location changes
    effect(() => {
      const loc = this.location();
      if (loc) {
        this.consumptionRecords.set(loc.consumption || []);
        this.productionRecords.set(loc.production || []);
      }
    });
  }

  // Helper method to get resource display name
  protected getResourceName(resourceClass: string): string {
    return this.resourceMap().get(resourceClass)?.displayName || resourceClass;
  }

  // Helper method to get resource icon URL
  protected getResourceIconUrl(resourceClass: string): string {
    return this.resourceMap().get(resourceClass)?.getSmallIconUrl() || '';
  }

  // Handle edit button click
  protected onEditClick(): void {
    console.log(`Editing location: ${this.location()?.id}`);
    // Implement edit functionality here
  }
}
