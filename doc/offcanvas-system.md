# Offcanvas System - Angular Material Dialog Style

This document explains how to use the new offcanvas system that works like Angular Material Dialog.

## Overview

The new offcanvas system provides a programmatic API for creating and managing Bootstrap offcanvas components dynamically, similar to how Angular Material Dialog works.

## Key Features

- 🚀 **Programmatic API** - Open offcanvas components with `offcanvasService.open()`
- 📤 **Data Passing** - Pass data to offcanvas components through configuration
- 🔄 **Result Handling** - Get results back through promises
- 🎯 **Type Safety** - Full TypeScript support with generics
- 🎨 **Dynamic Creation** - Components are created dynamically without templates
- 🔗 **Multiple Instances** - Handle multiple offcanvases simultaneously
- 🅱️ **Bootstrap Integration** - Uses Bootstrap's offcanvas under the hood

## Basic Usage

### 1. Create an Offcanvas Component

```typescript
import { Component } from '@angular/core';
import { BaseOffcanvasComponent } from '../base-offcanvas/base-offcanvas.component';

export interface MyOffcanvasData {
  title: string;
  message: string;
}

export interface MyOffcanvasResult {
  action: 'save' | 'cancel';
  value?: string;
}

@Component({
  selector: 'my-offcanvas',
  standalone: true,
  template: `
    <!-- Component defines the COMPLETE offcanvas content structure -->
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">{{ data?.title || 'Default Title' }}</h5>
      <button
        type="button"
        class="btn-close"
        (click)="cancel()"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <p>{{ data?.message }}</p>
      <input [(ngModel)]="inputValue" class="form-control" />
      <div class="mt-3">
        <button class="btn btn-primary me-2" (click)="save()">Save</button>
        <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
})
export class MyOffcanvasComponent extends BaseOffcanvasComponent<MyOffcanvasData, MyOffcanvasResult> {
  protected inputValue = '';

  protected save(): void {
    this.close({
      action: 'save',
      value: this.inputValue,
    });
  }

  protected cancel(): void {
    this.close({
      action: 'cancel',
    });
  }
}
```

### 2. Open the Offcanvas from a Service

```typescript
import { Injectable, inject } from '@angular/core';
import { OffcanvasService } from './offcanvas.service';
import { MyOffcanvasComponent, MyOffcanvasData, MyOffcanvasResult } from '../components/my-offcanvas.component';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  private offcanvasService = inject(OffcanvasService);

  async openEditor(title: string, message: string): Promise<string | null> {
    const offcanvasRef = this.offcanvasService.open<MyOffcanvasComponent, MyOffcanvasResult>(
      MyOffcanvasComponent,
      {
        data: { title, message } as MyOffcanvasData,
        backdrop: 'static',
        position: 'end',
        width: '400px',
      }
    );

    try {
      const result = await offcanvasRef.afterClosed();

      if (result?.action === 'save') {
        return result.value || null;
      }
      return null;
    } catch (dismissReason) {
      console.log('Offcanvas was dismissed:', dismissReason);
      return null;
    }
  }
}
```

### 3. Use in a Component

```typescript
import { Component, inject } from '@angular/core';
import { MyService } from './my.service';

@Component({
  selector: 'my-component',
  template: `
    <button (click)="openEditor()" class="btn btn-primary">
      Open Editor
    </button>
  `,
})
export class MyComponent {
  private myService = inject(MyService);

