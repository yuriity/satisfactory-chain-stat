import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from './modal.service';
import { EditLocationModalComponent } from '../components/edit-location-modal/edit-location-modal.component';
import { Location } from '../models/location';

describe('ModalService', () => {
  let service: ModalService;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;

  const mockLocation: Location = {
    id: '1',
    name: 'Test Location',
    resourceSources: [],
  };

  beforeEach(() => {
    const ngbModalSpy = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: NgbModal, useValue: ngbModalSpy },
      ],
    });

    service = TestBed.inject(ModalService);
    mockNgbModal = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open modal with correct configuration', async () => {
    // Arrange
    const mockModalRef = {
      result: Promise.resolve(mockLocation),
      componentInstance: { setLocation: jasmine.createSpy('setLocation') },
    } as any;
    mockNgbModal.open.and.returnValue(mockModalRef);

    // Act
    await service.editLocation(mockLocation);

    // Assert
    expect(mockNgbModal.open)
      .withContext('Should open modal with EditLocationModalComponent')
      .toHaveBeenCalledWith(EditLocationModalComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
      });
  });

  it('should set location on modal component instance', async () => {
    // Arrange
    const mockModalRef = {
      result: Promise.resolve(mockLocation),
      componentInstance: { setLocation: jasmine.createSpy('setLocation') },
    } as any;
    mockNgbModal.open.and.returnValue(mockModalRef);

    // Act
    await service.editLocation(mockLocation);

    // Assert
    expect(mockModalRef.componentInstance.setLocation)
      .withContext('Should call setLocation on component instance')
      .toHaveBeenCalledWith(mockLocation);
  });

  it('should return location when modal is closed with result', async () => {
    // Arrange
    const expectedLocation: Location = {
      ...mockLocation,
      name: 'Updated Location',
    };
    const mockModalRef = {
      result: Promise.resolve(expectedLocation),
      componentInstance: { setLocation: jasmine.createSpy('setLocation') },
    } as any;
    mockNgbModal.open.and.returnValue(mockModalRef);

    // Act
    const result = await service.editLocation(mockLocation);

    // Assert
    expect(result)
      .withContext('Should return the updated location')
      .toEqual(expectedLocation);
  });

  it('should return null when modal is dismissed', async () => {
    // Arrange
    const mockModalRef = {
      result: Promise.reject('dismissed'),
      componentInstance: { setLocation: jasmine.createSpy('setLocation') },
    } as any;
    mockNgbModal.open.and.returnValue(mockModalRef);

    // Act
    const result = await service.editLocation(mockLocation);

    // Assert
    expect(result)
      .withContext('Should return null when modal is dismissed')
      .toBeNull();
  });
});
