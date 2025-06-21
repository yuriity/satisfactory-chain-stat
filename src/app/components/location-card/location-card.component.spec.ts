import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationCardComponent } from './location-card.component';
import { Resource } from '../../models/resource';
import { Location } from '../../models/location';
import { LocationsService } from '../../services/locations.service';

describe('LocationCardComponent', () => {
  let component: LocationCardComponent;
  let fixture: ComponentFixture<LocationCardComponent>;
  let mockResource1: Resource;
  let mockResource2: Resource;
  let mockLocation: Location;
  let locationsServiceSpy: jasmine.SpyObj<LocationsService>;

  beforeEach(async () => {
    // Create mock LocationsService
    locationsServiceSpy = jasmine.createSpyObj('LocationsService', [
      'editLocation',
      'deleteLocation',
    ]);

    // Create mock resources
    mockResource1 = new Resource(
      'Desc_IronIngot_C',
      'Iron Ingot',
      'Iron in bar form. Valuable for crafting.'
    );
    mockResource2 = new Resource(
      'Desc_IronPlate_C',
      'Iron Plate',
      'Iron Plates are used for crafting.'
    );

    // Create mock location
    mockLocation = {
      id: 'loc-123',
      name: 'Iron Factory',
      resourceSources: [],
      consumption: [{ resource: mockResource1, amount: 60 }],
      production: [{ resource: mockResource2, amount: 20, consumption: 30 }],
    };

    await TestBed.configureTestingModule({
      imports: [LocationCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationsService, useValue: locationsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationCardComponent);
    component = fixture.componentInstance;

    // Set up required input with Location
    fixture.componentRef.setInput('location', mockLocation);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the location name', () => {
    const titleElement = fixture.debugElement.query(By.css('.card-header h2'));
    expect(titleElement.nativeElement.textContent).toContain('Iron Factory');
  });

  it('should display consumption records', () => {
    const consumptionItems = fixture.debugElement.queryAll(
      By.css('.input-section .resource-item')
    );

    expect(consumptionItems.length).toBe(1);
    expect(
      consumptionItems[0].query(By.css('.resource-name')).nativeElement
        .textContent
    ).toContain('Iron Ingot');
    expect(
      consumptionItems[0].query(By.css('.resource-amount')).nativeElement
        .textContent
    ).toContain('60');
  });

  it('should display production records', () => {
    const productionComponents = fixture.debugElement.queryAll(
      By.css('.production-section scs-prodaction-statistics')
    );

    expect(productionComponents.length).toBe(1);

    // Check that the production component receives the correct input
    const productionComponent = productionComponents[0].componentInstance;
    expect(productionComponent.productionRecord().resource.displayName).toBe(
      'Iron Plate'
    );
    expect(productionComponent.productionRecord().amount).toBe(20);
    expect(productionComponent.productionRecord().consumption).toBe(30);
  });

  it('should display correct resource names in the UI', () => {
    const resourceNames = fixture.debugElement.queryAll(
      By.css('.resource-name')
    );

    expect(resourceNames[0].nativeElement.textContent).toContain('Iron Ingot');
    expect(resourceNames[1].nativeElement.textContent).toContain('Iron Plate');
  });

  it('should display correct resource icon URLs in the UI', () => {
    const imgElements = fixture.debugElement.queryAll(
      By.css('img.resource-icon')
    );

    const expectedUrl1 =
      'https://www.satisfactorytools.com/assets/images/items/Desc_IronIngot_C_64.png';
    const expectedUrl2 =
      'https://www.satisfactorytools.com/assets/images/items/Desc_IronPlate_C_64.png';

    expect(imgElements[0].properties['src']).toBe(expectedUrl1);
    // Production section uses scs-prodaction-statistics component, so check within that component
    const productionComponent = fixture.debugElement.query(
      By.css('scs-prodaction-statistics')
    );
    const productionImg = productionComponent.query(By.css('img'));
    expect(productionImg.properties['src']).toBe(expectedUrl2);
  });

  it('should load resource icons with correct URLs', () => {
    const imgElements = fixture.debugElement.queryAll(
      By.css('img.resource-icon')
    );

    expect(imgElements.length).toBe(1); // Only one in consumption section
    expect(imgElements[0].properties['src']).toContain(
      'Desc_IronIngot_C_64.png'
    );

    // Check production section icon within scs-prodaction-statistics component
    const productionComponent = fixture.debugElement.query(
      By.css('scs-prodaction-statistics')
    );
    const productionImg = productionComponent.query(By.css('img'));
    expect(productionImg.properties['src']).toContain(
      'Desc_IronPlate_C_64.png'
    );
  });

  it('should call editLocation service when edit button is clicked', () => {
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    editButton.triggerEventHandler('click');

    expect(locationsServiceSpy.editLocation).toHaveBeenCalledWith(mockLocation);
  });

  it('should call deleteLocation service when delete button is clicked and confirmed', () => {
    // Mock window.confirm to return true
    spyOn(window, 'confirm').and.returnValue(true);
    locationsServiceSpy.deleteLocation = jasmine.createSpy('deleteLocation');

    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    deleteButton.triggerEventHandler('click');

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Iron Factory"? This action cannot be undone.'
    );
    expect(locationsServiceSpy.deleteLocation).toHaveBeenCalledWith(
      mockLocation
    );
  });

  it('should not call deleteLocation service when delete button is clicked and cancelled', () => {
    // Mock window.confirm to return false
    spyOn(window, 'confirm').and.returnValue(false);
    locationsServiceSpy.deleteLocation = jasmine.createSpy('deleteLocation');

    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    deleteButton.triggerEventHandler('click');

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Iron Factory"? This action cannot be undone.'
    );
    expect(locationsServiceSpy.deleteLocation).not.toHaveBeenCalled();
  });

  it('should display both edit and delete buttons', () => {
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));

    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();

    expect(editButton.nativeElement.getAttribute('aria-label')).toBe(
      'Edit location'
    );
    expect(deleteButton.nativeElement.getAttribute('aria-label')).toBe(
      'Delete location'
    );
  });

  it('should update display when location input changes', () => {
    // Create a new location
    const newLocation: Location = {
      id: 'loc-456',
      name: 'Steel Factory',
      resourceSources: [],
      consumption: [
        { resource: mockResource1, amount: 30 },
        { resource: mockResource2, amount: 15 },
      ],
      production: [],
    };

    // Update the location input
    fixture.componentRef.setInput('location', newLocation);
    fixture.detectChanges();

    // Check if consumption records updated
    const consumptionItems = fixture.debugElement.queryAll(
      By.css('.input-section .resource-item')
    );
    expect(consumptionItems.length).toBe(2);

    // Check if production section shows no records
    const productionComponents = fixture.debugElement.queryAll(
      By.css('.production-section scs-prodaction-statistics')
    );
    expect(productionComponents.length).toBe(0);
  });

  it('should handle locations with empty consumption and production arrays', () => {
    const emptyLocation: Location = {
      id: 'loc-empty',
      name: 'Empty Factory',
      resourceSources: [],
      consumption: [],
      production: [],
    };

    // Update the location input
    fixture.componentRef.setInput('location', emptyLocation);
    fixture.detectChanges();

    // Check that no resource items are displayed
    const consumptionItems = fixture.debugElement.queryAll(
      By.css('.input-section .resource-item')
    );
    const productionComponents = fixture.debugElement.queryAll(
      By.css('.production-section scs-prodaction-statistics')
    );

    expect(consumptionItems.length).toBe(0);
    expect(productionComponents.length).toBe(0);
  });
});
