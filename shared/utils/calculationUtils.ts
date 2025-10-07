/**
 * Calculation utilities for sales data analysis
 * Handles average sales, week-over-week, and cumulative calculations with null value handling
 */

import type { ChartDataset } from '@/shared/types';

export interface CalculationResult {
  value: number | null;
  formula: string;
  latexFormula: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface WeekOverWeekResult {
  data: (number | null)[];
  calculations: CalculationResult[];
}

export interface CumulativeResult {
  data: (number | null)[];
  totalSum: number | null;
}

/**
 * Calculate average sales per week with null handling
 * Formula: Total Sales / Weeks with Data
 */
export function calculateAverageSales(
  sales: (number | null)[]
): CalculationResult {
  try {
    // Filter out null values
    const validSales = sales.filter((value): value is number => value !== null);
    const validWeeks = validSales.length;
    
    if (validWeeks === 0) {
      return {
        value: null,
        formula: 'No valid data available',
        latexFormula: '\\text{No data available}',
        isValid: false,
        errorMessage: 'All sales data is null or empty'
      };
    }

    const totalSales = validSales.reduce((sum, value) => sum + value, 0);
    const averageSales = totalSales / validWeeks;

    // Round to 2 decimal places
    const roundedAverage = Math.round(averageSales * 100) / 100;

    return {
      value: roundedAverage,
      formula: `Total Sales (${totalSales}) ÷ Weeks with Data (${validWeeks}) = ${roundedAverage}`,
      latexFormula: `\\frac{\\text{Total Sales}}{\\text{Weeks with Data}}`,
      isValid: true
    };
  } catch (error) {
    return {
      value: null,
      formula: 'Calculation error',
      latexFormula: '\\text{Error in calculation}',
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown calculation error'
    };
  }
}

/**
 * Calculate week-over-week percentage changes
 * Formula: ((Current Week - Previous Week) / Previous Week) * 100
 */
export function calculateWeekOverWeek(
  sales: (number | null)[],
  includeCalculations: boolean = false
): WeekOverWeekResult {
  const weekOverWeekData: (number | null)[] = [];
  const calculations: CalculationResult[] = [];

  try {
    for (let i = 0; i < sales.length; i++) {
      if (i === 0) {
        // First week has no previous week to compare
        weekOverWeekData.push(null);
        
        if (includeCalculations) {
          calculations.push({
            value: null,
            formula: 'No previous week for comparison',
            latexFormula: '\\text{N/A - First week}',
            isValid: false,
            errorMessage: 'First week cannot have week-over-week comparison'
          });
        }
      } else {
        const current = sales[i];
        const previous = sales[i - 1];
        
        if (current !== null && previous !== null && previous !== 0) {
          const change = ((current - previous) / previous) * 100;
          const roundedChange = Math.round(change * 100) / 100;
          
          weekOverWeekData.push(roundedChange);
          
          if (includeCalculations) {
            calculations.push({
              value: roundedChange,
              formula: `((${current} - ${previous}) / ${previous}) × 100 = ${roundedChange}%`,
              latexFormula: `\\frac{${current} - ${previous}}{${previous}} \\times 100 = ${roundedChange}\\%`,
              isValid: true
            });
          }
        } else {
          weekOverWeekData.push(null);
          
          if (includeCalculations) {
            let errorMessage = 'Cannot calculate';
            if (current === null) errorMessage = 'Current week data is null';
            else if (previous === null) errorMessage = 'Previous week data is null';
            else if (previous === 0) errorMessage = 'Previous week is zero (division by zero)';
            
            calculations.push({
              value: null,
              formula: errorMessage,
              latexFormula: '\\text{Unable to calculate}',
              isValid: false,
              errorMessage
            });
          }
        }
      }
    }

    return {
      data: weekOverWeekData,
      calculations
    };
  } catch (error) {
    return {
      data: sales.map(() => null),
      calculations: [{
        value: null,
        formula: 'Calculation error',
        latexFormula: '\\text{Error in calculation}',
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown calculation error'
      }]
    };
  }
}

/**
 * Calculate cumulative totals
 * Formula: Running sum of all previous weeks
 */
export function calculateCumulative(sales: (number | null)[]): CumulativeResult {
  const cumulativeData: (number | null)[] = [];
  let runningTotal = 0;
  let hasValidData = false;

  try {
    for (const value of sales) {
      if (value !== null) {
        runningTotal += value;
        cumulativeData.push(runningTotal);
        hasValidData = true;
      } else {
        // For null values, maintain the running total if we have valid data
        cumulativeData.push(hasValidData ? runningTotal : null);
      }
    }

    return {
      data: cumulativeData,
      totalSum: hasValidData ? runningTotal : null
    };
  } catch {
    return {
      data: sales.map(() => null),
      totalSum: null
    };
  }
}

/**
 * Calculate multiple metrics for a dataset
 */
export function calculateDatasetMetrics(
  dataset: ChartDataset
): {
  averageSales: CalculationResult;
  weekOverWeek: WeekOverWeekResult;
  cumulative: CumulativeResult;
  totalSales: number | null;
  validWeeks: number;
} {
  const averageSales = calculateAverageSales(dataset.data);

  const weekOverWeek = calculateWeekOverWeek(dataset.data, true);
  const cumulative = calculateCumulative(dataset.data);

  // Calculate total sales and valid weeks
  const validSales = dataset.data.filter((value): value is number => value !== null);
  const totalSales = validSales.length > 0 
    ? validSales.reduce((sum, value) => sum + value, 0)
    : null;
  const validWeeks = validSales.length;

  return {
    averageSales,
    weekOverWeek,
    cumulative,
    totalSales,
    validWeeks
  };
}

/**
 * Validate calculation inputs
 */
export function validateCalculationInputs(
  sales: (number | null)[],
  operation: 'average' | 'week-over-week' | 'cumulative'
): { isValid: boolean; errorMessage?: string } {
  if (!Array.isArray(sales)) {
    return {
      isValid: false,
      errorMessage: 'Sales data must be an array'
    };
  }

  if (sales.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Sales data cannot be empty'
    };
  }

