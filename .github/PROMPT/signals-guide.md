# Signals & ZonelessChangeDetection Guide

> **See also:** [Components Guide](components.md) | [Testing Guide](angular-testing.md)

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

### 📌 Signals Rules

- **Use signals for component state.**
- **Use computed() for derived state.**
- **Use effect() for side effects.**
- **Remember to manually trigger change detection after async operations.**

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

  private http = inject(HttpClient);

  constructor() {
    this.loadResources();
  }

  private loadResources(): void {
    this.http.get<Resource[]>("/api/resources").subscribe((data) => this.resourcesSignal.set(data));
  }
}
```

### 📌 State Management Rules

- **Use services for shared state.**
- **Keep state management simple.**
- **Use signals for reactive state.**
- **Expose read-only signals when possible.**
- **Design services around a single responsibility.**
- **Use the `providedIn: 'root'` option for singleton services.**
- **Use the `inject()` function instead of constructor injection.**

---

**Related guides:** [Components Guide](components.md) | [Testing Guide](angular-testing.md) | [Development Workflow](development-workflow.md)
