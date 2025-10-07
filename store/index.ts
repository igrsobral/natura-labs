import { useCallback } from 'react';
import { useSalesStore } from './salesStore';
import { useUIStore } from './uiStore';

export { useSalesStore } from './salesStore';
export { useUIStore } from './uiStore';
export { StoreProvider } from './StoreProvider';

export type {
  AIQuery, Brand,
  Category,
  ChartConfig, DataError,
  LoadingState,
  ProcessedChartData,
  ProcessedTableData, SalesData, TableFilters,
  UIState
} from '../shared/types';

export const useStores = () => {
  const salesStore = useSalesStore();
  const uiStore = useUIStore();
  
  return {
    sales: salesStore,
    ui: uiStore
  };
};

export const useGlobalLoadingState = () => {
  const isLoadingSales = useSalesStore(state => state.isLoading);
  const isRefreshing = useSalesStore(state => state.isRefreshing);
  const isInitialLoad = useSalesStore(state => state.isInitialLoad);
  
  return {
    isLoading: isLoadingSales,
    isRefreshing,
    isInitialLoad,
    hasAnyLoading: isLoadingSales
  };
};

export const useGlobalErrorState = () => {
  const salesError = useSalesStore(state => state.error);
  const canRetry = useSalesStore(state => state.canRetry());
  const retryCount = useSalesStore(state => state.retryCount);
  const maxRetries = useSalesStore(state => state.maxRetries);
  
  const clearAllErrors = useCallback(() => {
    useSalesStore.getState().setError(null);
  }, []);
  
  const retryFailedOperations = useCallback(async () => {
    const salesStore = useSalesStore.getState();
    if (salesStore.canRetry()) {
      await salesStore.retryLoad();
    }
  }, []);
  
  return {
    errors: {
      sales: salesError
    },
    hasAnyError: Boolean(salesError),
    canRetry,
    retryCount,
    maxRetries,
    clearAllErrors,
    retryFailedOperations
  };
};

export const useDataInitialization = () => {
  const isInitialLoad = useSalesStore(state => state.isInitialLoad);
  const salesData = useSalesStore(state => state.salesData);
  
  const initializeData = useCallback(async () => {
    const store = useSalesStore.getState();
    if (!store.salesData || store.isInitialLoad) {
      await store.loadSalesData();
    }
  }, []); // Empty dependencies - we get fresh state inside the callback
  
  return {
    initializeData,
    isInitialized: Boolean(salesData) && !isInitialLoad
  };
};

// Cache management helper
export const useCacheManagement = () => {
  const refreshData = useSalesStore(state => state.refreshData);
  const clearData = useSalesStore(state => state.clearData);
  
  return {
    refreshData,
    clearData
  };
};