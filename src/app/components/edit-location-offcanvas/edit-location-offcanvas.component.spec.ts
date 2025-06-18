import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLocationOffcanvasComponent } from './edit-location-offcanvas.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { ResourcesService } from '../../services/resources.service';
import { Location } from '../../models/location';
import { Resource } from '../../models/resource';
import { OffcanvasRef } from '../../services/offcanvas-config';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('EditLocationOffcanvasComponent', () => {
  let component: EditLocationOffcanvasComponent;
  let fixture: ComponentFixture<EditLocationOffcanvasComponent>;
  let locationsServiceSpy: jasmine.SpyObj<LocationsService>;
  let resourcesServiceSpy: jasmine.SpyObj<ResourcesService>;
  let mockOffcanvasRef: jasmine.SpyObj<OffcanvasRef>;

  const mockResource = new Resource(
    'Desc_Plastic_C',
    'Plastic',
    'Synthetic polymer used in manufacturing'
  );

  const mockLocation: Location = {
    id: 'test-location',
    name: 'Test Location',
    resourceSources: ['other-location-1'],
    consumption: [{ resource: mockResource, amount: 150 }],
    production: [{ resource: mockResource, amount: 120, consumption: 0 }],
  };

  const mockLocations: Location[] = [
    mockLocation,
    {
      id: 'other-location-1',
      name: 'Other Location 1',
      resourceSources: [],
    },
    {
      id: 'other-location-2',
      name: 'Other Location 2',
      resourceSources: [],
    },
  ];

  beforeEach(async () => {
    locationsServiceSpy = jasmine.createSpyObj('LocationsService', [
      'locations',
    ]);
    // Mock the locations signal
    locationsServiceSpy.locations.and.returnValue(mockLocations);

    resourcesServiceSpy = jasmine.createSpyObj('ResourcesService', [
      'resources',
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
        { provide: ResourcesService, useValue: resourcesServiceSpy },
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
    const saveButton = fixture.nativeElement.querySelector(
      '.d-flex.gap-2.justify-content-end .btn-primary'
    );
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

    const saveButton = emptyFixture.nativeElement.querySelector(
      '.d-flex.gap-2.justify-content-end .btn-primary'
    );
    // Should not find save button because editableLocation() returns null
    expect(saveButton).toBeNull();
  });

  // Testing inbound resource management
  it('should display inbound resources from location data', () => {
    const inboundSection = fixture.debugElement.query(
      By.css('.mb-4:nth-child(2)')
    );
    expect(inboundSection).toBeTruthy();

    const resourceRows = fixture.debugElement.queryAll(By.css('.row.mb-2'));
    expect(resourceRows.length).toBeGreaterThanOrEqual(1);
  });

  it('should add inbound resource when add button is clicked', () => {
    const initialConsumptionLength =
      component.editableLocation()?.consumption?.length || 0;

    const addButton = fixture.debugElement.query(
      By.css('[title="Add Inbound Resource"]')
    );
    addButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const updatedConsumptionLength =
      component.editableLocation()?.consumption?.length || 0;
    expect(updatedConsumptionLength).toBe(initialConsumptionLength + 1);
  });

  it('should remove inbound resource when remove button is clicked', () => {
    const initialConsumptionLength =
      component.editableLocation()?.consumption?.length || 0;

    const removeButton = fixture.debugElement.query(
      By.css('[title="Remove Resource"]')
    );
    if (removeButton) {
      removeButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      const updatedConsumptionLength =
        component.editableLocation()?.consumption?.length || 0;
      expect(updatedConsumptionLength).toBe(initialConsumptionLength - 1);
    }
  });

  // Testing outbound resource management
  it('should display outbound resources from location data', () => {
    const outboundSection = fixture.debugElement.query(
      By.css('.mb-4:nth-child(3)')
    );
    expect(outboundSection).toBeTruthy();
  });

  it('should add outbound resource when add button is clicked', () => {
    const initialProductionLength =
      component.editableLocation()?.production?.length || 0;

    const addButton = fixture.debugElement.query(
      By.css('[title="Add Outbound Resource"]')
    );
    addButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const updatedProductionLength =
      component.editableLocation()?.production?.length || 0;
    expect(updatedProductionLength).toBe(initialProductionLength + 1);
  });

  // Testing resource sources management
  it('should display available locations as resource sources', () => {
    const inboundSourcesSection = fixture.debugElement.query(
      By.css('.mb-4:nth-child(3)')
    );
    expect(inboundSourcesSection).toBeTruthy();

    const checkboxes = fixture.debugElement.queryAll(
      By.css('.list-group-item input[type="checkbox"]')
    );
    // Should show 2 available locations (excluding the current one)
    expect(checkboxes.length).toBe(2);
  });

  it('should show checked state for selected resource sources', () => {
    const firstCheckbox = fixture.debugElement.query(
      By.css('.list-group-item input[type="checkbox"]')
    );
    expect(firstCheckbox.nativeElement.checked).toBe(true); // other-location-1 is selected
  });

  it('should toggle resource source when checkbox is clicked', () => {
    const initialSourcesLength =
      component.editableLocation()?.resourceSources?.length || 0;

    // Find a checkbox that is currently unchecked
    const checkboxes = fixture.debugElement.queryAll(
      By.css('.list-group-item input[type="checkbox"]')
    );
    const uncheckedCheckbox = checkboxes.find(
      (cb) => !cb.nativeElement.checked
    );

    if (uncheckedCheckbox) {
      uncheckedCheckbox.triggerEventHandler('change', {
        target: { checked: true },
      });
      fixture.detectChanges();

      const updatedSourcesLength =
        component.editableLocation()?.resourceSources?.length || 0;
      expect(updatedSourcesLength).toBe(initialSourcesLength + 1);
    }
  });

  it('should remove resource source when checkbox is unchecked', () => {
    const initialSourcesLength =
      component.editableLocation()?.resourceSources?.length || 0;

    // Find a checkbox that is currently checked
    const checkboxes = fixture.debugElement.queryAll(
      By.css('.list-group-item input[type="checkbox"]')
    );
    const checkedCheckbox = checkboxes.find((cb) => cb.nativeElement.checked);

    if (checkedCheckbox) {
      checkedCheckbox.triggerEventHandler('change', {
        target: { checked: false },
      });
      fixture.detectChanges();

      const updatedSourcesLength =
        component.editableLocation()?.resourceSources?.length || 0;
      expect(updatedSourcesLength).toBe(initialSourcesLength - 1);
    }
  });

  it('should exclude current location from available sources', () => {
    const availableLocations = component['availableLocations']();
    const currentLocationId = component.editableLocation()?.id;

    expect(availableLocations.every((loc) => loc.id !== currentLocationId))
      .withContext('Available locations should not include current location')
      .toBe(true);
  });

  it('should show message when no other locations are available', () => {
    // Mock service to return only the current location
    locationsServiceSpy.locations.and.returnValue([mockLocation]);

    // Create a new component instance to pick up the new mock data
    const noLocationFixture = TestBed.createComponent(
      EditLocationOffcanvasComponent
    );
    const noLocationComponent = noLocationFixture.componentInstance;
    noLocationComponent.offcanvasRef = mockOffcanvasRef;
    noLocationComponent.setData({ location: mockLocation });
    noLocationFixture.detectChanges();

    const noLocationsMessage = noLocationFixture.debugElement.query(
      By.css('.text-muted.small')
    );
    expect(noLocationsMessage?.nativeElement.textContent)
      .withContext(
        'Should show no locations message when only current location exists'
      )
      .toContain('No other locations available as sources');
  });
});
