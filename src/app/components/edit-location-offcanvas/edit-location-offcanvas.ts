import { Component, ElementRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffcanvasService } from '../../services/offcanvas.service';
import { BootstrapService } from '../../services/bootstrap-service';
import { Offcanvas } from 'bootstrap';

@Component({
  selector: 'scs-edit-location-offcanvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-location-offcanvas.html',
  styleUrls: ['./edit-location-offcanvas.scss'],
})
export class EditLocationOffcanvasComponent {
  private offcanvasService = inject(OffcanvasService);
  private bootstrapService = inject(BootstrapService);
  private elementRef = inject(ElementRef);
  private offcanvasInstance: Offcanvas | null = null;
  private readonly offcanvasId = 'editLocationOffcanvas';

  constructor() {
    // Setup effect to handle offcanvas toggling
    effect(() => {
      // Get the latest toggle action - this is our trigger
      const toggleCount = this.offcanvasService.toggleAction();

      // Only proceed if we have a toggle action
      if (toggleCount > 0) {
        const activeOffcanvasId = this.offcanvasService.activeOffcanvasId();

        // If our offcanvas is the active one, toggle it
        if (activeOffcanvasId === this.offcanvasId) {
          this.getOffcanvasInstance()?.toggle();
        }
      }
    });
  }

  closeOffcanvas(): void {
    this.offcanvasService.toggle(this.offcanvasId);
  }

  /**
   * Get or create a Bootstrap Offcanvas instance for this component
   */
  private getOffcanvasInstance(): Offcanvas | null {
    if (!this.offcanvasInstance) {
      const element = this.elementRef.nativeElement.querySelector(
        `#${this.offcanvasId}`
      );
      if (element) {
        this.offcanvasInstance = this.bootstrapService.createOffcanvas(element);
      }
    }
    return this.offcanvasInstance;
  }
}
