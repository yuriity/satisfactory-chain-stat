import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLocationOffcanvasComponent } from './edit-location-offcanvas';
import { provideZonelessChangeDetection } from '@angular/core';
import { OffcanvasService } from '../../services/offcanvas.service';
import { BootstrapService } from '../../services/bootstrap-service';
import { ElementRef } from '@angular/core';

describe('EditLocationOffcanvasComponent', () => {
  let component: EditLocationOffcanvasComponent;
  let fixture: ComponentFixture<EditLocationOffcanvasComponent>;
  let offcanvasServiceSpy: jasmine.SpyObj<OffcanvasService>;
  let bootstrapServiceSpy: jasmine.SpyObj<BootstrapService>;
  let mockOffcanvas: any;

  beforeEach(async () => {
    mockOffcanvas = {
      toggle: jasmine.createSpy('toggle'),
      hide: jasmine.createSpy('hide'),
    };

    offcanvasServiceSpy = jasmine.createSpyObj('OffcanvasService', [
      'toggle',
      'toggleAction',
      'activeOffcanvasId',
    ]);
    bootstrapServiceSpy = jasmine.createSpyObj('BootstrapService', [
      'createOffcanvas',
    ]);
    bootstrapServiceSpy.createOffcanvas.and.returnValue(mockOffcanvas);

    // Set up initial values for the spies
    offcanvasServiceSpy.toggleAction.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [EditLocationOffcanvasComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: OffcanvasService, useValue: offcanvasServiceSpy },
        { provide: BootstrapService, useValue: bootstrapServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditLocationOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call offcanvasService.toggle when closeOffcanvas is called', () => {
    component.closeOffcanvas();
    expect(offcanvasServiceSpy.toggle).toHaveBeenCalledWith(
      'editLocationOffcanvas'
    );
  });

  it('should toggle offcanvas when toggle action is triggered for this offcanvas', () => {
    // Mock toggle action with count > 0 and matching offcanvas ID
    offcanvasServiceSpy.toggleAction.and.returnValue(1);
    offcanvasServiceSpy.activeOffcanvasId.and.returnValue(
      'editLocationOffcanvas'
    );

    // Force effect to run (effects run automatically in constructor)
    fixture = TestBed.createComponent(EditLocationOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Verify offcanvas instance was toggled
    expect(mockOffcanvas.toggle).toHaveBeenCalled();
  });

  it('should not toggle offcanvas when toggle action is for a different offcanvas', () => {
    // Mock toggle action with count > 0 but different offcanvas ID
    offcanvasServiceSpy.toggleAction.and.returnValue(1);
    offcanvasServiceSpy.activeOffcanvasId.and.returnValue('differentOffcanvas');

    // Force effect to run
    fixture = TestBed.createComponent(EditLocationOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Verify offcanvas instance was not toggled
    expect(mockOffcanvas.toggle).not.toHaveBeenCalled();
  });
});
