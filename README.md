# Natura Labs Dashboard

A comprehensive sales analytics dashboard built for the Natura Labs Frontend Developer Test Task. This project demonstrates interactive data visualization, robust error handling, and modern React architecture with TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation & Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up git commit template (optional):**

   ```bash
   pnpm setup:git
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:ui      # Run tests with UI
pnpm setup:git    # Set up git commit message template
```

## 📊 Features

### Interactive Data Visualization

- **ECharts Integration**: High-performance charts with smooth animations
- **Multiple Chart Types**: Line and bar charts with responsive design
- **Comparison Modes**: Toggle between "Week-over-Week" and "Cumulative Total" views
- **Null Data Handling**: Graceful visualization of missing data points

### Advanced Table Analytics

- **Pivot-Style Tables**: Comprehensive data analysis with @tanstack/react-table
- **Multi-Dimensional Filtering**: Filter by brands, categories, and date ranges
- **Smart Totals**: Automatic calculation excluding null values
- **Empty States**: User-friendly messages when no data matches filters

### Formula Display & Calculations

- **LaTeX Rendering**: Mathematical formulas using react-katex
- **Average Sales per Week**: `\frac{\text{Total Sales}}{\text{Weeks with Data}}`
- **Null-Safe Calculations**: Proper handling of missing data in computations

### AI Assistant Integration

- **Mock AI Interface**: Demonstrates AI/MCP integration patterns
- **Contextual Responses**: Smart responses based on current data context
- **Query Examples**: Built-in examples for user guidance

## 🏗️ Architecture

### Project Structure

```
├── app/                    # Next.js App Router
├── components/            # Shared UI components
├── features/              # Feature-based modules
│   ├── ai-assistant/      # AI interface components
│   ├── charts/           # Chart visualization
│   ├── dashboard/        # Dashboard layout
│   └── tables/           # Table components
├── hooks/                # Custom React hooks
├── shared/               # Shared utilities and types
├── store/                # Zustand state management
└── __tests__/            # Test files
```

### Key Technologies

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Charts**: ECharts + echarts-for-react
- **State**: Zustand for global state management
- **Testing**: Vitest + Testing Library
- **Math**: KaTeX for formula rendering
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Commit Standards**: Commitlint with conventional commits

### Design Patterns

- **Feature-based Architecture**: Modular organization by business domain
- **Custom Hooks**: Business logic separation from UI components
- **Error Boundaries**: Comprehensive error handling and recovery
- **Lazy Loading**: Performance optimization with code splitting
- **Type Safety**: Full TypeScript coverage with strict types

## 🔧 Data Handling

### Sample Data Structure

The dashboard uses a specific test dataset with the following structure:

```typescript
{
  brands: [
    {
      name: "Lifestyle Brand A",
      categories: [
        { name: "Fitness", sales: [120, 150, 180, null, 210] },
        { name: "Recovery", sales: [90, 100, 85, 110, null] }
      ]
    },
    {
      name: "Fashion Brand A",
      categories: [
        { name: "Supplements", sales: [300, 280, 310, 295, 330] },
        { name: "Gear", sales: [50, null, 65, 70, 80] }
      ]
    }
  ],
  dateRange: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
}
```

### Null/Invalid Data Handling

The application implements robust null data handling across all components:

#### Charts

- **Null Visualization**: Missing data points appear as gaps in line charts
- **No Crashes**: Charts render smoothly even with null values
- **Specific Positions**: Handles nulls at Fitness[Week 4], Recovery[Week 5], Gear[Week 2]

#### Tables

- **Display**: Null values shown as "-" or "N/A"
- **Calculations**: Totals automatically exclude null values
- **Filtering**: Null-safe filtering operations

#### Formulas

- **Exclusion Logic**: Average calculations exclude null values from both numerator and denominator
- **Expected Results**:
  - Fitness: (120+150+180+210)/4 = 165
  - Recovery: (90+100+85+110)/4 = 96.25
  - Supplements: (300+280+310+295+330)/5 = 303
  - Gear: (50+65+70+80)/4 = 66.25

#### Error Boundaries

- **Component-Level**: Each major feature has error boundaries
- **Graceful Degradation**: Fallback UI when components fail
- **Error Recovery**: Automatic retry mechanisms where appropriate

## 🎨 Design Philosophy

### Chart Design Decisions

1. **ECharts Selection**: Chosen for performance, customization, and null handling capabilities
2. **Color Palette**: Consistent brand colors across all visualizations
3. **Responsive Design**: Charts adapt to different screen sizes and orientations
4. **Accessibility**: Proper ARIA labels and keyboard navigation support

