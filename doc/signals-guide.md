# Angular Signals Implementation Guide

This guide outlines how signals are implemented in the Satisfactory Chain Stat application following Angular 20 best practices.

## Signal Basics

### What are Signals?

Signals are a reactive primitive in Angular that makes it easy to create reactive applications. They are a first-class alternative to RxJS streams for many use cases.

### Advantages of Signals

1. **Simplicity**: Simpler than RxJS for many common scenarios
2. **Performance**: Fine-grained updates only where needed
3. **Integration**: Work well with ZonelessChangeDetection
4. **Type Safety**: Full TypeScript support
5. **Debugging**: Easier to debug than observables

## Implementation in Our Application

### Component-Level Signals

```typescript
// Example from production-board.component.ts
protected editingNode = signal<IProductionNode | null>(null);
protected connectionsSourceNode = signal<string | null>(null);
protected contextMenuNode = signal<IProductionNode | null>(null);
```

### Service-Level Signals

```typescript
// Example from resources.service.ts
private resourcesSignal = signal<Resource[]>([]);
private loadingSignal = signal<boolean>(false);
private errorSignal = signal<string | null>(null);

// Public readonly signals
readonly resources = this.resourcesSignal.asReadonly();
readonly loading = this.loadingSignal.asReadonly();
readonly error = this.errorSignal.asReadonly();
```

### Computed Signals

```typescript
// Example from production-board.component.ts
protected nodes = computed(() => this._nodes());

protected connections = computed<Connection[]>(() => {
  const result: Connection[] = [];

  this.nodes().forEach(source => {
    source.connections.forEach(targetId => {
      const target = this.nodes().find(n => n.id === targetId);
      if (target) {
        // Calculate connection points
        result.push({
          // Connection details
        });
      }
    });
  });

  return result;
});
```

### Updating Signals

```typescript
// Simple set
this.editingNode.set(nodeToEdit);

// Update based on previous value
this._nodes.update(nodes => [...nodes, newNode]);

// Conditional update
this._nodes.update(nodes =>
  nodes.map(n => n.id === node.id ? {
    ...n,
    title: node.title,
    inputs: node.inputs,
    outputs: node.outputs
  } : n)
);
```

### Effects

```typescript
// Example of an effect
effect(() => {
  // This would run whenever activeChainId changes
  const chainId = this.activeChainId();
  if (chainId) {
    localStorage.setItem('last-active-chain', chainId);
  }
});
```

## Converting from Observables to Signals

1. **Identify Observables**: Look for Observable patterns in services and components
2. **Create Signals**: Replace Observable declarations with signals
3. **Update Logic**: Convert subscribe() calls to signal access
4. **Expose Readonly**: For services, expose readonly signals to prevent external mutation
5. **Use Computed**: For derived values, use computed signals instead of pipe/map

## Best Practices

1. **Keep Mutations Internal**: Only mutate signals within their declaring class
2. **Use Readonly**: Expose signals as readonly when used by other components
3. **Prefer Immutability**: Use immutable update patterns
4. **Minimize Dependencies**: Keep the dependency graph simple
5. **Use Computed**: For derived state, always use computed signals

## Debugging Signals

To debug signals:

1. Use `console.log(mySignal())` to log current values
2. Use DevTools to track component renders
3. Use `effect(() => { console.log('value changed:', mySignal()) })` to track changes

### Input and Output Signals

```typescript
// Example using input signals
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'scs-resource-editor',
  standalone: true,
  // Other component metadata
})
export class ResourceEditorComponent {
  // Regular input
  public resource = input<Resource>();

  // Required input (never undefined)
  public location = input.required<Location>();

  // Input with default value
  public editMode = input<'view' | 'edit'>('view');

  // Input with transform function
  public amount = input<number>(0, {
    transform: (value: number) => Math.max(0, value)
  });

  // Output signal (for events)
  public save = output<Resource>();
  public cancel = output<void>();

  // Save changes and emit event
  protected onSave(): void {
    // Processing logic
    this.save.emit(this.updatedResource);
  }

  // Cancel and emit event
  protected onCancel(): void {
    this.cancel.emit();
  }
}
```

