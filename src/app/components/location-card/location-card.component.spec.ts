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
    ).toContain('60 /min');
  });

  it('should display production records', () => {
    const productionItems = fixture.debugElement.queryAll(
      By.css('.production-section .resource-item')
    );

    expect(productionItems.length).toBe(1);
    expect(
      productionItems[0].query(By.css('.resource-name')).nativeElement
        .textContent
    ).toContain('Iron Plate');
    expect(
      productionItems[0].query(By.css('.resource-amount')).nativeElement
        .textContent
    ).toContain('20 /min - Consumption 30 /min');
  });

  it('should display correct resource names in the UI', () => {
    const resourceNames = fixture.debugElement.queryAll(
      By.css('.resource-name')
    );

    expect(resourceNames[0].nativeElement.textContent).toContain('Iron Ingot');
    expect(resourceNames[1].nativeElement.textContent).toContain('Iron Plate');
  });

  it('should display correct resource icon URLs in the UI', () => {
    const imgElements = fixture.debugElement.queryAll(By.css('.resource-icon'));

    const expectedUrl1 =
      'https://www.satisfactorytools.com/assets/images/items/Desc_IronIngot_C_64.png';
    const expectedUrl2 =
      'https://www.satisfactorytools.com/assets/images/items/Desc_IronPlate_C_64.png';

    expect(imgElements[0].properties['src']).toBe(expectedUrl1);
    expect(imgElements[1].properties['src']).toBe(expectedUrl2);
  });

  it('should load resource icons with correct URLs', () => {
    const imgElements = fixture.debugElement.queryAll(By.css('.resource-icon'));

    expect(imgElements.length).toBe(2); // One for consumption, one for production
    expect(imgElements[0].properties['src']).toContain(
      'Desc_IronIngot_C_64.png'
    );
    expect(imgElements[1].properties['src']).toContain(
      'Desc_IronPlate_C_64.png'
    );
  });

  it('should call editLocation service when edit button is clicked', () => {
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    editButton.triggerEventHandler('click');

    expect(locationsServiceSpy.editLocation).toHaveBeenCalledWith(mockLocation);
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
    const productionItems = fixture.debugElement.queryAll(
      By.css('.production-section .resource-item')
    );
    expect(productionItems.length).toBe(0);
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
    const productionItems = fixture.debugElement.queryAll(
      By.css('.production-section .resource-item')
    );

    expect(consumptionItems.length).toBe(0);
    expect(productionItems.length).toBe(0);
  });
});
