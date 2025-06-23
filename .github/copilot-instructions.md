# Satisfactory Chain Stat

An application for analyzing p---

## 📚 Detailed Guides

For comprehensive information, see these specialized guides:

- **[Angular Components](PROMPT/components.md)** - Component patterns, structure, and best practices
- **[Signals & Reactivity](PROMPT/signals-guide.md)** - ZonelessChangeDetection and signals usage
- **[Testing](PROMPT/angular-testing.md)** - Testing patterns with signals and zoneless detection
- **[Bootstrap Styling](PROMPT/bootstrap-styling.md)** - Bootstrap 5 components and utilities
- **[Development Workflow](PROMPT/development-workflow.md)** - CLI commands and dependency injection
- **[Project Structure](PROMPT/project-structure.md)** - File organization and architectureuction chains in the game Satisfactory.

**Technologies:** Angular 20, ZonelessChangeDetection, Bootstrap 5, TypeScript, RxJS
**Owner:** yuriity

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
```
src/app/
  components/     # Reusable UI components
  pages/         # Page components
  services/      # Angular services
  models/        # TypeScript interfaces
  utils/         # Utility functions
```

---

**� Detailed guides available in `.github/PROMPT/` directory**
