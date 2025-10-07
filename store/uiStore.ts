import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChartConfig, TableFilters, UIState } from '../shared/types';

// Default date range constants
const DEFAULT_DATE_RANGE_START = 0;
const DEFAULT_DATE_RANGE_END = 7;

interface UIStore {
  // UI state
  uiState: UIState;
  
  chartConfig: ChartConfig;
  
  // Table filters
  tableFilters: TableFilters;
  
  // UI actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  
  // Chart configuration actions
  setChartType: (type: ChartConfig['type']) => void;
  setComparisonMode: (mode: ChartConfig['comparisonMode']) => void;
  setShowFormulas: (show: boolean) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  resetChartConfig: () => void;
  
  // Table filter actions
  setSelectedBrands: (brands: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  setDateRange: (range: [number, number]) => void;
  updateTableFilters: (filters: Partial<TableFilters>) => void;
  resetTableFilters: () => void;
  addBrandFilter: (brand: string) => void;
  removeBrandFilter: (brand: string) => void;
  addCategoryFilter: (category: string) => void;
  removeCategoryFilter: (category: string) => void;
  
  // Utility actions
  resetAllFilters: () => void;
  resetAllSettings: () => void;
}

// Default configurations
const defaultUIState: UIState = {
  activeTab: 'charts',
  sidebarOpen: true,
  theme: 'light'
};

const defaultChartConfig: ChartConfig = {
  type: 'line',
  comparisonMode: 'week-over-week',
  showFormulas: true
};

const defaultTableFilters: TableFilters = {
  selectedBrands: [],
  selectedCategories: [],
  dateRange: [DEFAULT_DATE_RANGE_START, DEFAULT_DATE_RANGE_END]
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      uiState: defaultUIState,
      chartConfig: defaultChartConfig,
      tableFilters: defaultTableFilters,
      
      // UI actions
      setActiveTab: (tab) => {
        set(state => ({
          uiState: { ...state.uiState, activeTab: tab }
        }));
      },
      
      setSidebarOpen: (open) => {
        set(state => ({
          uiState: { ...state.uiState, sidebarOpen: open }
        }));
      },
      
      setTheme: (theme) => {
        set(state => ({
          uiState: { ...state.uiState, theme }
        }));
      },
      
      toggleSidebar: () => {
        set(state => ({
          uiState: { ...state.uiState, sidebarOpen: !state.uiState.sidebarOpen }
        }));
      },
      
      toggleTheme: () => {
        set(state => ({
          uiState: {
            ...state.uiState,
            theme: state.uiState.theme === 'light' ? 'dark' : 'light'
          }
        }));
      },
      
      // Chart configuration actions
      setChartType: (type) => {
        set(state => ({
          chartConfig: { ...state.chartConfig, type }
        }));
      },
      
      setComparisonMode: (comparisonMode) => {
        set(state => ({
          chartConfig: { ...state.chartConfig, comparisonMode }
        }));
      },
      
      setShowFormulas: (showFormulas) => {
        set(state => ({
          chartConfig: { ...state.chartConfig, showFormulas }
        }));
      },
      
      updateChartConfig: (config) => {
        set(state => ({
          chartConfig: { ...state.chartConfig, ...config }
        }));
      },
      
      resetChartConfig: () => {
        set({ chartConfig: defaultChartConfig });
      },
      
      // Table filter actions
      setSelectedBrands: (selectedBrands) => {
        set(state => ({
          tableFilters: { ...state.tableFilters, selectedBrands }
        }));
      },
      
      setSelectedCategories: (selectedCategories) => {
        set(state => ({
          tableFilters: { ...state.tableFilters, selectedCategories }
        }));
      },
      
      setDateRange: (dateRange) => {
        set(state => ({
          tableFilters: { ...state.tableFilters, dateRange }
        }));
      },
      
      updateTableFilters: (filters) => {
        set(state => ({
          tableFilters: { ...state.tableFilters, ...filters }
        }));
      },
      
      resetTableFilters: () => {
        set({ tableFilters: defaultTableFilters });
      },
      
      addBrandFilter: (brand) => {
        set(state => {
          const selectedBrands = [...state.tableFilters.selectedBrands];
          if (!selectedBrands.includes(brand)) {
            selectedBrands.push(brand);
          }
          return {
            tableFilters: { ...state.tableFilters, selectedBrands }
          };
        });
      },
      
      removeBrandFilter: (brand) => {
        set(state => ({
          tableFilters: {
            ...state.tableFilters,
            selectedBrands: state.tableFilters.selectedBrands.filter(b => b !== brand)
          }
        }));
      },
      
      addCategoryFilter: (category) => {
        set(state => {
          const selectedCategories = [...state.tableFilters.selectedCategories];
          if (!selectedCategories.includes(category)) {
            selectedCategories.push(category);
          }
          return {
            tableFilters: { ...state.tableFilters, selectedCategories }
          };
        });
      },
      
      removeCategoryFilter: (category) => {
        set(state => ({
          tableFilters: {
            ...state.tableFilters,
            selectedCategories: state.tableFilters.selectedCategories.filter(c => c !== category)
          }
        }));
      },
      
      // Utility actions
      resetAllFilters: () => {
        set({
          tableFilters: defaultTableFilters,
          chartConfig: defaultChartConfig
        });
      },
      
      resetAllSettings: () => {
        set({
          uiState: defaultUIState,
          chartConfig: defaultChartConfig,
          tableFilters: defaultTableFilters
        });
      }
    }),
    {
      name: 'ui-store',
      // Persist all UI state
      partialize: (state) => ({
        uiState: state.uiState,
        chartConfig: state.chartConfig,
        tableFilters: state.tableFilters
      })
    }
  )
);