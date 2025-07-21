---
description: 'Angular-specific coding standards and best practices'
applyTo: '**/*.ts, **/*.html, **/*.scss, **/*.css'
---

# Satisfactory Chain Stat

An Angular application for analyzing and optimizing production chains in the game Satisfactory. Plan your factories, track resource flows, and visualize complex production networks.

Instructions for generating high-quality Angular applications with TypeScript, using Angular Signals for state management, adhering to Angular best practices as outlined at <https://angular.dev>.

## 📚 Detailed Guides

For comprehensive information, see these specialized guides:

- **[Angular Components](PROMPT/components.md)** - Component patterns, structure, and best practices
- **[Signals & Reactivity](PROMPT/signals-guide.md)** - ZonelessChangeDetection and signals usage
- **[Testing](PROMPT/angular-testing.md)** - Testing patterns with signals and zoneless detection
- **[Bootstrap Styling](PROMPT/bootstrap-styling.md)** - Bootstrap 5 components and utilities
- **[Development Workflow](PROMPT/development-workflow.md)** - CLI commands and dependency injection

**Technologies:** Angular 20, ZonelessChangeDetection, Bootstrap 5, TypeScript, RxJS
**Owner:** yuriity

## Project Context

- Latest Angular version (use standalone components by default)
- TypeScript for type safety
- Angular CLI for project setup and scaffolding
- Follow Angular Style Guide (<https://angular.dev/style-guide>)
- Use Bootstrap 5 for consistent styling and responsive design

## 🚀 Quick Reference

### Core Principles

- **Use signals** for reactive state management
- **Standalone components** with OnPush change detection
- **inject()** function for dependency injection
- **Bootstrap 5** utilities and components
- **ZonelessChangeDetection** for optimal performance

### Component Structure

```ts
@Component({
  selector: 'scs-component',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentName {
  // 1. Input/Output signals
  input = input.required<string>();
  output = output<string>();

  // 2. Protected signals (state)
  protected state = signal('');

  // 3. Computed signals
  protected computed = computed(() => this.state());

  // 4. Dependency injection
  private service = inject(Service);

  // 5. Methods
}
```

### Testing Essentials

- Use `provideZonelessChangeDetection()` in test modules
- Call `fixture.detectChanges()` after signal updates
- Test via DOM assertions, not protected properties
- Use `withContext()` for descriptive test failures

### File Organization

```text
src/app/
  components/     # Reusable UI components
  pages/         # Page components (main content areas)
  services/      # Angular services
  models/        # TypeScript interfaces and classes
  directives/    # Custom directives
  pipes/         # Custom pipes
  guards/        # Route guards
  utils/         # Utility functions
```

## Development Standards

### Architecture

- Use standalone components unless modules are explicitly required
- Organize code by feature modules or domains for scalability
- Implement lazy loading for feature modules to optimize performance
- Use Angular's built-in dependency injection system effectively
- Structure components with a clear separation of concerns (smart vs. presentational components)
- **Always use standalone components (don't use explicit `standalone: true` as it's implied by default)**
- **Keep components focused on a single responsibility**
- **Follow consistent class member organization**

### TypeScript

- Enable strict mode in `tsconfig.json` for type safety
- Define clear interfaces and types for components, services, and models
- Use type guards and union types for robust type checking
- Implement proper error handling with RxJS operators (e.g., `catchError`)
- Use typed forms (e.g., `FormGroup`, `FormControl`) for reactive forms
- **Prefer type inference when the type is obvious**
- **Avoid the `any` type; use `unknown` when type is uncertain**
- **Use strict type checking**

### Component Design

- Follow Angular's component lifecycle hooks best practices
- **Use `input()` and `output()` functions instead of decorators**
- **Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator**
- Keep templates clean and logic in component classes or services
- Use Angular directives and pipes for reusable functionality
- **Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`**
- **Handle null/undefined values gracefully**
- **Do NOT use `ngClass`, use `class` bindings instead**
- **DO NOT use `ngStyle`, use `style` bindings instead**

### Class Member Organization

Organize class members in this consistent order to improve readability:

1. **Input Signals and Inputs**
2. **Output Signals**
3. **Protected/Public Signals** (component state)
4. **Computed Signals** (derived state)
5. **Dependency Injections** (grouped logically)
6. **Private Properties**
7. **Lifecycle Methods**
8. **Public Methods** (exposed API)
9. **Protected Methods** (used in template or subclasses)
10. **Private Methods** (internal implementation details)

### Styling

- **Use Bootstrap 5 utilities and components consistently**
- **Use Bootstrap's grid system for responsive layouts**
- **Leverage Bootstrap utilities before writing custom CSS**
- **Use Bootstrap components (cards, modals, etc.) when possible**
- **Customize Bootstrap variables to match project theme**
- Use Angular's component-level CSS encapsulation (default: ViewEncapsulation.Emulated)
- Prefer SCSS for styling with consistent theming
- Implement responsive design using CSS Grid, Flexbox, or Bootstrap utilities
- Maintain accessibility (a11y) with ARIA attributes and semantic HTML

### State Management

- **Use Angular Signals for reactive state management in components and services**
- **Leverage `signal()`, `computed()`, and `effect()` for reactive state updates**
- **Use writable signals for mutable state and computed signals for derived state**
- **Handle loading and error states with signals and proper UI feedback**
- **Use services for shared state**
- **Keep state management simple**
- **Expose read-only signals when possible**
- **Design services around a single responsibility**
- **Use the `providedIn: 'root'` option for singleton services**
- Use Angular's `AsyncPipe` to handle observables in templates when combining signals with RxJS

### Data Fetching

- Use Angular's `HttpClient` for API calls with proper typing
- Implement RxJS operators for data transformation and error handling
- **Use Angular's `inject()` function for dependency injection in standalone components**
- Implement caching strategies (e.g., `shareReplay` for observables)
- Store API response data in signals for reactive updates
- Handle API errors with global interceptors for consistent error handling

### Dependency Injection

- **Always use inject() function instead of constructor injection**
- **Place injected dependencies after signals in class organization**
- **Use appropriate access modifiers (protected/private) for injected services**
- **Keep functional dependencies (services used together) grouped together**

### Security

- Sanitize user inputs using Angular's built-in sanitization
- Implement route guards for authentication and authorization
- Use Angular's `HttpInterceptor` for CSRF protection and API authentication headers
- Validate form inputs with Angular's reactive forms and custom validators
- Follow Angular's security best practices (e.g., avoid direct DOM manipulation)

### Performance

- **Enable ZonelessChangeDetection for optimal performance**
- **Use OnPush change detection strategy with signals**
- **Remember to manually trigger change detection after async operations**
- Enable production builds with `ng build --configuration production` for optimization
- Use lazy loading for routes to reduce initial bundle size
- Optimize change detection with `OnPush` strategy and signals for fine-grained reactivity
- Use trackBy in `ngFor` loops to improve rendering performance
- **Keep components small and focused**
- **Prefer signals over subjects for reactive state**
- Implement server-side rendering (SSR) or static site generation (SSG) with Angular Universal (if specified)

### Testing

- **Always include `provideZonelessChangeDetection()` in test modules**
- **Remember `fixture.detectChanges()` after signal updates to reflect changes in the DOM**
- **Test via DOM assertions, not protected properties**
- **Use `withContext()` for descriptive test failures**
- **Follow the AAA pattern (Arrange-Act-Assert)** for clean, maintainable tests
- Write unit tests for components, services, and pipes using Jasmine and Karma
- Use Angular's `TestBed` for component testing with mocked dependencies
- Test signal-based state updates using Angular's testing utilities
- Write end-to-end tests with Cypress or Playwright (if specified)
- Mock HTTP requests using `HttpClientTestingModule`
- Ensure high test coverage for critical functionality

### Testing Rules

- **For InputSignal testing:**
  - Use `component.myInput.set('value')` or `fixture.componentRef.setInput('myInput', 'value')`
- **For OutputSignal testing:**
  - Use `component.myOutput.subscribe(spy)` and verify with `spy.toHaveBeenCalledWith(...)`
- **For signal effects testing:**
  - Define effects inside `TestBed.runInInjectionContext(() => { ... })`
  - Trigger effects with `TestBed.tick()` after changing signal dependencies
- **Testing protected properties:**
  - Do not expose protected properties just for testing
  - Test through the public API, inputs/outputs, and DOM interactions
  - Verify behavior rather than implementation details
  - Use DOM assertions to confirm UI state instead of checking protected signals directly

### Angular CLI Commands

```bash
# Generate a new component
ng generate component components/resource-card --standalone

# Generate a service
ng generate service services/inventory

# Run tests
ng test --watch=false

# Run tests in watch mode (default)
ng test

# Run specific test file once
ng test --include="**/component-name.spec.ts" --watch=false

# Run tests with code coverage
ng test --code-coverage --watch=false

# Build for production
ng build --configuration production

# Lint code
ng lint
```

## Implementation Process

1. Plan project structure and feature modules
2. Define TypeScript interfaces and models
3. Scaffold components, services, and pipes using Angular CLI
4. Implement data services and API integrations with signal-based state
5. Build reusable components with clear inputs and outputs
6. Add reactive forms and validation
7. Apply styling with Bootstrap 5 and responsive design
8. Implement lazy-loaded routes and guards
9. Add error handling and loading states using signals
10. Write unit and end-to-end tests
11. Optimize performance and bundle size

## Additional Guidelines

- Follow Angular's naming conventions (e.g., `feature.component.ts`, `feature.service.ts`)
- Use Angular CLI commands for generating boilerplate code
- Document components and services with clear JSDoc comments
- Ensure accessibility compliance (WCAG 2.1) where applicable
- Use Angular's built-in i18n for internationalization (if specified)
- Keep code DRY by creating reusable utilities and shared modules
- Use signals consistently for state management to ensure reactive updates
- **Group by feature over type when feature grows**
- **Keep related files close together**
- **Use barrel exports (index.ts) judiciously**
- **Avoid the `any` type; use `unknown` when type is uncertain**
- **Use `NgOptimizedImage` for all static images**
- **Prefer Reactive forms instead of Template-driven ones**

## Final Thoughts

1. **Embrace signal-based reactivity** - Move away from observables where possible
2. **Master ZonelessChangeDetection** - Understand when to manually trigger change detection
3. **Use Bootstrap 5 correctly** - Leverage its utility classes and components
4. **Keep components focused and small** - Single responsibility principle
5. **Test thoroughly** - Ensure all code paths are tested
6. **Prioritize performance** - Monitor bundle sizes and component re-renders

---

**🔗 Detailed guides available in `.github/PROMPT/` directory**
