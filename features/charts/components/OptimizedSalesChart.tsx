import React from 'react';
import { SalesChart, SalesChartWithErrorBoundary, type SalesChartProps } from './SalesChart';
import { reactPerformance } from '@/shared/utils/performance';

export const MemoizedSalesChart = React.memo<SalesChartProps>(
  SalesChart,
  (prevProps, nextProps) => {
    return (
      prevProps.className === nextProps.className &&
      prevProps.height === nextProps.height &&
      prevProps.enableInteractions === nextProps.enableInteractions &&
      prevProps.showTooltip === nextProps.showTooltip &&
      prevProps.onChartReady === nextProps.onChartReady &&
      prevProps.onDataPointClick === nextProps.onDataPointClick &&
      prevProps.onDataPointHover === nextProps.onDataPointHover
    );
  }
);

MemoizedSalesChart.displayName = 'MemoizedSalesChart';

export const MemoizedSalesChartWithErrorBoundary = React.memo<SalesChartProps>(
  SalesChartWithErrorBoundary,
  (prevProps, nextProps) => {
    return (
      prevProps.className === nextProps.className &&
      prevProps.height === nextProps.height &&
      prevProps.enableInteractions === nextProps.enableInteractions &&
      prevProps.showTooltip === nextProps.showTooltip &&
      prevProps.onChartReady === nextProps.onChartReady &&
      prevProps.onDataPointClick === nextProps.onDataPointClick &&
      prevProps.onDataPointHover === nextProps.onDataPointHover
    );
  }
);

MemoizedSalesChartWithErrorBoundary.displayName = 'MemoizedSalesChartWithErrorBoundary';

export const PerformanceMonitoredSalesChart = reactPerformance.withPerformanceMonitoring(
  MemoizedSalesChart,
  'SalesChart'
);

export {
  MemoizedSalesChart as OptimizedSalesChart,
  MemoizedSalesChartWithErrorBoundary as OptimizedSalesChartWithErrorBoundary,
};

export default MemoizedSalesChartWithErrorBoundary;