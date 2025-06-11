import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { LocationCardComponent } from './location-card';
import { Resource } from '../../models/resource';
import { Location } from '../../models/location';
import { LocationViewModel } from '../../view-models/location-view-model';

describe('LocationCardComponent', () => {
  let component: LocationCardComponent;
  let fixture: ComponentFixture<LocationCardComponent>;
  let mockResource1: Resource;
  let mockResource2: Resource;
  let mockLocationVM: LocationViewModel;

  beforeEach(async () => {
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
    const mockLocation: Location = {
      id: 'loc-123',
      name: 'Iron Factory',
      resourceSources: [],
      consumption: [{ resource: mockResource1, amount: 60 }],
      production: [{ resource: mockResource2, amount: 20 }],
    };

    // Create LocationViewModel from the mock location
    mockLocationVM = new LocationViewModel(mockLocation);

    await TestBed.configureTestingModule({
      imports: [LocationCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationCardComponent);
    component = fixture.componentInstance;

    // Set up required input with LocationViewModel
    fixture.componentRef.setInput('locationVM', mockLocationVM);
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
    ).toContain('20 /min');
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

  it('should log edit message when edit button is clicked', () => {
    spyOn(console, 'log');

    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    editButton.triggerEventHandler('click');

    expect(console.log).toHaveBeenCalledWith('Editing location: loc-123');
  });

  it('should update display when locationVM input changes', () => {
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

    // Create a new LocationViewModel
    const newLocationVM = new LocationViewModel(newLocation);

    // Update the locationVM input
    fixture.componentRef.setInput('locationVM', newLocationVM);
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

  it('should display total consumption and production', () => {
    // Create a location with multiple consumption and production records
    const location: Location = {
      id: 'loc-totals',
      name: 'Test Factory',
      resourceSources: [],
      consumption: [
        { resource: mockResource1, amount: 30 },
        { resource: mockResource2, amount: 15 },
      ],
      production: [
        { resource: mockResource1, amount: 60 },
        { resource: mockResource2, amount: 40 },
      ],
    };

    // Create LocationViewModel from the location
    const locationVM = new LocationViewModel(location);

    // Update the locationVM input
    fixture.componentRef.setInput('locationVM', locationVM);
    fixture.detectChanges();

    // Check totals
    const totalConsumption = fixture.debugElement.query(
      By.css('.input-section strong')
    );
    const totalProduction = fixture.debugElement.query(
      By.css('.production-section strong')
    );

    expect(totalConsumption.nativeElement.textContent).toContain(
      'Total: 45 /min'
    );
    expect(totalProduction.nativeElement.textContent).toContain(
      'Total: 100 /min'
    );
  });

  it('should handle locations with empty consumption and production arrays', () => {
    const emptyLocation: Location = {
      id: 'loc-empty',
      name: 'Empty Factory',
      resourceSources: [],
      consumption: [],
      production: [],
    };

    // Create LocationViewModel from the empty location
    const emptyLocationVM = new LocationViewModel(emptyLocation);

    // Update the locationVM input
    fixture.componentRef.setInput('locationVM', emptyLocationVM);
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

    // Check totals are zero
    const totalConsumption = fixture.debugElement.query(
      By.css('.input-section strong')
    );
    const totalProduction = fixture.debugElement.query(
      By.css('.production-section strong')
    );

    expect(totalConsumption.nativeElement.textContent).toContain(
      'Total: 0 /min'
    );
    expect(totalProduction.nativeElement.textContent).toContain(
      'Total: 0 /min'
    );
  });
});
