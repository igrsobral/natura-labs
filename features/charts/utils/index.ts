export {
  setupChartInteractions,
  handleChartLoading,
  handleChartError,
  handleEmptyChart,
  animateChartTransition
} from './chartInteractions';

export {
  ChartErrorType,
  createChartError,
  handleDataLoadingError,
  handleDataValidationError,
  handleChartRenderingError,
  handleConfigurationError,
  handleInteractionError,
  getUserFriendlyErrorMessage,
  getErrorRecoverySuggestions,
  logChartError,
  validateChartDataStructure,
  createChartErrorFallback
} from './chartErrorHandling';

export {
  sampleSalesData,
  sampleDateLabels,
  sampleDataset,
  testCalculations,
  generateSampleFormulas,
  testEdgeCases,
  validateLatexFormulas,
  performanceTest
} from './formulaTestUtils';

export {
  initializeECharts,
  createEChartsInstance,
  disposeEChartsInstance,
  isEChartsReady,
  getEChartsInfo,
  echarts
} from './echartsSetup';

export type { ChartInteractionOptions } from './chartInteractions';
export type { ChartError } from './chartErrorHandling';
