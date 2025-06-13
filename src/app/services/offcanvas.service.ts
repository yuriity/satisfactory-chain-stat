import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OffcanvasService {
  // Signal to track which offcanvas should be toggled
  private activeOffcanvasIdSignal = signal<string | null>(null);

  // Signal to track toggle action
  private toggleActionSignal = signal<number>(0);

  // Expose a read-only signal
  public activeOffcanvasId = this.activeOffcanvasIdSignal.asReadonly();

  // Expose a read-only signal for components to react to
  public toggleAction = this.toggleActionSignal.asReadonly();

  /**
   * Toggle the specified offcanvas element
   * @param id The ID of the offcanvas element to toggle
   */
  public toggle(id: string): void {
    this.activeOffcanvasIdSignal.set(id);
    // Increment the counter to trigger subscribers
    this.toggleActionSignal.update((count) => count + 1);
  }

  /**
   * Show the specified offcanvas element
   * @param id The ID of the offcanvas element to show
   */
  public show(id: string): void {
    this.activeOffcanvasIdSignal.set(id);
    this.toggleActionSignal.update((count) => count + 1);
  }

  /**
   * Hide the active offcanvas element
   */
  public hide(): void {
    this.activeOffcanvasIdSignal.set(null);
    this.toggleActionSignal.update((count) => count + 1);
  }
}
