# Satisfactory Chain Stat

An application for analyzing production chains in the game Satisfactory.

Technologies used:

- Angular 20
- ZonelessChangeDetection
- Bootstrap 5
- TypeScript
- RxJS

The owner of the GitHub repo is yuriity.

# 🏗 Angular 20 / ZonelessChangeDetection / Bootstrap 5 Best Practices

This guide outlines **best practices** for building an **Angular 20** application with **ZonelessChangeDetection** and **Bootstrap 5**. The goal is **readability and maintainability**, minimizing abstraction to keep the codebase clear.

---

## 📁 Project Structure

Keep a **logical and predictable** folder structure:
```

/public # Static assets (images, icons, etc.)
/environments # Environment configurations
/src
  /app
    /components # Reusable UI components
    /pages # Page components (main content areas)
    /services # Angular services
    /models # TypeScript interfaces and classes
    /directives # Custom directives
    /pipes # Custom pipes
    /guards # Route guards
    /interfaces # TypeScript interfaces
    /utils # Utility functions
    app.config.ts # Application configuration
    app.ts # Root component
    app.html # Root component template
  main.ts # Entry point
  styles.scss # Global styles

````

📌 **Rules:**

- **Group by feature over type when feature grows.**
- **Keep related files close together.**
- **Use barrel exports (index.ts) judiciously.**

---

## ⚛ Angular Component Best Practices

### ✅ Component Structure and Organization

1. **Use standalone components when possible.**
2. **Keep components focused on a single responsibility.**
3. **Use signals for component state management.**

```ts
// ✅ GOOD: Clean, focused component with signals
import { Component, signal } from '@angular/core';

@Component({
  selector: 'scs-resource-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-card.html',
})
export class ResourceCardComponent {
  protected resourceAmount = signal(0);

  incrementAmount(): void {
    this.resourceAmount.update(current => current + 1);
  }
}
````

### ✅ Component Templates

1. **Keep templates clean and readable.**
2. **Use structural directives appropriately.**
3. **Handle null/undefined values gracefully.**

```html
<!-- ✅ GOOD: Clean template with null checks -->
<div class="card" *ngIf="resource()">
  <div class="card-header">{{ resource()?.name }}</div>
  <div class="card-body">
    <p>{{ resource()?.description || 'No description available' }}</p>
  </div>
</div>
```

📌 **Rules:**

- **Keep components small and focused.**
- **Prefer signals over subjects for reactive state.**
- **Use OnPush change detection strategy.**

---

## 🔄 ZonelessChangeDetection Best Practices

### ✅ Setting Up ZonelessChangeDetection

```ts
// app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // Other providers...
  ],
};
```

### ✅ Working with Signals and Effects

```ts
// ✅ GOOD: Using signals for reactive state
import { Component, signal, computed, effect } from "@angular/core";

@Component({
  // Component metadata
})
export class ResourceManagerComponent {
  private resources = signal<Resource[]>([]);
  protected filteredResources = computed(() => this.resources().filter((r) => r.available));

  constructor() {
    // Effect runs whenever dependencies change
    effect(() => {
      console.log("Filtered resources updated:", this.filteredResources());
    });
  }
}
```

📌 **Rules:**

- **Use signals for component state.**
- **Use computed() for derived state.**
- **Use effect() for side effects.**
- **Remember to manually trigger change detection after async operations.**

---

## 🎨 Bootstrap 5 Best Practices

### ✅ Use Bootstrap Components and Utilities

```html
<!-- ✅ GOOD: Proper use of Bootstrap classes -->
<div class="container mt-4">
  <div class="row">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">Resource Details</div>
        <div class="card-body">
          <h5 class="card-title">{{ resource().name }}</h5>
          <p class="card-text">{{ resource().description }}</p>
          <button class="btn btn-outline-primary">Details</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### ✅ Custom Styling with Bootstrap

```scss
// styles.scss - Customizing Bootstrap
$primary: #3498db;
$secondary: #2ecc71;

// Import Bootstrap after variable overrides
@import "bootstrap/scss/bootstrap";

// Additional custom styles
.resource-card {
  @extend .card;
  border-left: 4px solid $primary;
}
```

📌 **Rules:**

- **Use Bootstrap's grid system consistently.**
- **Leverage Bootstrap utilities before writing custom CSS.**
- **Use Bootstrap components (cards, modals, etc.) when possible.**
- **Customize Bootstrap variables to match your theme.**

---

## 📊 State Management Best Practices

### ✅ Using Angular Signals

```ts
// services/resources.service.ts
import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Resource } from "../models/resource";

