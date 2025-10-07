import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

interface SkeletonChartProps {
  className?: string;
  title?: boolean;
  showControls?: boolean;
  showFormulas?: boolean;
  height?: number;
  chartType?: 'line' | 'bar' | 'pie';
}

/**
 * SkeletonChart component that matches the structure of the ChartContainer component
 * Used for loading states while chart data is being fetched
 */
export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  className,
  title = true,
  showControls = true,
  showFormulas = true,
  height = 300,
  chartType = 'line'
}) => {
  return (
    <Card className={className}>
      {/* Card Header with Title and Controls */}
      {(title || showControls) && (
        <CardHeader className={title && showControls ? 'pb-4' : 'pb-6'}>
          {title && (
            <Skeleton className="h-6 w-48 mb-4" />
          )}
          {showControls && (
            <div className="flex items-center justify-between">
              {/* Chart controls skeleton */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          )}
        </CardHeader>
      )}

      {/* Chart Content */}
      <CardContent className={title || showControls ? '' : 'pt-6'}>
        {/* Chart Area */}
        <div className="flex-1 min-h-0 mb-6">
          <div 
            className="w-full  dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
            style={{ height }}
          >
            {/* Chart skeleton based on type */}
            {chartType === 'line' && <LineChartSkeleton />}
            {chartType === 'bar' && <BarChartSkeleton />}
            {chartType === 'pie' && <PieChartSkeleton />}
            
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Formulas Section */}
        {showFormulas && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Line chart skeleton pattern
 */
const LineChartSkeleton: React.FC = () => (
  <div className="absolute inset-4">
    {/* Y-axis labels */}
    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-8" />
      ))}
    </div>
    
    {/* Chart lines */}
    <div className="ml-12 mr-4 mt-4 mb-8 relative h-full">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, index) => (
          <line
            key={index}
            x1="0"
            y1={index * 40}
            x2="400"
            y2={index * 40}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:"
          />
        ))}
        
        {/* Sample line paths */}
        <path
          d="M0,160 Q100,120 200,100 T400,80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:"
        />
        <path
          d="M0,140 Q100,100 200,120 T400,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:"
        />
      </svg>
    </div>
    
    {/* X-axis labels */}
    <div className="absolute bottom-0 left-12 right-4 flex justify-between">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-12" />
      ))}
    </div>
  </div>
);

/**
 * Bar chart skeleton pattern
 */
const BarChartSkeleton: React.FC = () => (
  <div className="absolute inset-4">
    {/* Y-axis labels */}
    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-8" />
      ))}
    </div>
    
    {/* Chart bars */}
    <div className="ml-12 mr-4 mt-4 mb-8 flex items-end justify-between h-full space-x-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton 
          key={index}
          className="w-8 bg-gray-300 dark:bg-gray-600"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
    
    {/* X-axis labels */}
    <div className="absolute bottom-0 left-12 right-4 flex justify-between">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-8" />
      ))}
    </div>
  </div>
);

/**
 * Pie chart skeleton pattern
 */
const PieChartSkeleton: React.FC = () => (
  <div className="absolute inset-4 flex items-center justify-center">
    <div className="relative">
      <Skeleton className="h-48 w-48 rounded-full" />
      <Skeleton className="absolute inset-8 rounded-full dark:bg-gray-900" />
    </div>
  </div>
);

/**
 * Compact skeleton chart for smaller spaces
 */
export const SkeletonChartCompact: React.FC<Omit<SkeletonChartProps, 'showFormulas' | 'height'>> = ({
  className,
  title = false,
  showControls = false,
  chartType = 'line'
}) => {
  return (
    <SkeletonChart
      className={className}
      title={title}
      showControls={showControls}
      showFormulas={false}
      height={200}
      chartType={chartType}
    />
  );
};

export default SkeletonChart;