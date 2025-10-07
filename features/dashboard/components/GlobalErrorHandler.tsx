'use client';

import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/shared/components';
import { useGlobalErrorState, useGlobalLoadingState } from '@/store';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false
  }));
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);

  const { hasAnyError, errors, retryFailedOperations, clearAllErrors } = useGlobalErrorState();
  const { isLoading } = useGlobalLoadingState();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => {
        const newStatus = {
          isOnline: true,
          wasOffline: prev.wasOffline || !prev.isOnline
        };
        return newStatus;
      });
      
      // Handle retry outside of state setter to avoid issues
      setShowOfflineNotification(false);
      retryFailedOperations();
    };

    const handleOffline = () => {
      setNetworkStatus({
        isOnline: false,
        wasOffline: true
      });
      setShowOfflineNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryFailedOperations]);

  // Auto-hide offline notification after coming back online
  useEffect(() => {
    if (networkStatus.isOnline && showOfflineNotification) {
      const timer = setTimeout(() => {
        setShowOfflineNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [networkStatus.isOnline, showOfflineNotification]);

  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Global error caught:', error, errorInfo);

    // In a real app, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  };

  const handleRetryAll = async () => {
    clearAllErrors();
    await retryFailedOperations();
  };

  return (
    <>
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className=" rounded-lg p-6 shadow-lg flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="">Loading...</span>
          </div>
        </div>
      )}

      {/* Offline Notification */}
      {showOfflineNotification && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              {networkStatus.isOnline
                ? 'Connection restored'
                : 'You are currently offline. Some features may not work properly.'
              }
            </span>
          </div>
        </div>
      )}

      {/* Global Error Notification */}
      {hasAnyError && (
        <div className="fixed top-16 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-40 max-w-sm">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Error occurred</p>
              <p className="text-sm opacity-90">
                {errors.sales?.message || 'An unexpected error occurred'}
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleRetryAll}
                  className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                >
                  Retry
                </button>
                <button
                  onClick={clearAllErrors}
                  className="text-xs bg-transparent hover:bg-red-600 px-2 py-1 rounded border border-red-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Error Boundary */}
      <ErrorBoundary onError={handleGlobalError}>
        {children}
      </ErrorBoundary>
    </>
  );
}