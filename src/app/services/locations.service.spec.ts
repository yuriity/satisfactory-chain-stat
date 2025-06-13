import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationsService } from './locations.service';
import { LOCATIONS } from './mock-locations';
import { Location } from '../models/location';

describe('LocationsService', () => {
  let service: LocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a read-only locations signal', () => {
    // Access the locations read-only signal
    expect(service.locations).toBeDefined();

    // Since we're using mock data from LOCATIONS, we should expect that data
    expect(service.locations().length).toBe(3);
    expect(service.locations()[0].name).toBe('Silica Plant');
    expect(service.locations()[1].name).toBe('Plastic Plant');
    expect(service.locations()[2].name).toBe('Circuit Board Plant');

    // Service currently doesn't expose methods to modify locations
    // This will need to be updated when such methods are added
  });

  // Add more tests when the service is implemented further
  // Examples:
  //
  // it('should add a new location', () => {
  //   const newLocation: Location = {
  //     id: 'test-id',
  //     name: 'Test Location',
  //     resourceSources: []
  //   };
  //
  //   service.addLocation(newLocation);
  //
  //   expect(service.locations().length).toBe(1);
  //   expect(service.locations()[0]).toEqual(newLocation);
  // });
  //
  // it('should update an existing location', () => {
  //   // Setup - add a location first
  //   const initialLocation: Location = {
  //     id: 'test-id',
  //     name: 'Initial Name',
  //     resourceSources: []
  //   };
  //   service.addLocation(initialLocation);
  //
  //   // Update the location
  //   const updatedLocation = { ...initialLocation, name: 'Updated Name' };
  //   service.updateLocation(updatedLocation);
  //
  //   expect(service.locations().length).toBe(1);
  //   expect(service.locations()[0].name).toBe('Updated Name');
  // });
});
