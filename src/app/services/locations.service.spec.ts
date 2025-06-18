import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationsService } from './locations.service';
import { OffcanvasService } from './offcanvas.service';
import { LOCATIONS, PlasticResource, SilicaResource } from './mock-locations';
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
        width: '450px',
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

  it('should recalculate consumption when location resourceSources are updated', async () => {
    // Get the Circuit Board Plant (which consumes from Silica Plant and Plastic Plant)
    const circuitBoardPlant = service
      .locations()
      .find((loc) => loc.id === 'circuit-board-plant1');
    expect(circuitBoardPlant).toBeDefined();

    // Get the Silica Plant (which produces Silica that Circuit Board Plant consumes)
    const silicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    expect(silicaPlant).toBeDefined();

    // Initially, Silica Plant should have consumption > 0 because Circuit Board Plant uses it
    const initialSilicaConsumption =
      silicaPlant?.production?.[0]?.consumption ?? 0;
    expect(initialSilicaConsumption).toBeGreaterThan(0);

    // Create updated location with Silica Plant removed from resourceSources
    const updatedCircuitBoardPlant: Location = {
      ...circuitBoardPlant!,
      resourceSources: ['plastic-plant-1'], // Remove 'silica-plant-1'
      consumption: [
        // Update consumption to only include Plastic (remove Silica)
        { resource: PlasticResource, amount: 140 },
      ],
    };

    const mockOffcanvasRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(
        Promise.resolve({
          action: 'save',
          location: updatedCircuitBoardPlant,
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

    await service.editLocation(circuitBoardPlant!);

    // After updating, Silica Plant should have consumption = 0 since no one consumes from it
    const updatedSilicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    const finalSilicaConsumption =
      updatedSilicaPlant?.production?.[0]?.consumption ?? 0;
    expect(finalSilicaConsumption).toBe(0);

    // Verify that the Circuit Board Plant was actually updated
    const updatedCircuitBoard = service
      .locations()
      .find((loc) => loc.id === 'circuit-board-plant1');
    expect(updatedCircuitBoard?.resourceSources).toEqual(['plastic-plant-1']);
    expect(updatedCircuitBoard?.consumption).toEqual([
      { resource: PlasticResource, amount: 140 },
    ]);
  });

  it('should recalculate consumption when resourceSources are added back', async () => {
    // First, update to remove a resource source
    const circuitBoardPlant = service
      .locations()
      .find((loc) => loc.id === 'circuit-board-plant1');
    expect(circuitBoardPlant).toBeDefined();

    // Remove Silica Plant from resource sources
    const updatedCircuitBoardPlant: Location = {
      ...circuitBoardPlant!,
      resourceSources: ['plastic-plant-1'], // Remove 'silica-plant-1'
      consumption: [{ resource: PlasticResource, amount: 140 }],
    };

    let mockOffcanvasRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(
        Promise.resolve({
          action: 'save',
          location: updatedCircuitBoardPlant,
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
    await service.editLocation(circuitBoardPlant!);

    // Verify Silica Plant consumption is 0
    let silicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    expect(silicaPlant?.production?.[0]?.consumption).toBe(0);

    // Now add Silica Plant back to resource sources
    const readdedCircuitBoardPlant: Location = {
      ...updatedCircuitBoardPlant,
      resourceSources: ['silica-plant-1', 'plastic-plant-1'], // Add back 'silica-plant-1'
      consumption: [
        { resource: SilicaResource, amount: 240 },
        { resource: PlasticResource, amount: 140 },
      ],
    };

    mockOffcanvasRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(
        Promise.resolve({
          action: 'save',
          location: readdedCircuitBoardPlant,
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
    const currentCircuitBoard = service
      .locations()
      .find((loc) => loc.id === 'circuit-board-plant1');
    await service.editLocation(currentCircuitBoard!);

    // Verify Silica Plant consumption is recalculated back to 240
    silicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    expect(silicaPlant?.production?.[0]?.consumption).toBe(240);
  });

  it('should delete a location from the locations list', () => {
    // Get initial count
    const initialCount = service.locations().length;
    expect(initialCount).toBe(3);

    // Get the first location to delete
    const locationToDelete = service.locations()[0];
    expect(locationToDelete.name).toBe('Silica Plant');

    // Delete the location
    service.deleteLocation(locationToDelete);

    // Verify the location was removed
    const finalCount = service.locations().length;
    expect(finalCount).toBe(2);

    // Verify the specific location is no longer in the list
    const deletedLocationExists = service
      .locations()
      .some((loc) => loc.id === locationToDelete.id);
    expect(deletedLocationExists).toBeFalse();
  });

  it('should recalculate consumption after deleting a location', () => {
    // Get the Circuit Board Plant (which consumes from Silica Plant and Plastic Plant)
    const circuitBoardPlant = service
      .locations()
      .find((loc) => loc.id === 'circuit-board-plant1');
    expect(circuitBoardPlant).toBeDefined();

    // Get the Silica Plant (which produces Silica that Circuit Board Plant consumes)
    const silicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    expect(silicaPlant).toBeDefined();

    // Initially, Silica Plant should have consumption > 0 because Circuit Board Plant uses it
    const initialSilicaConsumption =
      silicaPlant?.production?.[0]?.consumption ?? 0;
    expect(initialSilicaConsumption).toBeGreaterThan(0);

    // Delete the Circuit Board Plant
    service.deleteLocation(circuitBoardPlant!);

    // After deleting Circuit Board Plant, Silica Plant should have consumption = 0
    const updatedSilicaPlant = service
      .locations()
      .find((loc) => loc.id === 'silica-plant-1');
    const finalSilicaConsumption =
      updatedSilicaPlant?.production?.[0]?.consumption ?? 0;
    expect(finalSilicaConsumption).toBe(0);

    // Verify Circuit Board Plant was actually deleted
    const deletedPlantExists = service
      .locations()
      .some((loc) => loc.id === 'circuit-board-plant1');
    expect(deletedPlantExists).toBeFalse();
  });

  it('should handle deleting a non-existent location gracefully', () => {
    const initialCount = service.locations().length;

    // Create a fake location that doesn't exist in the service
    const fakeLocation: Location = {
      id: 'non-existent-id',
      name: 'Fake Location',
      resourceSources: [],
    };

    // Try to delete the non-existent location
    service.deleteLocation(fakeLocation);

    // Count should remain the same
    const finalCount = service.locations().length;
    expect(finalCount).toBe(initialCount);
  });

  it('should create a new location and open edit offcanvas when newLocation is called', async () => {
    const mockOffcanvasRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(
        Promise.resolve({
          action: 'save',
          location: {
            id: 'new-location-id',
            name: 'My New Location',
            resourceSources: ['silica-plant-1'],
          },
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

    const initialCount = service.locations().length;

    await service.newLocation();

    // Verify offcanvas was opened with a new location
    expect(offcanvasService.open).toHaveBeenCalledWith(
      EditLocationOffcanvasComponent,
      {
        data: {
          location: jasmine.objectContaining({
            name: 'New Location',
            resourceSources: [],
          }),
        },
        backdrop: 'static',
        position: 'end',
        width: '450px',
      }
    );

    // Verify new location was added to the list
    expect(service.locations().length).toBe(initialCount + 1);
    const newLocation = service
      .locations()
      .find((loc) => loc.name === 'My New Location');
    expect(newLocation).toBeDefined();
    expect(newLocation?.resourceSources).toEqual(['silica-plant-1']);
  });

  it('should not add location when newLocation edit is cancelled', async () => {
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

    const initialCount = service.locations().length;

    await service.newLocation();

    // Verify no new location was added
    expect(service.locations().length).toBe(initialCount);
  });

  it('should generate unique IDs for new locations', async () => {
    // Mock crypto.randomUUID to return predictable values
    const originalRandomUUID = crypto.randomUUID;
    let callCount = 0;
    spyOn(crypto, 'randomUUID').and.callFake(() => {
      callCount++;
      return `test-uuid-${callCount}-1234-5678-9abc` as `${string}-${string}-${string}-${string}-${string}`;
    });

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

    await service.newLocation();
    await service.newLocation();

    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
    expect(offcanvasService.open).toHaveBeenCalledWith(
      EditLocationOffcanvasComponent,
      {
        data: {
          location: jasmine.objectContaining({
            id: 'test-uuid-1-1234-5678-9abc',
            name: 'New Location',
          }),
        },
        backdrop: 'static',
        position: 'end',
        width: '450px',
      }
    );

    // Restore original function
    crypto.randomUUID = originalRandomUUID;
  });
});
