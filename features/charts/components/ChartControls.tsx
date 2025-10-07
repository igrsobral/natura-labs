'use client';

import React from 'react';
import { useChartConfig } from '../hooks';
import { LineChart, BarChart3, TrendingUp, ArrowUp } from 'lucide-react';

export interface ChartControlsProps {
  className?: string;
  compact?: boolean;
  showLabels?: boolean;
}

/**
 * ChartControls component for toggling chart configuration
 * Provides controls for chart type, comparison mode, and formula display
 */
export const ChartControls: React.FC<ChartControlsProps> = ({
  className = '',
  compact = false,
  showLabels = true
}) => {
  const {
    config,
    setChartType,
    setComparisonMode,
    setShowFormulas,
    isLineChart,
    isBarChart,
    isWeekOverWeek,
    isCumulative
  } = useChartConfig();

  const ControlGroup: React.FC<{
    label: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ label, children, description }) => (
    <div className={compact ? 'space-y-3' : 'space-y-2'}>
      {showLabels && (
        <div>
          <label className="block text-sm font-bold ">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`flex ${compact ? 'flex-col gap-2' : 'gap-2'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className={`
      ${compact
        ? 'space-y-6 p-6 bg-card rounded-lg border shadow-sm'
        : 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20'
      } 
      ${className}
    `}>
      {/* Chart Type Controls */}
      <ControlGroup
        label="Chart Type"
        description="Choose how to display your data"
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setChartType('line')}
            aria-pressed={isLineChart}
            className={`
              inline-flex items-center justify-center h-auto p-4 rounded-lg border-2 transition-all duration-200 font-medium
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${isLineChart
                ? 'bg-primary/10 border-primary hover:bg-primary/20 hover:border-primary/80 shadow-sm'
                : 'bg-white border-gray-200 hover:border-primary/60 hover:bg-primary/5 shadow-sm'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <LineChartIcon className={`w-5 h-5 ${isLineChart ? '' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-semibold ${isLineChart ? '' : 'text-muted-foreground'}`}>
                Line Chart
              </span>
            </div>
          </button>

          <button
            onClick={() => setChartType('bar')}
            aria-pressed={isBarChart}
            className={`
              inline-flex items-center justify-center h-auto p-4 rounded-lg border-2 transition-all duration-200 font-medium
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${isBarChart
                ? 'bg-primary/10 border-primary hover:bg-primary/20 hover:border-primary/80 shadow-sm'
                : 'bg-white border-gray-200 hover:border-primary/60 hover:bg-primary/5 shadow-sm'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <BarChartIcon className={`w-5 h-5 ${isBarChart ? '' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-semibold ${isBarChart ? '' : 'text-muted-foreground'}`}>
                Bar Chart
              </span>
            </div>
          </button>
        </div>
      </ControlGroup>

      {/* Comparison Mode Controls */}
      <ControlGroup
        label="Analysis Mode"
        description="Select comparison method"
      >
        <div className="space-y-2">
          <button
            onClick={() => setComparisonMode('week-over-week')}
            aria-pressed={isWeekOverWeek}
            className={`
              w-full inline-flex items-center justify-start h-auto p-4 rounded-lg border-2 transition-all duration-200 font-medium
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${isWeekOverWeek
                ? 'bg-primary/10 border-primary hover:bg-primary/20 hover:border-primary/80 shadow-sm'
                : 'bg-white border-gray-200 hover:border-primary/60 hover:bg-primary/5 shadow-sm'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <TrendingUpIcon className={`w-4 h-4 flex-shrink-0 ${isWeekOverWeek ? '' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <div className={`text-sm font-semibold ${isWeekOverWeek ? '' : 'text-muted-foreground'}`}>
                  Week-over-Week
                </div>
                <div className="text-xs text-muted-foreground">
                  Show % change
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setComparisonMode('cumulative')}
            aria-pressed={isCumulative}
            className={`
              w-full inline-flex items-center justify-start h-auto p-4 rounded-lg border-2 transition-all duration-200 font-medium
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${isCumulative
                ? 'bg-primary/10 border-primary hover:bg-primary/20 hover:border-primary/80 shadow-sm'
                : 'border-gray-200 hover:border-primary/60 hover:bg-primary/5 shadow-sm'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <CumulativeIcon className={`w-4 h-4 flex-shrink-0 ${isCumulative ? '' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <div className={`text-sm font-semibold ${isCumulative ? '' : 'text-muted-foreground'}`}>
                  Cumulative
                </div>
                <div className="text-xs text-muted-foreground">
                  Running totals
                </div>
              </div>
            </div>
          </button>
        </div>
      </ControlGroup>

      {/* Display Options */}
      <ControlGroup
        label="Display Options"
        description="Customize chart appearance"
      >
        <div className="space-y-3">
          <label className={`
            flex items-center gap-4 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
            ${config.showFormulas
              ? 'bg-primary/10 border-primary hover:bg-primary/20 hover:border-primary/80 shadow-sm'
              : 'bg-white border-gray-200 hover:border-primary/60 hover:bg-primary/5 shadow-sm'
            }
          `}>
            <input
              type="checkbox"
              checked={config.showFormulas}
              onChange={(e) => setShowFormulas(e.target.checked)}
              className="w-5 h-5 rounded accent-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <div className="flex-1">
              <span className={`text-sm font-semibold select-none block ${config.showFormulas ? '' : ''}`}>
                Show Formulas
              </span>
              <span className={`text-xs text-muted-foreground ${config.showFormulas ? '' : ''}`}>
                Display calculation details below chart
              </span>
            </div>
          </label>
        </div>
      </ControlGroup>
    </div>
  );
};

/**
 * Compact version of chart controls for mobile/small screens
 */
export const CompactChartControls: React.FC<Omit<ChartControlsProps, 'compact'>> = (props) => {
  return <ChartControls {...props} compact={true} />;
};

// Icon components using Lucide React
const LineChartIcon = LineChart;
const BarChartIcon = BarChart3;
const TrendingUpIcon = TrendingUp;
const CumulativeIcon = ArrowUp;

export default ChartControls;