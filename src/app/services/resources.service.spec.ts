import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ResourcesService } from './resources.service';
import { Resource } from '../models/resource';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let httpMock: HttpTestingController;

  const mockResourcesData = [
    {
      className: 'desc-nuclearwaste-c',
      displayName: 'Uranium Waste',
      description: 'Highly radioactive waste material',
    },
    {
      className: 'desc-silica-c',
      displayName: 'Silica',
      description: 'Derived from Raw Quartz',
    },
    {
      className: 'desc-cement-c',
      displayName: 'Concrete',
      description: 'Used for building.',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResourcesService, provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ResourcesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load resources on initialization', () => {
    // The service should make an HTTP request when it's initialized
    const req = httpMock.expectOne('/en-US_extracted.json');
    expect(req.request.method).toBe('GET');

    // Respond with mock data
    req.flush(mockResourcesData);

    // Check if the resources signal was updated correctly
    expect(service.resources().length).toBe(3);
    expect(service.resources()[0]).toBeInstanceOf(Resource);
    expect(service.resources()[0].className).toBe('desc-nuclearwaste-c');
    expect(service.resources()[0].displayName).toBe('Uranium Waste');
  });

  it('should convert raw data to Resource instances', () => {
    // Trigger HTTP request
    const req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // Check that items are Resource instances with methods
    const resources = service.resources();
    expect(resources[0].getSmallIconUrl).toBeDefined();
    expect(resources[0].getLargeIconUrl).toBeDefined();

    // Check that methods work correctly
    expect(resources[0].getSmallIconUrl()).toBe(
      'https://www.satisfactorytools.com/assets/images/items/desc-nuclearwaste-c_64.png'
    );
  });

  it('should track loading state', () => {
    // Service should be in loading state initially
    expect(service.loading()).toBe(true);

    // Complete the request
    const req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // Loading should be false after request completes
    expect(service.loading()).toBe(false);
  });

  it('should handle error state', () => {
    // Initial error state should be null
    expect(service.loadError()).toBeNull();

    // Trigger HTTP request and respond with an error
    const req = httpMock.expectOne('/en-US_extracted.json');
    const mockError = new ErrorEvent('Network error');
    req.error(mockError);

    // Error signal should be updated and loading should be false
    expect(service.loadError()).toBeTruthy();
    expect(service.loading()).toBe(false);
  });

  it('should manually reload resources when requested', () => {
    // First initial load
    let req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // Trigger manual reload
    service.reloadResources();

    // Should make another request
    req = httpMock.expectOne('/en-US_extracted.json');
    req.flush([
      ...mockResourcesData,
      {
        className: 'desc-plastic-c',
        displayName: 'Plastic',
        description: 'Versatile material',
      },
    ]);

    // Should update resources
    expect(service.resources().length).toBe(4);
  });

  it('should find resource by className', () => {
    // Set up data
    const req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // Test finding existing resource
    const silica = service.getResourceByClassName('desc-silica-c');
    expect(silica).toBeTruthy();
    expect(silica?.displayName).toBe('Silica');

    // Test finding non-existent resource
    const nonExistent = service.getResourceByClassName('non-existent');
    expect(nonExistent).toBeUndefined();
  });

  it('should find resources by name (case-insensitive)', () => {
    // Set up data
    const req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // Test case-insensitive search
    const results = service.findResourcesByName('uRAniUm');
    expect(results.length).toBe(1);
    expect(results[0].className).toBe('desc-nuclearwaste-c');

    // Test partial match
    const concreteResults = service.findResourcesByName('crete');
    expect(concreteResults.length).toBe(1);
    expect(concreteResults[0].displayName).toBe('Concrete');

    // Test empty/null search term
    expect(service.findResourcesByName('')).toEqual([]);
    expect(service.findResourcesByName('   ')).toEqual([]);
  });

  it('should not reload resources if already loading', () => {
    // First call will start loading
    service.reloadResources();

    // Second call should be ignored since still loading
    service.reloadResources();

    // Should only have one request
    const req = httpMock.expectOne('/en-US_extracted.json');
    req.flush(mockResourcesData);

    // After completing the request, we can reload again
    service.reloadResources();

    // Should get another request
    const req2 = httpMock.expectOne('/en-US_extracted.json');
    req2.flush(mockResourcesData);
  });
});
