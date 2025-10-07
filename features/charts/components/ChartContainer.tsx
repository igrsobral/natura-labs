'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SalesChartWithErrorBoundary } from './SalesChart';
import { ChartControls } from './ChartControls';
import { ChartFormulas } from './ChartFormulas';
import { useChartData, useChartConfig, shouldUseMobileLayout } from '../hooks';
import { useSalesStore } from '@/store/salesStore';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonChart } from '@/components/ui/skeleton-chart';
import { LoadingTransition } from '@/components/ui/loading-transition';
import { BarChart3 } from 'lucide-react';

export interface ChartContainerProps {
  className?: string;
  showControls?: boolean;
  showFormulas?: boolean;
  minHeight?: number;
  maxHeight?: number;
  title?: string;
}

/**
 * ChartContainer component with responsive layout and formula display
 * Manages chart sizing, controls, and formula rendering with consistent Card styling
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  className = '',
  showControls = true,
  showFormulas = true,
  minHeight = 300,
  maxHeight = 600,
  title
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const { salesData, isLoading } = useSalesStore();
  const { config } = useChartConfig();
  const { chartData, hasData } = useChartData(salesData, config, isLoading);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
        setIsMobile(shouldUseMobileLayout(width));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const chartHeight = React.useMemo(() => {
    if (containerSize.width === 0) return minHeight;
    
    let height = Math.max(minHeight, Math.min(maxHeight, containerSize.width * 0.6));
    
    if (isMobile) {
      height = Math.min(height, 350);
    }
    
    if (chartData.datasets.length > 4) {
      height += 40;
    }
    
    return height;
  }, [containerSize.width, minHeight, maxHeight, isMobile, chartData.datasets.length]);

  // Handle chart interactions
  const handleDataPointClick = (params: unknown) => {
    console.log('Chart data point clicked:', params);
  };

  const handleChartReady = (chart: unknown) => {
    console.log('Chart ready:', chart);
  };

  if (isLoading) {
    return (
      <SkeletonChart
        className={className}
        title={!!title}
        showControls={showControls}
        showFormulas={showFormulas}
        height={minHeight}
        chartType="line"
      />
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className={`space-y-6 ${className}`}>
        {title && (
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">
              Interactive sales data visualization with advanced analytics
            </p>
          </div>
        )}
        
        {showControls && (
          <ChartControls compact={isMobile} />
        )}
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="flex items-center justify-center p-12" style={{ minHeight }}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Chart Data Available</h3>
                <p className="text-muted-foreground max-w-md">
                  There&apos;s no sales data to visualize at the moment. Data will appear here once it&apos;s loaded.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`space-y-6 ${className}`}>
      {/* Title Section */}
      {title && (
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">
            Interactive sales data visualization with advanced analytics
          </p>
        </div>
      )}

      {/* Chart Controls - Enhanced styling */}
      {showControls && (
        <ChartControls compact={isMobile} />
      )}

      {/* Chart Card - Enhanced styling */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-0">
          <LoadingTransition
            isLoading={isLoading}
            fallback={
              <SkeletonChart
                title={false}
                showControls={false}
                showFormulas={showFormulas}
                height={chartHeight}
                chartType="line"
              />
            }
          >
            {/* Chart Header */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {config.comparisonMode === 'week-over-week' ? 'Week-over-Week Analysis' : 'Cumulative Sales Trends'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {config.type === 'line' ? 'Line chart visualization' : 'Bar chart visualization'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live Data</span>
                </div>
              </div>
            </div>

           
            <div className="px-6 pb-4">
              <div 
                className="relative bg-gradient-to-br from-background to-muted/10 rounded-lg p-4 border"
                role="region"
                aria-label={`${config.type} chart showing ${config.comparisonMode === 'week-over-week' ? 'week-over-week analysis' : 'cumulative sales trends'}`}
              >
                <SalesChartWithErrorBoundary
                  height={chartHeight}
                  onChartReady={handleChartReady}
                  onDataPointClick={handleDataPointClick}
                  className="w-full"
                />
              </div>
            </div>

            {showFormulas && config.showFormulas && hasData && salesData && (
              <div className="border-t bg-muted/30">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Calculation Details
                    </h4>
                  </div>
                  <ChartFormulas 
                    datasets={chartData.datasets}
                    dateLabels={salesData.dateRange}
                    config={config}
                    className={isMobile ? 'text-sm' : ''}
                  />
                </div>
              </div>
            )}
          </LoadingTransition>
        </CardContent>
      </Card>
    </div>
  );
};



/**
 * Chart container with responsive wrapper and elevated styling
 */
export const ResponsiveChartContainer: React.FC<ChartContainerProps> = (props) => {
  return (
    <div className="w-full h-full min-h-0">
      <ChartContainer {...props} />
    </div>
  );
};

export default ChartContainer;