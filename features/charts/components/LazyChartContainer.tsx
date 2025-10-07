import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/shared/components';

const ChartContainer = lazy(() => 
  import('./ChartContainer').then(module => ({ 
    default: module.ChartContainer 
  }))
);

const ResponsiveChartContainer = lazy(() => 
  import('./ChartContainer').then(module => ({ 
    default: module.ResponsiveChartContainer 
  }))
);

const ChartLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64  rounded-lg">
    <LoadingSpinner 
      size="lg" 
      text="Loading chart..." 
      ariaLabel="Loading chart visualization"
    />
  </div>
);

export const LazyChartContainer: React.FC<React.ComponentProps<typeof ChartContainer>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <ChartContainer {...props} />
  </Suspense>
);

export const LazyResponsiveChartContainer: React.FC<React.ComponentProps<typeof ResponsiveChartContainer>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <ResponsiveChartContainer {...props} />
  </Suspense>
);

export { LazyChartContainer as default };