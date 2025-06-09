import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';

@Component({
  selector: 'scs-board',
  imports: [],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('board') board!: ElementRef;

  private jsPlumbInstance!: BrowserJsPlumbInstance;

  ngAfterViewInit(): void {
    this.jsPlumbInstance = newInstance({
      container: this.board.nativeElement,
    });

    // Example: Add two cards and connect them
    const card1 = this.addCard('Card 1', '100px', '100px');
    const card2 = this.addCard('Card 2', '300px', '200px');

    this.jsPlumbInstance.connect({
      source: card1,
      target: card2,
      anchor: 'AutoDefault',
      connector: 'Straight',
      endpoint: 'Blank',
      overlays: [
        { type: 'Arrow', options: { location: 1, width: 10, length: 10 } },
      ],
    });

    this.jsPlumbInstance.isDraggable(card1);
    this.jsPlumbInstance.isDraggable(card2);
  }

  private addCard(id: string, top: string, left: string): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.id = id;
    cardElement.classList.add('card');
    cardElement.style.position = 'absolute';
    cardElement.style.top = top;
    cardElement.style.left = left;
    cardElement.innerHTML = `
      <div class="card-body">
        ${id}
      </div>
    `;
    this.board.nativeElement.appendChild(cardElement);
    return cardElement;
  }
}
