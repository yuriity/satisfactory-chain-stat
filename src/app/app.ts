import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationCardComponent } from './components/location-card/location-card';
import { LocationsService } from './services/locations.service';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [CommonModule, LocationCardComponent],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';

  constructor(protected locationsService: LocationsService) {}
}
