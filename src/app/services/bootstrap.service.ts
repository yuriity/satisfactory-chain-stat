import { Injectable } from '@angular/core';
import { Offcanvas } from 'bootstrap';

/**
 * Service that provides Bootstrap component functionality
 * with proper typing and error handling
 */
@Injectable({
  providedIn: 'root',
})
export class BootstrapService {
  /**
   * Creates a Bootstrap Offcanvas instance
   */
  createOffcanvas(element: HTMLElement): Offcanvas | null {
    try {
      return new Offcanvas(element);
    } catch (error) {
      console.error('Error creating Bootstrap Offcanvas:', error);
      return null;
    }
  }
}
