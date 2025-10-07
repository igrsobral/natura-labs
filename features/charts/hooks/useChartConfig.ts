import { useCallback, useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';
import type { ChartConfig } from '@/shared/types';

export interface UseChartConfigReturn {
  config: ChartConfig;
  setChartType: (type: ChartConfig['type']) => void;
  setComparisonMode: (mode: ChartConfig['comparisonMode']) => void;
  setShowFormulas: (show: boolean) => void;
  updateConfig: (updates: Partial<ChartConfig>) => void;
  resetConfig: () => void;
  isLineChart: boolean;
  isBarChart: boolean;
  isWeekOverWeek: boolean;
  isCumulative: boolean;
  canShowFormulas: boolean;
}

/**
 * Custom hook for managing chart configuration state
 * Provides convenient methods and computed properties for chart settings
 */
export const useChartConfig = (): UseChartConfigReturn => {
  const {
    chartConfig,
    setChartType: storeSetChartType,
    setComparisonMode: storeSetComparisonMode,
    setShowFormulas: storeSetShowFormulas,
    updateChartConfig,
    resetChartConfig
  } = useUIStore();

  // Memoized setters with validation
  const setChartType = useCallback((type: ChartConfig['type']) => {
    if (isValidChartType(type)) {
      storeSetChartType(type);
    }
  }, [storeSetChartType]);

  const setComparisonMode = useCallback((mode: ChartConfig['comparisonMode']) => {
    if (isValidComparisonMode(mode)) {
      storeSetComparisonMode(mode);
    }
  }, [storeSetComparisonMode]);

  const setShowFormulas = useCallback((show: boolean) => {
    storeSetShowFormulas(show);
  }, [storeSetShowFormulas]);

  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    const validatedUpdates: Partial<ChartConfig> = {};

    if (updates.type !== undefined && isValidChartType(updates.type)) {
      validatedUpdates.type = updates.type;
    }

    if (updates.comparisonMode !== undefined && isValidComparisonMode(updates.comparisonMode)) {
      validatedUpdates.comparisonMode = updates.comparisonMode;
    }

    if (updates.showFormulas !== undefined) {
      validatedUpdates.showFormulas = updates.showFormulas;
    }

    if (Object.keys(validatedUpdates).length > 0) {
      updateChartConfig(validatedUpdates);
    }
  }, [updateChartConfig]);

  const resetConfig = useCallback(() => {
    resetChartConfig();
  }, [resetChartConfig]);

  const computedProperties = useMemo(() => ({
    isLineChart: chartConfig.type === 'line',
    isBarChart: chartConfig.type === 'bar',
    isWeekOverWeek: chartConfig.comparisonMode === 'week-over-week',
    isCumulative: chartConfig.comparisonMode === 'cumulative',
    canShowFormulas: true
  }), [chartConfig]);

  return {
    config: chartConfig,
    setChartType,
    setComparisonMode,
    setShowFormulas,
    updateConfig,
    resetConfig,
    ...computedProperties
  };
};

/**
 * Validate chart type
 */
function isValidChartType(type: unknown): type is ChartConfig['type'] {
  return type === 'line' || type === 'bar';
}

/**
 * Validate comparison mode
 */
function isValidComparisonMode(mode: unknown): mode is ChartConfig['comparisonMode'] {
  return mode === 'week-over-week' || mode === 'cumulative';
}

/**
 * Get ECharts configuration based on chart config and data
 */
