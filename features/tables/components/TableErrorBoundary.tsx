'use client';

import React from 'react';
import { ErrorBoundary } from '@/shared/components';
import { TableContainerError } from './TableContainerFallback';

interface TableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ onRetry?: () => void }>;
}

export const TableErrorBoundary: React.FC<TableErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent = TableContainerError
}) => {
  const handleRetry = () => {
    // In development, try to reload the page to fix HMR issues
    if (process.env.NODE_ENV === 'development') {
      window.location.reload();
    } else {
      // In production, just refresh the component
      window.location.href = window.location.href;
    }
  };

  return (
    <ErrorBoundary
      fallback={<FallbackComponent onRetry={handleRetry} />}
      onError={(error, errorInfo) => {
        // Log HMR-related errors differently
        if (error.message.includes('module factory') || error.message.includes('HMR')) {
          console.warn('HMR-related error in table component:', error);
        } else {
          console.error('Table component error:', error, errorInfo);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};