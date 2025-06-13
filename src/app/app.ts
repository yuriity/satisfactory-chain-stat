import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationCardComponent } from './components/location-card/location-card';
import { LocationsService } from './services/locations.service';
import { EditLocationOffcanvasComponent } from './components/edit-location-offcanvas/edit-location-offcanvas';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [
    CommonModule,
    LocationCardComponent,
    EditLocationOffcanvasComponent,
  ],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';
  protected locationsService = inject(LocationsService);
}
