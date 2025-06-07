import { Component, signal } from '@angular/core';
import { ResourcesService } from './services/resources.service';
import { Resource } from './models/resource';

@Component({
  selector: 'scs-root',
  imports: [],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'satisfactory-chain-stat';
  protected resource = signal<Resource | null>(
    new Resource(
      'desc-nuclearwaste-c',
      'Uranium Waste',
      'Highly radioactive waste material'
    )
  );

  constructor(private resourcesService: ResourcesService) {}

  ngOnInit() {
    this.resourcesService.getResources().subscribe((resources: Resource[]) => {
      console.log('Resources loaded:', resources[0]);
      this.resource.set(resources[1]);
    });
  }
}
