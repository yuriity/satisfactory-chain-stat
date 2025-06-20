import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  effect,
  signal,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  ApplicationRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import { LocationsService } from '../../services/locations.service';
import { LocationCardComponent } from '../location-card/location-card.component';
import { Location } from '../../models/location';

@Component({
  selector: 'scs-board',
  imports: [],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('board') board!: ElementRef;

  // Dependency injections (grouped logically)
  private readonly locationsService = inject(LocationsService);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly applicationRef = inject(ApplicationRef);

  // Protected signals (component state)
  protected locationCardRefs = signal<
    Map<string, ComponentRef<LocationCardComponent>>
  >(new Map());

  // Private properties
  private jsPlumbInstance!: BrowserJsPlumbInstance;

  constructor() {
    // Effect to react to location changes
    effect(() => {
      const locations = this.locationsService.locations();
      if (this.jsPlumbInstance) {
        this.updateLocationCards(locations);
      }
    });
  }

  ngAfterViewInit(): void {
    this.jsPlumbInstance = newInstance({
      container: this.board.nativeElement,
    });

    // Initialize with current locations
    const locations = this.locationsService.locations();
    this.updateLocationCards(locations);
  }

  ngOnDestroy(): void {
    // Clean up all component references
    const currentRefs = this.locationCardRefs();
    currentRefs.forEach((componentRef, locationId) => {
      this.removeLocationCard(locationId, componentRef);
    });
  }

  // Protected methods (internal implementation)
  protected updateLocationCards(locations: Location[]): void {
    const currentRefs = this.locationCardRefs();
    const currentLocationIds = new Set(locations.map((loc) => loc.id));

    // Remove cards for deleted locations
    currentRefs.forEach((componentRef, locationId) => {
      if (!currentLocationIds.has(locationId)) {
        this.removeLocationCard(locationId, componentRef);
      }
    });

    // Add or update cards for current locations
    locations.forEach((location, index) => {
      const existingRef = currentRefs.get(location.id);
      if (existingRef) {
        // Update existing location card input
        existingRef.setInput('location', location);
      } else {
        // Create new location card
        this.createLocationCard(location, index);
      }
    });

    // Update connections after all cards are created/updated
    this.updateConnections();
  }

  protected updateConnections(): void {
    // Clear existing connections
    this.jsPlumbInstance.deleteEveryConnection();

    const locations = this.locationsService.locations();
    const locationCardRefs = this.locationCardRefs();

    locations.forEach((location) => {
      if (location.resourceSources && location.resourceSources.length > 0) {
        const targetCardRef = locationCardRefs.get(location.id);
        if (!targetCardRef) return;

        location.resourceSources.forEach((sourceLocationId) => {
          const sourceCardRef = locationCardRefs.get(sourceLocationId);
          if (sourceCardRef) {
            this.jsPlumbInstance.connect({
              source: sourceCardRef.location.nativeElement,
              target: targetCardRef.location.nativeElement,
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
          }
        });
      }
    });
  }

  // Private methods (internal implementation details)
  private createLocationCard(location: Location, index: number): void {
    // Create the component instance
    const componentRef = createComponent(LocationCardComponent, {
      environmentInjector: this.environmentInjector,
    });

    // Set the location input
    componentRef.setInput('location', location);

    // Attach to application and DOM
    this.applicationRef.attachView(componentRef.hostView);

    const cardElement = componentRef.location.nativeElement;

    // Position the card on the board (you can customize this logic)
    const x = 50 + (index % 3) * 300; // 3 cards per row
    const y = 50 + Math.floor(index / 3) * 200; // Row height of 200px

    cardElement.style.position = 'absolute';
    cardElement.style.left = `${x}px`;
    cardElement.style.top = `${y}px`;
    cardElement.style.width = '280px';
    cardElement.style.zIndex = '1000';

    // Add to the board
    this.board.nativeElement.appendChild(cardElement);

    // Make the card draggable
    this.jsPlumbInstance.isDraggable(cardElement);

    // Store the component reference
    this.locationCardRefs.update((refs) => {
      const newRefs = new Map(refs);
      newRefs.set(location.id, componentRef);
      return newRefs;
    });
  }

  private removeLocationCard(
    locationId: string,
    componentRef: ComponentRef<LocationCardComponent>
  ): void {
    // Remove from jsPlumb
    this.jsPlumbInstance.removeAllEndpoints(
      componentRef.location.nativeElement
    );

    // Remove from DOM
    componentRef.location.nativeElement.remove();

    // Detach from application
    this.applicationRef.detachView(componentRef.hostView);
    componentRef.destroy();

    // Remove from our tracking
    this.locationCardRefs.update((refs) => {
      const newRefs = new Map(refs);
      newRefs.delete(locationId);
      return newRefs;
    });
  }
}
