import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  inject,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[scsDraggable]',
  standalone: true,
})
export class ScsDraggableDirective {
  @Output() scsDragEnd = new EventEmitter<{ x: number; y: number }>();

  private element = inject(ElementRef<HTMLElement>);
  private dragging = false;
  private offset = { x: 0, y: 0 };

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.dragging = true;
    const rect = this.element.nativeElement.getBoundingClientRect();
    this.offset.x = event.clientX - rect.left;
    this.offset.y = event.clientY - rect.top;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.dragging) return;
    const parentRect =
      this.element.nativeElement.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    const x = event.clientX - parentRect.left - this.offset.x;
    const y = event.clientY - parentRect.top - this.offset.y;
    this.element.nativeElement.style.left = `${x}px`;
    this.element.nativeElement.style.top = `${y}px`;
  };

  onMouseUp = (event: MouseEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    const rect = this.element.nativeElement.getBoundingClientRect();
    const parentRect =
      this.element.nativeElement.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;
    this.scsDragEnd.emit({ x, y });
  };
}
