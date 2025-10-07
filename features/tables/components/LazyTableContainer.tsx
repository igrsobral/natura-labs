import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/shared/components';
import { TableContainerFallback } from './TableContainerFallback';
import { TableErrorBoundary } from './TableErrorBoundary';

// Lazy load the table container with better error handling
const TableContainer = lazy(() =>
  import('./TableContainer')
    .then(module => ({
      default: module.TableContainer
    }))
    .catch(error => {
      console.warn('Failed to load TableContainer, using fallback:', error);
      // Return fallback component
      return { default: TableContainerFallback };
    })
);

// Loading fallback component
const TableLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64  rounded-lg border border-gray-200">
    <LoadingSpinner
      size="lg"
      text="Loading table..."
      ariaLabel="Loading data table"
    />
  </div>
);



// Lazy-loaded table container with suspense and error boundary
export const LazyTableContainer: React.FC<React.ComponentProps<typeof TableContainer>> = (props) => (
  <TableErrorBoundary>
    <Suspense fallback={<TableLoadingFallback />}>
      <TableContainer {...props} />
    </Suspense>
  </TableErrorBoundary>
);

// Export as default
export default LazyTableContainer;