  async openEditor(): void {
    const result = await this.myService.openEditor(
      'Edit Something',
      'Please enter a value:'
    );

    if (result) {
      console.log('User entered:', result);
    } else {
      console.log('User cancelled');
    }
  }
}
```

## Configuration Options

```typescript
interface OffcanvasConfig<T = any> {
  data?: T;                           // Data to pass to the component
  backdrop?: 'static' | boolean;      // Bootstrap backdrop behavior
  keyboard?: boolean;                 // Enable/disable keyboard ESC key
  scroll?: boolean;                   // Allow body scroll when offcanvas is open
  width?: string;                     // Custom width (e.g., '400px', '50%')
  position?: 'start' | 'end' | 'top' | 'bottom'; // Offcanvas position
  panelClass?: string | string[];     // Additional CSS classes
}
```

## API Reference

### OffcanvasService

#### `open<T, R>(component: Type<T>, config?: OffcanvasConfig): OffcanvasRef<R>`

Opens an offcanvas component programmatically.

#### `closeAll(): void`

Closes all open offcanvases.

### OffcanvasRef

#### `close(result?: R): void`

Closes the offcanvas and resolves `afterClosed()` with the result.

#### `dismiss(reason?: any): void`

Dismisses the offcanvas and resolves `afterDismissed()` with the reason.

#### `afterClosed(): Promise<R | undefined>`

Promise that resolves when the offcanvas is closed with a result.

#### `afterDismissed(): Promise<any>`

Promise that resolves when the offcanvas is dismissed.

### BaseOffcanvasComponent

#### Properties

- `data?: T` - Data passed from the opening component
- `offcanvasRef?: OffcanvasRef<R>` - Reference to the offcanvas

#### Methods

- `close(result?: R): void` - Close with a result
- `dismiss(reason?: any): void` - Dismiss with a reason

## Best Practices

1. **Always extend BaseOffcanvasComponent** for your offcanvas components
2. **Use TypeScript interfaces** for data and result types
3. **Handle both close and dismiss scenarios** in your calling code
4. **Use async/await** for cleaner promise handling
5. **Provide meaningful close reasons** for better debugging
6. **Clean up resources** in the offcanvas component if needed

## Important Notes

### ⚠️ Component Template Structure

**The offcanvas component template must include the complete Bootstrap offcanvas structure:**

- `<div class="offcanvas-header">` - Contains title and close button
- `<div class="offcanvas-body">` - Contains the main content

The `OffcanvasService` creates a minimal wrapper and lets your component define the complete content structure. This prevents duplicate headers and gives you full control over the layout.

**✅ Correct Structure:**

```html
<!-- Your component template -->
<div class="offcanvas-header">
  <h5 class="offcanvas-title">Your Title</h5>
  <button type="button" class="btn-close" (click)="close()" aria-label="Close"></button>
</div>
<div class="offcanvas-body">
  <!-- Your content here -->
</div>
```

**❌ Incorrect - Don't do this:**

```html
<!-- This would create duplicate headers -->
<div class="offcanvas-body">
  <!-- Content without proper header structure -->
</div>
```

---

## Migration from Old System

The old system used signals and manual DOM manipulation:

```typescript
// OLD WAY ❌
this.offcanvasService.show('editLocationOffcanvas');
this.locationService.setEditableLocation(location);

// NEW WAY ✅
const result = await this.offcanvasService.open(EditLocationOffcanvasComponent, {
  data: { location },
});
```

The new system provides:

- Better type safety
- Cleaner data flow
- No need for manual DOM elements in templates
- Promise-based result handling
- Multiple instance support

### 🔧 Bootstrap Integration Details

The system properly integrates with Bootstrap's offcanvas lifecycle:

- **Opening**: Uses `bootstrapOffcanvas.show()` to display the offcanvas
- **Closing**: Uses `bootstrapOffcanvas.hide()` to properly dismiss the offcanvas
- **Event Handling**: Listens to `hidden.bs.offcanvas` event for cleanup
- **Backdrop Removal**: Automatically removes backdrop when offcanvas is closed

This ensures that:

- ✅ Backdrop is properly removed when closing
- ✅ Animations work correctly
- ✅ ESC key handling works
- ✅ Click outside to dismiss works (if enabled)
- ✅ Multiple instances don't interfere

---

## 🛠 Troubleshooting

### Backdrop Not Disappearing

**Problem:** When clicking the close button, the backdrop (`<div class="offcanvas-backdrop fade show"></div>`) doesn't disappear.

**Solution:** This was fixed in the implementation by ensuring that:

1. Our `close()` and `dismiss()` methods call `bootstrapOffcanvas.hide()`
2. We listen for the `hidden.bs.offcanvas` event before doing cleanup
3. We properly distinguish between programmatic closes and backdrop dismisses

**Why it happens:** If you directly call cleanup without properly hiding the Bootstrap offcanvas instance, the backdrop element remains in the DOM.

### Component Template Structure Issues

**Problem:** Duplicate headers or incorrect Bootstrap structure.

**Solution:** Ensure your component template includes the complete offcanvas structure:

```html
<div class="offcanvas-header">...</div>
<div class="offcanvas-body">...</div>
```

### Promises Not Resolving

**Problem:** `afterClosed()` or `afterDismissed()` promises never resolve.

**Solution:** This typically happens in tests when the Bootstrap instance is mocked. Ensure your test mocks trigger the `hidden.bs.offcanvas` event.

---
