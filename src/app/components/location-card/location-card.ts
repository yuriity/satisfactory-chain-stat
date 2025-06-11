import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resource } from '../../models/resource';
import { LocationViewModel } from '../../view-models/location-view-model';

@Component({
  selector: 'scs-location-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-card.html',
  styleUrl: './location-card.scss',
})
export class LocationCardComponent {
  // Input for the location view model (required, never undefined)
  public locationVM = input.required<LocationViewModel>();

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
    console.log(`Editing location: ${this.locationVM().id}`);
    // Implement edit functionality here
  }
}
