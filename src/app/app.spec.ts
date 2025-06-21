import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { LocationsService } from './services/locations.service';
import { ResourcesService } from './services/resources.service';

describe('App', () => {
  let locationsService: jasmine.SpyObj<LocationsService>;
  let resourcesService: jasmine.SpyObj<ResourcesService>;

  beforeEach(async () => {
    const locationsSpy = jasmine.createSpyObj(
      'LocationsService',
      ['newLocation', 'editLocation', 'deleteLocation'],
      {
        locations: jasmine.createSpy('locations').and.returnValue([]),
      }
    );

    const resourcesSpy = jasmine.createSpyObj(
      'ResourcesService',
      ['findResourcesByName'],
      {
        resources: jasmine.createSpy('resources').and.returnValue([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationsService, useValue: locationsSpy },
        { provide: ResourcesService, useValue: resourcesSpy },
      ],
    }).compileComponents();

    locationsService = TestBed.inject(
      LocationsService
    ) as jasmine.SpyObj<LocationsService>;
    resourcesService = TestBed.inject(
      ResourcesService
    ) as jasmine.SpyObj<ResourcesService>;
  });

  xit('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Hello, satisfactory-chain-stat'
    );
  });
});
