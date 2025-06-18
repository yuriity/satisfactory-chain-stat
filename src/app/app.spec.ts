import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { LocationsService } from './services/locations.service';

describe('App', () => {
  let locationsService: jasmine.SpyObj<LocationsService>;

  beforeEach(async () => {
    const locationsSpy = jasmine.createSpyObj(
      'LocationsService',
      ['newLocation', 'editLocation', 'deleteLocation'],
      {
        locations: jasmine.createSpy('locations').and.returnValue([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationsService, useValue: locationsSpy },
      ],
    }).compileComponents();

    locationsService = TestBed.inject(
      LocationsService
    ) as jasmine.SpyObj<LocationsService>;
  });

  xit('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Hello, satisfactory-chain-stat'
    );
  });

  it('should call locationsService.newLocation when Create Location button is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const createButton =
      fixture.debugElement.query(
        By.css('button:contains("Create Location")')
      ) || fixture.debugElement.query(By.css('button[class*="btn-success"]'));

    expect(createButton)
      .withContext('Create Location button should be present')
      .toBeTruthy();

    createButton.triggerEventHandler('click', null);

    expect(locationsService.newLocation)
      .withContext('newLocation should be called when button is clicked')
      .toHaveBeenCalledTimes(1);
  });
});
