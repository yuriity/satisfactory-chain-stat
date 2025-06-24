import { Injectable, inject } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EditLocationModalComponent } from '../components/edit-location-modal/edit-location-modal.component';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private ngbModal = inject(NgbModal);

  async editLocation(location: Location): Promise<Location | null> {
    const modalRef: NgbModalRef = this.ngbModal.open(
      EditLocationModalComponent,
      {
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
      }
    );

    // Set location data using the component method
    const component = modalRef.componentInstance as EditLocationModalComponent;
    component.setLocation(location);

    try {
      const result = await modalRef.result;
      return result;
    } catch (dismissReason) {
      // Modal was dismissed
      return null;
    }
  }
}
