# Bootstrap 5 & Styling Guide

## 🎨 Bootstrap 5 Best Practices

### ✅ Use Bootstrap Components and Utilities

```html
<!-- ✅ GOOD: Proper use of Bootstrap classes -->
<div class="container mt-4">
  <div class="row">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">Resource Details</div>
        <div class="card-body">
          <h5 class="card-title">{{ resource().name }}</h5>
          <p class="card-text">{{ resource().description }}</p>
          <button class="btn btn-outline-primary">Details</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### ✅ Custom Styling with Bootstrap

```scss
// styles.scss - Customizing Bootstrap
$primary: #3498db;
$secondary: #2ecc71;

// Import Bootstrap after variable overrides
@import "bootstrap/scss/bootstrap";

// Additional custom styles
.resource-card {
  @extend .card;
  border-left: 4px solid $primary;
}
```

### 📌 Bootstrap Rules

- **Use Bootstrap's grid system consistently.**
- **Leverage Bootstrap utilities before writing custom CSS.**
- **Use Bootstrap components (cards, modals, etc.) when possible.**
- **Customize Bootstrap variables to match your theme.**
