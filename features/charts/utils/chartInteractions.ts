import type { ECharts } from 'echarts/core';

/**
 * Chart interaction utilities for enhanced user experience
 */

export interface ChartInteractionOptions {
  enableZoom?: boolean;
  enableBrush?: boolean;
  enableDataZoom?: boolean;
  enableAnimation?: boolean;
}

/**
 * Enhanced chart interaction setup
 */
export function setupChartInteractions(
  chart: ECharts,
  options: ChartInteractionOptions = {}
) {
  const {
    enableBrush = false,
    enableDataZoom = true
  } = options;

  // Add data zoom functionality
  if (enableDataZoom) {
    chart.setOption({
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          handleStyle: {
            color: '#3B82F6'
          },
          textStyle: {
            color: '#6B7280'
          }
        }
      ]
    });
  }

  // Add brush selection
  if (enableBrush) {
    chart.setOption({
      brush: {
        toolbox: ['rect', 'polygon', 'clear'],
        xAxisIndex: 0,
        brushStyle: {
          borderWidth: 1,
          color: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3B82F6'
        }
      }
    });
  }

  // Setup keyboard interactions
  setupKeyboardInteractions(chart);

  // Setup accessibility features
  setupAccessibilityFeatures(chart);

  return chart;
}

/**
 * Setup keyboard interactions for accessibility
 */
function setupKeyboardInteractions(chart: ECharts) {
  const chartContainer = chart.getDom();
  
  if (!chartContainer) return;

  // Make chart focusable
  chartContainer.setAttribute('tabindex', '0');
  chartContainer.setAttribute('role', 'img');
  chartContainer.setAttribute('aria-label', 'Sales data chart');

  chartContainer.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        // Navigate to previous data point
        event.preventDefault();
        navigateDataPoint(chart, 'prev');
        break;
      case 'ArrowRight':
        // Navigate to next data point
        event.preventDefault();
        navigateDataPoint(chart, 'next');
        break;
      case 'Enter':
      case ' ':
        // Trigger click on focused data point
        event.preventDefault();
        triggerDataPointAction();
        break;
      case 'Escape':
        // Clear selection/focus
        event.preventDefault();
        clearChartSelection(chart);
        break;
    }
  });
}

/**
 * Setup accessibility features
 */
function setupAccessibilityFeatures(chart: ECharts) {
  const chartContainer = chart.getDom();
  
  if (!chartContainer) return;

  // Add ARIA description
  const description = generateChartDescription(chart);
  chartContainer.setAttribute('aria-describedby', 'chart-description');
  
  // Create hidden description element
  let descElement = document.getElementById('chart-description');
  if (!descElement) {
    descElement = document.createElement('div');
    descElement.id = 'chart-description';
    descElement.className = 'sr-only';
    document.body.appendChild(descElement);
  }
  descElement.textContent = description;
}

/**
 * Navigate between data points using keyboard
 */
function navigateDataPoint(chart: ECharts, direction: 'prev' | 'next') {
  // Implementation for keyboard navigation
  console.log(`Navigate ${direction} data point`);
  // This would require tracking current focus state and updating chart highlight
}

/**
 * Trigger action on focused data point
 */
function triggerDataPointAction() {
  // Implementation for triggering click on focused data point
  console.log('Trigger data point action');
}

/**
 * Clear chart selection and focus
 */
function clearChartSelection(chart: ECharts) {
  chart.dispatchAction({
    type: 'downplay'
  });
}

/**
 * Generate accessible description of chart data
 */
function generateChartDescription(chart: ECharts): string {
  const option = chart.getOption();
  const series = option.series as { data?: unknown[] }[];
  
  if (!series || series.length === 0) {
    return 'Empty chart with no data';
  }

  const seriesCount = series.length;
  const dataPointCount = series[0]?.data?.length || 0;
  
  return `Chart displaying ${seriesCount} data series with ${dataPointCount} data points each. Use arrow keys to navigate, Enter to select, and Escape to clear selection.`;
}

/**
 * Handle chart loading states with user feedback
 */
export function handleChartLoading(
  chart: ECharts,
  isLoading: boolean,
  loadingText: string = 'Loading chart data...'
) {
  if (isLoading) {
    chart.showLoading('default', {
      text: loadingText,
      color: '#3B82F6',
      textColor: '#374151',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0,
      fontSize: 14,
      showSpinner: true,
      spinnerRadius: 10,
      lineWidth: 2
    });
  } else {
    chart.hideLoading();
  }
}

/**
 * Handle chart errors with user-friendly messages
 */
export function handleChartError(
  chart: ECharts,
  error: Error | string,
  onRetry?: () => void
) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Clear existing chart
  chart.clear();
  
  // Show error state
  chart.setOption({
    title: {
      text: 'Chart Error',
      subtext: errorMessage,
      left: 'center',
      top: 'center',
      textStyle: {
        color: '#EF4444',
        fontSize: 18
      },
      subtextStyle: {
        color: '#6B7280',
        fontSize: 14
      }
    },
    graphic: onRetry ? {
      type: 'group',
      left: 'center',
      top: '60%',
      children: [{
        type: 'rect',
        shape: {
          width: 100,
          height: 40,
          r: 4
        },
        style: {
          fill: '#3B82F6',
          stroke: '#2563EB'
        },
        onclick: onRetry
      }, {
        type: 'text',
        style: {
          text: 'Retry',
          fill: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold'
        },
        position: [50, 20],
        origin: [50, 20]
      }]
    } : undefined
  });
}

/**
 * Handle empty chart state
 */
export function handleEmptyChart(
  chart: ECharts,
  message: string = 'No data available',
  onLoadData?: () => void
) {
  chart.clear();
  
  chart.setOption({
    title: {
      text: 'No Data',
      subtext: message,
      left: 'center',
      top: 'center',
      textStyle: {
        color: '#6B7280',
        fontSize: 18
      },
      subtextStyle: {
        color: '#9CA3AF',
        fontSize: 14
      }
    },
    graphic: onLoadData ? {
      type: 'group',
      left: 'center',
      top: '60%',
      children: [{
        type: 'rect',
        shape: {
          width: 120,
          height: 40,
          r: 4
        },
        style: {
          fill: '#10B981',
          stroke: '#059669'
        },
        onclick: onLoadData
      }, {
        type: 'text',
        style: {
          text: 'Load Data',
          fill: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold'
        },
        position: [60, 20],
        origin: [60, 20]
      }]
    } : undefined
  });
}

/**
 * Animate chart transitions
 */
export function animateChartTransition(
  chart: ECharts,
  newOption: Record<string, unknown>,
  duration: number = 750
) {
  chart.setOption(newOption as Parameters<typeof chart.setOption>[0], {
    notMerge: false,
    lazyUpdate: false,
    silent: false
  });
  
  // Custom animation for smooth transitions
  chart.dispatchAction({
    type: 'highlight',
    animation: {
      duration,
      easing: 'cubicOut'
    }
  });
}