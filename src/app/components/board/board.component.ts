import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';
import { debounce } from '../../utils/debounce';
import { ScsDraggableDirective } from '../../directives/scs-draggable.directive';
import { LocationCardComponent } from '../location-card/location-card.component';

@Component({
  selector: 'scs-board',
  imports: [ScsDraggableDirective, LocationCardComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('board') board!: ElementRef;

  private readonly locationsService = inject(LocationsService);

  protected locations = this.locationsService.locations;

  private jsPlumbInstance!: BrowserJsPlumbInstance;
  private debouncedSavePosition = debounce(
    (locationId: string, x: number, y: number) => {
      this.saveCardPosition(locationId, x, y);
    },
    300
  );

  constructor() {
    effect(() => {
      // Explicitly depend on locations signal
      const locations = this.locations();
      // Only update connections if jsPlumbInstance is initialized
      if (this.jsPlumbInstance) {
        // Use setTimeout to ensure DOM elements are rendered before creating connections
        setTimeout(() => {
          this.updateConnections();
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    this.jsPlumbInstance = newInstance({
      container: this.board.nativeElement,
    });
    this.updateConnections();
  }

  protected updateConnections(): void {
    if (!this.jsPlumbInstance) return;

    this.jsPlumbInstance.deleteEveryConnection();
    const locations = this.locations();
    locations.forEach((location) => {
      if (location.resourceSources && location.resourceSources.length > 0) {
        const targetEl = document.getElementById('loc-' + location.id);
        if (!targetEl) return;
        location.resourceSources.forEach((sourceLocationId) => {
          const sourceEl = document.getElementById('loc-' + sourceLocationId);
          if (sourceEl) {
            this.jsPlumbInstance.connect({
              source: sourceEl,
              target: targetEl,
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

  protected onCardDragEnd(location: Location, event: { x: number; y: number }) {
    this.debouncedSavePosition(location.id, event.x, event.y);
  }

  private saveCardPosition(locationId: string, x: number, y: number): void {
    this.locationsService.updateCardPosition(locationId, x, y);
  }

  protected getDefaultX(index: number): number {
    return 50 + (index % 3) * 300;
  }

  protected getDefaultY(index: number): number {
    return 50 + Math.floor(index / 3) * 200;
  }
}
