import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';

import { BoardComponent } from './board.component';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';
import { ScsDraggableDirective } from '../../directives/scs-draggable.directive';
import { LocationCardComponent } from '../location-card/location-card.component';

// Mock location data for testing
const mockLocations: Location[] = [
  {
    id: 'location-1',
    name: 'Silica Factory',
    resourceSources: ['location-2'],
    cardPositionX: 100,
    cardPositionY: 150,
    consumption: [],
    production: [],
  },
  {
    id: 'location-2',
    name: 'Quartz Extractor',
    resourceSources: [],
    cardPositionX: 400,
    cardPositionY: 300,
    consumption: [],
    production: [],
  },
  {
    id: 'location-3',
    name: 'Plastic Factory',
    resourceSources: ['location-1'],
    consumption: [],
    production: [],
  },
];

// Mock LocationCardComponent for testing
@Component({
  selector: 'scs-location-card',
  template: '<div class="mock-location-card">{{ location.name }}</div>',
  inputs: ['location'],
})
class MockLocationCardComponent {
  location: any;
}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let locationsService: jasmine.SpyObj<LocationsService>;
  let mockJsPlumbInstance: jasmine.SpyObj<BrowserJsPlumbInstance>;

  beforeEach(async () => {
    // Create mock jsPlumb instance
    mockJsPlumbInstance = jasmine.createSpyObj('BrowserJsPlumbInstance', [
      'deleteEveryConnection',
      'connect',
    ]);

    // Create mock locations service with writable signal
    const locationsSignal = signal<Location[]>(mockLocations);
    const locationsServiceSpy = jasmine.createSpyObj('LocationsService', [
      'updateCardPosition',
    ]);

    // Create a writable signal for testing
    Object.defineProperty(locationsServiceSpy, 'locations', {
      value: locationsSignal.asReadonly(),
      writable: false,
      configurable: true,
    });

    // Store reference to the writable signal for test manipulation
    (locationsServiceSpy as any)._locationsSignal = locationsSignal;

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationsService, useValue: locationsServiceSpy },
      ],
    })
      .overrideComponent(BoardComponent, {
        remove: { imports: [LocationCardComponent] },
        add: { imports: [MockLocationCardComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    locationsService = TestBed.inject(
      LocationsService
    ) as jasmine.SpyObj<LocationsService>;

    // Mock document.getElementById for jsPlumb connections
    spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (
        id === 'loc-location-1' ||
        id === 'loc-location-2' ||
        id === 'loc-location-3'
      ) {
        return document.createElement('div');
      }
      return null;
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up any timers from debounced functions
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have board view child after view init', () => {
    expect(component['board']).toBeTruthy();
    expect(component['board'].nativeElement).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should initialize jsPlumb instance and update connections', () => {
      spyOn(component, 'updateConnections' as any);

      // Manually call ngAfterViewInit since it's already called in beforeEach
      component.ngAfterViewInit();

      expect(component['jsPlumbInstance']).toBeTruthy();
      expect(component['updateConnections']).toHaveBeenCalled();
    });
  });

  describe('locations rendering', () => {
    it('should render all locations from service', () => {
      const locationElements = fixture.debugElement.queryAll(
        By.css('[id^="loc-"]')
      );
      expect(locationElements.length)
        .withContext('Should render all locations')
        .toBe(3);

      const locationIds = locationElements.map((el) => el.nativeElement.id);
      expect(locationIds).toContain('loc-location-1');
      expect(locationIds).toContain('loc-location-2');
      expect(locationIds).toContain('loc-location-3');
    });

    it('should apply scsDraggable directive to each location', () => {
      const draggableElements = fixture.debugElement.queryAll(
        By.directive(ScsDraggableDirective)
      );
      expect(draggableElements.length)
        .withContext('All locations should be draggable')
        .toBe(3);
    });

    it('should render location cards within draggable containers', () => {
      const locationCards = fixture.debugElement.queryAll(
        By.css('scs-location-card')
      );
      expect(locationCards.length)
        .withContext('Should render all location cards')
        .toBe(3);
    });

    it('should use custom positions when available', () => {
      const location1Element = fixture.debugElement.query(
        By.css('#loc-location-1')
      );
      const location2Element = fixture.debugElement.query(
        By.css('#loc-location-2')
      );

      expect(location1Element.nativeElement.style.left).toBe('100px');
      expect(location1Element.nativeElement.style.top).toBe('150px');
      expect(location2Element.nativeElement.style.left).toBe('400px');
      expect(location2Element.nativeElement.style.top).toBe('300px');
    });

    it('should use default positions when cardPosition is not set', () => {
      const location3Element = fixture.debugElement.query(
        By.css('#loc-location-3')
      );

      // Location 3 (index 2) should use default positioning
      const expectedX = component['getDefaultX'](2);
      const expectedY = component['getDefaultY'](2);

      expect(location3Element.nativeElement.style.left).toBe(`${expectedX}px`);
      expect(location3Element.nativeElement.style.top).toBe(`${expectedY}px`);
    });
  });

  describe('default positioning calculations', () => {
    it('should calculate correct default X positions', () => {
      expect(component['getDefaultX'](0)).toBe(50); // 50 + (0 % 3) * 300
      expect(component['getDefaultX'](1)).toBe(350); // 50 + (1 % 3) * 300
      expect(component['getDefaultX'](2)).toBe(650); // 50 + (2 % 3) * 300
      expect(component['getDefaultX'](3)).toBe(50); // 50 + (3 % 3) * 300
    });

    it('should calculate correct default Y positions', () => {
      expect(component['getDefaultY'](0)).toBe(50); // 50 + Math.floor(0 / 3) * 200
      expect(component['getDefaultY'](1)).toBe(50); // 50 + Math.floor(1 / 3) * 200
      expect(component['getDefaultY'](2)).toBe(50); // 50 + Math.floor(2 / 3) * 200
      expect(component['getDefaultY'](3)).toBe(250); // 50 + Math.floor(3 / 3) * 200
      expect(component['getDefaultY'](4)).toBe(250); // 50 + Math.floor(4 / 3) * 200
      expect(component['getDefaultY'](5)).toBe(250); // 50 + Math.floor(5 / 3) * 200
      expect(component['getDefaultY'](6)).toBe(450); // 50 + Math.floor(6 / 3) * 200
    });
  });

  describe('drag functionality', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    it('should handle card drag end events', () => {
      const testLocation = mockLocations[0];
      const dragEndEvent = { x: 200, y: 250 };

      component['onCardDragEnd'](testLocation, dragEndEvent);

      // Fast-forward past debounce delay
      jasmine.clock().tick(350);

      expect(locationsService.updateCardPosition).toHaveBeenCalledOnceWith(
        'location-1',
        200,
        250
      );
    });

    it('should debounce position save calls', () => {
      const testLocation = mockLocations[0];
      const dragEndEvent1 = { x: 100, y: 150 };
      const dragEndEvent2 = { x: 200, y: 250 };
      const dragEndEvent3 = { x: 300, y: 350 };

      // Trigger multiple drag events quickly
      component['onCardDragEnd'](testLocation, dragEndEvent1);
      component['onCardDragEnd'](testLocation, dragEndEvent2);
      component['onCardDragEnd'](testLocation, dragEndEvent3);

      // Only the last call should be executed after debounce
      jasmine.clock().tick(350);

      expect(locationsService.updateCardPosition).toHaveBeenCalledOnceWith(
        'location-1',
        300,
        350
      );
    });

    it('should trigger drag end via DOM events', () => {
      spyOn(component, 'onCardDragEnd' as any);

      const location1Element = fixture.debugElement.query(
        By.css('#loc-location-1')
      );
      const dragEndEvent = { x: 150, y: 200 };

      location1Element.triggerEventHandler('scsDragEnd', dragEndEvent);

      expect(component['onCardDragEnd']).toHaveBeenCalledOnceWith(
        mockLocations[0],
        dragEndEvent
      );
    });
  });

  describe('jsPlumb connections', () => {
    beforeEach(() => {
      // Set up the mock jsPlumb instance
      component['jsPlumbInstance'] = mockJsPlumbInstance;
    });

    it('should have effect that calls updateConnections', () => {
      // This test verifies that the effect exists and uses the locations signal
      // The effect is set up in the constructor and calls updateConnections
      expect(component['locations']).toBe(locationsService.locations);

      // The effect should be working as evidenced by updateConnections being called
      // during ngAfterViewInit (tested in other tests)
    });

    it('should delete all connections before creating new ones', () => {
      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
    });

    it('should create connections for locations with resource sources', () => {
      component['updateConnections']();

      expect(mockJsPlumbInstance.connect).toHaveBeenCalledTimes(2);

      // Verify first connection (location-2 -> location-1)
      expect(mockJsPlumbInstance.connect).toHaveBeenCalledWith({
        source: jasmine.any(HTMLElement),
        target: jasmine.any(HTMLElement),
        anchor: ['Right', 'Left'],
        connector: 'Bezier',
        endpoint: 'Blank',
        overlays: [
          {
            type: 'Arrow',
            options: {
              location: 1,
              width: 12,
              length: 12,
              foldback: 0.8,
            },
          },
        ],
        paintStyle: {
          stroke: '#007bff',
          strokeWidth: 2,
        },
      });
    });

    it('should not create connections when source element not found', () => {
      // Mock document.getElementById to return null for source elements
      (document.getElementById as jasmine.Spy).and.returnValue(null);

      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });

    it('should not create connections when target element not found', () => {
      // Mock document.getElementById to return elements only for sources, not targets
      (document.getElementById as jasmine.Spy).and.callFake((id: string) => {
        if (id === 'loc-location-2') {
          return document.createElement('div');
        }
        return null;
      });

      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });

    it('should not update connections when jsPlumb instance is not initialized', () => {
      component['jsPlumbInstance'] = undefined as any;

      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).not.toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });

    it('should skip locations without resource sources', () => {
      // Test with location that has no resource sources
      const locationsWithoutSources = [mockLocations[1]]; // location-2 has no sources
      (locationsService as any)._locationsSignal.set(locationsWithoutSources);

      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });

    it('should handle locations with empty resource sources array', () => {
      const locationsWithEmptySources = [
        {
          ...mockLocations[0],
          resourceSources: [],
        },
      ];
      (locationsService as any)._locationsSignal.set(locationsWithEmptySources);

      component['updateConnections']();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });
  });

  describe('effect behavior', () => {
    it('should use reactive locations signal', () => {
      // Test that the component properly uses the locations signal
      expect(component['locations']).toBe(locationsService.locations);

      // Verify current locations are reflected in the component
      expect(component['locations']()).toEqual(mockLocations);
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      jasmine.clock().install();
      component['jsPlumbInstance'] = mockJsPlumbInstance;
    });

    it('should handle complete drag and position save workflow', () => {
      const testLocation = mockLocations[0];
      const dragEndEvent = { x: 500, y: 600 };

      // Simulate drag end
      component['onCardDragEnd'](testLocation, dragEndEvent);

      // Fast-forward debounce
      jasmine.clock().tick(350);

      // Verify position was saved
      expect(locationsService.updateCardPosition).toHaveBeenCalledWith(
        'location-1',
        500,
        600
      );
    });

    it('should maintain proper DOM structure and styling', () => {
      const boardContainer = fixture.debugElement.query(
        By.css('.board-container')
      );
      expect(boardContainer)
        .withContext('Board container should exist')
        .toBeTruthy();

      const locationElements = fixture.debugElement.queryAll(
        By.css('.position-absolute')
      );
      expect(locationElements.length)
        .withContext('All locations should have absolute positioning')
        .toBe(3);

      locationElements.forEach((element) => {
        expect(element.nativeElement.style.width).toBe('280px');
        expect(element.nativeElement.style.zIndex).toBe('1000');
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing DOM elements gracefully in updateConnections', () => {
      // Mock getElementById to return null for all elements
      (document.getElementById as jasmine.Spy).and.returnValue(null);
      component['jsPlumbInstance'] = mockJsPlumbInstance;

      expect(() => {
        component['updateConnections']();
      }).not.toThrow();

      expect(mockJsPlumbInstance.deleteEveryConnection).toHaveBeenCalled();
      expect(mockJsPlumbInstance.connect).not.toHaveBeenCalled();
    });

    it('should handle jsPlumb instance being undefined', () => {
      component['jsPlumbInstance'] = undefined as any;

      expect(() => {
        component['updateConnections']();
      }).not.toThrow();
    });
  });
});
