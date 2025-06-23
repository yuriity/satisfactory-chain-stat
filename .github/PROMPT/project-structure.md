# Project Structure Guide

> **See also:** [Components Guide](components.md) | [Development Workflow](development-workflow.md)

## 📁 Project Structure

Keep a **logical and predictable** folder structure:

```text
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
```

## 📌 Organization Rules

- **Group by feature over type when feature grows.**
- **Keep related files close together.**
- **Use barrel exports (index.ts) judiciously.**

## 🔥 Final Thoughts

1. **Embrace signal-based reactivity** - Move away from observables where possible.
2. **Master ZonelessChangeDetection** - Understand when to manually trigger change detection.
3. **Use Bootstrap 5 correctly** - Leverage its utility classes and components.
4. **Keep components focused and small** - Single responsibility principle.
5. **Test thoroughly** - Ensure all code paths are tested.
6. **Prioritize performance** - Monitor bundle sizes and component re-renders.

---

**Related guides:** [Components Guide](components.md) | [Development Workflow](development-workflow.md)
