import { dataService } from './dataService';
import { useSalesStore } from '../store/salesStore';
import { cleanupExpiredItems, getStorageInfo } from '../shared/utils/localStorage';

// Configuration for data initialization
export const DATA_INIT_CONFIG = {
  // Whether to preload data on app startup
  PRELOAD_ON_STARTUP: true,
  
  // Whether to cleanup expired localStorage items on startup
  CLEANUP_ON_STARTUP: true,
  
  // Maximum time to wait for initial data load (in ms)
  INITIAL_LOAD_TIMEOUT: 10000,
  
  // Whether to show loading indicators during initialization
  SHOW_LOADING_INDICATORS: true,
} as const;

// Interface for initialization result
export interface DataInitializationResult {
  success: boolean;
  loadTime: number;
  fromCache: boolean;
  error?: string;
  storageInfo?: {
    available: boolean;
    used: number;
    remaining: number;
    cleanedItems?: number;
  };
}

// Data initialization class
export class DataInitializer {
  private static instance: DataInitializer;
  private initialized = false;
  private initializationPromise: Promise<DataInitializationResult> | null = null;

  private constructor() {}

  static getInstance(): DataInitializer {
    if (!DataInitializer.instance) {
      DataInitializer.instance = new DataInitializer();
    }
    return DataInitializer.instance;
  }

  // Initialize data on app startup
  async initialize(options: {
    preloadData?: boolean;
    cleanupStorage?: boolean;
    showLoading?: boolean;
    timeout?: number;
  } = {}): Promise<DataInitializationResult> {
    // Return existing initialization promise if already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return success if already initialized
    if (this.initialized) {
      return {
        success: true,
        loadTime: 0,
        fromCache: true
      };
    }

    const {
      preloadData = DATA_INIT_CONFIG.PRELOAD_ON_STARTUP,
      cleanupStorage = DATA_INIT_CONFIG.CLEANUP_ON_STARTUP,
      showLoading = DATA_INIT_CONFIG.SHOW_LOADING_INDICATORS,
      timeout = DATA_INIT_CONFIG.INITIAL_LOAD_TIMEOUT
    } = options;

    this.initializationPromise = this._performInitialization({
      preloadData,
      cleanupStorage,
      showLoading,
      timeout
    });

    const result = await this.initializationPromise;
    this.initialized = result.success;
    this.initializationPromise = null;

    return result;
  }

  private async _performInitialization(options: {
    preloadData: boolean;
    cleanupStorage: boolean;
    showLoading: boolean;
    timeout: number;
  }): Promise<DataInitializationResult> {
    const startTime = Date.now();
    let cleanedItems: number | undefined;

    try {
      // Step 1: Cleanup expired localStorage items
      if (options.cleanupStorage) {
        try {
          cleanedItems = cleanupExpiredItems();
          if (cleanedItems > 0) {
            console.log(`Cleaned up ${cleanedItems} expired localStorage items`);
          }
        } catch (error) {
          console.warn('Failed to cleanup expired localStorage items:', error);
        }
      }

      // Step 2: Get storage information
      const storageInfo = getStorageInfo();

      // Step 3: Preload data if requested
      let fromCache = false;
      if (options.preloadData) {
        const salesStore = useSalesStore.getState();

        // Check if we already have valid cached data
        if (salesStore.salesData && salesStore.isCacheValid()) {
          fromCache = true;
        } else {
          // Load data with timeout
          const loadPromise = salesStore.loadSalesData();
          
          if (options.timeout > 0) {
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Data loading timeout')), options.timeout);
            });

            await Promise.race([loadPromise, timeoutPromise]);
          } else {
            await loadPromise;
          }

          // Check if data was loaded from cache
          const cacheStatus = dataService.getCacheStatus();
          fromCache = cacheStatus.cached;
        }
      }

      const loadTime = Date.now() - startTime;

      return {
        success: true,
        loadTime,
        fromCache,
        storageInfo: {
          ...storageInfo,
          cleanedItems
        }
      };

    } catch (error) {
      const loadTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';

      console.error('Data initialization failed:', error);

      return {
        success: false,
        loadTime,
        fromCache: false,
        error: errorMessage,
        storageInfo: {
          available: false,
          used: 0,
          remaining: 0,
          cleanedItems
        }
      };
    }
  }

  // Check if data is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Reset initialization state (useful for testing)
  reset(): void {
    this.initialized = false;
    this.initializationPromise = null;
  }

  // Get current data status
  getDataStatus(): {
    initialized: boolean;
    hasData: boolean;
    cacheStatus: ReturnType<typeof dataService.getCacheStatus>;
    storeState: {
      isLoading: boolean;
      error: unknown;
      lastUpdated: Date | null;
    };
  } {
    const salesStore = useSalesStore.getState();
    
    return {
      initialized: this.initialized,
      hasData: !!salesStore.salesData,
      cacheStatus: dataService.getCacheStatus(),
      storeState: {
        isLoading: salesStore.isLoading,
        error: salesStore.error,
        lastUpdated: salesStore.lastUpdated
      }
    };
  }

  // Perform health check
  async healthCheck(): Promise<{
    dataService: { status: 'healthy' | 'degraded'; latency: number };
    storage: { available: boolean; used: number; remaining: number };
    store: { hasData: boolean; isLoading: boolean; hasError: boolean };
  }> {
    const [serviceHealth, storageInfo] = await Promise.all([
      dataService.healthCheck(),
      Promise.resolve(getStorageInfo())
    ]);

    const salesStore = useSalesStore.getState();

    return {
      dataService: serviceHealth,
      storage: storageInfo,
      store: {
        hasData: !!salesStore.salesData,
        isLoading: salesStore.isLoading,
        hasError: !!salesStore.error
      }
    };
  }
}

// Export singleton instance
export const dataInitializer = DataInitializer.getInstance();

// Utility function to initialize data with default settings
export const initializeAppData = async (
  options?: Parameters<typeof dataInitializer.initialize>[0]
): Promise<DataInitializationResult> => {
  return dataInitializer.initialize(options);
};

// Hook for React components to check initialization status
export const useDataInitialization = () => {
  const salesStore = useSalesStore();
  
  return {
    isInitialized: dataInitializer.isInitialized(),
    hasData: !!salesStore.salesData,
    isLoading: salesStore.isLoading,
    error: salesStore.error,
    initialize: initializeAppData,
    getStatus: () => dataInitializer.getDataStatus(),
    healthCheck: () => dataInitializer.healthCheck()
  };
};