## Best Practices for Input and Output Signals

1. **Input Signal Naming**:
   - Use clear, descriptive names that reflect the data they represent
   - Follow the same naming conventions as your regular variables

2. **Required vs Optional Inputs**:
   - Use `input.required<T>()` when the input must have a value
   - Use `input<T>()` for optional inputs that can be undefined

3. **Default Values**:
   - Provide default values for inputs that should never be undefined
   - Example: `public showHeader = input<boolean>(true);`

4. **Input Transforms**:
   - Use transforms to sanitize or normalize input values
   - Keep transforms pure and focused on a single responsibility

5. **Output Signal Naming**:
   - Name output signals after events/actions (e.g., `save`, `cancel`, `valueChange`)
   - Keep a consistent naming convention for related outputs

6. **Minimizing Outputs**:
   - Only create output signals for events that parent components need to respond to
   - Consolidate related outputs when possible

## Testing Input and Output Signals

Testing components that use input and output signals requires specific approaches:

```typescript
// Example test for a component with input and output signals
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ResourceEditorComponent } from './resource-editor';

describe('ResourceEditorComponent', () => {
  let component: ResourceEditorComponent;
  let fixture: ComponentFixture<ResourceEditorComponent>;
  let mockResource: Resource;

  beforeEach(async () => {
    mockResource = new Resource('iron_ore', 'Iron Ore', 'A common resource');

    await TestBed.configureTestingModule({
      imports: [ResourceEditorComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceEditorComponent);
    component = fixture.componentInstance;
  });

  it('should update display when input changes', () => {
    // Set input signal value
    component.resource.set(mockResource);
    fixture.detectChanges();

    // Check that UI reflects the input
    const nameElement = fixture.debugElement.query(By.css('.resource-name'));
    expect(nameElement.nativeElement.textContent).toBe('Iron Ore');
  });

  it('should apply input transform correctly', () => {
    // Test that input transform prevents negative values
    component.amount.set(-10);
    fixture.detectChanges();

    // Check that negative value was transformed to 0
    expect(component.amount()).toBe(0);
  });

  it('should emit output signal when save button is clicked', () => {
    // Set up spy on output signal
    const spy = jasmine.createSpy('saveHandler');
    component.save.subscribe(spy);

    // Set input and trigger save
    component.resource.set(mockResource);
    fixture.detectChanges();

    // Find and click save button
    const saveButton = fixture.debugElement.query(By.css('.save-button'));
    saveButton.triggerEventHandler('click');

    // Verify output was emitted with correct value
    expect(spy).toHaveBeenCalledWith(mockResource);
  });
});
```

### Best Practices for Testing Signals

1. **Set Input Values**:
   - Use `component.inputName.set(value)` to set input signal values in tests
   - Always call `fixture.detectChanges()` after setting input values

2. **Test Required Inputs**:
   - Verify that required inputs behave as expected
   - Test error cases when required inputs are not provided

3. **Test Input Transformations**:
   - Verify transforms correctly handle edge cases (negative values, null, etc.)
   - Test the behavior directly by checking the transformed value

4. **Test Output Signals**:
   - Use jasmine spies to verify output emissions
   - Test both the emission and the emitted value

5. **Test Signal Effects**:
   - Verify that effects run when their dependencies change
   - Test that computed signals update correctly

6. **Test Signal-dependent UI Updates**:
   - After changing signal values, check that UI elements update correctly
   - Test that conditional elements appear/disappear based on signal values

7. **Provide ZonelessChangeDetection**:
   - Always include `provideZonelessChangeDetection()` in your test module

## Additional Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Signal-based Components](https://angular.dev/guide/signals/signal-components)
- [Testing Signal-based Components](https://angular.dev/guide/testing/components/overview)
