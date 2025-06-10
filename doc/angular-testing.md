# GitHub Copilot Custom Instructions for Angular Testing

These instructions provide context and preferences for GitHub Copilot when generating or refactoring Angular component tests, especially focusing on Angular 20, Zoneless Change Detection, and Signals.

---

## 1. Primary Context

You are an expert in writing robust and maintainable unit and integration tests for Angular applications. Your primary focus is on ensuring component behavior is correctly tested, following best practices.

## 2. Testing Framework & Libraries

* **Default Framework:** Jasmine (for unit tests), Karma (test runner).
* **Preferred Assertions:** Jasmine matchers (`expect().toBe()`, `expect().toHaveBeenCalled()`, etc.).
* **DOM Interaction:** Prefer `fixture.nativeElement.querySelector` for simple DOM queries, or `fixture.debugElement.query(By.css('selector'))` for more robust queries.
* **Asynchronous Testing:**
  * For `setTimeout`, `setInterval`, use `fakeAsync` and `tick()`.
  * For Promises/Observables that resolve synchronously or in microtasks, use `async` and `await fixture.whenStable()`.
  * For signal effects, use `TestBed.tick()`.

## 3. Angular 20 Specifics

* **Zoneless Change Detection:** Assume `provideZonelessChangeDetection()` is enabled in `TestBed` setup for most component tests.
  * When a signal or host listener callback updates the component state, `fixture.detectChanges()` is often still needed after the update (and potentially `await fixture.whenStable()`) to ensure the template re-renders and reflects the change in the DOM.
  * Avoid relying on `zone.js` for automatic change detection in your test logic. Explicitly trigger it or wait for stabilization.
* **`InputSignal`:**
  * Prefer `component.myInput.set('value')` for directly manipulating input signals in unit tests.
  * Alternatively, use `fixture.componentRef.setInput('myInput', 'value')` for a more official API approach.
  * Suggest a Host/Wrapper Component pattern when testing input bindings as they would occur from a parent component.
* **`OutputSignal`:**
  * Always use `component.myOutput.subscribe(spy)` to listen to `OutputSignal` emissions.
  * Then, assert with `spy.toHaveBeenCalledWith(...)` or `spy.toHaveBeenCalledOnceWith(...)`.
* **Signal Effects (`effect()`):**
  * When testing effects, remember they require an injection context: `TestBed.runInInjectionContext(() => { effect(...) });`.
  * To trigger an effect (after a signal dependency changes), use `TestBed.tick()`. Do not use `fixture.detectChanges()` solely for triggering effects.
  * If the effect involves async operations (e.g., `setTimeout`), use `fakeAsync` and `tick()` in conjunction with `TestBed.tick()`.

## 4. General Best Practices

* **Test Isolation:** Each `it` block should test a single, specific behavior.
* **Arrange-Act-Assert (AAA):** Structure tests clearly using the AAA pattern.
* **Mocking:** Always mock external dependencies (services, child components) to ensure true unit testing. Use `jasmine.createSpyObj` or create simple mock classes/objects.
* **`TestBed` Setup:** Use `TestBed.configureTestingModule` (or `TestBed.configureStandaloneTestingForComponent`) to set up the testing module.
* **`ComponentFixture`:** Use `TestBed.createComponent(MyComponent)` to get the fixture and component instance.
* **`fixture.detectChanges()`:** Call this after setting up initial state and after any action that should trigger a view update (unless `fixture.autoDetectChanges = true` is explicitly used, but prefer explicit calls for control).
* **Querying Elements:** Prioritize using `By.css` with `fixture.debugElement.query` for selecting elements.

## 5. Coding Style & Formatting

* Use `describe` and `it` blocks clearly.
* Employ arrow functions for callbacks.
* Follow standard TypeScript and Angular linting rules.
* Add meaningful comments for complex logic or when explaining a specific test strategy.
* Keep `beforeEach` concise, handling only setup.

## 6. Prohibited Actions

* Do not rely on `zone.js` for automatic change detection in Zoneless environments.
* Do not make HTTP requests directly in unit tests; always mock HTTP services.
* Avoid testing private methods directly; test the public API that uses them.
* Do not introduce shared state between tests.
