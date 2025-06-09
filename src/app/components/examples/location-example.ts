import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '../../models/location';
import { LocationCardComponent } from '../location-card';

/**
 * Example component demonstrating how to use the LocationCardComponent
 */
@Component({
  selector: 'scs-location-example',
  standalone: true,
  imports: [CommonModule, LocationCardComponent],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-6 mx-auto">
          <scs-location-card [location]="circuitBoardPlant()" />
        </div>
      </div>
    </div>
  `,
})
export class LocationExampleComponent {
  protected circuitBoardPlant = signal<Location>({
    id: 'circuit-board-plant',
    name: 'Circuit Board Plant',
    resourceSources: [],
    consumption: [
      { resourceClass: 'desc-silica-c', amount: 240 },
      { resourceClass: 'desc-plastic-c', amount: 140 },
    ],
    production: [{ resourceClass: 'desc-circuitboard-c', amount: 150 }],
  });
}
