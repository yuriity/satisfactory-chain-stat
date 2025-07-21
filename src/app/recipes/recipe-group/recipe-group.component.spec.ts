import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeGroupComponent } from './recipe-group.component';

describe('RecipeGroupComponent', () => {
  let component: RecipeGroupComponent;
  let fixture: ComponentFixture<RecipeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
