import { Component, signal } from '@angular/core';
import { ResourcesService } from './services/resources.service';
import { Resource } from './models/resource';
import { LocationExampleComponent } from './components/examples/location-example';

@Component({
  selector: 'scs-root',
  imports: [LocationExampleComponent],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';

  constructor(private resourcesService: ResourcesService) {}
}
