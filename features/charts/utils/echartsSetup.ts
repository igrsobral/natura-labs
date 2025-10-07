// ECharts setup and initialization utilities
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components';

// Flag to track if ECharts has been initialized
let isEChartsInitialized = false;

/**
 * Initialize ECharts with required components
 * This should be called once before using any ECharts functionality
 */
export function initializeECharts(): void {
  if (isEChartsInitialized) {
    return;
  }

  try {
    // Register the required components
    echarts.use([
      CanvasRenderer,
      LineChart,
      BarChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      DataZoomComponent,
      ToolboxComponent
    ]);

    isEChartsInitialized = true;
    console.log('ECharts initialized successfully');
  } catch (error) {
    console.error('Failed to initialize ECharts:', error);
    throw error;
  }
}

/**
 * Create an ECharts instance with proper error handling
 */
export function createEChartsInstance(container: HTMLElement): ECharts | null {
  try {
    // Ensure ECharts is initialized
    initializeECharts();

    // Create the chart instance
    const chart = echarts.init(container, undefined, {
      renderer: 'canvas',
      useDirtyRect: true, // Performance optimization
    });

    return chart;
  } catch (error) {
    console.error('Failed to create ECharts instance:', error);
    return null;
  }
}

/**
 * Safely dispose of an ECharts instance
 */
export function disposeEChartsInstance(chart: ECharts | null): void {
  if (chart && !chart.isDisposed()) {
    try {
      chart.dispose();
    } catch (error) {
      console.error('Failed to dispose ECharts instance:', error);
    }
  }
}

/**
 * Check if ECharts is properly initialized
 */
export function isEChartsReady(): boolean {
  return isEChartsInitialized;
}

/**
 * Get ECharts version info
 */
export function getEChartsInfo(): { version: string; initialized: boolean } {
  return {
    version: echarts.version || 'unknown',
    initialized: isEChartsInitialized
  };
}

// Export the echarts object for direct use if needed
export { echarts };