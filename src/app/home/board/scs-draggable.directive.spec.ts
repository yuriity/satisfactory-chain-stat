import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { ScsDraggableDirective } from './scs-draggable.directive';

@Component({
  template: `
    <div
      class="parent"
      style="position: relative; width: 400px; height: 300px;"
    >
      <div
        class="draggable-element"
        scsDraggable
        (scsDragEnd)="onDragEnd($event)"
        style="position: absolute; width: 50px; height: 50px; left: 100px; top: 50px;"
      >
        Draggable Content
      </div>
    </div>
  `,
  imports: [ScsDraggableDirective],
})
class TestHostComponent {
  dragEndPosition: { x: number; y: number } | null = null;

  onDragEnd(position: { x: number; y: number }): void {
    this.dragEndPosition = position;
  }
}

describe('ScsDraggableDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let draggableElement: DebugElement;
  let draggableNativeElement: HTMLElement;
  let parentElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    draggableElement = fixture.debugElement.query(By.css('.draggable-element'));
    draggableNativeElement = draggableElement.nativeElement;
    parentElement = fixture.debugElement.query(By.css('.parent')).nativeElement;

    // Mock getBoundingClientRect for consistent testing
    spyOn(draggableNativeElement, 'getBoundingClientRect').and.returnValue({
      left: 100,
      top: 50,
      right: 150,
      bottom: 100,
      width: 50,
      height: 50,
    } as DOMRect);

    spyOn(parentElement, 'getBoundingClientRect').and.returnValue({
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
    } as DOMRect);
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    // Note: In practice, the directive should clean up its own listeners
    // This is just a safety measure for tests
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(draggableElement).toBeTruthy();
  });

  it('should apply directive to element', () => {
    const directiveInstance = draggableElement.injector.get(
      ScsDraggableDirective
    );
    expect(directiveInstance).toBeTruthy();
  });

  describe('mousedown event', () => {
    it('should start dragging on mousedown', () => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });

      const addEventListenerSpy = spyOn(document, 'addEventListener');

      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        jasmine.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        jasmine.any(Function)
      );
    });

    it('should calculate correct offset on mousedown', () => {
      const addEventListenerSpy = spyOn(document, 'addEventListener');

      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125, // 25px from element left (100 + 25)
        clientY: 75, // 25px from element top (50 + 25)
        bubbles: true,
      });

      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      // Offset should be calculated as clientX - rect.left and clientY - rect.top
      // This is tested indirectly through subsequent mouse move behavior
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        jasmine.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        jasmine.any(Function)
      );
    });
  });

  describe('mouse move during drag', () => {
    beforeEach(() => {
      // Start dragging
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);
    });

    it('should update element position during drag', () => {
      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150, // Move 25px right
        clientY: 100, // Move 25px down
        bubbles: true,
      });

      document.dispatchEvent(mouseMoveEvent);

      // Expected position: clientX - parentRect.left - offset.x
      // 150 - 0 - 25 = 125px
      // 100 - 0 - 25 = 75px
      expect(draggableNativeElement.style.left).toBe('125px');
      expect(draggableNativeElement.style.top).toBe('75px');
    });

    it('should not move element when parent element is not available', () => {
      // Mock parentElement to return null
      Object.defineProperty(draggableNativeElement, 'parentElement', {
        value: null,
        configurable: true,
      });

      const originalLeft = draggableNativeElement.style.left;
      const originalTop = draggableNativeElement.style.top;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });

      document.dispatchEvent(mouseMoveEvent);

      // Position should not change
      expect(draggableNativeElement.style.left).toBe(originalLeft);
      expect(draggableNativeElement.style.top).toBe(originalTop);
    });
  });

  describe('mouse up event', () => {
    beforeEach(() => {
      // Start dragging
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);
    });

    it('should stop dragging and remove event listeners on mouseup', () => {
      const removeEventListenerSpy = spyOn(document, 'removeEventListener');

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });

      document.dispatchEvent(mouseUpEvent);

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        jasmine.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        jasmine.any(Function)
      );
    });

    it('should emit scsDragEnd with final position on mouseup', () => {
      const scsDragEndSpy = jasmine.createSpy('scsDragEnd');
      component.onDragEnd = scsDragEndSpy;

      // Update the getBoundingClientRect mock to reflect new position after drag
      (
        draggableNativeElement.getBoundingClientRect as jasmine.Spy
      ).and.returnValue({
        left: 150, // New position after drag
        top: 100,
        right: 200,
        bottom: 150,
        width: 50,
        height: 50,
      } as DOMRect);

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });

      document.dispatchEvent(mouseUpEvent);

      // Expected emitted position: rect.left - parentRect.left, rect.top - parentRect.top
      // 150 - 0 = 150, 100 - 0 = 100
      expect(scsDragEndSpy).toHaveBeenCalledOnceWith({ x: 150, y: 100 });
    });

    it('should not emit scsDragEnd when parent element is not available', () => {
      const scsDragEndSpy = jasmine.createSpy('scsDragEnd');
      component.onDragEnd = scsDragEndSpy;

      // Mock parentElement to return null
      Object.defineProperty(draggableNativeElement, 'parentElement', {
        value: null,
        configurable: true,
      });

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });

      document.dispatchEvent(mouseUpEvent);

      expect(scsDragEndSpy).not.toHaveBeenCalled();
    });

    it('should not process mouseup when not dragging', () => {
      // Stop dragging first
      const mouseUpEvent1 = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent1);

      const removeEventListenerSpy = spyOn(document, 'removeEventListener');
      const scsDragEndSpy = jasmine.createSpy('scsDragEnd');
      component.onDragEnd = scsDragEndSpy;

      // Try mouseup again when not dragging
      const mouseUpEvent2 = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent2);

      expect(removeEventListenerSpy).not.toHaveBeenCalled();
      expect(scsDragEndSpy).not.toHaveBeenCalled();
    });
  });

  describe('drag sequence integration', () => {
    it('should complete full drag sequence correctly', () => {
      const scsDragEndSpy = jasmine.createSpy('scsDragEnd');
      component.onDragEnd = scsDragEndSpy;

      // 1. Start drag
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      // 2. Move element
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 200,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);

      // Verify element moved
      expect(draggableNativeElement.style.left).toBe('175px'); // 200 - 0 - 25
      expect(draggableNativeElement.style.top).toBe('125px'); // 150 - 0 - 25

      // 3. Update mock for final position
      (
        draggableNativeElement.getBoundingClientRect as jasmine.Spy
      ).and.returnValue({
        left: 175,
        top: 125,
        right: 225,
        bottom: 175,
        width: 50,
        height: 50,
      } as DOMRect);

      // 4. End drag
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(mouseUpEvent);

      // Verify final position emitted
      expect(scsDragEndSpy).toHaveBeenCalledOnceWith({ x: 175, y: 125 });
    });

    it('should handle multiple drag sequences', () => {
      const scsDragEndSpy = jasmine.createSpy('scsDragEnd');
      component.onDragEnd = scsDragEndSpy;

      // First drag sequence
      let mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      let mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent);

      // Second drag sequence
      mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 130,
        clientY: 80,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent);

      expect(scsDragEndSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should not move element when not dragging', () => {
      const originalLeft = draggableNativeElement.style.left;
      const originalTop = draggableNativeElement.style.top;

      // Try to move without starting drag
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 200,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);

      expect(draggableNativeElement.style.left).toBe(originalLeft);
      expect(draggableNativeElement.style.top).toBe(originalTop);
    });

    it('should handle getBoundingClientRect returning undefined parentElement', () => {
      // Start dragging
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      // Mock parentElement to return undefined getBoundingClientRect
      Object.defineProperty(draggableNativeElement, 'parentElement', {
        value: {
          getBoundingClientRect: () => undefined,
        },
        configurable: true,
      });

      const originalLeft = draggableNativeElement.style.left;
      const originalTop = draggableNativeElement.style.top;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 100,
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);

      // Position should not change
      expect(draggableNativeElement.style.left).toBe(originalLeft);
      expect(draggableNativeElement.style.top).toBe(originalTop);
    });
  });

  describe('output signal behavior', () => {
    it('should emit scsDragEnd output signal correctly', () => {
      // Use the component's method to test the output signal
      const outputSpy = jasmine.createSpy('outputSpy');
      const directiveInstance = draggableElement.injector.get(
        ScsDraggableDirective
      );
      directiveInstance.scsDragEnd.subscribe(outputSpy);

      // Start and end drag to trigger emission
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 125,
        clientY: 75,
        bubbles: true,
      });
      draggableElement.triggerEventHandler('mousedown', mouseDownEvent);

      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent);

      expect(outputSpy).toHaveBeenCalledOnceWith({ x: 100, y: 50 });
    });
  });
});
