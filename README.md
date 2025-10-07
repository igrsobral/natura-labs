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
- **AI Integration**: Mock AI assistant (ready for OpenAI Agent Kit upgrade)

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

## 🤖 Future Enhancement: OpenAI Agent Kit Integration

### Overview

The current dashboard provides an excellent foundation for integrating [OpenAI's Agent Kit](https://platform.openai.com/docs/guides/agents), which would transform the mock AI assistant into a fully functional, context-aware analytics agent.

### Agent Kit Integration Strategy

#### 1. **Contextual Data Analysis Agent**

```typescript
// Enhanced agent with OpenAI Agent Kit
import { Agent, Tool } from "@openai/agent-kit";

const salesAnalyticsAgent = new Agent({
  name: "SalesAnalyticsAgent",
  description: "Intelligent sales data analysis and visualization assistant",
  instructions: `
    You are a sales analytics expert. You have access to sales data for multiple brands and categories.
    Current context: ${JSON.stringify(currentDashboardState)}
    
    Help users:
    - Analyze sales trends and patterns
    - Generate insights from data
    - Create custom visualizations
    - Identify anomalies and opportunities
  `,
  tools: [
    chartGenerationTool,
    dataFilteringTool,
    trendAnalysisTool,
    reportGenerationTool,
  ],
});
```

#### 2. **Smart Dashboard Tools**

```typescript
// Agent tools for dashboard interaction
const dashboardTools: Tool[] = [
  {
    name: "generate_chart",
    description: "Create interactive charts based on user requirements",
    parameters: {
      type: "object",
      properties: {
        chartType: { type: "string", enum: ["line", "bar", "pie", "scatter"] },
        dataFilters: { type: "object" },
        comparisonMode: {
          type: "string",
          enum: ["week-over-week", "cumulative"],
        },
      },
    },
    function: async params => {
      // Integration with existing chart components
      return generateChartComponent(params);
    },
  },

  {
    name: "analyze_trends",
    description: "Perform statistical analysis on sales data",
    parameters: {
      type: "object",
      properties: {
        brands: { type: "array", items: { type: "string" } },
        categories: { type: "array", items: { type: "string" } },
        timeRange: { type: "string" },
      },
    },
    function: async params => {
      // Integration with existing analytics utils
      return performTrendAnalysis(params);
    },
  },

  {
    name: "filter_data",
    description: "Apply filters to the dashboard data",
    parameters: {
      type: "object",
      properties: {
        filters: { type: "object" },
        sortBy: { type: "string" },
        groupBy: { type: "string" },
      },
    },
    function: async params => {
      // Integration with existing table filtering
      return applyDataFilters(params);
    },
  },
];
```

#### 3. **Context-Aware Responses**

```typescript
// Enhanced context management
const buildAgentContext = () => ({
  currentData: useUIStore.getState().salesData,
  activeFilters: useUIStore.getState().filters,
  selectedBrands: useUIStore.getState().selectedBrands,
  chartSettings: useUIStore.getState().chartSettings,
  userPreferences: getUserPreferences(),
  dashboardState: {
    activeTab: useUIStore.getState().uiState.activeTab,
    viewMode: useUIStore.getState().uiState.viewMode,
    lastQuery: useUIStore.getState().lastQuery,
  },
});

// Agent with full dashboard context
const contextAwareAgent = new Agent({
  name: "ContextualSalesAgent",
  instructions: `
    You have full access to the current dashboard state and user preferences.
    Current context: ${JSON.stringify(buildAgentContext())}
    
    Provide contextual responses based on:
    - Currently visible data and filters
    - User's previous queries and interactions
    - Dashboard state and active views
    - Data patterns and anomalies you detect
  `,
  tools: dashboardTools,
});
```

#### 4. **Advanced Analytics Integration**

```typescript
// Integration with existing analytics utilities
const advancedAnalyticsTools: Tool[] = [
  {
    name: "detect_anomalies",
    description: "Identify unusual patterns in sales data",
    function: async params => {
      // Use existing performance monitoring
      const performanceData = PerformanceMonitor.getMetrics();
      return detectDataAnomalies(params, performanceData);
    },
  },

  {
    name: "generate_insights",
    description: "Generate business insights from current data",
    function: async params => {
      // Integration with existing data processing
      const insights = await generateBusinessInsights(params);
      return formatInsightsForDisplay(insights);
    },
  },

  {
    name: "create_report",
    description: "Generate comprehensive sales reports",
    function: async params => {
      // Use existing chart and table components
      return generateInteractiveReport(params);
    },
  },
];
```

### Implementation Roadmap

#### Phase 1: Foundation Setup

- [ ] Install and configure OpenAI Agent Kit
- [ ] Create basic agent with dashboard context
- [ ] Implement core tools (chart generation, data filtering)
- [ ] Replace mock responses with agent-generated content

#### Phase 2: Enhanced Intelligence

- [ ] Add trend analysis and anomaly detection tools
- [ ] Implement context-aware conversation memory
- [ ] Create personalized insights based on user behavior
- [ ] Add natural language query processing

#### Phase 3: Advanced Features

- [ ] Implement automated report generation
- [ ] Add predictive analytics capabilities
- [ ] Create custom visualization recommendations
- [ ] Integrate with external data sources

#### Phase 4: Production Optimization

- [ ] Implement response caching and optimization
- [ ] Add error handling and fallback mechanisms
- [ ] Create usage analytics and monitoring
- [ ] Optimize for performance and cost

### Technical Integration Points

#### Current Architecture Enhancement

```typescript
// Enhanced AI Assistant component
const AIAssistant: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const dashboardContext = buildAgentContext();

  useEffect(() => {
    // Initialize agent with current context
    const salesAgent = new Agent({
      name: "SalesAnalyticsAgent",
      instructions: buildContextualInstructions(dashboardContext),
      tools: [...dashboardTools, ...advancedAnalyticsTools],
    });

    setAgent(salesAgent);
  }, [dashboardContext]);

  const handleQuery = async (query: string) => {
    if (!agent) return "Agent not initialized";

    // Agent processes query with full dashboard context
    const response = await agent.run(query, {
      context: dashboardContext,
      tools: getRelevantTools(query),
    });

    return response;
  };

  // Rest of component implementation...
};
```

#### State Management Integration

```typescript
// Enhanced store with agent integration
const useUIStore = create<UIState>((set, get) => ({
  // Existing state...

  // Agent-specific state
  agentContext: null,
  agentHistory: [],

  // Agent actions
  updateAgentContext: context => set({ agentContext: context }),
  addToAgentHistory: interaction =>
    set(state => ({
      agentHistory: [...state.agentHistory, interaction],
    })),

  // Enhanced actions with agent integration
  setActiveTab: tab => {
    set({ uiState: { ...get().uiState, activeTab: tab } });
    // Update agent context when tab changes
    get().updateAgentContext(buildAgentContext());
  },
}));
```

### Benefits of Agent Kit Integration

#### For Users

- **Natural Language Queries**: "Show me which brand performed best last month"
- **Contextual Insights**: Agent understands current view and provides relevant analysis
- **Automated Reports**: Generate comprehensive reports with natural language summaries
- **Predictive Analytics**: Forecast trends and identify opportunities

#### For Developers

- **Structured Tool Integration**: Clean API for adding new analytics capabilities
- **Context Management**: Automatic context passing and state synchronization
- **Error Handling**: Built-in retry mechanisms and fallback responses
- **Extensibility**: Easy to add new tools and capabilities

#### For Business

- **Enhanced User Experience**: More intuitive and powerful data analysis
- **Increased Engagement**: Users can explore data through conversation
- **Better Insights**: AI-powered pattern recognition and recommendations
- **Scalability**: Agent can handle complex queries and multiple users

### Migration Strategy

#### From Current Mock to Agent Kit

1. **Gradual Replacement**: Start by replacing simple mock responses
2. **Tool-by-Tool**: Implement one agent tool at a time
3. **A/B Testing**: Compare agent responses with mock responses
4. **User Feedback**: Collect feedback and iterate on agent behavior
5. **Full Migration**: Complete transition to agent-powered assistant

This integration would transform the dashboard from a static analytics tool into an intelligent, conversational data analysis platform, significantly enhancing user experience and analytical capabilities.

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
   - Verify production build
7. Submit pull request with description

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration with auto-fix
- **Prettier**: Automatic code formatting on commit
- **Conventional Commits**: Enforced via commitlint
- **Pre-commit Hooks**: Automated quality checks with Husky
- **Pre-push Hooks**: Full validation before remote push (lint + build)

## 📝 License

This project is part of the Natura Labs Frontend Developer Test Task.

---

**Built with ❤️ using Next.js, TypeScript, and modern React patterns**