### Table Design Decisions

1. **Pivot Layout**: Optimized for cross-category analysis
2. **Progressive Disclosure**: Advanced filters hidden until needed
3. **Performance**: Virtualization for large datasets (future-ready)
4. **Mobile-First**: Touch-friendly interactions on mobile devices

### User Experience Principles

- **Progressive Enhancement**: Core functionality works without JavaScript
- **Loading States**: Skeleton screens and loading indicators
- **Error Recovery**: Clear error messages with actionable solutions
- **Accessibility**: WCAG 2.1 AA compliance throughout

## 🤖 AI/MCP Integration Potential

### Current Implementation

The dashboard includes a mock AI assistant that demonstrates integration patterns:

```typescript
// Example AI query handling
const handleAIQuery = (query: string) => {
  if (query.includes("Brand A trends")) {
    return "Mila would return a filtered chart for Lifestyle Brand A showing Fitness and Recovery categories";
  }
  // ... more contextual responses
};
```

### Future AI/MCP Extensions

#### 1. Natural Language Queries

```typescript
// Potential MCP integration
const mcpClient = new MCPClient({
  server: "data-analysis-server",
  capabilities: ["chart-generation", "data-filtering", "trend-analysis"]
});

// Natural language to data operations
"Show me fitness trends" → Filter(category: "Fitness") + GenerateChart()
"Compare brands this month" → GroupBy("brand") + ComparisonChart()
```

#### 2. Intelligent Data Insights

- **Anomaly Detection**: AI-powered identification of unusual patterns
- **Trend Prediction**: Forecasting based on historical data
- **Smart Recommendations**: Suggested filters and views based on user behavior

#### 3. Dynamic Dashboard Generation

- **Layout Optimization**: AI-driven dashboard layout based on data importance
- **Personalization**: User-specific dashboard configurations
- **Auto-Reporting**: Scheduled insights and summaries

#### 4. Advanced Analytics

```typescript
// MCP tool integration example
const analyticsTools = {
  "correlation-analysis": data => findCorrelations(data),
  "seasonal-patterns": data => detectSeasonality(data),
  "performance-metrics": data => calculateKPIs(data),
};
```

### Integration Architecture

```
Frontend (React) ↔ MCP Client ↔ MCP Server ↔ AI Models
                                    ↓
                              Analytics Tools
                              Data Processors
                              Visualization Generators
```

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: Feature-level workflow testing
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Visual Regression**: Chart rendering consistency

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Visual test runner
pnpm test:ui
```

## 🚀 Deployment

### Build Process

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

### Environment Requirements

- Node.js 18+
- 512MB RAM minimum
- Modern browser with ES2020 support

### Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Built-in bundle analyzer

## 🛠️ Code Quality & Git Hooks

This project uses automated code quality tools to ensure consistent, high-quality code:

### Pre-commit Hooks (Husky + lint-staged)

- **Automatic Linting**: ESLint runs on staged files with auto-fix
- **Code Formatting**: Prettier formats all staged files
- **Test Validation**: Related tests run for changed files
- **Commit Message Validation**: Enforces conventional commit format

### Pre-push Hooks

- **Full Lint Check**: Complete ESLint validation across the entire codebase
- **Test Suite**: All tests must pass before pushing
- **Build Verification**: Ensures the project builds successfully
- **Quality Gate**: Prevents broken code from reaching the remote repository

### Conventional Commits

All commit messages must follow the conventional commit format:

```
type(scope): description

feat: add new dashboard component
fix: resolve chart rendering issue
docs: update README with setup instructions
style: format code with prettier
refactor: restructure component hierarchy
test: add unit tests for data utils
chore: update dependencies
```

### Manual Quality Checks

```bash
pnpm lint         # Check for linting issues
pnpm lint:fix     # Fix linting issues automatically
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Commit using conventional commit format
4. Pre-commit hooks will automatically:
   - Lint and format your code
   - Run related tests
   - Validate commit message format
5. Push to remote repository
6. Pre-push hooks will automatically:
   - Run full lint check on entire codebase
   - Execute complete test suite
   - Verify production build
7. Submit pull request with description

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration with auto-fix
- **Prettier**: Automatic code formatting on commit
- **Conventional Commits**: Enforced via commitlint
- **Pre-commit Hooks**: Automated quality checks with Husky
- **Pre-push Hooks**: Full validation before remote push (lint + test + build)

## 📝 License

This project is part of the Natura Labs Frontend Developer Test Task.

---

**Built with ❤️ using Next.js, TypeScript, and modern React patterns**
