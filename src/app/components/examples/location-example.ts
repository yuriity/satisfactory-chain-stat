import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '../../models/location';
import { LocationCardComponent } from '../location-card/location-card';
import { Resource } from '../../models/resource';

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
  // Create Resource objects for our example
  private readonly silica = new Resource(
    'desc-silica-c',
    'Silica',
    'Derived from Raw Quartz'
  );
  private readonly plastic = new Resource(
    'desc-plastic-c',
    'Plastic',
    'Derived from Crude Oil'
  );
  private readonly circuitBoard = new Resource(
    'desc-circuitboard-c',
    'Circuit Board',
    'Used for electronics manufacturing'
  );

  protected circuitBoardPlant = signal<Location>({
    id: 'circuit-board-plant',
    name: 'Circuit Board Plant',
    resourceSources: [],
    consumption: [
      { resource: this.silica, amount: 240 },
      { resource: this.plastic, amount: 140 },
    ],
    production: [{ resource: this.circuitBoard, amount: 150 }],
  });
}
