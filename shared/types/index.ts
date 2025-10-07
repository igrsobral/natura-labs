// Core data types for the Natura Labs Dashboard

export interface SalesData {
  brands: Brand[];
  dateRange: string[];
}

export interface Brand {
  name: string;
  categories: Category[];
}

export interface Category {
  name: string;
  sales: (number | null)[];
}

export interface ChartConfig {
  type: 'line' | 'bar';
  comparisonMode: 'week-over-week' | 'cumulative';
  showFormulas: boolean;
}

export interface TableFilters {
  selectedBrands: string[];
  selectedCategories: string[];
  dateRange: [number, number];
}

export interface AIQuery {
  query: string;
  timestamp: Date;
  response?: string;
}

// Additional utility types for data processing
export interface ProcessedChartData {
  labels: string[];
  datasets: ChartDataset[];
  formulas?: FormulaData[];
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  brandName: string;
  categoryName: string;
}

export interface FormulaData {
  label: string;
  formula: string;
  value: number | null;
  latexFormula: string;
}

export interface ProcessedTableData {
  headers: string[];
  rows: TableRow[];
  totals: TableTotals;
}

export interface TableRow {
  brand: string;
  category: string;
  values: (number | null)[];
  total: number | null;
}

export interface TableTotals {
  byWeek: (number | null)[];
  grandTotal: number | null;
}

// Error and loading state types
export interface DataError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  error: DataError | null;
}

// UI state types
export interface UIState {
  activeTab: 'charts' | 'tables' | 'ai';
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}