  // Check if all values are null
  const hasValidData = sales.some(value => value !== null);
  if (!hasValidData) {
    return {
      isValid: false,
      errorMessage: 'All sales data is null'
    };
  }

  switch (operation) {
    case 'week-over-week':
      if (sales.length < 2) {
        return {
          isValid: false,
          errorMessage: 'Week-over-week calculation requires at least 2 data points'
        };
      }
      break;
    
    case 'average':
    case 'cumulative':
      // No additional validation needed
      break;
  }

  return { isValid: true };
}

/**
 * Format calculation result for display
 */
export function formatCalculationResult(
  result: CalculationResult,
  includeFormula: boolean = true
): string {
  if (!result.isValid || result.value === null) {
    return result.errorMessage || 'Unable to calculate';
  }

  const valueStr = typeof result.value === 'number' 
    ? result.value.toLocaleString()
    : 'N/A';

  if (includeFormula) {
    return `${valueStr} (${result.formula})`;
  }

  return valueStr;
}

/**
 * Generate LaTeX formula for display
 */
export function generateCalculationLatexFormula(
  operation: 'average' | 'week-over-week' | 'cumulative',
  values: { current?: number; previous?: number; total?: number; weeks?: number }
): string {
  switch (operation) {
    case 'average':
      if (values.total !== undefined && values.weeks !== undefined) {
        return `\\text{Average} = \\frac{\\text{Total Sales}}{\\text{Weeks with Data}} = \\frac{${values.total}}{${values.weeks}}`;
      }
      return '\\text{Average} = \\frac{\\text{Total Sales}}{\\text{Weeks with Data}}';

    case 'week-over-week':
      if (values.current !== undefined && values.previous !== undefined) {
        return `\\text{WoW} = \\frac{\\text{Current} - \\text{Previous}}{\\text{Previous}} \\times 100 = \\frac{${values.current} - ${values.previous}}{${values.previous}} \\times 100`;
      }
      return '\\text{WoW} = \\frac{\\text{Current} - \\text{Previous}}{\\text{Previous}} \\times 100';

    case 'cumulative':
      return '\\text{Cumulative} = \\sum_{i=1}^{n} \\text{Sales}_i';

    default:
      return '\\text{Formula not available}';
  }
}