import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditLocationModalComponent } from './edit-location-modal.component';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';

describe('EditLocationModalComponent', () => {
  let component: EditLocationModalComponent;
  let fixture: ComponentFixture<EditLocationModalComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockLocationsService: jasmine.SpyObj<LocationsService>;

  const mockLocation: Location = {
    id: '1',
    name: 'Test Location',
    resourceSources: [],
    consumption: [],
    production: [],
  };

  const mockLocations: Location[] = [
    { id: '2', name: 'Location 2', resourceSources: [] },
    { id: '3', name: 'Location 3', resourceSources: [] },
  ];

  beforeEach(async () => {
    const activeModalSpy = jasmine.createSpyObj('NgbActiveModal', [
      'close',
      'dismiss',
    ]);
    const locationsServiceSpy = jasmine.createSpyObj('LocationsService', [], {
      locations: jasmine.createSpy().and.returnValue(mockLocations),
    });

    await TestBed.configureTestingModule({
      imports: [EditLocationModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        { provide: NgbActiveModal, useValue: activeModalSpy },
        { provide: LocationsService, useValue: locationsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditLocationModalComponent);
    component = fixture.componentInstance;
    mockActiveModal = TestBed.inject(
      NgbActiveModal
    ) as jasmine.SpyObj<NgbActiveModal>;
    mockLocationsService = TestBed.inject(
      LocationsService
    ) as jasmine.SpyObj<LocationsService>;

    // Set required input
    fixture.componentRef.setInput('location', mockLocation);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editable location with a copy of input location', () => {
    // Assert via DOM elements instead of accessing protected properties
    const nameInput = fixture.nativeElement.querySelector('#locationName');
    expect(nameInput).withContext('Should have name input').toBeTruthy();
    expect(nameInput.value)
      .withContext('Name input should have correct value')
      .toBe(mockLocation.name);
  });

  it('should close modal when save is clicked with valid data', () => {
    // Arrange - form is valid by default with mock data

    // Act
    component['saveLocation']();

    // Assert
    expect(mockActiveModal.close)
      .withContext('Modal should close with location data')
      .toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: '1',
          name: 'Test Location',
        })
      );
  });

  it('should dismiss modal when cancel is clicked', () => {
    // Act
    component['cancel']();

    // Assert
    expect(mockActiveModal.dismiss)
      .withContext('Modal should be dismissed')
      .toHaveBeenCalledWith('cancel');
  });

  it('should disable save button when form is invalid', () => {
    // Arrange - make form invalid by setting empty name
    component['updateLocationName']('');
    fixture.detectChanges();

    // Assert - Use DOM assertions instead of accessing protected properties
    const saveButton = fixture.nativeElement.querySelector(
      '.modal-footer .btn-primary'
    );
    expect(saveButton).withContext('Save button should exist').toBeTruthy();
    expect(saveButton.disabled)
      .withContext('Save button should be disabled when form is invalid')
      .toBe(true);
  });

  it('should enable save button when form is valid', () => {
    // Arrange - ensure form is valid
    component['updateLocationName']('Valid Location Name');
    fixture.detectChanges();

    // Assert
    const saveButton = fixture.nativeElement.querySelector(
      '.modal-footer .btn-primary'
    );
    expect(saveButton.disabled)
      .withContext('Save button should be enabled when form is valid')
      .toBe(false);
  });

  it('should update location name when updateLocationName is called', () => {
    // Arrange
    const newName = 'Updated Location Name';
    const nameInput = fixture.nativeElement.querySelector('#locationName');

    // Act
    component['updateLocationName'](newName);
    fixture.detectChanges();

    // Assert via DOM instead of protected properties
    expect(nameInput.value)
      .withContext('Name input should show updated value')
      .toBe(newName);
  });

  it('should add inbound resource when addInboundResource is called', () => {
    // Arrange - Count existing consumption rows in DOM
    const initialConsumptionRows = fixture.nativeElement.querySelectorAll(
      '.row.mb-2.align-items-center'
    );
    // Filter to only inbound resources (those with consumption selectors)
    const initialInboundRows = Array.from(initialConsumptionRows).filter(
      (row: any) => row.querySelector('scs-resource-selector')
    );
    const initialCount = initialInboundRows.length;

    // Act
    component['addInboundResource']();
    fixture.detectChanges();

    // Assert via DOM count
    const updatedConsumptionRows = fixture.nativeElement.querySelectorAll(
      '.row.mb-2.align-items-center'
    );
    const updatedInboundRows = Array.from(updatedConsumptionRows).filter(
      (row: any) => row.querySelector('scs-resource-selector')
    );

    expect(updatedInboundRows.length)
      .withContext('Should have one more consumption row in DOM')
      .toBeGreaterThan(initialCount);
  });

  it('should add outbound resource when addOutboundResource is called', () => {
    // Arrange - Count existing production rows in DOM
    const initialProductionRows = fixture.nativeElement.querySelectorAll(
      '.row.mb-2.align-items-center'
    );
    // Filter to only production resources
    const initialOutboundRows = Array.from(initialProductionRows).filter(
      (row: any) => row.querySelector('scs-resource-selector')
    );
    const initialCount = initialOutboundRows.length;

    // Act
    component['addOutboundResource']();
    fixture.detectChanges();

    // Assert via DOM count
    const updatedProductionRows = fixture.nativeElement.querySelectorAll(
      '.row.mb-2.align-items-center'
    );
    const updatedOutboundRows = Array.from(updatedProductionRows).filter(
      (row: any) => row.querySelector('scs-resource-selector')
    );

    expect(updatedOutboundRows.length)
      .withContext('Should have one more production row in DOM')
      .toBeGreaterThan(initialCount);
  });
  it('should filter out current location from available locations', () => {
    // Assert via DOM - check that current location is not in the list
    const checkboxes = fixture.nativeElement.querySelectorAll(
      'input[type="checkbox"]'
    );
    const locationIds = Array.from(checkboxes).map((cb: any) =>
      cb.id.replace('source-', '')
    );

    expect(locationIds.length)
      .withContext('Should have checkboxes for available locations')
      .toBe(2);
    expect(locationIds)
      .withContext('Should not include current location ID')
      .not.toContain(mockLocation.id);
  });

  it('should toggle resource source correctly', () => {
    // Arrange
    const locationId = '2';

    // Act - Add resource source
    component['toggleResourceSource'](locationId, true);
    fixture.detectChanges();

    // Assert via DOM - check if checkbox is checked
    const checkbox = fixture.nativeElement.querySelector(
      `#source-${locationId}`
    ) as HTMLInputElement;
    expect(checkbox?.checked)
      .withContext('Checkbox should be checked after adding resource source')
      .toBe(true);

    // Act - Remove resource source
    component['toggleResourceSource'](locationId, false);
    fixture.detectChanges();

    // Assert via DOM - check if checkbox is unchecked
    expect(checkbox?.checked)
      .withContext(
        'Checkbox should be unchecked after removing resource source'
      )
      .toBe(false);
  });
});
