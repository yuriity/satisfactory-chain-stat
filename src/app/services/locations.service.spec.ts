import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationsService } from './locations.service';
import { OffcanvasService } from './offcanvas.service';
import { LOCATIONS } from './mock-locations';
import { Location } from '../models/location';
import { EditLocationOffcanvasComponent } from '../components/edit-location-offcanvas/edit-location-offcanvas.component';

describe('LocationsService', () => {
  let service: LocationsService;
  let offcanvasService: jasmine.SpyObj<OffcanvasService>;

  beforeEach(() => {
    const offcanvasSpy = jasmine.createSpyObj('OffcanvasService', ['open']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: OffcanvasService, useValue: offcanvasSpy },
      ],
    });

    service = TestBed.inject(LocationsService);
    offcanvasService = TestBed.inject(
      OffcanvasService
    ) as jasmine.SpyObj<OffcanvasService>;
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
  });

  it('should open edit location offcanvas when editLocation is called', async () => {
    const testLocation: Location = {
      id: 'test-id',
      name: 'Test Location',
      resourceSources: [],
    };

    const mockOffcanvasRef = {
      afterClosed: jasmine
        .createSpy('afterClosed')
        .and.returnValue(
          Promise.resolve({
            action: 'save',
            location: { ...testLocation, name: 'Updated Name' },
          })
        ),
      afterDismissed: jasmine
        .createSpy('afterDismissed')
        .and.returnValue(Promise.resolve()),
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      componentInstance: {},
      componentRef: {} as any,
    };

    offcanvasService.open.and.returnValue(mockOffcanvasRef);

    await service.editLocation(testLocation);

    expect(offcanvasService.open).toHaveBeenCalledWith(
      EditLocationOffcanvasComponent,
      {
        data: { location: testLocation },
        backdrop: 'static',
        position: 'end',
      }
    );
  });

  it('should update location when edit returns save result', async () => {
    const originalLocation: Location = service.locations()[0];
    const updatedLocation: Location = {
      ...originalLocation,
      name: 'Updated Name',
    };

    const mockOffcanvasRef = {
      afterClosed: jasmine
        .createSpy('afterClosed')
        .and.returnValue(
          Promise.resolve({ action: 'save', location: updatedLocation })
        ),
      afterDismissed: jasmine
        .createSpy('afterDismissed')
        .and.returnValue(Promise.resolve()),
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      componentInstance: {},
      componentRef: {} as any,
    };

    offcanvasService.open.and.returnValue(mockOffcanvasRef);

    await service.editLocation(originalLocation);

    // Check that the location was updated
    const locations = service.locations();
    const foundLocation = locations.find(
      (loc) => loc.id === originalLocation.id
    );
    expect(foundLocation?.name).toBe('Updated Name');
  });

  it('should not update location when edit returns cancel result', async () => {
    const originalLocation: Location = service.locations()[0];
    const originalName = originalLocation.name;

    const mockOffcanvasRef = {
      afterClosed: jasmine
        .createSpy('afterClosed')
        .and.returnValue(Promise.resolve({ action: 'cancel' })),
      afterDismissed: jasmine
        .createSpy('afterDismissed')
        .and.returnValue(Promise.resolve()),
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      componentInstance: {},
      componentRef: {} as any,
    };

    offcanvasService.open.and.returnValue(mockOffcanvasRef);

    await service.editLocation(originalLocation);

    // Check that the location was not updated
    const locations = service.locations();
    const foundLocation = locations.find(
      (loc) => loc.id === originalLocation.id
    );
    expect(foundLocation?.name).toBe(originalName);
  });
});
