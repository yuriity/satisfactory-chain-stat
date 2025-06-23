import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProdactionStatisticsComponent } from './prodaction-statistics.component';
import { Resource } from '../../../models/resource';
import { ProductionRecord } from '../../../models/location';

describe('ProdactionStatisticsComponent', () => {
  let component: ProdactionStatisticsComponent;
  let fixture: ComponentFixture<ProdactionStatisticsComponent>;

  const mockResource = new Resource(
    'Desc_CircuitBoard_C',
    'Circuit Board',
    'Advanced electronics component'
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdactionStatisticsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdactionStatisticsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 150,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display balanced state with equal production and consumption', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 150,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.progress-balanced')))
      .withContext('Progress bar should have balanced class')
      .toBeTruthy();

    const progressBars = fixture.debugElement.queryAll(By.css('.progress-bar'));
    expect(progressBars.length)
      .withContext('Should have two progress bars in balanced state')
      .toBe(2);
  });

  it('should display production-only state when consumption is zero', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 0,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.progress-production-only')))
      .withContext('Progress bar should have production-only class')
      .toBeTruthy();

    const progressBars = fixture.debugElement.queryAll(By.css('.progress-bar'));
    expect(progressBars.length)
      .withContext('Should have one progress bar in production-only state')
      .toBe(1);
  });

  it('should display consumption-only state when production is zero', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 0,
      consumption: 150,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.progress-consumption-only')))
      .withContext('Progress bar should have consumption-only class')
      .toBeTruthy();

    const progressBars = fixture.debugElement.queryAll(By.css('.progress-bar'));
    expect(progressBars.length)
      .withContext('Should have one progress bar in consumption-only state')
      .toBe(1);
  });

  it('should display correct production and consumption rates', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 100,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    const productionRate = fixture.debugElement.query(
      By.css('.rates-container .production-rate')
    );
    const consumptionRate = fixture.debugElement.query(
      By.css('.rates-container .consumption-rate')
    );

    expect(productionRate.nativeElement.textContent)
      .withContext('Production rate should display correct value')
      .toContain('150/min');

    expect(consumptionRate.nativeElement.textContent)
      .withContext('Consumption rate should display correct value')
      .toContain('100/min');
  });

  it('should display resource name and icon', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 100,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    const resourceName = fixture.debugElement.query(By.css('.resource-name'));
    const resourceIcon = fixture.debugElement.query(
      By.css('.resource-icon img')
    );

    expect(resourceName.nativeElement.textContent)
      .withContext('Should display correct resource name')
      .toContain('Circuit Board');

    expect(resourceIcon.nativeElement.src)
      .withContext('Should have correct icon URL')
      .toContain('Desc_CircuitBoard_C_64.png');
  });

  it('should have correct grid layout structure', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150,
      consumption: 100,
    };

    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    const resourceIcon = fixture.debugElement.query(By.css('.resource-icon'));
    const resourceName = fixture.debugElement.query(By.css('.resource-name'));
    const ratesContainer = fixture.debugElement.query(
      By.css('.rates-container')
    );
    const progressContainer = fixture.debugElement.query(
      By.css('.progress-container')
    );

    expect(resourceIcon).withContext('Should have resource icon').toBeTruthy();

    expect(resourceName).withContext('Should have resource name').toBeTruthy();

    expect(ratesContainer)
      .withContext('Should have rates container')
      .toBeTruthy();

    expect(progressContainer)
      .withContext('Should have progress container')
      .toBeTruthy();
  });

  it('should show thumbs-down icon when isShortage() is true', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 50, // less than consumption
      consumption: 100,
    };
    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    const icon = fixture.debugElement.query(
      By.css('.resource-name .bi-hand-thumbs-down-fill')
    );
    expect(icon)
      .withContext('Should show thumbs-down icon when shortage')
      .toBeTruthy();

    const altIcon = fixture.debugElement.query(
      By.css('.resource-name .bi-hand-thumbs-up-fill')
    );
    expect(altIcon)
      .withContext('Should not show thumbs-up icon when shortage')
      .toBeNull();
  });

  it('should show thumbs-up icon when isShortage() is false', () => {
    const mockRecord: ProductionRecord = {
      resource: mockResource,
      amount: 150, // more than consumption
      consumption: 100,
    };
    fixture.componentRef.setInput('productionRecord', mockRecord);
    fixture.detectChanges();

    const icon = fixture.debugElement.query(
      By.css('.resource-name .bi-hand-thumbs-up-fill')
    );
    expect(icon)
      .withContext('Should show thumbs-up icon when not shortage')
      .toBeTruthy();

    const altIcon = fixture.debugElement.query(
      By.css('.resource-name .bi-hand-thumbs-down-fill')
    );
    expect(altIcon)
      .withContext('Should not show thumbs-down icon when not shortage')
      .toBeNull();
  });
});
