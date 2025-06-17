import {
  Injectable,
  ComponentRef,
  inject,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  Type,
} from '@angular/core';
import { OffcanvasConfig, OffcanvasRef } from './offcanvas-config';
import { BootstrapService } from './bootstrap.service';
import { BaseOffcanvasComponent } from '../components/base-offcanvas/base-offcanvas.component';

@Injectable({
  providedIn: 'root',
})
export class OffcanvasService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly bootstrapService = inject(BootstrapService);
  private readonly openOffcanvases = new Map<string, OffcanvasRef>();

  /**
   * Open an offcanvas component programmatically
   * Enhanced type safety with proper constraints
   */
  open<T extends BaseOffcanvasComponent<D, R>, D = any, R = any>(
    component: Type<T>,
    config: OffcanvasConfig<D> = {}
  ): OffcanvasRef<R> {
    const id = this.generateId();

    // Create the component dynamically
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
    });

    // Enhanced data injection with better type safety
    this.injectDataIntoComponent(componentRef, config.data);

    // Create the offcanvas wrapper
    const offcanvasElement = this.createOffcanvasElement(id, config);

    // Attach the component to the offcanvas content
    this.attachComponentToOffcanvas(componentRef, offcanvasElement);

    // Append to document body
    document.body.appendChild(offcanvasElement);

    // Attach to Angular's change detection
    this.appRef.attachView(componentRef.hostView);

    // Create and configure the offcanvas reference
    const offcanvasRef = this.createOffcanvasRef<R>(
      id,
      componentRef,
      offcanvasElement
    );

    // Store the reference
    this.openOffcanvases.set(id, offcanvasRef);

    // Inject the offcanvas reference into the component
    this.injectOffcanvasRef(componentRef, offcanvasRef);

    // Initialize and show the offcanvas
    this.initializeAndShowOffcanvas(id, offcanvasElement, offcanvasRef);

    return offcanvasRef;
  }

  /**
   * Close all open offcanvases
   */
  closeAll(): void {
    this.openOffcanvases.forEach((ref) => ref.dismiss('close_all'));
  }

  /**
   * Get the number of currently open offcanvases
   */
  getOpenCount(): number {
    return this.openOffcanvases.size;
  }

  /**
   * Check if any offcanvas is currently open
   */
  hasOpenOffcanvas(): boolean {
    return this.openOffcanvases.size > 0;
  }

  private injectDataIntoComponent<T, D>(
    componentRef: ComponentRef<T>,
    data?: D
  ): void {
    if (!data || !componentRef.instance) {
      return;
    }

    const instance = componentRef.instance as any;

    // Use the signal-based setData method if available (preferred)
    if (typeof instance.setData === 'function') {
      instance.setData(data);
    } else {
      // Fallback for components that don't extend BaseOffcanvasComponent
      Object.assign(instance, { data });
    }
  }

  private attachComponentToOffcanvas<T>(
    componentRef: ComponentRef<T>,
    offcanvasElement: HTMLElement
  ): void {
    const contentElement = offcanvasElement.querySelector('.offcanvas-content');
    if (!contentElement) {
      throw new Error('Offcanvas content element not found');
    }

    if (!componentRef.location.nativeElement) {
      throw new Error('Component native element not found');
    }

    contentElement.appendChild(componentRef.location.nativeElement);
  }

  private createOffcanvasRef<R>(
    id: string,
    componentRef: ComponentRef<any>,
    offcanvasElement: HTMLElement
  ): OffcanvasRef<R> {
    // Create Bootstrap offcanvas instance
    const bootstrapOffcanvas =
      this.bootstrapService.createOffcanvas(offcanvasElement);

    let closeResolve!: (value: R | undefined) => void;
    let dismissResolve!: (reason: any) => void;
    let isDisposed = false;

    const afterClosedPromise = new Promise<R | undefined>((resolve) => {
      closeResolve = resolve;
    });

    const afterDismissedPromise = new Promise<any>((resolve) => {
      dismissResolve = resolve;
    });

    const offcanvasRef: OffcanvasRef<R> = {
      componentInstance: componentRef.instance,
      componentRef,
      close: (result?: R) => {
        if (isDisposed) {
          console.warn('Attempting to close already disposed offcanvas');
          return;
        }

        // Mark this as a programmatic close
        this.markElementAction(offcanvasElement, 'close', result);

        // Hide the Bootstrap offcanvas
        if (bootstrapOffcanvas) {
          bootstrapOffcanvas.hide();
        } else {
          // Fallback if no Bootstrap instance
          this.cleanup(id, offcanvasElement, componentRef);
          isDisposed = true;
          closeResolve(result);
        }
      },
      dismiss: (reason?: any) => {
        if (isDisposed) {
          console.warn('Attempting to dismiss already disposed offcanvas');
          return;
        }

        // Mark this as a programmatic dismiss
        this.markElementAction(offcanvasElement, 'dismiss', reason);

        // Hide the Bootstrap offcanvas
        if (bootstrapOffcanvas) {
          bootstrapOffcanvas.hide();
        } else {
          // Fallback if no Bootstrap instance
          this.cleanup(id, offcanvasElement, componentRef);
          isDisposed = true;
          dismissResolve(reason);
        }
      },
      afterClosed: () => afterClosedPromise,
      afterDismissed: () => afterDismissedPromise,
    };

    // Store resolvers for event handling
    (offcanvasRef as any)._closeResolve = closeResolve;
    (offcanvasRef as any)._dismissResolve = dismissResolve;
    (offcanvasRef as any)._isDisposed = () => isDisposed;
    (offcanvasRef as any)._setDisposed = () => {
      isDisposed = true;
    };

    return offcanvasRef;
  }

  private injectOffcanvasRef<T, R>(
    componentRef: ComponentRef<T>,
    offcanvasRef: OffcanvasRef<R>
  ): void {
    const instance = componentRef.instance;
    if (
      instance &&
      typeof instance === 'object' &&
      'offcanvasRef' in instance
    ) {
      (instance as any).offcanvasRef = offcanvasRef;
    }
  }

  private initializeAndShowOffcanvas<R>(
    id: string,
    offcanvasElement: HTMLElement,
    offcanvasRef: OffcanvasRef<R>
  ): void {
    const bootstrapOffcanvas =
      this.bootstrapService.createOffcanvas(offcanvasElement);

    if (!bootstrapOffcanvas) {
      console.error('Failed to create Bootstrap offcanvas instance');
      return;
    }

    // Set up event listeners before showing
    this.setupOffcanvasEventListeners(id, offcanvasElement, offcanvasRef);

    // Show the offcanvas
    bootstrapOffcanvas.show();
  }

  private setupOffcanvasEventListeners<R>(
    id: string,
    offcanvasElement: HTMLElement,
    offcanvasRef: OffcanvasRef<R>
  ): void {
    const handleHidden = () => {
      if (!this.openOffcanvases.has(id)) {
        return; // Already cleaned up
      }

      const element = offcanvasElement as any;
      const refAny = offcanvasRef as any;

      // Check the action type and resolve accordingly
      if (element._actionType === 'close') {
        this.cleanup(id, offcanvasElement, offcanvasRef.componentRef);
        refAny._setDisposed();
        refAny._closeResolve?.(element._actionData);
      } else if (element._actionType === 'dismiss') {
        this.cleanup(id, offcanvasElement, offcanvasRef.componentRef);
        refAny._setDisposed();
        refAny._dismissResolve?.(element._actionData);
      } else {
        // Default to backdrop/ESC dismiss
        this.cleanup(id, offcanvasElement, offcanvasRef.componentRef);
        refAny._setDisposed();
        refAny._dismissResolve?.('backdrop_click');
      }

      // Clean up event listener
      offcanvasElement.removeEventListener('hidden.bs.offcanvas', handleHidden);
    };

    offcanvasElement.addEventListener('hidden.bs.offcanvas', handleHidden);
  }

  private markElementAction(
    element: HTMLElement,
    actionType: 'close' | 'dismiss',
    data?: any
  ): void {
    (element as any)._actionType = actionType;
    (element as any)._actionData = data;
  }

  private generateId(): string {
    return `offcanvas-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  private createOffcanvasElement(
    id: string,
    config: OffcanvasConfig
  ): HTMLElement {
    const element = document.createElement('div');
    element.className = `offcanvas offcanvas-${config.position || 'end'}`;
    element.id = id;
    element.tabIndex = -1;

    // Apply configuration attributes
    this.applyOffcanvasConfig(element, config);

    // Create minimal structure - let components define their own content
    element.innerHTML = '<div class="offcanvas-content"></div>';

    return element;
  }

  private applyOffcanvasConfig(
    element: HTMLElement,
    config: OffcanvasConfig
  ): void {
    if (config.backdrop === 'static') {
      element.setAttribute('data-bs-backdrop', 'static');
    }

    if (config.keyboard === false) {
      element.setAttribute('data-bs-keyboard', 'false');
    }

    if (config.scroll) {
      element.setAttribute('data-bs-scroll', 'true');
    }

    if (config.panelClass) {
      const classes = Array.isArray(config.panelClass)
        ? config.panelClass
        : [config.panelClass];
      element.classList.add(...classes);
    }

    if (config.width) {
      element.style.width = config.width;
    }
  }

  private cleanup(
    id: string,
    element: HTMLElement,
    componentRef: ComponentRef<any>
  ): void {
    // Remove from our tracking
    this.openOffcanvases.delete(id);

    // Detach from Angular
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();

    // Remove from DOM
    element.remove();
  }
}