export function getEChartsConfig(
  config: ChartConfig,
  labels: string[],
  datasets: Array<{
    label: string;
    data: (number | null)[];
    brandName: string;
    categoryName: string;
  }>,
  theme: 'light' | 'dark' = 'light'
) {
  const isDark = theme === 'dark';
  
  // Enhanced color palette for better visual hierarchy
  const colors = [
    '#2563EB', // Blue - Primary
    '#DC2626', // Red - Secondary  
    '#059669', // Green - Success
    '#D97706', // Orange - Warning
    '#7C3AED', // Purple - Info
    '#DB2777', // Pink - Accent
    '#0891B2', // Cyan - Cool
    '#65A30D', // Lime - Fresh
    '#4338CA', // Indigo - Deep
    '#BE185D'  // Rose - Warm
  ];

  const series = datasets.map((dataset, index) => {
    const color = colors[index % colors.length];
    
    return {
      name: dataset.label,
      type: config.type,
      data: dataset.data.map((value, dataIndex) => ({
        value: value,
        name: labels[dataIndex]
      })),
      color: color,
      connectNulls: false,
      symbol: config.type === 'line' ? 'circle' : 'none',
      symbolSize: 8,
      lineStyle: config.type === 'line' ? {
        width: 3,
        shadowColor: `${color}40`,
        shadowBlur: 4,
        shadowOffsetY: 2
      } : undefined,
      itemStyle: {
        borderRadius: config.type === 'bar' ? [4, 4, 0, 0] : undefined,
        shadowColor: `${color}30`,
        shadowBlur: config.type === 'bar' ? 6 : 0,
        shadowOffsetY: config.type === 'bar' ? 2 : 0,
        borderWidth: config.type === 'line' ? 2 : 0,
        borderColor: '#8e7575ff'
      },
      emphasis: {
        focus: 'series',
        blurScope: 'coordinateSystem',
        itemStyle: {
          shadowBlur: 12,
          shadowColor: `${color}80`,
          shadowOffsetY: 3,
          borderWidth: config.type === 'line' ? 3 : 1,
          borderColor: '#ffffff'
        },
        lineStyle: config.type === 'line' ? {
          width: 4,
          shadowBlur: 8,
          shadowColor: `${color}60`
        } : undefined
      },
      smooth: config.type === 'line' ? 0.3 : false
    };
  });

  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#F3F4F6' : '#374151'
    },
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: config.type === 'line' ? 'cross' : 'shadow',
        crossStyle: {
          color: isDark ? '#6B7280' : '#9CA3AF',
          width: 1,
          opacity: 0.8
        },
        shadowStyle: {
          color: isDark ? 'rgba(107, 114, 128, 0.1)' : 'rgba(156, 163, 175, 0.1)'
        }
      },
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#E5E7EB',
      borderWidth: 1,
      borderRadius: 8,
      padding: [12, 16],
      textStyle: {
        color: isDark ? '#F3F4F6' : '#374151',
        fontSize: 13
      },
      extraCssText: 'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); backdrop-filter: blur(8px);',
      formatter: (params: unknown) => {
        const paramArray = Array.isArray(params) ? params : [params];

        let tooltip = `
          <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px; color: ${isDark ? '#F9FAFB' : '#111827'};">
            📊 ${(paramArray[0] as { name: string }).name}
          </div>
        `;
        
        paramArray.forEach((param: { value?: { value?: unknown } | unknown; name: string; seriesName: string; color: string }) => {
          const value = (param.value && typeof param.value === 'object' && 'value' in param.value) 
            ? (param.value as { value?: unknown }).value 
            : param.value;
          const displayValue = value === null ? 'No data' : 
            config.comparisonMode === 'week-over-week' && typeof value === 'number' ? 
              `${value > 0 ? '+' : ''}${value}%` : 
              typeof value === 'number' ? value.toLocaleString() : value;

          const trendIcon = config.comparisonMode === 'week-over-week' && typeof value === 'number' 
            ? (value > 0 ? '📈' : value < 0 ? '📉' : '➡️')
            : '💰';

          tooltip += `
            <div style="display: flex; align-items: center; margin: 8px 0; padding: 4px 0;">
              <span style="display: inline-block; width: 12px; height: 12px; background: linear-gradient(135deg, ${param.color}, ${param.color}CC); border-radius: 50%; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></span>
              <span style="flex: 1; font-weight: 500;">${param.seriesName}</span>
              <span style="font-weight: 700; margin-left: 12px; color: ${param.color};">${trendIcon} ${displayValue}</span>
            </div>
          `;
        });

        return tooltip;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      bottom: 8,
      itemGap: 24,
      itemWidth: 16,
      itemHeight: 16,
      padding: [12, 20],
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(220, 211, 211, 0.01)',
      borderColor: isDark ? '#374151' : '#5555554f',
      borderWidth: 1,
      borderRadius: 12,
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 8,
      shadowOffsetY: 2,
      textStyle: {
        color: isDark ? '#F3F4F6' : '#374151',
        fontSize: 13,
        fontWeight: 600,
        padding: [0, 8, 0, 4]
      },
      pageTextStyle: {
        color: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: 12,
        fontWeight: 500
      },
      pageIconColor: isDark ? '#9CA3AF' : '#6B7280',
      pageIconInactiveColor: isDark ? '#4B5563' : '#D1D5DB',
      pageIconSize: 14,
      pageButtonItemGap: 8,
      pageButtonGap: 12,
      pageFormatter: '{current}/{total}',
      emphasis: {
        selectorLabel: {
          color: isDark ? '#F9FAFB' : '#111827',
          fontWeight: 700
        }
      },
      selector: datasets.length > 1 ? [
        {
          type: 'all',
          title: 'Show All'
        },
        {
          type: 'inverse',
          title: 'Invert Selection'
        }
      ] : false,
      selectorLabel: {
        color: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: 11,
        fontWeight: 500,
        borderColor: isDark ? '#4B5563' : '#D1D5DB',
        borderWidth: 1,
        borderRadius: 6,
        padding: [4, 8],
        backgroundColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)'
      },
      selectorPosition: 'end',
      selectorItemGap: 8,
      tooltip: {
        show: true,
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        borderRadius: 6,
        padding: [8, 12],
        textStyle: {
          color: isDark ? '#F3F4F6' : '#374151',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: datasets.length > 6 ? '22%' : datasets.length > 3 ? '18%' : '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      axisLabel: {
        color: isDark ? '#9CA3AF' : '#6B7280',
        rotate: labels.length > 6 ? 45 : 0,
        formatter: (value: string) => {
          // Format date labels if they look like dates
          if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
          return value;
        }
      },
      axisTick: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      axisLabel: {
        color: isDark ? '#9CA3AF' : '#6B7280',
        formatter: (value: number) => {
          if (config.comparisonMode === 'week-over-week') {
            return `${value}%`;
          }
          return value.toLocaleString();
        }
      },
      axisTick: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#F3F4F6',
          type: 'dashed'
        }
      }
    },
    series,
    animation: true,
    animationDuration: 750,
    animationEasing: 'cubicOut' as const
  };
}

/**
 * Get responsive chart dimensions based on container size
 */
export function getResponsiveChartSize(containerWidth: number, containerHeight: number) {
  // Ensure minimum dimensions
  const minWidth = 300;
  const minHeight = 200;
  
  // Calculate responsive dimensions
  const width = Math.max(containerWidth, minWidth);
  const height = Math.max(containerHeight, minHeight);
  
  return { width, height };
}

/**
 * Determine if chart should show in mobile layout
 */
export function shouldUseMobileLayout(width: number): boolean {
  return width < 768; // Tailwind's md breakpoint
}