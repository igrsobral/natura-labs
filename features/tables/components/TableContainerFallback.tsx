'use client';

import React from 'react';
import { LoadingSpinner, EmptyState } from '@/shared/components';

interface TableContainerFallbackProps {
  className?: string;
}

export const TableContainerFallback: React.FC<TableContainerFallbackProps> = ({
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="shadow rounded-lg overflow-hidden p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 ">Loading table...</p>
        </div>
      </div>
    </div>
  );
};

export const TableContainerError: React.FC<{ 
  className?: string;
  onRetry?: () => void;
}> = ({ className = '', onRetry }) => {
  return (
    <div className={className}>
      <EmptyState
        title="Table Loading Error"
        description="There was an issue loading the table. This might be a temporary development issue."
        icon="table"
        action={onRetry ? {
          label: "Retry",
          onClick: onRetry
        } : undefined}
      />
    </div>
  );
};