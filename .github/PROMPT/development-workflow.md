# Development Workflow Guide

> **See also:** [Components Guide](components.md) | [Project Structure](project-structure.md)

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

# Run tests without watch mode (single run)
ng test --watch=false

# Lint code
ng lint
```

### ✅ Code Organization and Style

- Use ESLint and Prettier for consistent formatting.
- Organize imports logically:

```ts
// Angular imports first
import { Component, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

// Third-party imports
import { Chart } from "chart.js";

// Application imports
import { Resource } from "../../models/resource";
import { ResourcesService } from "../../services/resources.service";
```

## 💉 Dependency Injection Best Practices

### ✅ Using inject() Function

```ts
// ✅ GOOD: Using inject() function for dependency injection
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'scs-resource-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceManagerComponent {
  // Dependency injection with inject() - place after signals
  protected resourcesService = inject(ResourcesService);
  private logService = inject(LogService);

  // Component logic...
}
```

### 📌 Dependency Injection Rules

- **Always use inject() function instead of constructor injection.**
- **Place injected dependencies after signals in class organization.**
- **Use appropriate access modifiers (protected/private) for injected services.**
- **Keep functional dependencies (services used together) grouped together.**

---

**Related guides:** [Components Guide](components.md) | [Project Structure](project-structure.md)
