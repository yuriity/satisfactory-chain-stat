import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LocationCardComponent } from './location-card';
import { Location } from '../../models/location';
import { ResourcesService } from '../../services/resources.service';
import { Resource } from '../../models/resource';

describe('LocationCardComponent', () => {
  let component: LocationCardComponent;
  let fixture: ComponentFixture<LocationCardComponent>;
  let mockResourcesService: Partial<ResourcesService>;

  const mockLocation: Location = {
    id: 'circuit-board-plant',
    name: 'Circuit Board Plant',
    resourceSources: [],
    consumption: [
      { resourceClass: 'Desc_Silica_C', amount: 240 },
      { resourceClass: 'Desc_Plastic_C', amount: 140 },
    ],
    production: [{ resourceClass: 'Desc_CircuitBoard_C', amount: 150 }],
  };

  const mockResources: Resource[] = [
    new Resource('Desc_Silica_C', 'Silica', 'Silica description'),
    new Resource('Desc_Plastic_C', 'Plastic', 'Plastic description'),
    new Resource(
      'Desc_CircuitBoard_C',
      'Circuit Board',
      'Circuit Board description'
    ),
  ];

  beforeEach(async () => {
    // Create a mock ResourcesService with a resources signal
    const resourcesSignal = signal<Resource[]>(mockResources);

    mockResourcesService = {
      resources: resourcesSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [LocationCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ResourcesService, useValue: mockResourcesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationCardComponent);
    component = fixture.componentInstance;

    // Set input for location
    (component.location as any).set(mockLocation);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the location name correctly', () => {
    const titleElement = fixture.debugElement.query(
      By.css('.card-header h2')
    ).nativeElement;
    expect(titleElement.textContent).toContain('Circuit Board Plant');
  });

  it('should display consumption records', () => {
    const resourceItems = fixture.debugElement.queryAll(
      By.css('.input-section .resource-item')
    );
    expect(resourceItems.length).toBe(2);

    const silicaItem = resourceItems[0].nativeElement;
    expect(silicaItem.textContent).toContain('Silica');
    expect(silicaItem.textContent).toContain('240 /min');

    const plasticItem = resourceItems[1].nativeElement;
    expect(plasticItem.textContent).toContain('Plastic');
    expect(plasticItem.textContent).toContain('140 /min');
  });

  it('should display production records', () => {
    const resourceItems = fixture.debugElement.queryAll(
      By.css('.production-section .resource-item')
    );
    expect(resourceItems.length).toBe(1);

    const circuitBoardItem = resourceItems[0].nativeElement;
    expect(circuitBoardItem.textContent).toContain('Circuit Board');
    expect(circuitBoardItem.textContent).toContain('150 /min');
  });

  it('should call onEditClick method when edit button is clicked', () => {
    spyOn(component as any, 'onEditClick');
    const editButton = fixture.debugElement.query(
      By.css('.edit-button')
    ).nativeElement;
    editButton.click();
    expect((component as any).onEditClick).toHaveBeenCalled();
  });
});
