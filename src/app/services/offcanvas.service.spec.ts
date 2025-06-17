import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { OffcanvasService } from './offcanvas.service';
import { BootstrapService } from './bootstrap.service';
import { BaseOffcanvasComponent } from '../components/base-offcanvas/base-offcanvas.component';

// Test component that extends BaseOffcanvasComponent
@Component({
  selector: 'test-offcanvas',
  standalone: true,
  template: `
    <div class="test-content">
      <h5>Test Offcanvas</h5>
      <p>Data: {{ data()?.message || 'No data' }}</p>
      <button (click)="close('test-result')">Close with result</button>
      <button (click)="dismiss('dismissed')">Dismiss</button>
    </div>
  `,
})
class TestOffcanvasComponent extends BaseOffcanvasComponent<
  { message: string },
  string
> {}

describe('OffcanvasService', () => {
  let service: OffcanvasService;
  let bootstrapService: jasmine.SpyObj<BootstrapService>;

  beforeEach(() => {
    const bootstrapSpy = jasmine.createSpyObj('BootstrapService', [
      'createOffcanvas',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        OffcanvasService,
        { provide: BootstrapService, useValue: bootstrapSpy },
      ],
    });

    service = TestBed.inject(OffcanvasService);
    bootstrapService = TestBed.inject(
      BootstrapService
    ) as jasmine.SpyObj<BootstrapService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open an offcanvas component with data', () => {
    // Mock Bootstrap offcanvas
    const mockOffcanvas = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
    };
    bootstrapService.createOffcanvas.and.returnValue(mockOffcanvas as any);

    const testData = { message: 'Hello World' };
    const offcanvasRef = service.open(TestOffcanvasComponent, {
      data: testData,
      position: 'end',
    });

    expect(offcanvasRef).toBeTruthy();
    expect(offcanvasRef.componentInstance).toBeTruthy();
    expect(offcanvasRef.componentInstance.data()).toEqual(testData);
    expect(mockOffcanvas.show).toHaveBeenCalled();
  });

  it('should resolve afterClosed promise when close is called', async () => {
    const mockOffcanvas = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide').and.callFake(() => {
        // Simulate the Bootstrap hidden event
        setTimeout(() => {
          const event = new Event('hidden.bs.offcanvas');
          document.querySelector('.offcanvas')?.dispatchEvent(event);
        }, 0);
      }),
    };
    bootstrapService.createOffcanvas.and.returnValue(mockOffcanvas as any);

    const offcanvasRef = service.open(TestOffcanvasComponent);
    const testResult = 'test-result';

    // Close the offcanvas
    offcanvasRef.close(testResult);

    const result = await offcanvasRef.afterClosed();
    expect(result).toBe(testResult);
  });

  it('should resolve afterDismissed promise when dismiss is called', async () => {
    const mockOffcanvas = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide').and.callFake(() => {
        // Simulate the Bootstrap hidden event
        setTimeout(() => {
          const event = new Event('hidden.bs.offcanvas');
          document.querySelector('.offcanvas')?.dispatchEvent(event);
        }, 0);
      }),
    };
    bootstrapService.createOffcanvas.and.returnValue(mockOffcanvas as any);

    const offcanvasRef = service.open(TestOffcanvasComponent);
    const dismissReason = 'user-dismissed';

    // Dismiss the offcanvas
    offcanvasRef.dismiss(dismissReason);

    const reason = await offcanvasRef.afterDismissed();
    expect(reason).toBe(dismissReason);
  });

  it('should create offcanvas element with correct configuration', () => {
    const mockOffcanvas = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
    };
    bootstrapService.createOffcanvas.and.returnValue(mockOffcanvas as any);

    service.open(TestOffcanvasComponent, {
      position: 'start',
      backdrop: 'static',
      keyboard: false,
      width: '400px',
      panelClass: 'custom-class',
    });

    // Check that an offcanvas element was created and added to the DOM
    const offcanvasElements = document.querySelectorAll(
      '.offcanvas.offcanvas-start'
    );
    expect(offcanvasElements.length).toBeGreaterThan(0);

    const lastElement = offcanvasElements[
      offcanvasElements.length - 1
    ] as HTMLElement;
    expect(lastElement.getAttribute('data-bs-backdrop')).toBe('static');
    expect(lastElement.getAttribute('data-bs-keyboard')).toBe('false');
    expect(lastElement.style.width).toBe('400px');
    expect(lastElement.classList.contains('custom-class')).toBe(true);
    expect(lastElement.querySelector('.offcanvas-content')).toBeTruthy();
  });

  it('should close all open offcanvases', () => {
    const mockOffcanvas = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
    };
    bootstrapService.createOffcanvas.and.returnValue(mockOffcanvas as any);

    const ref1 = service.open(TestOffcanvasComponent);
    const ref2 = service.open(TestOffcanvasComponent);

    spyOn(ref1, 'dismiss');
    spyOn(ref2, 'dismiss');

    service.closeAll();

    expect(ref1.dismiss).toHaveBeenCalledWith('close_all');
    expect(ref2.dismiss).toHaveBeenCalledWith('close_all');
  });

  afterEach(() => {
    // Clean up any remaining offcanvas elements
    document.querySelectorAll('.offcanvas').forEach((el) => el.remove());
  });
});
