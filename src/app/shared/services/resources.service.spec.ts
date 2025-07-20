import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ResourcesService } from './resources.service';
import { Resource } from '../../shared/models/resource';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let httpMock: HttpTestingController;
  const mockResourcesRaw = [
    {
      className: 'Resource_Copper',
      displayName: 'Copper',
      description: 'Copper ore',
      stackSize: 'Small',
      sinkPoints: 10,
    },
    {
      className: 'Resource_Iron',
      displayName: 'Iron',
      description: 'Iron ore',
      stackSize: 'Large',
      sinkPoints: 20,
    },
  ];

  const expectedResources: Resource[] = [
    {
      className: 'Resource_Copper',
      displayName: 'Copper',
      description: 'Copper ore',
      stackSize: 'Small',
      sinkPoints: 10,
    },
    {
      className: 'Resource_Iron',
      displayName: 'Iron',
      description: 'Iron ore',
      stackSize: 'Large',
      sinkPoints: 20,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourcesService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ResourcesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Service makes HTTP request on initialization, so we need to handle it
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    expect(service).toBeTruthy();
  });

  it('should load resources on init (success)', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockResourcesRaw);
    expect(service.resources())
      .withContext('Resources signal should contain loaded data')
      .toEqual(expectedResources);
    expect(service.loading())
      .withContext('Loading signal should be false after load')
      .toBeFalse();
    expect(service.loadError())
      .withContext('Error signal should not be null after load')
      .toBeNull();
  });

  it('should set error signal on load failure', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.error(new ProgressEvent('Network error'));
    expect(service.resources())
      .withContext('Resources signal should be empty on error')
      .toEqual([]);
    expect(service.loading())
      .withContext('Loading signal should be false after error')
      .toBeFalse();
    expect(service.loadError())
      .withContext('Error signal should not be null after error')
      .not.toBeNull();
  });

  it('getResourceByClassName should return correct resource', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    const found = service.getResourceByClassName('Resource_Copper');
    expect(found)
      .withContext('Should find resource by className')
      .toEqual(expectedResources[0]);
  });

  it('getResourceByClassName should return undefined for missing className', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    const found = service.getResourceByClassName('Resource_Gold');
    expect(found)
      .withContext('Should return undefined for unknown className')
      .toBeUndefined();
  });

  it('findResourcesByName should return matching resources (case-insensitive, partial)', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    const results = service.findResourcesByName('cop');
    expect(results)
      .withContext('Should find resources by partial name')
      .toEqual([expectedResources[0]]);
  });

  it('findResourcesByName should return empty array for empty or no match', () => {
    const req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    expect(service.findResourcesByName(''))
      .withContext('Should return [] for empty string')
      .toEqual([]);
    expect(service.findResourcesByName('gold'))
      .withContext('Should return [] for no match')
      .toEqual([]);
  });

  it('reloadResources should trigger a new HTTP request', () => {
    let req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    service.reloadResources();
    req = httpMock.expectOne('data/en-US_resources.json');
    req.flush(mockResourcesRaw);
    expect(service.resources())
      .withContext('Resources should be reloaded')
      .toEqual(expectedResources);
  });
});
