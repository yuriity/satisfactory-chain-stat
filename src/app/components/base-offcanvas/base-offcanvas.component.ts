import { Component, signal } from '@angular/core';
import { OffcanvasRef } from '../../services/offcanvas-config';

@Component({
  selector: 'scs-base-offcanvas',
  standalone: true,
  template: '',
})
export abstract class BaseOffcanvasComponent<T = any, R = any> {
  protected data = signal<T | undefined>(undefined);

  offcanvasRef?: OffcanvasRef<R>;

  /**
   * Set the data for this offcanvas component
   */
  setData(data: T): void {
    this.data.set(data);
  }

  protected close(result?: R): void {
    this.offcanvasRef?.close(result);
  }

  protected dismiss(reason?: any): void {
    this.offcanvasRef?.dismiss(reason);
  }
}
