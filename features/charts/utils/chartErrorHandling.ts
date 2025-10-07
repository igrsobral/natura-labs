/**
 * Chart-specific error handling utilities
 */

export enum ChartErrorType {
  DATA_LOADING_ERROR = 'DATA_LOADING_ERROR',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  CHART_RENDERING_ERROR = 'CHART_RENDERING_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INTERACTION_ERROR = 'INTERACTION_ERROR'
}

export interface ChartError {
  type: ChartErrorType;
  message: string;
  details?: unknown;
  recoverable: boolean;
  timestamp: Date;
}

/**
 * Create a standardized chart error
 */
export function createChartError(
  type: ChartErrorType,
  message: string,
  details?: unknown,
  recoverable: boolean = true
): ChartError {
  return {
    type,
    message,
    details,
    recoverable,
    timestamp: new Date()
  };
}

/**
 * Handle data loading errors
 */
export function handleDataLoadingError(error: unknown): ChartError {
  if (error instanceof Error) {
    return createChartError(
      ChartErrorType.DATA_LOADING_ERROR,
      `Failed to load chart data: ${error.message}`,
      error,
      true
    );
  }

  return createChartError(
    ChartErrorType.DATA_LOADING_ERROR,
    'Failed to load chart data: Unknown error occurred',
    error,
    true
  );
}

/**
 * Handle data validation errors
 */
export function handleDataValidationError(
  validationDetails: string
): ChartError {
  return createChartError(
    ChartErrorType.DATA_VALIDATION_ERROR,
    `Invalid chart data: ${validationDetails}`,
    validationDetails,
    false
  );
}

/**
 * Handle chart rendering errors
 */
export function handleChartRenderingError(error: unknown): ChartError {
  if (error instanceof Error) {
    return createChartError(
      ChartErrorType.CHART_RENDERING_ERROR,
      `Chart rendering failed: ${error.message}`,
      error,
      true
    );
  }

  return createChartError(
    ChartErrorType.CHART_RENDERING_ERROR,
    'Chart rendering failed: Unknown error occurred',
    error,
    true
  );
}

/**
 * Handle configuration errors
 */
export function handleConfigurationError(
  configField: string,
  value: unknown
): ChartError {
  return createChartError(
    ChartErrorType.CONFIGURATION_ERROR,
    `Invalid chart configuration: ${configField} has invalid value`,
    { field: configField, value },
    true
  );
}

/**
 * Handle interaction errors
 */
export function handleInteractionError(
  interaction: string,
  error: unknown
): ChartError {
  return createChartError(
    ChartErrorType.INTERACTION_ERROR,
    `Chart interaction failed: ${interaction}`,
    error,
    true
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ChartError): string {
  switch (error.type) {
    case ChartErrorType.DATA_LOADING_ERROR:
      return 'Unable to load chart data. Please check your connection and try again.';
    
    case ChartErrorType.DATA_VALIDATION_ERROR:
      return 'The chart data format is invalid. Please contact support if this persists.';
    
    case ChartErrorType.CHART_RENDERING_ERROR:
      return 'Unable to display the chart. Please refresh the page and try again.';
    
    case ChartErrorType.CONFIGURATION_ERROR:
      return 'Chart configuration error. The chart settings will be reset to defaults.';
    
    case ChartErrorType.INTERACTION_ERROR:
      return 'Chart interaction failed. Please try again.';
    
    default:
      return 'An unexpected error occurred with the chart.';
  }
}

/**
 * Get recovery suggestions for errors
 */
export function getErrorRecoverySuggestions(error: ChartError): string[] {
  const suggestions: string[] = [];

  switch (error.type) {
    case ChartErrorType.DATA_LOADING_ERROR:
      suggestions.push('Check your internet connection');
      suggestions.push('Refresh the page');
      suggestions.push('Try again in a few moments');
      break;
    
    case ChartErrorType.DATA_VALIDATION_ERROR:
      suggestions.push('Contact support with error details');
      suggestions.push('Try loading different data');
      break;
    
    case ChartErrorType.CHART_RENDERING_ERROR:
      suggestions.push('Refresh the page');
      suggestions.push('Clear browser cache');
      suggestions.push('Try a different browser');
      break;
    
    case ChartErrorType.CONFIGURATION_ERROR:
      suggestions.push('Reset chart settings to defaults');
      suggestions.push('Refresh the page');
      break;
    
    case ChartErrorType.INTERACTION_ERROR:
      suggestions.push('Try the interaction again');
      suggestions.push('Refresh the page if problem persists');
      break;
  }

  return suggestions;
}

/**
 * Log chart errors for debugging
 */
export function logChartError(error: ChartError, context?: Record<string, unknown>) {
  const logData = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: error.timestamp.toISOString()
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Chart Error:', logData);
  }

  // In production, you might want to send to error tracking service
  // Example: sendToErrorTracking(logData);
}

