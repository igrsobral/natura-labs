import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SalesData, DataError, LoadingState } from '../shared/types';
import { dataService, withRetry, DataServiceError, DataServiceErrorType } from '../services/dataService';

// Configuration constants
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000; // 1 second
const INITIAL_LOAD_DELAY_MS = 1000;
const RETRY_LOAD_DELAY_MS = 500;
const RANDOM_DELAY_FACTOR = 1500;


const NETWORK_ERROR_CHANCE = 0.05; // 5%
const TIMEOUT_ERROR_CHANCE = 0.08; // 3% (0.08 - 0.05)
const SERVER_ERROR_CHANCE = 0.1;   // 2% (0.1 - 0.08)
const VALIDATION_ERROR_CHANCE = 0.11; // 1% (0.11 - 0.1)

// Time conversion constants
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;

interface SalesStore extends LoadingState {
    // Data state
    salesData: SalesData | null;
    lastUpdated: Date | null;

    // Cache settings
    cacheExpiry: number; // in milliseconds

    // Retry logic state
    retryCount: number;
    maxRetries: number;
    retryDelay: number; // in milliseconds

    // Loading indicators
    isInitialLoad: boolean;
    isRefreshing: boolean;

    // Actions
    setSalesData: (data: SalesData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: DataError | null) => void;
    loadSalesData: () => Promise<void>;
    refreshData: () => Promise<void>;
    retryLoad: () => Promise<void>;
    clearData: () => void;

    // Cache utilities
    isCacheValid: () => boolean;
    getCacheAge: () => number;

    // Error recovery
    canRetry: () => boolean;
    getRetryDelay: () => number;
}

// Error types for better error handling
export enum DataErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Enhanced error class
class DataLoadError extends Error {
    constructor(
        message: string,
        public type: DataErrorType,
        public retryable: boolean = true,
        public details?: unknown
    ) {
        super(message);
        this.name = 'DataLoadError';
    }
}

// Load sales data using the data service
const loadSalesDataFromService = async (attempt: number = 1): Promise<SalesData> => {
    const response = await dataService.loadSalesData({
        useCache: attempt === 1, // Use cache on first attempt, bypass on retries
        forceRefresh: attempt > 1
    });
    
    return response.data;
};

const createDataError = (error: unknown, attempt: number): DataError => {
    if (error instanceof DataServiceError) {
        return {
            message: error.message,
            code: error.type,
            details: {
                retryable: error.retryable,
                attempt,
                statusCode: error.statusCode,
                originalError: error.details
            }
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            code: DataServiceErrorType.UNKNOWN_ERROR,
            details: { attempt, originalError: error }
        };
    }

    return {
        message: 'An unknown error occurred',
        code: DataServiceErrorType.UNKNOWN_ERROR,
        details: { attempt, originalError: error }
    };
};

export const useSalesStore = create<SalesStore>()(
    persist(
        (set, get) => ({
            // Initial state
            salesData: null,
            isLoading: false,
            error: null,
            lastUpdated: null,
            cacheExpiry: CACHE_EXPIRY_MS,

            // Retry logic state
            retryCount: 0,
            maxRetries: MAX_RETRIES,
            retryDelay: BASE_RETRY_DELAY_MS,

            // Loading indicators
            isInitialLoad: true,
            isRefreshing: false,

            // Actions
            setSalesData: (data: SalesData) => {
                set({
                    salesData: data,
                    lastUpdated: new Date(),
                    error: null,
                    retryCount: 0,
                    isInitialLoad: false,
                    isRefreshing: false
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setError: (error: DataError | null) => {
                set({
                    error,
                    isLoading: false,
                    isRefreshing: false
                });
            },

            loadSalesData: async () => {
                const state = get();

                if (state.salesData && state.isCacheValid()) {
                    return;
                }

                set({
                    isLoading: true,
                    error: null,
                    isRefreshing: !state.isInitialLoad
                });

                const attemptLoad = async (attempt: number): Promise<void> => {
                    try {
                        const data = await loadSalesDataFromService(attempt);
                        state.setSalesData(data);
                    } catch (error) {
                        const dataError = createDataError(error, attempt);

                        const shouldRetry = attempt < state.maxRetries &&
                            error instanceof DataServiceError &&
                            error.retryable;

                        if (shouldRetry) {
                            set({ retryCount: attempt });

                            const delay = state.getRetryDelay() * Math.pow(2, attempt - 1);

                            await new Promise(resolve => setTimeout(resolve, delay));

                            return attemptLoad(attempt + 1);
                        } else {
                            state.setError(dataError);
                        }
                    }
                };

                try {
                    await attemptLoad(1);
                } catch (error) {
                    const dataError = createDataError(error, 1);
                    state.setError(dataError);
                } finally {
                    set({ isLoading: false, isRefreshing: false });
                }
            },

            refreshData: async () => {
                set({
                    salesData: null,
                    lastUpdated: null,
                    retryCount: 0,
                    error: null
                });
                await get().loadSalesData();
            },

            retryLoad: async () => {
                const state = get();
                if (!state.canRetry()) {
                    return;
                }

                set({ error: null, retryCount: 0 });
                await state.loadSalesData();
            },

            clearData: () => {
                set({
                    salesData: null,
                    lastUpdated: null,
                    error: null,
                    isLoading: false,
                    retryCount: 0,
                    isInitialLoad: true,
                    isRefreshing: false
                });
            },

            isCacheValid: () => {
                const state = get();
                if (!state.lastUpdated || !state.salesData) {
                    return false;
                }
                return state.getCacheAge() < state.cacheExpiry;
            },

            getCacheAge: () => {
                const state = get();
                if (!state.lastUpdated) {
                    return Infinity;
                }
                
                // Handle case where lastUpdated might be a string (from localStorage)
                const lastUpdatedDate = state.lastUpdated instanceof Date 
                    ? state.lastUpdated 
                    : new Date(state.lastUpdated);
                
                return Date.now() - lastUpdatedDate.getTime();
            },

            canRetry: () => {
                const state = get();
                if (!state.error) return false;

                const details = state.error.details as any;
                return details?.retryable !== false && state.retryCount < state.maxRetries;
            },

            getRetryDelay: () => {
                return get().retryDelay;
            }
        }),
        {
            name: 'sales-store',
            partialize: (state) => ({
                salesData: state.salesData,
                lastUpdated: state.lastUpdated,
                cacheExpiry: state.cacheExpiry,
                maxRetries: state.maxRetries,
                retryDelay: state.retryDelay
            }),
            // Handle Date serialization/deserialization with SSR safety
            storage: {
                getItem: (name) => {
                    if (typeof window === 'undefined') return null;
                    try {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        const parsed = JSON.parse(str);
                        // Convert lastUpdated string back to Date object
                        if (parsed.state?.lastUpdated) {
                            parsed.state.lastUpdated = new Date(parsed.state.lastUpdated);
                        }
                        return parsed;
                    } catch (error) {
                        console.warn('Failed to parse stored data:', error);
                        return null;
                    }
                },
                setItem: (name, value) => {
                    if (typeof window === 'undefined') return;
                    try {
                        localStorage.setItem(name, JSON.stringify(value));
                    } catch (error) {
                        console.warn('Failed to store data:', error);
                    }
                },
                removeItem: (name) => {
                    if (typeof window === 'undefined') return;
                    try {
                        localStorage.removeItem(name);
                    } catch (error) {
                        console.warn('Failed to remove stored data:', error);
                    }
                }
            }
        }
    )
);