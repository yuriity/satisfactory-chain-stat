# Testing Guide

> **See also:** [Components Guide](components.md) | [Signals Guide](signals-guide.md)

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
    component.incrementValue(); // Public method that updates protected signal
    fixture.detectChanges(); // Needed after signal updates
    const element = fixture.nativeElement.querySelector(".value");
    expect(element.textContent).toContain("1");
  });

  // ✅ GOOD: Testing protected state via DOM assertions
  it("should hide content when toggle is clicked", () => {
    // Initial state check via DOM
    expect(fixture.debugElement.query(By.css('.content')))
      .withContext('Content should be visible initially')
      .toBeTruthy();

    // Click the toggle button (which changes a protected signal)
    const toggleBtn = fixture.debugElement.query(By.css('.toggle-btn'));
    toggleBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify outcome via DOM, not by accessing protected property
    expect(fixture.debugElement.query(By.css('.content')))
      .withContext('Content should be hidden after clicking toggle')
      .toBeNull();
  });
});
```

### 📌 Testing Rules

- **Always include provideZonelessChangeDetection() in test modules.**
- **Remember fixture.detectChanges() after signal updates to reflect changes in the DOM.**
- **For InputSignal testing:**
  - Use `component.myInput.set('value')` or `fixture.componentRef.setInput('myInput', 'value')`.
- **For OutputSignal testing:**
  - Use `component.myOutput.subscribe(spy)` and verify with `spy.toHaveBeenCalledWith(...)`.
- **For signal effects testing:**
  - Define effects inside `TestBed.runInInjectionContext(() => { ... })`.
  - Trigger effects with `TestBed.tick()` after changing signal dependencies.
- **Follow the AAA pattern (Arrange-Act-Assert)** for clean, maintainable tests.
- **Testing protected properties:**
  - Do not expose protected properties just for testing.
  - Test through the public API, inputs/outputs, and DOM interactions.
  - Verify behavior rather than implementation details.
  - Use DOM assertions to confirm UI state instead of checking protected signals directly.
- **Use withContext for descriptive test failures:**
  - Use `withContext()` instead of passing messages directly to assertion methods.
  - Example: `expect(element).withContext('Button should be visible').toBeTruthy()`

### ✅ Test Execution Commands

```bash
# Run all tests once (no watch mode)
ng test --watch=false

# Run tests in watch mode (default)
ng test

# Run specific test file once
ng test --include="**/component-name.spec.ts" --watch=false

# Run tests with code coverage
ng test --code-coverage --watch=false

# Stop running tests in watch mode
# Use Ctrl+C in terminal or kill the process:
pkill -f "ng test"
```

---

**Related guides:** [Components Guide](components.md) | [Signals Guide](signals-guide.md)
