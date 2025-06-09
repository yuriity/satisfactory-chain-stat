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

## Additional Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Signal-based Components](https://angular.dev/guide/signals/signal-components)
