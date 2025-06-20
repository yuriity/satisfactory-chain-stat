import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationsService } from './services/locations.service';
import { Resource } from './models/resource';
import { ResourcesService } from './services/resources.service';
import { BoardComponent } from './components/board/board.component';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [BoardComponent, CommonModule],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';
  protected locationsService = inject(LocationsService);
  protected resourcesService = inject(ResourcesService);
  protected selectedResource = signal<Resource | null>(null);

  protected createNewLocation(): void {
    this.locationsService.newLocation();
  }
}
