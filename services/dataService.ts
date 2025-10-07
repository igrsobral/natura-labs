import { sampleData } from '@/data/sampleData';
import type { SalesData } from '../shared/types';

// Configuration constants
export const DATA_SERVICE_CONFIG = {
  // Delay ranges for realistic loading simulation
  MIN_DELAY_MS: 800,
  MAX_DELAY_MS: 2500,
  RETRY_DELAY_MS: 1000,

  // Error simulation probabilities
  NETWORK_ERROR_CHANCE: 0.05,    // 5%
  TIMEOUT_ERROR_CHANCE: 0.03,    // 3%
  SERVER_ERROR_CHANCE: 0.02,     // 2%
  VALIDATION_ERROR_CHANCE: 0.01, // 1%

  // Cache settings
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const;

// Error types for better error handling
export enum DataServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Enhanced error class for data service operations
export class DataServiceError extends Error {
  constructor(
    message: string,
    public type: DataServiceErrorType,
    public retryable: boolean = true,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DataServiceError';
  }
}

// Interface for data service response
export interface DataServiceResponse<T> {
  data: T;
  metadata: {
    timestamp: Date;
    source: string;
    cached: boolean;
    loadTime: number;
  };
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

// Simple in-memory cache
class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number = DATA_SERVICE_CONFIG.CACHE_DURATION_MS): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  getMetadata(key: string): { timestamp: Date; expiresAt: Date } | null {
    const entry = this.cache.get(key);
    return entry ? { timestamp: entry.timestamp, expiresAt: entry.expiresAt } : null;
  }
}

// Global cache instance
const dataCache = new DataCache();

// Utility functions
const randomDelay = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const simulateNetworkDelay = async (): Promise<void> => {
  const delay = randomDelay(
    DATA_SERVICE_CONFIG.MIN_DELAY_MS,
    DATA_SERVICE_CONFIG.MAX_DELAY_MS
  );
  await new Promise(resolve => setTimeout(resolve, delay));
};

const shouldSimulateError = (): DataServiceErrorType | null => {
  const random = Math.random();

  if (random < DATA_SERVICE_CONFIG.NETWORK_ERROR_CHANCE) {
    return DataServiceErrorType.NETWORK_ERROR;
  }

  if (random < DATA_SERVICE_CONFIG.NETWORK_ERROR_CHANCE + DATA_SERVICE_CONFIG.TIMEOUT_ERROR_CHANCE) {
    return DataServiceErrorType.TIMEOUT_ERROR;
  }

  if (random < DATA_SERVICE_CONFIG.NETWORK_ERROR_CHANCE + DATA_SERVICE_CONFIG.TIMEOUT_ERROR_CHANCE + DATA_SERVICE_CONFIG.SERVER_ERROR_CHANCE) {
    return DataServiceErrorType.SERVER_ERROR;
  }

  if (random < DATA_SERVICE_CONFIG.NETWORK_ERROR_CHANCE + DATA_SERVICE_CONFIG.TIMEOUT_ERROR_CHANCE + DATA_SERVICE_CONFIG.SERVER_ERROR_CHANCE + DATA_SERVICE_CONFIG.VALIDATION_ERROR_CHANCE) {
    return DataServiceErrorType.VALIDATION_ERROR;
  }

  return null;
};

const createErrorFromType = (errorType: DataServiceErrorType): DataServiceError => {
  switch (errorType) {
    case DataServiceErrorType.NETWORK_ERROR:
      return new DataServiceError(
        'Network connection failed. Please check your internet connection.',
        DataServiceErrorType.NETWORK_ERROR,
        true,
        0
      );

    case DataServiceErrorType.TIMEOUT_ERROR:
      return new DataServiceError(
        'Request timed out. The server is taking too long to respond.',
        DataServiceErrorType.TIMEOUT_ERROR,
        true,
        408
      );

    case DataServiceErrorType.SERVER_ERROR:
      return new DataServiceError(
        'Server temporarily unavailable. Please try again later.',
        DataServiceErrorType.SERVER_ERROR,
        true,
        503
      );

    case DataServiceErrorType.VALIDATION_ERROR:
      return new DataServiceError(
        'Invalid data format received from server.',
        DataServiceErrorType.VALIDATION_ERROR,
        false,
        422
      );

    default:
      return new DataServiceError(
        'An unknown error occurred.',
        DataServiceErrorType.UNKNOWN_ERROR,
        true
      );
  }
};

