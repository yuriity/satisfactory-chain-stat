import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationsService } from './locations.service';
import { ModalService } from './modal.service';
import { LocationStorageService } from './location-storage.service';
import { LOCATIONS, PlasticResource, SilicaResource } from './mock-locations';
import { Location } from '../models/location';

describe('LocationsService', () => {
  let service: LocationsService;
  let modalService: jasmine.SpyObj<ModalService>;
  let storageService: jasmine.SpyObj<LocationStorageService>;

  beforeEach(() => {
    const modalSpy = jasmine.createSpyObj('ModalService', ['editLocation']);
    const storageSpy = jasmine.createSpyObj('LocationStorageService', [
      'loadFromStorage',
      'saveToStorage',
      'clearStorage',
      'exportToJson',
      'importFromJson',
    ]);

    // Mock empty storage by default
    storageSpy.loadFromStorage.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalSpy },
        { provide: LocationStorageService, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(LocationsService);
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    storageService = TestBed.inject(
      LocationStorageService
    ) as jasmine.SpyObj<LocationStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with mock data when storage is empty', () => {
    // Verify the service was initialized correctly with mock data
    expect(service.locations().length).toBe(3);
    expect(service.locations()[0].name).toBe('Silica Plant');
    expect(service.locations()[1].name).toBe('Plastic Plant');
    expect(service.locations()[2].name).toBe('Circuit Board Plant');
    expect(storageService.saveToStorage).toHaveBeenCalled();
  });

  it('should initialize with stored data when available', () => {
    const storedLocations: Location[] = [
      {
        id: 'stored-1',
        name: 'Stored Location 1',
        resourceSources: [],
      },
      {
        id: 'stored-2',
        name: 'Stored Location 2',
        resourceSources: [],
      },
    ];

    // Reset the test bed with different mock data
    const modalSpy = jasmine.createSpyObj('ModalService', ['editLocation']);
    const storageSpy = jasmine.createSpyObj('LocationStorageService', [
      'loadFromStorage',
      'saveToStorage',
      'clearStorage',
      'exportToJson',
      'importFromJson',
    ]);

    storageSpy.loadFromStorage.and.returnValue(storedLocations);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalSpy },
        { provide: LocationStorageService, useValue: storageSpy },
      ],
    });

    // Create a new service instance to test initialization
    const newService = TestBed.inject(LocationsService);

    expect(newService.locations().length).toBe(2);
    expect(newService.locations()[0].name).toBe('Stored Location 1');
    expect(newService.locations()[1].name).toBe('Stored Location 2');
  });

  it('should open edit location modal when editLocation is called', async () => {
    const testLocation: Location = {
      id: 'test-id',
      name: 'Test Location',
      resourceSources: [],
    };

    const updatedLocation = { ...testLocation, name: 'Updated Name' };
    modalService.editLocation.and.returnValue(Promise.resolve(updatedLocation));

    await service.editLocation(testLocation);

    expect(modalService.editLocation).toHaveBeenCalledWith(testLocation);
  });

  it('should update location when edit returns save result', async () => {
    const originalLocation: Location = service.locations()[0];
    const updatedLocation: Location = {
      ...originalLocation,
      name: 'Updated Name',
    };

    modalService.editLocation.and.returnValue(Promise.resolve(updatedLocation));

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

    modalService.editLocation.and.returnValue(Promise.resolve(null));

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

    modalService.editLocation.and.returnValue(
      Promise.resolve(updatedCircuitBoardPlant)
    );

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

    modalService.editLocation.and.returnValue(
      Promise.resolve(updatedCircuitBoardPlant)
    );
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

    modalService.editLocation.and.returnValue(
      Promise.resolve(readdedCircuitBoardPlant)
    );
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

  it('should create a new location and open edit modal when newLocation is called', async () => {
    modalService.editLocation.and.returnValue(
      Promise.resolve({
        id: 'new-location-id',
        name: 'My New Location',
        resourceSources: ['silica-plant-1'],
      })
    );

    const initialCount = service.locations().length;

    await service.newLocation();

    // Verify modal was opened with a new location
    expect(modalService.editLocation).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'New Location',
        resourceSources: [],
      })
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
    modalService.editLocation.and.returnValue(Promise.resolve(null));

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

    modalService.editLocation.and.returnValue(Promise.resolve(null));

    await service.newLocation();
    await service.newLocation();

    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
    expect(modalService.editLocation).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 'test-uuid-1-1234-5678-9abc',
        name: 'New Location',
      })
    );

    // Restore original function
    crypto.randomUUID = originalRandomUUID;
  });

  describe('Storage operations', () => {
    it('should export locations to JSON', () => {
      const filename = 'test-export.json';

      service.exportLocations(filename);

      expect(storageService.exportToJson).toHaveBeenCalledWith(
        service.locations(),
        filename
      );
    });

    it('should export locations with default filename when none provided', () => {
      service.exportLocations();

      expect(storageService.exportToJson).toHaveBeenCalledWith(
        service.locations(),
        undefined
      );
    });

    it('should import locations from JSON file', async () => {
      const importedLocations: Location[] = [
        {
          id: 'imported-1',
          name: 'Imported Location',
          resourceSources: [],
        },
      ];

      const file = new File(['test'], 'test.json', {
        type: 'application/json',
      });
      storageService.importFromJson.and.returnValue(
        Promise.resolve(importedLocations)
      );

      await service.importLocations(file);

      expect(storageService.importFromJson).toHaveBeenCalledWith(file);
      expect(service.locations()).toEqual(importedLocations);
      expect(storageService.saveToStorage).toHaveBeenCalledWith(
        importedLocations
      );
    });

    it('should handle import errors', async () => {
      const file = new File(['invalid'], 'test.json', {
        type: 'application/json',
      });
      const error = new Error('Invalid JSON');
      storageService.importFromJson.and.returnValue(Promise.reject(error));

      await expectAsync(service.importLocations(file)).toBeRejectedWith(error);
      expect(storageService.importFromJson).toHaveBeenCalledWith(file);
    });

    it('should reset to mock data', () => {
      service.resetToMockData();

      expect(service.locations().length).toBe(3);
      expect(service.locations()[0].name).toBe('Silica Plant');
      expect(storageService.saveToStorage).toHaveBeenCalled();
    });

    it('should clear all locations', () => {
      service.clearAllLocations();

      expect(service.locations().length).toBe(0);
      expect(storageService.clearStorage).toHaveBeenCalled();
    });

    it('should save to storage when deleting a location', () => {
      const locationToDelete = service.locations()[0];

      service.deleteLocation(locationToDelete);

      expect(storageService.saveToStorage).toHaveBeenCalled();
    });

    it('should save to storage when updating card position', () => {
      const locationId = service.locations()[0].id;

      service.updateCardPosition(locationId, 100, 200);

      expect(storageService.saveToStorage).toHaveBeenCalled();

      const updatedLocation = service
        .locations()
        .find((loc) => loc.id === locationId);
      expect(updatedLocation?.cardPositionX).toBe(100);
      expect(updatedLocation?.cardPositionY).toBe(200);
    });
  });
});
