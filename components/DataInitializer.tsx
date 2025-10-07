'use client';

import React, { useEffect, useState } from 'react';
import { initializeAppData, useDataInitialization } from '@/services/dataInitializer';
import { LoadingSpinner } from '@/shared/components';
import { AlertTriangle } from 'lucide-react';

interface DataInitializerProps {
  children: React.ReactNode;
  showLoadingScreen?: boolean;
  fallbackComponent?: React.ComponentType<{ error: string }>;
}

interface InitializationState {
  isInitializing: boolean;
  initialized: boolean;
  error: string | null;
  loadTime: number;
  fromCache: boolean;
}

const DefaultErrorFallback: React.FC<{ error: string }> = ({ error }) => (
  <div className="min-h-screen  flex items-center justify-center">
    <div className="max-w-md mx-auto text-center">
      <div className="rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-red-600 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-lg font-semibold  mb-2">
          Initialization Failed
        </h2>
        <p className=" mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
);

const LoadingScreen: React.FC<{ loadTime: number; fromCache: boolean }> = ({ loadTime, fromCache }) => (
  <div className="min-h-screen  flex items-center justify-center">
    <div className="text-center">
      <div className="rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-lg font-semibold  mb-2">
          Loading Natura Labs Dashboard
        </h2>
        <p className=" mb-4">
          {fromCache ? 'Loading cached data...' : 'Fetching latest data...'}
        </p>
        {loadTime > 2000 && (
          <p className="text-sm text-gray-500">
            This is taking longer than usual...
          </p>
        )}
      </div>
    </div>
  </div>
);

export const DataInitializer: React.FC<DataInitializerProps> = ({
  children,
  showLoadingScreen = true,
  fallbackComponent: ErrorFallback = DefaultErrorFallback
}) => {
  const [state, setState] = useState<InitializationState>({
    isInitializing: true,
    initialized: false,
    error: null,
    loadTime: 0,
    fromCache: false
  });

  const { isInitialized, hasData, isLoading } = useDataInitialization();

  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, isInitializing: true, error: null }));

        const result = await initializeAppData({
          preloadData: true,
          cleanupStorage: true,
          showLoading: showLoadingScreen,
          timeout: 10000 // 10 second timeout
        });

        if (!mounted) return;

        if (result.success) {
          setState({
            isInitializing: false,
            initialized: true,
            error: null,
            loadTime: result.loadTime,
            fromCache: result.fromCache
          });
        } else {
          setState({
            isInitializing: false,
            initialized: false,
            error: result.error || 'Unknown initialization error',
            loadTime: result.loadTime,
            fromCache: false
          });
        }
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
        setState({
          isInitializing: false,
          initialized: false,
          error: errorMessage,
          loadTime: Date.now() - startTime,
          fromCache: false
        });
      }
    };

    // Only initialize if not already initialized
    if (!isInitialized) {
      initialize();
    } else {
      setState({
        isInitializing: false,
        initialized: true,
        error: null,
        loadTime: 0,
        fromCache: true
      });
    }

    return () => {
      mounted = false;
    };
  }, [isInitialized, showLoadingScreen]);

  // Show error screen if initialization failed
  if (state.error && !state.initialized) {
    return <ErrorFallback error={state.error} />;
  }

  // Show loading screen during initialization
  if (state.isInitializing && showLoadingScreen) {
    return <LoadingScreen loadTime={state.loadTime} fromCache={state.fromCache} />;
  }

  // Show loading screen if still loading data after initialization
  if (state.initialized && isLoading && !hasData && showLoadingScreen) {
    return <LoadingScreen loadTime={state.loadTime} fromCache={state.fromCache} />;
  }

  // Render children once initialized
  return <>{children}</>;
};

// Hook to get initialization status in child components
export const useInitializationStatus = () => {
  const { isInitialized, hasData, isLoading, error } = useDataInitialization();
  
  return {
    isInitialized,
    hasData,
    isLoading,
    error,
    isReady: isInitialized && hasData && !isLoading
  };
};