@Injectable({
  providedIn: "root",
})
export class ResourcesService {
  private resourcesSignal = signal<Resource[]>([]);

  // Expose a read-only signal
  public resources = this.resourcesSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadResources();
  }

  private loadResources(): void {
    this.http.get<Resource[]>("/api/resources").subscribe((data) => this.resourcesSignal.set(data));
  }
}
```

📌 **Rules:**

- **Use services for shared state.**
- **Keep state management simple.**
- **Use signals for reactive state.**
- **Expose read-only signals when possible.**

---

## 🧪 Testing Best Practices

### ✅ Component Testing with ZonelessChangeDetection

```ts
// component.spec.ts
import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { YourComponent } from "./your.component";

describe("YourComponent", () => {
  let component: YourComponent;
  let fixture: ComponentFixture<YourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(YourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // Testing signals
  it("should update signal value", () => {
    component.incrementValue();
    fixture.detectChanges(); // Needed after signal updates
    const element = fixture.nativeElement.querySelector(".value");
    expect(element.textContent).toContain("1");
  });

  // Testing input signals
  it("should accept input signal value", () => {
    component.resourceInput.set({ id: '123', name: 'Iron Ore' });
    fixture.detectChanges();
    // Alternative using official API:
    // fixture.componentRef.setInput('resourceInput', { id: '123', name: 'Iron Ore' });

    expect(fixture.debugElement.query(By.css('.resource-name')).nativeElement.textContent)
      .toContain('Iron Ore');
  });

  // Testing output signals
  it("should emit from output signal", () => {
    const spy = jasmine.createSpy('outputSpy');
    component.resourceSelected.subscribe(spy);

    component.selectResource({ id: '123', name: 'Iron Ore' });

    expect(spy).toHaveBeenCalledOnceWith({ id: '123', name: 'Iron Ore' });
  });

  // Testing effects
  it("should trigger effect when signal changes", () => {
    // Setup for testing an effect (must be in injection context)
    const effectSpy = jasmine.createSpy('effectSpy');
    TestBed.runInInjectionContext(() => {
      effect(() => {
        effectSpy(component.selectedResource());
      });
    });

    component.selectResource({ id: '123', name: 'Iron Ore' });
    TestBed.tick(); // Trigger effect execution

    expect(effectSpy).toHaveBeenCalledWith({ id: '123', name: 'Iron Ore' });
  });
});
```

📌 **Rules:**

- **Always include provideZonelessChangeDetection() in test modules.**
- **Remember fixture.detectChanges() after signal updates to reflect changes in the DOM.**
- **For InputSignal testing:**
  - Use `component.myInput.set('value')` or `fixture.componentRef.setInput('myInput', 'value')`.
- **For OutputSignal testing:**
  - Use `component.myOutput.subscribe(spy)` and verify with `spy.toHaveBeenCalledWith(...)`.
- **For signal effects testing:**
  - Define effects inside `TestBed.runInInjectionContext(() => { ... })`.
  - Trigger effects with `TestBed.tick()` after changing signal dependencies.
  - Use `fakeAsync` and `tick()` for effects with async operations.
- **Follow the AAA pattern (Arrange-Act-Assert)** for clean, maintainable tests.
- **Mock external dependencies** using `jasmine.createSpyObj` or simple mock classes.
- **Use element queries appropriately:**
  - `fixture.nativeElement.querySelector()` for simple DOM queries.
  - `fixture.debugElement.query(By.css())` for more robust element selections.
- **Mock HTTP requests and services.**

---

## 🛠 Development Workflow Best Practices

### ✅ Angular CLI Commands

```bash
# Generate a new component
ng generate component components/resource-card --standalone

# Generate a service
ng generate service services/inventory

# Build for production
ng build --configuration production

# Run tests
ng test

# Lint code
ng lint
```

### ✅ Code Organization and Style

- Use ESLint and Prettier for consistent formatting.
- Organize imports logically:

```ts
// Angular imports first
import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

// Third-party imports
import { Chart } from "chart.js";

// Application imports
import { Resource } from "../../models/resource";
import { ResourcesService } from "../../services/resources.service";
```

---

## 🔥 Final Thoughts

1. **Embrace signal-based reactivity** - Move away from observables where possible.
2. **Master ZonelessChangeDetection** - Understand when to manually trigger change detection.
3. **Use Bootstrap 5 correctly** - Leverage its utility classes and components.
4. **Keep components focused and small** - Single responsibility principle.
5. **Test thoroughly** - Ensure all code paths are tested.
6. **Prioritize performance** - Monitor bundle sizes and component re-renders.

---
