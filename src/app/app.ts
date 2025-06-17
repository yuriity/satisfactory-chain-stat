import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationCardComponent } from './components/location-card/location-card.component';
import { LocationsService } from './services/locations.service';
import { EditLocationOffcanvasComponent } from './components/edit-location-offcanvas/edit-location-offcanvas.component';
import { ResourceSelectorComponent } from './components/resource-selector/resource-selector.component';
import { Resource } from './models/resource';
import { ResourcesService } from './services/resources.service';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [
    CommonModule,
    LocationCardComponent,
    EditLocationOffcanvasComponent,
    ResourceSelectorComponent,
  ],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';
  protected locationsService = inject(LocationsService);
  protected resourcesService = inject(ResourcesService);
  protected selectedResource = signal<Resource | null>(null);

  onResourceSelected(resource: Resource | null): void {
    this.selectedResource.set(resource);
    console.log('Selected resource:', resource);
  }

  selectIronOre(): void {
    // Find the Iron Ore resource
    const resources = this.resourcesService.findResourcesByName('Iron Ore');
    if (resources.length > 0) {
      this.selectedResource.set(resources[0]);
    }
  }

  clearResource(): void {
    this.selectedResource.set(null);
  }
}
