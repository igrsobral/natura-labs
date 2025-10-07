// Number and date formatting utilities

export interface NumberFormatOptions {
  decimals?: number;
  currency?: string;
  compact?: boolean;
  percentage?: boolean;
}

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  timezone?: string;
}

// Number formatting functions

export function formatNumber(
  value: number | null,
  options: NumberFormatOptions = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const {
    decimals = 2,
    currency,
    compact = false,
    percentage = false
  } = options;

  try {
    if (percentage) {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    }

    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        notation: compact ? 'compact' : 'standard'
      }).format(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      notation: compact ? 'compact' : 'standard'
    }).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
}

export function formatCurrency(
  value: number | null,
  currency: string = 'USD',
  decimals: number = 2
): string {
  return formatNumber(value, { currency, decimals });
}

export function formatPercentage(
  value: number | null,
  decimals: number = 1
): string {
  return formatNumber(value, { percentage: true, decimals });
}

export function formatCompactNumber(
  value: number | null,
  decimals: number = 1
): string {
  return formatNumber(value, { compact: true, decimals });
}

// Sales-specific formatting functions

export function formatSalesValue(value: number | null): string {
  if (value === null) {
    return 'No data';
  }
  
  return formatCurrency(value, 'USD', 0);
}

export function formatSalesChange(value: number | null): string {
  if (value === null) {
    return 'N/A';
  }
  
  const formatted = formatPercentage(value, 1);
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatted}`;
}

export function formatAverage(value: number | null): string {
  if (value === null) {
    return 'Insufficient data';
  }
  
  return formatCurrency(value, 'USD', 2);
}

// Date formatting functions

export function formatDate(
  date: Date | string | null,
  options: DateFormatOptions = {}
): string {
  if (!date) {
    return 'N/A';
  }

  const {
    format = 'medium',
    includeTime = false,
    timezone = 'UTC'
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone
    };

    switch (format) {
      case 'short':
        formatOptions.dateStyle = 'short';
        break;
      case 'medium':
        formatOptions.dateStyle = 'medium';
        break;
      case 'long':
        formatOptions.dateStyle = 'long';
        break;
      case 'full':
        formatOptions.dateStyle = 'full';
        break;
    }

    if (includeTime) {
      formatOptions.timeStyle = 'short';
    }

    return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
}

export function formatWeekLabel(weekString: string): string {
  try {
    // Assuming week strings are in format "2024-W01" or similar
    if (weekString.includes('W')) {
      const [year, week] = weekString.split('-W');
      return `Week ${week}, ${year}`;
    }
    
    // If it's a regular date string, format it
    const date = new Date(weekString);
    if (!isNaN(date.getTime())) {
      return formatDate(date, { format: 'short' });
    }
    
    return weekString;
  } catch (error) {
    console.error('Error formatting week label:', error);
    return weekString;
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = formatDate(startDate, { format: 'short' });
    const end = formatDate(endDate, { format: 'short' });
    return `${start} - ${end}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return `${startDate} - ${endDate}`;
  }
}

// Utility functions for data display

export function formatTableCell(value: number | null): string {
  if (value === null) {
    return '-';
  }
  
  return formatSalesValue(value);
}

export function formatChartTooltip(
  value: number | null,
  label: string,
  comparisonMode: 'week-over-week' | 'cumulative'
): string {
  if (value === null) {
    return `${label}: No data`;
  }
  
  if (comparisonMode === 'week-over-week' && label !== 'Week 1') {
    return `${label}: ${formatSalesChange(value)}`;
  }
  
  return `${label}: ${formatSalesValue(value)}`;
}

export function formatAITimestamp(timestamp: Date): string {
  return formatDate(timestamp, { 
    format: 'short', 
    includeTime: true 
  });
}

// Validation helpers for formatted values

export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function parseFormattedNumber(formattedValue: string): number | null {
  try {
    // Remove currency symbols, commas, and other formatting
    const cleaned = formattedValue
      .replace(/[$,\s%]/g, '')
      .replace(/[()]/g, ''); // Remove parentheses for negative numbers
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Error parsing formatted number:', error);
    return null;
  }
}