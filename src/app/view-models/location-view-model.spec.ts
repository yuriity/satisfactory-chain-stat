import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, effect } from '@angular/core';

import { LocationViewModel } from './location-view-model';
import { Location } from '../models/location';
import { Resource } from '../models/resource';

describe('LocationViewModel', () => {
  let mockResource1: Resource;
  let mockResource2: Resource;
  let mockLocation: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    // Create mock resources
    mockResource1 = new Resource(
      'Desc_IronOre_C',
      'Iron Ore',
      'Basic Iron Ore resource'
    );
    mockResource2 = new Resource(
      'Desc_IronIngot_C',
      'Iron Ingot',
      'Iron in bar form. Valuable for crafting.'
    );

    // Create mock location data
    mockLocation = {
      id: 'loc-123',
      name: 'Iron Processing',
      resourceSources: [],
      consumption: [{ resource: mockResource1, amount: 60 }],
      production: [{ resource: mockResource2, amount: 30 }],
    };
  });

  describe('Constructor', () => {
    it('should create with provided location data', () => {
      // Arrange & Act
      const viewModel = new LocationViewModel(mockLocation);

      // Assert
      expect(viewModel).toBeTruthy();
      expect(viewModel.id).toBe('loc-123');
      expect(viewModel.name()).toBe('Iron Processing');
      expect(viewModel.consumption().length).toBe(1);
      expect(viewModel.production().length).toBe(1);
      expect(viewModel.resourceSourceIds().length).toBe(0);
    });

    it('should create with default values when null is provided', () => {
      // Arrange & Act
      const viewModel = new LocationViewModel(null);

      // Assert
      expect(viewModel).toBeTruthy();
      expect(viewModel.id).toBeTruthy(); // UUID should be generated
      expect(viewModel.name()).toContain('New location');
      expect(viewModel.consumption().length).toBe(0);
      expect(viewModel.production().length).toBe(0);
    });

    it('should throw error for invalid location (after null check)', () => {
      // Arrange: Create an invalid location with no ID
      const invalidLocation: Location = {
        id: null as unknown as string,
        name: 'Invalid',
        resourceSources: [],
      };

      // Act & Assert
      expect(() => new LocationViewModel(invalidLocation)).toThrow();
    });

    it('should throw error for location with empty name', () => {
      // Arrange: Create an invalid location with empty name
      const invalidLocation = {
        id: 'loc-invalid',
        name: '',
        resourceSources: [],
      } as Location;

      // Act & Assert
      expect(() => new LocationViewModel(invalidLocation)).toThrow();
    });

    it('should store resource source ids', () => {
      // Arrange
      const locationWithSources: Location = {
        id: 'main-loc',
        name: 'Main Factory',
        resourceSources: ['source-1', 'source-2'],
      };

      // Act
      const viewModel = new LocationViewModel(locationWithSources);

      // Assert
      expect(viewModel.resourceSourceIds().length).toBe(2);
      expect(viewModel.resourceSourceIds()).toContain('source-1');
      expect(viewModel.resourceSourceIds()).toContain('source-2');
    });
  });

  describe('Signal operations', () => {
    it('should update name via setName method', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);
      const newName = 'Updated Factory';

      // Act
      viewModel.setName(newName);

      // Assert
      expect(viewModel.name()).toBe(newName);
    });

    it('should compute totalConsumption correctly', () => {
      // Arrange
      const location: Location = {
        id: 'loc-1',
        name: 'Test',
        resourceSources: [],
        consumption: [
          { resource: mockResource1, amount: 60 },
          { resource: mockResource2, amount: 40 },
        ],
      };

      // Act
      const viewModel = new LocationViewModel(location);

      // Assert
      expect(viewModel.totalConsumption()).toBe(100);
    });

    it('should compute totalProduction correctly', () => {
      // Arrange
      const location: Location = {
        id: 'loc-1',
        name: 'Test',
        resourceSources: [],
        production: [
          { resource: mockResource1, amount: 30 },
          { resource: mockResource2, amount: 20 },
        ],
      };

      // Act
      const viewModel = new LocationViewModel(location);

      // Assert
      expect(viewModel.totalProduction()).toBe(50);
    });

    it('should update totalConsumption when consumption changes', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);
      const initialTotal = viewModel.totalConsumption();

      // Create a spy to monitor changes to totalConsumption
      const effectSpy = jasmine.createSpy('effectSpy');

      // Act - Setup effect to monitor totalConsumption changes
      TestBed.runInInjectionContext(() => {
        effect(() => {
          effectSpy(viewModel.totalConsumption());
        });
      });

      // Modify consumption
      viewModel.addConsumptionRecord(mockResource2, 40);

      // Trigger effect execution
      TestBed.tick();

      // Assert
      expect(effectSpy).toHaveBeenCalledWith(100); // 60 + 40
      expect(viewModel.totalConsumption()).toBe(100);
    });
  });

  describe('Resource management', () => {
    it('should add consumption record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);
      const newResource = new Resource('Desc_Coal_C', 'Coal', 'Black gold');

      // Act
      viewModel.addConsumptionRecord(newResource, 45);

      // Assert
      expect(viewModel.consumption().length).toBe(2);
      expect(viewModel.consumption()[1].resource.className).toBe('Desc_Coal_C');
      expect(viewModel.consumption()[1].amount).toBe(45);
    });

    it('should update consumption record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      viewModel.updateConsumptionRecord(mockResource1, 75);

      // Assert
      expect(viewModel.consumption().length).toBe(1);
      expect(viewModel.consumption()[0].amount).toBe(75);
    });

    it('should remove consumption record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      viewModel.removeConsumptionRecord(mockResource1);

      // Assert
      expect(viewModel.consumption().length).toBe(0);
    });

    it('should add production record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);
      const newResource = new Resource(
        'Desc_Steel_C',
        'Steel Ingot',
        'Refined steel'
      );

      // Act
      viewModel.addProductionRecord(newResource, 15);

      // Assert
      expect(viewModel.production().length).toBe(2);
      expect(viewModel.production()[1].resource.className).toBe('Desc_Steel_C');
      expect(viewModel.production()[1].amount).toBe(15);
    });

    it('should update production record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      viewModel.updateProductionRecord(mockResource2, 45);

      // Assert
      expect(viewModel.production().length).toBe(1);
      expect(viewModel.production()[0].amount).toBe(45);
    });

    it('should remove production record', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      viewModel.removeProductionRecord(mockResource2);

      // Assert
      expect(viewModel.production().length).toBe(0);
    });
  });

  describe('toLocation method', () => {
    it('should convert ViewModel back to Location model', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      const result = viewModel.toLocation();

      // Assert
      expect(result.id).toBe('loc-123');
      expect(result.name).toBe('Iron Processing');
      expect(result.consumption?.length).toBe(1);
      expect(result.consumption?.[0].resource.className).toBe('Desc_IronOre_C');
      expect(result.production?.length).toBe(1);
      expect(result.production?.[0].resource.className).toBe(
        'Desc_IronIngot_C'
      );
    });

    it('should include all resource source ids when converting to Location', () => {
      // Arrange
      const locationWithSources: Location = {
        id: 'main-loc',
        name: 'Main Factory',
        resourceSources: ['source-1', 'source-2'],
      };

      const viewModel = new LocationViewModel(locationWithSources);

      // Act
      const result = viewModel.toLocation();

      // Assert
      expect(result.resourceSources.length).toBe(2);
      expect(result.resourceSources).toContain('source-1');
      expect(result.resourceSources).toContain('source-2');
    });
  });

  describe('Resource source management', () => {
    it('should add resource source id', () => {
      // Arrange
      const viewModel = new LocationViewModel(mockLocation);

      // Act
      viewModel.addResourceSource('source-1');

      // Assert
      expect(viewModel.resourceSourceIds().length).toBe(1);
      expect(viewModel.resourceSourceIds()[0]).toBe('source-1');
    });

    it('should remove resource source id', () => {
      // Arrange
      const locationWithSource: Location = {
        id: 'main-loc',
        name: 'Main Factory',
        resourceSources: ['source-1', 'source-2'],
      };

      const viewModel = new LocationViewModel(locationWithSource);

      // Act
      viewModel.removeResourceSource('source-1');

      // Assert
      expect(viewModel.resourceSourceIds().length).toBe(1);
      expect(viewModel.resourceSourceIds()[0]).toBe('source-2');
    });
  });
});
