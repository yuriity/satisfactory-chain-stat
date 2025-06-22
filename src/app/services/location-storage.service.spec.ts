import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LocationStorageService, ExportData } from './location-storage.service';
import { Location } from '../models/location';

describe('LocationStorageService', () => {
  let service: LocationStorageService;
  let mockLocations: Location[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LocationStorageService);

    // Clear localStorage before each test
    localStorage.clear();

    // Setup mock locations
    mockLocations = [
      {
        id: '1',
        name: 'Test Location 1',
        resourceSources: [],
        cardPositionX: 10,
        cardPositionY: 20,
      },
      {
        id: '2',
        name: 'Test Location 2',
        resourceSources: [],
        cardPositionX: 30,
        cardPositionY: 40,
      },
    ];
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Storage availability', () => {
    it('should detect localStorage availability', () => {
      expect(service.isStorageAvailable()).toBe(true);
    });
  });

  describe('Local storage operations', () => {
    it('should save and load locations from localStorage', () => {
      service.saveToStorage(mockLocations);
      const loadedLocations = service.loadFromStorage();

      expect(loadedLocations).toBeDefined();
      expect(loadedLocations!.length).toBe(2);
      expect(loadedLocations![0].id).toBe('1');
      expect(loadedLocations![0].name).toBe('Test Location 1');
      expect(loadedLocations![1].id).toBe('2');
      expect(loadedLocations![1].name).toBe('Test Location 2');
    });

    it('should return null when no data exists in localStorage', () => {
      const loadedLocations = service.loadFromStorage();
      expect(loadedLocations).toBeNull();
    });

    it('should handle corrupted data in localStorage', () => {
      localStorage.setItem('satisfactory-chain-stat-locations', 'invalid json');
      const loadedLocations = service.loadFromStorage();
      expect(loadedLocations).toBeNull();
    });

    it('should handle invalid data format in localStorage', () => {
      localStorage.setItem(
        'satisfactory-chain-stat-locations',
        JSON.stringify('not an array')
      );
      const loadedLocations = service.loadFromStorage();
      expect(loadedLocations).toBeNull();
    });

    it('should clear localStorage', () => {
      service.saveToStorage(mockLocations);
      service.clearStorage();
      const loadedLocations = service.loadFromStorage();
      expect(loadedLocations).toBeNull();
    });
  });

  describe('JSON export', () => {
    it('should export locations as JSON with metadata', () => {
      const createElementSpy = spyOn(
        document,
        'createElement'
      ).and.callThrough();
      const appendChildSpy = spyOn(document.body, 'appendChild');
      const removeChildSpy = spyOn(document.body, 'removeChild');
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue(
        'blob-url'
      );
      const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

      service.exportToJson(mockLocations, 'test-export.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob-url');
    });

    it('should generate default filename when none provided', () => {
      const createElementSpy = spyOn(
        document,
        'createElement'
      ).and.callThrough();
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
      spyOn(URL, 'revokeObjectURL');

      service.exportToJson(mockLocations);

      const linkElement = createElementSpy.calls.mostRecent()
        .returnValue as HTMLAnchorElement;
      expect(linkElement.download).toMatch(
        /satisfactory-locations-\d{4}-\d{2}-\d{2}\.json/
      );
    });
  });

  describe('JSON import', () => {
    it('should import locations from JSON file with metadata', async () => {
      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: '2025-06-21T00:00:00.000Z',
        locations: mockLocations,
      };

      const file = new File([JSON.stringify(exportData)], 'test.json', {
        type: 'application/json',
      });

      const result = await service.importFromJson(file);
      expect(result.length).toBe(mockLocations.length);
      expect(result[0].id).toBe(mockLocations[0].id);
      expect(result[0].name).toBe(mockLocations[0].name);
    });

    it('should import locations from legacy JSON format (direct array)', async () => {
      const file = new File([JSON.stringify(mockLocations)], 'test.json', {
        type: 'application/json',
      });

      const result = await service.importFromJson(file);
      expect(result.length).toBe(mockLocations.length);
      expect(result[0].id).toBe(mockLocations[0].id);
      expect(result[0].name).toBe(mockLocations[0].name);
    });

    it('should reject non-JSON files', async () => {
      const file = new File(['not json'], 'test.txt', { type: 'text/plain' });

      await expectAsync(service.importFromJson(file)).toBeRejectedWithError(
        'File must be a JSON file'
      );
    });

    it('should reject invalid JSON content', async () => {
      const file = new File(['invalid json'], 'test.json', {
        type: 'application/json',
      });

      await expectAsync(service.importFromJson(file)).toBeRejectedWithError(
        'Invalid JSON file format'
      );
    });

    it('should validate location structure and reject invalid data', async () => {
      const invalidLocations = [
        { id: 1, name: 'Invalid ID' }, // ID should be string
        { name: 'Missing ID' }, // Missing ID
        { id: '3' }, // Missing name
      ];

      const file = new File([JSON.stringify(invalidLocations)], 'test.json', {
        type: 'application/json',
      });

      await expectAsync(service.importFromJson(file)).toBeRejectedWithError(
        'Invalid JSON file format'
      );
    });

    it('should add default values for missing optional properties', async () => {
      const minimalLocations = [
        {
          id: '1',
          name: 'Minimal Location',
          resourceSources: [],
        },
      ];

      const file = new File([JSON.stringify(minimalLocations)], 'test.json', {
        type: 'application/json',
      });

      const result = await service.importFromJson(file);
      expect(result[0].cardPositionX).toBe(0);
      expect(result[0].cardPositionY).toBe(0);
    });

    it('should reconstruct Resource instances from plain objects', async () => {
      const locationWithResources = [
        {
          id: 'test-location',
          name: 'Test Location',
          resourceSources: [],
          consumption: [
            {
              resource: {
                className: 'desc-test-c',
                displayName: 'Test Resource',
                description: 'Test description',
              },
              amount: 100,
            },
          ],
          production: [
            {
              resource: {
                className: 'desc-output-c',
                displayName: 'Output Resource',
                description: 'Output description',
              },
              amount: 50,
              consumption: 0,
            },
          ],
        },
      ];

      const file = new File(
        [JSON.stringify(locationWithResources)],
        'test.json',
        {
          type: 'application/json',
        }
      );

      const result = await service.importFromJson(file);

      expect(result.length).toBe(1);
      expect(result[0].consumption).toBeDefined();
      expect(result[0].consumption!.length).toBe(1);
      expect(result[0].consumption![0].resource.className).toBe('desc-test-c');
      expect(result[0].consumption![0].resource.getSmallIconUrl()).toContain(
        'desc-test-c'
      );

      expect(result[0].production).toBeDefined();
      expect(result[0].production!.length).toBe(1);
      expect(result[0].production![0].resource.className).toBe('desc-output-c');
      expect(result[0].production![0].resource.getLargeIconUrl()).toContain(
        'desc-output-c'
      );
    });
  });
});
