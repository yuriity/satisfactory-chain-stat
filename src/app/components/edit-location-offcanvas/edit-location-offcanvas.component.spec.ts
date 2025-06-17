import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLocationOffcanvasComponent } from './edit-location-offcanvas.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { Location } from '../../models/location';
import { OffcanvasRef } from '../../services/offcanvas-config';
import { FormsModule } from '@angular/forms';

describe('EditLocationOffcanvasComponent', () => {
  let component: EditLocationOffcanvasComponent;
  let fixture: ComponentFixture<EditLocationOffcanvasComponent>;
  let locationsServiceSpy: jasmine.SpyObj<LocationsService>;
  let mockOffcanvasRef: jasmine.SpyObj<OffcanvasRef>;

  const mockLocation: Location = {
    id: 'test-location',
    name: 'Test Location',
    resourceSources: [],
    consumption: [],
    production: [],
  };

  beforeEach(async () => {
    locationsServiceSpy = jasmine.createSpyObj('LocationsService', [
      'locations',
    ]);
    mockOffcanvasRef = jasmine.createSpyObj('OffcanvasRef', [
      'close',
      'dismiss',
    ]);

    await TestBed.configureTestingModule({
      imports: [EditLocationOffcanvasComponent, FormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationsService, useValue: locationsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditLocationOffcanvasComponent);
    component = fixture.componentInstance;

    component.offcanvasRef = mockOffcanvasRef;
    component.setData({ location: mockLocation });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editableLocation with data from input', () => {
    expect(component.editableLocation()).toEqual(
      jasmine.objectContaining({
        id: mockLocation.id,
        name: mockLocation.name,
      })
    );
  });

  it('should display location name in template', () => {
    const compiled = fixture.nativeElement;
    const nameInput = compiled.querySelector(
      '#locationName'
    ) as HTMLInputElement;
    expect(nameInput.value).toBe(mockLocation.name);
  });

  it('should call close with save result when saveLocation is called', () => {
    const updatedName = 'Updated Location Name';

    // Update the location name using the component's method
    component.updateLocationName(updatedName);
    fixture.detectChanges();

    // Call saveLocation through the public interface (click the save button)
    const saveButton = fixture.nativeElement.querySelector('.btn-primary');
    saveButton.click();

    expect(mockOffcanvasRef.close).toHaveBeenCalledWith({
      action: 'save',
      location: jasmine.objectContaining({
        id: mockLocation.id,
        name: updatedName,
      }),
    });
  });

  it('should call close with cancel result when closeOffcanvas is called', () => {
    // Call closeOffcanvas through the public interface (click the cancel button)
    const cancelButton = fixture.nativeElement.querySelector('.btn-secondary');
    cancelButton.click();

    expect(mockOffcanvasRef.close).toHaveBeenCalledWith({
      action: 'cancel',
    });
  });

  it('should call close with cancel result when close button is clicked', () => {
    // Click the X close button
    const closeButton = fixture.nativeElement.querySelector('.btn-close');
    closeButton.click();

    expect(mockOffcanvasRef.close).toHaveBeenCalledWith({
      action: 'cancel',
    });
  });

  it('should update location name when input changes', () => {
    const nameInput = fixture.nativeElement.querySelector(
      '#locationName'
    ) as HTMLInputElement;
    const newName = 'New Location Name';

    // Simulate ngModelChange event
    component.updateLocationName(newName);
    fixture.detectChanges();

    expect(component.editableLocation()?.name).toBe(newName);
  });

  it('should show "No location to edit" when no data is provided', () => {
    // Create component without data
    const noDataFixture = TestBed.createComponent(
      EditLocationOffcanvasComponent
    );
    const noDataComponent = noDataFixture.componentInstance;
    noDataFixture.detectChanges();

    const compiled = noDataFixture.nativeElement;
    expect(compiled.textContent).toContain('No location to edit');
  });

  it('should not call close when saveLocation is called without editableLocation', () => {
    // Create a component without setting data
    const emptyFixture = TestBed.createComponent(
      EditLocationOffcanvasComponent
    );
    const emptyComponent = emptyFixture.componentInstance;
    emptyComponent.offcanvasRef = mockOffcanvasRef;
    emptyFixture.detectChanges();

    const saveButton = emptyFixture.nativeElement.querySelector('.btn-primary');
    // Should not find save button because editableLocation() returns null
    expect(saveButton).toBeNull();
    expect(mockOffcanvasRef.close).not.toHaveBeenCalled();
  });
});