// Validate sales data structure
const validateSalesData = (data: unknown): data is SalesData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const salesData = data as { brands?: unknown; dateRange?: unknown };

  if (!Array.isArray(salesData.brands) || !Array.isArray(salesData.dateRange)) {
    return false;
  }

  // Validate brands structure
  for (const brand of salesData.brands) {
    if (!brand.name || typeof brand.name !== 'string') {
      return false;
    }

    if (!Array.isArray(brand.categories)) {
      return false;
    }

    for (const category of brand.categories) {
      if (!category.name || typeof category.name !== 'string') {
        return false;
      }

      if (!Array.isArray(category.sales)) {
        return false;
      }

      // Validate sales data (should be numbers or null)
      for (const sale of category.sales) {
        if (sale !== null && typeof sale !== 'number') {
          return false;
        }
      }
    }
  }

  // Validate date range
  for (const date of salesData.dateRange) {
    if (typeof date !== 'string') {
      return false;
    }

    // Accept both date format (YYYY-MM-DD) and week format (Week N)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) && !/^Week \d+$/.test(date)) {
      return false;
    }
  }

  return true;
};

// Main data service class
export class DataService {
  private static instance: DataService;

  private constructor() { }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Load sales data with caching and error simulation
  async loadSalesData(options: {
    useCache?: boolean;
    forceRefresh?: boolean;
  } = {}): Promise<DataServiceResponse<SalesData>> {
    const { useCache = true, forceRefresh = false } = options;
    const cacheKey = 'sales-data';
    const startTime = Date.now();

    // Check cache first (unless force refresh is requested)
    if (useCache && !forceRefresh && dataCache.has(cacheKey)) {
      const cachedData = dataCache.get<SalesData>(cacheKey);
      const cacheMetadata = dataCache.getMetadata(cacheKey);

      if (cachedData && cacheMetadata) {
        return {
          data: cachedData,
          metadata: {
            timestamp: cacheMetadata.timestamp,
            source: 'cache',
            cached: true,
            loadTime: Date.now() - startTime
          }
        };
      }
    }

    // Simulate network delay
    await simulateNetworkDelay();

    // Check for simulated errors
    const errorType = shouldSimulateError();
    if (errorType) {
      throw createErrorFromType(errorType);
    }

    // Load and validate data
    try {
      const rawData = { ...sampleData };

      if (!validateSalesData(rawData)) {
        throw new DataServiceError(
          'Invalid data structure received',
          DataServiceErrorType.VALIDATION_ERROR,
          false
        );
      }

      const salesData = rawData as SalesData;

      // Cache the data
      if (useCache) {
        dataCache.set(cacheKey, salesData);
      }

      return {
        data: salesData,
        metadata: {
          timestamp: new Date(),
          source: 'api',
          cached: false,
          loadTime: Date.now() - startTime
        }
      };

    } catch (error) {
      if (error instanceof DataServiceError) {
        throw error;
      }

      throw new DataServiceError(
        'Failed to process sales data',
        DataServiceErrorType.UNKNOWN_ERROR,
        true,
        undefined,
        error
      );
    }
  }

  // Refresh data (bypass cache)
  async refreshSalesData(): Promise<DataServiceResponse<SalesData>> {
    return this.loadSalesData({ forceRefresh: true });
  }

  // Get cache status
  getCacheStatus(key: string = 'sales-data'): {
    cached: boolean;
    timestamp?: Date;
    expiresAt?: Date;
    age?: number;
  } {
    const metadata = dataCache.getMetadata(key);

    if (!metadata) {
      return { cached: false };
    }

    return {
      cached: true,
      timestamp: metadata.timestamp,
      expiresAt: metadata.expiresAt,
      age: Date.now() - metadata.timestamp.getTime()
    };
  }

  // Clear cache
  clearCache(): void {
    dataCache.clear();
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded'; latency: number }> {
    const startTime = Date.now();

    try {
      // Simulate a lightweight health check
      await new Promise(resolve => setTimeout(resolve, randomDelay(100, 300)));

      const latency = Date.now() - startTime;
      return {
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency
      };
    } catch {
      return {
        status: 'degraded',
        latency: Date.now() - startTime
      };
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Utility function for retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = DATA_SERVICE_CONFIG.MAX_RETRIES,
  baseDelay: number = DATA_SERVICE_CONFIG.RETRY_DELAY_MS
): Promise<T> => {
  let lastError: Error = new Error('Operation failed after retries');

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (error instanceof DataServiceError && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt > maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(DATA_SERVICE_CONFIG.RETRY_BACKOFF_MULTIPLIER, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};