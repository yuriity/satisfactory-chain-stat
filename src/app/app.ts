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
  protected resource = signal<Resource>({
    className: 'classNameTest',
    displayName: 'displayNameTest',
    description: 'descriptionTest',
  });

  constructor(private resourcesService: ResourcesService) {}

  ngOnInit() {
    this.resourcesService.getResources().subscribe((resources: Resource[]) => {
      console.log('Resources loaded:', resources[0]);
      this.resource.set(resources[0]);
      // this.resource.set({
      //   className: 'classNameTest1',
      //   displayName: 'displayNameTest2',
      //   description: 'descriptionTest2',
      // });
    });
  }
}
