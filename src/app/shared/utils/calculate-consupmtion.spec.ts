import { calculateConsumption } from './calculate-consupmtion';
import { Location } from '../models/location';
import { Resource } from '../models/resource';
import {
  RawQuartzResource,
  LimestoneResource,
  SilicaResource,
  CrudeOilResource,
  PlasticResource,
  CircuitBoardResource,
  LOCATIONS,
} from '../services/mock-locations';

describe('calculateConsumption', () => {
  it('should clear all consumption values before calculating new consumption', () => {
    // Create a deep copy of the mock locations to avoid modifying the original
    const testLocations: Location[] = JSON.parse(JSON.stringify(LOCATIONS));

    // Set initial consumption values to non-zero
    testLocations.forEach((location) => {
      location.production?.forEach((prod) => {
        prod.consumption = 100; // Set to a non-zero value
      });
    });

    // Find locations we'll check after calculation
    const silicaPlant = testLocations.find(
      (loc) => loc.id === 'silica-plant-1'
    );
    const circuitBoardPlant = testLocations.find(
      (loc) => loc.id === 'circuit-board-plant1'
    );

    // Verify that consumption values are non-zero before calculation
    expect(silicaPlant?.production?.[0].consumption).toBe(100);
    expect(circuitBoardPlant?.production?.[0].consumption).toBe(100);

    // Temporarily replace resourceSources with empty arrays to prevent actual consumption calculation
    const originalSources: Record<string, string[]> = {};
    testLocations.forEach((location) => {
      originalSources[location.id] = [...(location.resourceSources || [])];
      location.resourceSources = [];
    });

    // Run the calculation function
    calculateConsumption(testLocations);

    // Verify that consumption values are reset to 0 by the clearConsumption function
    expect(silicaPlant?.production?.[0].consumption).toBe(0);
    expect(circuitBoardPlant?.production?.[0].consumption).toBe(0);

    // Restore original resourceSources for completeness
    testLocations.forEach((location) => {
      location.resourceSources = originalSources[location.id] || [];
    });
  });

  it('should update production consumption values correctly', () => {
    // Create a deep copy of the mock locations to avoid modifying the original
    const testLocations: Location[] = JSON.parse(JSON.stringify(LOCATIONS));

    // Initialize all consumption values to 0
    testLocations.forEach((location) => {
      location.production?.forEach((prod) => {
        prod.consumption = 0;
      });
    });

    // Run the calculation function and get the updated locations
    const updatedLocations = calculateConsumption(testLocations);

    // Find specific locations by id
    const silicaPlant = testLocations.find(
      (loc) => loc.id === 'silica-plant-1'
    );
    const plasticPlant = testLocations.find(
      (loc) => loc.id === 'plastic-plant-1'
    );
    const circuitBoardPlant = testLocations.find(
      (loc) => loc.id === 'circuit-board-plant1'
    );

    // Verify the silica plant's production consumption was updated correctly
    expect(silicaPlant?.production?.[0].consumption).toBe(240);

    // Verify the plastic plant's production consumption was updated correctly
    expect(plasticPlant?.production?.[0].consumption).toBe(140);

    // Circuit board plant doesn't have consumers, so consumption should remain 0
    expect(circuitBoardPlant?.production?.[0].consumption).toBe(0);
  });

  it('should handle locations without defined consumption', () => {
    // Create test data with a location missing consumption data
    const testLocations: Location[] = [
      {
        id: 'test-location-1',
        name: 'Test Location 1',
        resourceSources: ['test-location-2'],
        // No consumption defined
        production: [{ resource: SilicaResource, amount: 100, consumption: 0 }],
      },
      {
        id: 'test-location-2',
        name: 'Test Location 2',
        resourceSources: [],
        consumption: [{ resource: SilicaResource, amount: 50 }],
        production: [
          { resource: CircuitBoardResource, amount: 25, consumption: 0 },
        ],
      },
    ];

    // This should not throw an error
    calculateConsumption(testLocations);

    // Consumption should remain unchanged at 0 since test-location-1 has no consumption defined
    expect(testLocations[1].production?.[0].consumption).toBe(0);
  });

  it('should handle locations without resource sources', () => {
    // Create test locations without resource sources
    const testLocations: Location[] = [
      {
        id: 'standalone-location',
        name: 'Standalone Location',
        resourceSources: [], // Empty resource sources
        consumption: [{ resource: SilicaResource, amount: 100 }],
        production: [
          { resource: CircuitBoardResource, amount: 50, consumption: 0 },
        ],
      },
    ];

    calculateConsumption(testLocations);

    // No changes should occur
    expect(testLocations[0].production?.[0].consumption).toBe(0);
  });

  it('should handle circular dependencies correctly', () => {
    // Create locations with circular dependencies
    const testLocations: Location[] = [
      {
        id: 'location-a',
        name: 'Location A',
        resourceSources: ['location-b'],
        consumption: [{ resource: PlasticResource, amount: 60 }],
        production: [{ resource: SilicaResource, amount: 40, consumption: 0 }],
      },
      {
        id: 'location-b',
        name: 'Location B',
        resourceSources: ['location-a'],
        consumption: [{ resource: SilicaResource, amount: 30 }],
        production: [{ resource: PlasticResource, amount: 70, consumption: 0 }],
      },
    ];

    calculateConsumption(testLocations);

    // Each should update the other's consumption
    expect(testLocations[0].production?.[0].consumption).toBe(30);
    expect(testLocations[1].production?.[0].consumption).toBe(60);
  });

  it('should handle non-existent resource sources', () => {
    // Create location with non-existent resource source
    const testLocations: Location[] = [
      {
        id: 'consumer-location',
        name: 'Consumer Location',
        resourceSources: ['non-existent-location'],
        consumption: [{ resource: SilicaResource, amount: 75 }],
        production: [
          { resource: CircuitBoardResource, amount: 30, consumption: 0 },
        ],
      },
    ];

    // Should not throw an error
    calculateConsumption(testLocations);

    // No changes should occur since the source doesn't exist
    expect(testLocations[0].production?.[0].consumption).toBe(0);
  });

  it('should match consumption and production by resource className', () => {
    // Create test locations with multiple resources
    const testLocations: Location[] = [
      {
        id: 'multi-producer',
        name: 'Multi-Resource Producer',
        resourceSources: [],
        production: [
          { resource: SilicaResource, amount: 100, consumption: 0 },
          { resource: PlasticResource, amount: 150, consumption: 0 },
        ],
      },
      {
        id: 'multi-consumer',
        name: 'Multi-Resource Consumer',
        resourceSources: ['multi-producer'],
        consumption: [
          { resource: SilicaResource, amount: 80 },
          { resource: PlasticResource, amount: 120 },
          { resource: RawQuartzResource, amount: 50 }, // This one doesn't match any production
        ],
        production: [],
      },
    ];

    calculateConsumption(testLocations);

    // Verify correct matching by className
    expect(testLocations[0].production?.[0].consumption).toBe(80); // SilicaResource
    expect(testLocations[0].production?.[1].consumption).toBe(120); // PlasticResource
  });
});
