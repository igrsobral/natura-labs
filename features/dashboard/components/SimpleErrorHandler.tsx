'use client';

import React from 'react';
import { ErrorBoundary } from '@/shared/components';

interface SimpleErrorHandlerProps {
  children: React.ReactNode;
}

export function SimpleErrorHandler({ children }: SimpleErrorHandlerProps) {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Global error caught:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      {children}
    </ErrorBoundary>
  );
}