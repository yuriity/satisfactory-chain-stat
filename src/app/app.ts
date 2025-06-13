import { Component, effect, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationCardComponent } from './components/location-card/location-card';
import { LocationsService } from './services/locations.service';
import { OffcanvasService } from './services/offcanvas.service';
import { BootstrapService } from './services/bootstrap-service';
import { Offcanvas } from 'bootstrap';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [CommonModule, LocationCardComponent],
  templateUrl: './app.html',
  styles: [],
})
export class App {
  protected title = 'Satisfactory Chain Stat';
  protected locationsService = inject(LocationsService);
  private offcanvasService = inject(OffcanvasService);
  private bootstrapService = inject(BootstrapService);
  private offcanvasInstances = new Map<string, Offcanvas | null>();

  constructor(private elementRef: ElementRef) {
    // Setup effect to handle offcanvas toggling
    effect(() => {
      // Get the latest toggle action - this is our trigger
      const toggleCount = this.offcanvasService.toggleAction();

      // Only proceed if we have a toggle action
      if (toggleCount > 0) {
        const offcanvasId = this.offcanvasService.activeOffcanvasId();

        // If we have an active offcanvas ID, toggle it
        if (offcanvasId) {
          this.getOffcanvasInstance(offcanvasId)?.toggle();
        } else {
          // Hide all offcanvas elements if no specific ID
          this.offcanvasInstances.forEach((instance: any) => {
            instance.hide();
          });
        }
      }
    });
  }

  /**
   * Get or create a Bootstrap Offcanvas instance for the specified element ID
   */
  private getOffcanvasInstance(elementId: string): any {
    if (!this.offcanvasInstances.has(elementId)) {
      const element = this.elementRef.nativeElement.querySelector(
        `#${elementId}`
      );
      if (element) {
        this.offcanvasInstances.set(
          elementId,
          this.bootstrapService.createOffcanvas(element)
        );
      }
    }
    return this.offcanvasInstances.get(elementId);
  }

  /**
   * Convenience method to toggle offcanvas via component
   */
  protected toggleOffcanvas(): void {
    this.offcanvasService.toggle('editLocationOffcanvas');
  }
}
