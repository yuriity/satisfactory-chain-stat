# Satisfactory Chain Stat

[![Unit Tests](https://github.com/yuriity/satisfactory-chain-stat/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/yuriity/satisfactory-chain-stat/actions/workflows/unit-tests.yml) [![Deploy to GitHub Pages](https://github.com/yuriity/satisfactory-chain-stat/actions/workflows/deploy.yml/badge.svg)](https://github.com/yuriity/satisfactory-chain-stat/actions/workflows/deploy.yml)

An Angular application for analyzing and optimizing production chains in the game Satisfactory. Plan your factories, track resource flows, and visualize complex production networks.

## 🎮 Features

- **Interactive Production Chain Planning** - Design and visualize complex factory layouts
- **Resource Flow Analysis** - Track inputs, outputs, and efficiency metrics
- **Location Management** - Organize production facilities by geographic locations
- **Data Import/Export** - Save and share your factory configurations
- **Real-time Calculations** - Instant feedback on production rates and bottlenecks

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yuriity/satisfactory-chain-stat.git
   cd satisfactory-chain-stat
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   ng serve
   ```

4. **Open your browser** and navigate to `http://localhost:42625/`

## 🛠 Technology Stack

- **Angular 20** with ZonelessChangeDetection
- **Bootstrap 5** for responsive UI components
- **TypeScript** for type-safe development
- **RxJS** for reactive programming
- **Signals** for modern state management

## 📁 Project Structure

``` bash
src/app/
├── components/     # Reusable UI components
├── pages/         # Main page components
├── services/      # Angular services for business logic
├── models/        # TypeScript interfaces and classes
├── pipes/         # Custom pipes for data transformation
├── guards/        # Route guards for navigation protection
└── utils/         # Utility functions and helpers
```

## 🧪 Development

### Running Tests

```bash
# Run all tests once
ng test --watch=false

# Run tests in watch mode (development)
ng test

# Run specific test file
ng test --include="**/component-name.spec.ts" --watch=false

# Run tests with coverage report
ng test --code-coverage --watch=false
```

### Code Generation

```bash
# Generate a new component
ng generate component components/resource-card

# Generate a new service
ng generate service services/production-calculator

# Generate a new page
ng generate component pages/factory-planner
```

### Building for Production

```bash
# Build optimized production bundle
ng build --configuration production

# Serve production build locally
npx http-server dist/satisfactory-chain-stat -p 8080
```

## 📋 Development Guidelines

This project follows strict coding standards for maintainability:

- **Use signals** for component state management
- **Prefer `inject()`** over constructor dependency injection
- **Use standalone components** with OnPush change detection
- **Follow Bootstrap 5** utility classes over custom CSS
- **Write comprehensive tests** with proper mocking
- **Use modern Angular patterns** (control flow, input/output functions)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/new-calculator`
3. **Follow the coding guidelines** outlined in the project
4. **Write tests** for new functionality
5. **Run tests:** `ng test --watch=false`
6. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Advanced recipe optimization algorithms
- [ ] Multi-floor factory planning
- [ ] Power consumption analysis
- [ ] Integration with Satisfactory game saves
- [ ] Community sharing platform

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/yuriity/satisfactory-chain-stat/issues).

---
