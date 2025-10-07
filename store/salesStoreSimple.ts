import { create } from 'zustand';
import type { SalesData, DataError, LoadingState } from '../shared/types';
import { dataService, DataServiceError } from '../services/dataService';

// Simplified store without persistence for testing
interface SalesStore extends LoadingState {
    salesData: SalesData | null;
    lastUpdated: Date | null;
    
    setSalesData: (data: SalesData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: DataError | null) => void;
    loadSalesData: () => Promise<void>;
}

// Load sales data using the data service
const loadSalesDataFromService = async (): Promise<SalesData> => {
    const response = await dataService.loadSalesData();
    return response.data;
};

export const useSalesStoreSimple = create<SalesStore>((set, get) => ({
    // Initial state
    salesData: null,
    isLoading: false,
    error: null,
    lastUpdated: null,

    // Actions
    setSalesData: (data: SalesData) => {
        set({
            salesData: data,
            lastUpdated: new Date(),
            error: null,
        });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setError: (error: DataError | null) => {
        set({
            error,
            isLoading: false,
        });
    },

    loadSalesData: async () => {
        const state = get();
        
        // Don't load if already loading or data exists
        if (state.isLoading || state.salesData) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const data = await loadSalesDataFromService();
            set({
                salesData: data,
                lastUpdated: new Date(),
                error: null,
                isLoading: false
            });
        } catch (error) {
            const errorMessage = error instanceof DataServiceError 
                ? error.message 
                : 'Failed to load sales data';
            
            const errorCode = error instanceof DataServiceError 
                ? error.type 
                : 'LOAD_ERROR';

            set({
                error: {
                    message: errorMessage,
                    code: errorCode,
                    details: error
                },
                isLoading: false
            });
        }
    },
}));