/**
 * Validate chart data structure and return detailed errors
 */
export function validateChartDataStructure(data: unknown): ChartError | null {
  if (!data || typeof data !== 'object') {
    return handleDataValidationError('Data must be an object');
  }

  const salesData = data as { brands?: unknown; dateRange?: unknown };

  if (!Array.isArray(salesData.brands)) {
    return handleDataValidationError('Data must contain a brands array');
  }

  if (!Array.isArray(salesData.dateRange)) {
    return handleDataValidationError('Data must contain a dateRange array');
  }

  if (salesData.brands.length === 0) {
    return handleDataValidationError('Brands array cannot be empty');
  }

  if (salesData.dateRange.length === 0) {
    return handleDataValidationError('DateRange array cannot be empty');
  }

  // Validate each brand
  for (let i = 0; i < salesData.brands.length; i++) {
    const brand = salesData.brands[i];
    
    if (!brand || typeof brand !== 'object') {
      return handleDataValidationError(`Brand at index ${i} is invalid`);
    }

    if (typeof brand.name !== 'string') {
      return handleDataValidationError(`Brand at index ${i} must have a string name`);
    }

    if (!Array.isArray(brand.categories)) {
      return handleDataValidationError(`Brand "${brand.name}" must have a categories array`);
    }

    // Validate each category
    for (let j = 0; j < brand.categories.length; j++) {
      const category = brand.categories[j];
      
      if (!category || typeof category !== 'object') {
        return handleDataValidationError(`Category at index ${j} in brand "${brand.name}" is invalid`);
      }

      if (typeof category.name !== 'string') {
        return handleDataValidationError(`Category at index ${j} in brand "${brand.name}" must have a string name`);
      }

      if (!Array.isArray(category.sales)) {
        return handleDataValidationError(`Category "${category.name}" in brand "${brand.name}" must have a sales array`);
      }

      // Validate sales data length matches dateRange
      if (category.sales.length !== salesData.dateRange.length) {
        return handleDataValidationError(
          `Category "${category.name}" in brand "${brand.name}" has ${category.sales.length} sales values but ${salesData.dateRange.length} dates`
        );
      }

      // Validate sales values
      for (let k = 0; k < category.sales.length; k++) {
        const sale = category.sales[k];
        if (sale !== null && typeof sale !== 'number') {
          return handleDataValidationError(
            `Sales value at index ${k} in category "${category.name}" of brand "${brand.name}" must be a number or null`
          );
        }
      }
    }
  }

  return null; // No validation errors
}

/**
 * Create error boundary fallback for charts
 */
export function createChartErrorFallback(
  error: Error,
  onRetry?: () => void,
  onReset?: () => void
) {
  return {
    title: 'Chart Error',
    message: getUserFriendlyErrorMessage(handleChartRenderingError(error)),
    suggestions: getErrorRecoverySuggestions(handleChartRenderingError(error)),
    actions: [
      ...(onRetry ? [{ label: 'Retry', onClick: onRetry }] : []),
      ...(onReset ? [{ label: 'Reset', onClick: onReset }] : []),
      { label: 'Refresh Page', onClick: () => window.location.reload() }
    ]
  };
}