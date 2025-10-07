'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useChartData, useChartConfig, getEChartsConfig } from '../hooks';
import { 
  setupChartInteractions, 
  handleChartLoading, 
  handleChartError, 
  logChartError,
  createChartError,
  ChartErrorType,
  createEChartsInstance,
  disposeEChartsInstance,
} from '../utils';
import { useSalesStore } from '@/store/salesStore';
import { useUIStore } from '@/store/uiStore';
import { LoadingSpinner, ErrorBoundary, EmptyState } from '@/shared/components';

import type { ECharts } from 'echarts/core';

export interface SalesChartProps {
  className?: string;
  height?: number;
  onChartReady?: (chart: ECharts) => void;
  onDataPointClick?: (params: unknown) => void;
  onDataPointHover?: (params: unknown) => void;
  enableInteractions?: boolean;
  showTooltip?: boolean;
}

/**
 * SalesChart component with ECharts integration
 * Supports line and bar charts with comparison modes
 */
export const SalesChart: React.FC<SalesChartProps> = ({
  className = '',
  height = 400,
  onChartReady,
  onDataPointClick,
  onDataPointHover,
  enableInteractions = true,
  showTooltip = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const { salesData, isLoading, error } = useSalesStore();
  const { uiState } = useUIStore();
  const { config } = useChartConfig();

  const { 
    chartData, 
    hasData, 
    isEmpty,
    error: chartError 
  } = useChartData(salesData, config, isLoading, error?.message || null);

  const echartsConfig = useMemo(() => {
    if (!hasData) return null;
    
    const baseConfig = getEChartsConfig(
      config,
      chartData.labels,
      chartData.datasets,
      uiState.theme
    );

    return {
      ...baseConfig,
      tooltip: {
        ...baseConfig.tooltip,
        show: showTooltip && enableInteractions
      },
      series: baseConfig.series.map((series: { emphasis?: Record<string, unknown>; [key: string]: unknown }) => ({
        ...series,
        silent: !enableInteractions,
        emphasis: enableInteractions ? {
          ...(series.emphasis || {}),
          scale: config.type === 'bar' ? 1.05 : 1.1,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        } : undefined
      }))
    };
  }, [config, chartData, hasData, uiState.theme, enableInteractions, showTooltip]);

  useEffect(() => {
    if (!chartRef.current || !echartsConfig) return;

    try {
      if (chartInstanceRef.current) {
        disposeEChartsInstance(chartInstanceRef.current);
        chartInstanceRef.current = null;
      }

      const chart = createEChartsInstance(chartRef.current);
      if (!chart) {
        throw new Error('Failed to create ECharts instance');
      }
      
      chartInstanceRef.current = chart;

      chart.setOption(echartsConfig);

      if (enableInteractions) {
        setupChartInteractions(chart, {
          enableZoom: true,
          enableDataZoom: chartData.labels.length > 10,
          enableAnimation: true
        });

        if (onDataPointClick) {
          chart.on('click', (params) => {
            try {
              onDataPointClick(params);
            } catch (error) {
              const chartError = createChartError(
                ChartErrorType.INTERACTION_ERROR,
                'Click handler failed',
                error
              );
              logChartError(chartError, { params });
            }
          });
        }

        if (onDataPointHover) {
          chart.on('mouseover', (params) => {
            try {
              onDataPointHover(params);
            } catch (error) {
              const chartError = createChartError(
                ChartErrorType.INTERACTION_ERROR,
                'Hover handler failed',
                error
              );
              logChartError(chartError, { params });
            }
          });
        }
      }

      if (onChartReady) {
        onChartReady(chart);
      }

    } catch (error) {
      const chartError = createChartError(
        ChartErrorType.CHART_RENDERING_ERROR,
        'Failed to initialize chart',
        error
      );
      logChartError(chartError);
      
      if (chartInstanceRef.current) {
        handleChartError(
          chartInstanceRef.current, 
          chartError.message,
          () => {
            const { loadSalesData } = useSalesStore.getState();
            loadSalesData();
          }
        );
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        disposeEChartsInstance(chartInstanceRef.current);
        chartInstanceRef.current = null;
      }
    };
  }, [echartsConfig, uiState.theme, onChartReady, onDataPointClick, onDataPointHover, enableInteractions, chartData.labels.length]);

  useEffect(() => {
    if (!chartRef.current || !chartInstanceRef.current) return;

    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(chartRef.current);

    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current && echartsConfig) {
      try {
        chartInstanceRef.current.setOption(echartsConfig, true);
      } catch (error) {
        const chartError = createChartError(
          ChartErrorType.CONFIGURATION_ERROR,
          'Failed to update chart configuration',
          error
        );
        logChartError(chartError, { config });
        
        handleChartError(
          chartInstanceRef.current,
          chartError.message,
          () => {
            const { resetChartConfig } = useUIStore.getState();
            resetChartConfig();
          }
        );
      }
    }
  }, [echartsConfig, config]);

  useEffect(() => {
    if (chartInstanceRef.current) {
      handleChartLoading(chartInstanceRef.current, isLoading, 'Loading sales data...');
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || chartError) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <EmptyState
          title="Chart Error"
          description={error?.message || chartError || 'Failed to load chart data'}
          action={{
            label: 'Retry',
            onClick: () => {
              const { loadSalesData } = useSalesStore.getState();
              loadSalesData();
            }
          }}
        />
      </div>
    );
  }

  // Empty state
  if (isEmpty || !hasData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <EmptyState
          title="No Data Available"
          description="There is no sales data to display in the chart"
          action={{
            label: 'Load Sample Data',
            onClick: () => {
              const { loadSalesData } = useSalesStore.getState();
              loadSalesData();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={chartRef}
        className="w-full"
        style={{ height }}
      />
      
      <div className="absolute inset-0 pointer-events-none">
      </div>
    </div>
  );
};


export const SalesChartWithErrorBoundary: React.FC<SalesChartProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center" style={{ height: props.height || 400 }}>
          <EmptyState
            title="Chart Error"
            description="Something went wrong while rendering the chart"
            action={{
              label: 'Reload Page',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      }
    >
      <SalesChart {...props} />
    </ErrorBoundary>
  );
};

export default SalesChartWithErrorBoundary;