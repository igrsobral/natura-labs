import { SalesData, Brand, Category, ChartConfig, TableFilters, AIQuery } from '../types';

// Validation functions for core data types

export function validateSalesData(data: unknown): data is SalesData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const salesData = data as SalesData;
  
  if (!Array.isArray(salesData.brands)) {
    return false;
  }

  if (!Array.isArray(salesData.dateRange) || 
      !salesData.dateRange.every(date => typeof date === 'string')) {
    return false;
  }

  return salesData.brands.every(validateBrand);
}

export function validateBrand(brand: unknown): brand is Brand {
  if (!brand || typeof brand !== 'object') {
    return false;
  }

  const brandData = brand as Brand;
  
  return typeof brandData.name === 'string' &&
         Array.isArray(brandData.categories) &&
         brandData.categories.every(validateCategory);
}

export function validateCategory(category: unknown): category is Category {
  if (!category || typeof category !== 'object') {
    return false;
  }

  const categoryData = category as Category;
  
  return typeof categoryData.name === 'string' &&
         Array.isArray(categoryData.sales) &&
         categoryData.sales.every(sale => 
           sale === null || typeof sale === 'number'
         );
}

export function validateChartConfig(config: unknown): config is ChartConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const chartConfig = config as ChartConfig;
  
  return (chartConfig.type === 'line' || chartConfig.type === 'bar') &&
         (chartConfig.comparisonMode === 'week-over-week' || 
          chartConfig.comparisonMode === 'cumulative') &&
         typeof chartConfig.showFormulas === 'boolean';
}

export function validateTableFilters(filters: unknown): filters is TableFilters {
  if (!filters || typeof filters !== 'object') {
    return false;
  }

  const tableFilters = filters as TableFilters;
  
  return Array.isArray(tableFilters.selectedBrands) &&
         tableFilters.selectedBrands.every(brand => typeof brand === 'string') &&
         Array.isArray(tableFilters.selectedCategories) &&
         tableFilters.selectedCategories.every(category => typeof category === 'string') &&
         Array.isArray(tableFilters.dateRange) &&
         tableFilters.dateRange.length === 2 &&
         tableFilters.dateRange.every(index => typeof index === 'number');
}

export function validateAIQuery(query: unknown): query is AIQuery {
  if (!query || typeof query !== 'object') {
    return false;
  }

  const aiQuery = query as AIQuery;
  
  return typeof aiQuery.query === 'string' &&
         aiQuery.timestamp instanceof Date &&
         (aiQuery.response === undefined || typeof aiQuery.response === 'string');
}

// Data sanitization functions

export function sanitizeSalesData(data: unknown): SalesData | null {
  try {
    if (!validateSalesData(data)) {
      return null;
    }

    const salesData = data as SalesData;
    
    return {
      brands: salesData.brands.map(sanitizeBrand).filter(Boolean) as Brand[],
      dateRange: salesData.dateRange.filter(date => typeof date === 'string')
    };
  } catch (error) {
    console.error('Error sanitizing sales data:', error);
    return null;
  }
}

export function sanitizeBrand(brand: unknown): Brand | null {
  try {
    if (!validateBrand(brand)) {
      return null;
    }

    const brandData = brand as Brand;
    
    return {
      name: brandData.name.trim(),
      categories: brandData.categories.map(sanitizeCategory).filter(Boolean) as Category[]
    };
  } catch (error) {
    console.error('Error sanitizing brand data:', error);
    return null;
  }
}

export function sanitizeCategory(category: unknown): Category | null {
  try {
    if (!validateCategory(category)) {
      return null;
    }

    const categoryData = category as Category;
    
    return {
      name: categoryData.name.trim(),
      sales: categoryData.sales.map(sale => {
        if (sale === null || sale === undefined) {
          return null;
        }
        if (typeof sale === 'number' && !isNaN(sale) && isFinite(sale)) {
          return sale;
        }
        return null;
      })
    };
  } catch (error) {
    console.error('Error sanitizing category data:', error);
    return null;
  }
}

// Null value handling utilities

export function hasValidData(sales: (number | null)[]): boolean {
  return sales.some(sale => sale !== null && typeof sale === 'number' && !isNaN(sale));
}

export function countValidDataPoints(sales: (number | null)[]): number {
  return sales.filter(sale => sale !== null && typeof sale === 'number' && !isNaN(sale)).length;
}

export function replaceNullsWithDefault(sales: (number | null)[], defaultValue: number = 0): number[] {
  return sales.map(sale => sale === null ? defaultValue : sale || defaultValue);
}

export function filterValidSales(sales: (number | null)[]): number[] {
  return sales.filter((sale): sale is number => 
    sale !== null && typeof sale === 'number' && !isNaN(sale) && isFinite(sale)
  );
}