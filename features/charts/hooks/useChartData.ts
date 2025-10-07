import { useMemo } from 'react';
import type { SalesData, ChartConfig, ProcessedChartData, ChartDataset, FormulaData } from '@/shared/types';

export interface UseChartDataReturn {
  chartData: ProcessedChartData;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  isEmpty: boolean;
}

/**
 * Custom hook for processing sales data into chart-ready format
 * Handles data transformation, null value processing, and formula calculations
 */
export const useChartData = (
  salesData: SalesData | null,
  config: ChartConfig,
  isLoading: boolean = false,
  error: string | null = null
): UseChartDataReturn => {
  const processedData = useMemo(() => {
    if (!salesData) {
      return {
        labels: [],
        datasets: [],
        formulas: []
      };
    }

    // Extract labels from date range
    const labels = salesData.dateRange;

    // Process datasets for each brand/category combination
    const datasets: ChartDataset[] = [];
    
    salesData.brands.forEach(brand => {
      brand.categories.forEach(category => {
        let processedSales: (number | null)[];

        // Apply comparison mode transformation
        if (config.comparisonMode === 'cumulative') {
          processedSales = calculateCumulative(category.sales);
        } else if (config.comparisonMode === 'week-over-week') {
          processedSales = calculateWeekOverWeek(category.sales);
        } else {
          processedSales = category.sales;
        }

        datasets.push({
          label: `${brand.name} - ${category.name}`,
          data: processedSales,
          brandName: brand.name,
          categoryName: category.name
        });
      });
    });

    // Calculate formulas if enabled
    const formulas: FormulaData[] = config.showFormulas 
      ? calculateFormulas(datasets)
      : [];

    return {
      labels,
      datasets,
      formulas
    };
  }, [salesData, config]);

  const hasData = useMemo(() => {
    return processedData.datasets.length > 0 && 
           processedData.datasets.some(dataset => 
             dataset.data.some(value => value !== null)
           );
  }, [processedData]);

  const isEmpty = useMemo(() => {
    return !salesData || 
           salesData.brands.length === 0 || 
           !hasData;
  }, [salesData, hasData]);

  return {
    chartData: processedData,
    isLoading,
    error,
    hasData,
    isEmpty
  };
};

/**
 * Calculate cumulative totals for sales data
 */
function calculateCumulative(sales: (number | null)[]): (number | null)[] {
  const cumulative: (number | null)[] = [];
  let runningTotal = 0;
  let hasValidData = false;

  for (const value of sales) {
    if (value !== null) {
      runningTotal += value;
      cumulative.push(runningTotal);
      hasValidData = true;
    } else {
      // For null values, maintain the running total if we have valid data
      cumulative.push(hasValidData ? runningTotal : null);
    }
  }

  return cumulative;
}

/**
 * Calculate week-over-week percentage changes
 */
function calculateWeekOverWeek(sales: (number | null)[]): (number | null)[] {
  const weekOverWeek: (number | null)[] = [];
  
  for (let i = 0; i < sales.length; i++) {
    if (i === 0) {
      // First week has no previous week to compare
      weekOverWeek.push(null);
    } else {
      const current = sales[i];
      const previous = sales[i - 1];
      
      if (current !== null && previous !== null && previous !== 0) {
        const change = ((current - previous) / previous) * 100;
        weekOverWeek.push(Math.round(change * 100) / 100); // Round to 2 decimal places
      } else {
        weekOverWeek.push(null);
      }
    }
  }

  return weekOverWeek;
}

/**
 * Calculate formulas for chart data
 */
function calculateFormulas(datasets: ChartDataset[]): FormulaData[] {
  const formulas: FormulaData[] = [];

  datasets.forEach(dataset => {
    const validSales = dataset.data.filter((value): value is number => value !== null);
    const validWeeks = validSales.length;
    
    if (validWeeks > 0) {
      const totalSales = validSales.reduce((sum, value) => sum + value, 0);
      const averageSales = totalSales / validWeeks;

      formulas.push({
        label: `${dataset.label} - Average Sales per Week`,
        formula: `Total Sales (${totalSales}) ÷ Weeks with Data (${validWeeks})`,
        value: Math.round(averageSales * 100) / 100,
        latexFormula: `\\frac{${totalSales}}{${validWeeks}} = ${Math.round(averageSales * 100) / 100}`
      });
    } else {
      formulas.push({
        label: `${dataset.label} - Average Sales per Week`,
        formula: 'Insufficient data for calculation',
        value: null,
        latexFormula: '\\text{No data available}'
      });
    }
  });

  return formulas;
}

/**
 * Validate sales data structure
 */
export function validateSalesData(data: unknown): data is SalesData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const salesData = data as { brands?: unknown; dateRange?: unknown };

  // Check if brands array exists and is valid
  if (!Array.isArray(salesData.brands)) {
    return false;
  }

  // Check if dateRange array exists and is valid
  if (!Array.isArray(salesData.dateRange)) {
    return false;
  }

  // Validate each brand structure
  for (const brand of salesData.brands) {
    if (!brand || typeof brand !== 'object') {
      return false;
    }

    if (typeof brand.name !== 'string') {
      return false;
    }

    if (!Array.isArray(brand.categories)) {
      return false;
    }

    // Validate each category structure
    for (const category of brand.categories) {
      if (!category || typeof category !== 'object') {
        return false;
      }

      if (typeof category.name !== 'string') {
        return false;
      }

      if (!Array.isArray(category.sales)) {
        return false;
      }

      // Validate sales data - should be array of numbers or nulls
      for (const sale of category.sales) {
        if (sale !== null && typeof sale !== 'number') {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Handle null values in chart data based on strategy
 */
export function handleNullValues(
  data: (number | null)[],
  strategy: 'skip' | 'zero' | 'interpolate' = 'skip'
): (number | null)[] {
  switch (strategy) {
    case 'zero':
      return data.map(value => value === null ? 0 : value);
    
    case 'interpolate':
      return interpolateNullValues(data);
    
    case 'skip':
    default:
      return data;
  }
}

/**
 * Interpolate null values using linear interpolation
 */
function interpolateNullValues(data: (number | null)[]): (number | null)[] {
  const result = [...data];
  
  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      // Find previous and next non-null values
      let prevIndex = i - 1;
      let nextIndex = i + 1;
      
      while (prevIndex >= 0 && result[prevIndex] === null) {
        prevIndex--;
      }
      
      while (nextIndex < result.length && result[nextIndex] === null) {
        nextIndex++;
      }
      
      // If we have both previous and next values, interpolate
      if (prevIndex >= 0 && nextIndex < result.length) {
        const prevValue = result[prevIndex] as number;
        const nextValue = result[nextIndex] as number;
        const steps = nextIndex - prevIndex;
        const stepSize = (nextValue - prevValue) / steps;
        
        result[i] = prevValue + stepSize * (i - prevIndex);
      }
    }
  }
  
  return result;
}