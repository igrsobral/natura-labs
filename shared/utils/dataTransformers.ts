import { SalesData, ProcessedChartData, ChartDataset, ProcessedTableData, TableRow, TableTotals } from '../types';
import { filterValidSales } from './dataValidation';

// Chart data transformation utilities

export function transformDataForChart(
  salesData: SalesData,
  comparisonMode: 'week-over-week' | 'cumulative' = 'week-over-week'
): ProcessedChartData {
  const datasets: ChartDataset[] = [];
  
  salesData.brands.forEach(brand => {
    brand.categories.forEach(category => {
      const transformedData = comparisonMode === 'cumulative' 
        ? transformToCumulative(category.sales)
        : transformToWeekOverWeek(category.sales);
        
      datasets.push({
        label: `${brand.name} - ${category.name}`,
        data: transformedData,
        brandName: brand.name,
        categoryName: category.name
      });
    });
  });

  return {
    labels: salesData.dateRange,
    datasets,
    formulas: generateFormulas(salesData)
  };
}

export function transformToCumulative(sales: (number | null)[]): (number | null)[] {
  let cumulative = 0;
  return sales.map(sale => {
    if (sale === null) {
      return null;
    }
    cumulative += sale;
    return cumulative;
  });
}

export function transformToWeekOverWeek(sales: (number | null)[]): (number | null)[] {
  return sales.map((current, index) => {
    if (current === null || index === 0) {
      return current;
    }
    
    const previous = sales[index - 1];
    if (previous === null || previous === 0) {
      return null;
    }
    
    return ((current - previous) / previous) * 100;
  });
}

// Table data transformation utilities

export function transformDataForTable(
  salesData: SalesData,
  selectedBrands: string[] = [],
  selectedCategories: string[] = []
): ProcessedTableData {
  const filteredBrands = selectedBrands.length > 0 
    ? salesData.brands.filter(brand => selectedBrands.includes(brand.name))
    : salesData.brands;

  const rows: TableRow[] = [];
  
  filteredBrands.forEach(brand => {
    const filteredCategories = selectedCategories.length > 0
      ? brand.categories.filter(category => selectedCategories.includes(category.name))
      : brand.categories;
      
    filteredCategories.forEach(category => {
      const total = calculateTotal(category.sales);
      
      rows.push({
        brand: brand.name,
        category: category.name,
        values: category.sales,
        total
      });
    });
  });

  const totals = calculateTableTotals(rows, salesData.dateRange.length);

  return {
    headers: ['Brand', 'Category', ...salesData.dateRange, 'Total'],
    rows,
    totals
  };
}

export function calculateTotal(sales: (number | null)[]): number | null {
  const validSales = filterValidSales(sales);
  
  if (validSales.length === 0) {
    return null;
  }
  
  return validSales.reduce((sum, sale) => sum + sale, 0);
}

export function calculateTableTotals(rows: TableRow[], dateRangeLength: number): TableTotals {
  const byWeek: (number | null)[] = [];
  
  for (let weekIndex = 0; weekIndex < dateRangeLength; weekIndex++) {
    const weekValues = rows
      .map(row => row.values[weekIndex])
      .filter((value): value is number => value !== null);
      
    byWeek.push(weekValues.length > 0 ? weekValues.reduce((sum, value) => sum + value, 0) : null);
  }
  
  const grandTotal = rows
    .map(row => row.total)
    .filter((total): total is number => total !== null)
    .reduce((sum, total) => sum + total, 0) || null;

  return {
    byWeek,
    grandTotal
  };
}

// Formula calculation utilities

export function generateFormulas(salesData: SalesData) {
  const formulas = salesData.brands.flatMap(brand =>
    brand.categories.map(category => ({
      label: `${brand.name} - ${category.name} Average`,
      formula: calculateAverageFormula(category.sales),
      value: calculateAverage(category.sales),
      latexFormula: generateLatexFormula(category.sales)
    }))
  );
  
  return formulas;
}

export function calculateAverage(sales: (number | null)[]): number | null {
  const validSales = filterValidSales(sales);
  
  if (validSales.length === 0) {
    return null;
  }
  
  const total = validSales.reduce((sum, sale) => sum + sale, 0);
  return total / validSales.length;
}

export function calculateAverageFormula(sales: (number | null)[]): string {
  const validSales = filterValidSales(sales);
  const validCount = validSales.length;
  const total = validSales.reduce((sum, sale) => sum + sale, 0);
  
  if (validCount === 0) {
    return 'Insufficient data for calculation';
  }
  
  return `Total Sales (${total}) / Weeks with Data (${validCount}) = ${(total / validCount).toFixed(2)}`;
}

export function generateLatexFormula(sales: (number | null)[]): string {
  const validSales = filterValidSales(sales);
  const validCount = validSales.length;
  
  if (validCount === 0) {
    return '\\text{Insufficient data}';
  }
  
  return `\\frac{\\text{Total Sales}}{\\text{Weeks with Data}}`;
}

// Null value transformation utilities

export function handleNullValues(
  data: (number | null)[],
  strategy: 'remove' | 'zero' | 'interpolate' = 'remove'
): (number | null)[] {
  switch (strategy) {
    case 'zero':
      return data.map(value => value === null ? 0 : value);
    
    case 'interpolate':
      return interpolateNulls(data);
    
    case 'remove':
    default:
      return data; // Keep nulls as-is for explicit handling in UI
  }
}

export function interpolateNulls(data: (number | null)[]): (number | null)[] {
  const result = [...data];
  
  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      const prevValue = findPreviousValidValue(result, i);
      const nextValue = findNextValidValue(result, i);
      
      if (prevValue !== null && nextValue !== null) {
        result[i] = (prevValue + nextValue) / 2;
      } else if (prevValue !== null) {
        result[i] = prevValue;
      } else if (nextValue !== null) {
        result[i] = nextValue;
      }
    }
  }
  
  return result;
}

function findPreviousValidValue(data: (number | null)[], startIndex: number): number | null {
  for (let i = startIndex - 1; i >= 0; i--) {
    if (data[i] !== null) {
      return data[i];
    }
  }
  return null;
}

function findNextValidValue(data: (number | null)[], startIndex: number): number | null {
  for (let i = startIndex + 1; i < data.length; i++) {
    if (data[i] !== null) {
      return data[i];
    }
  }
  return null;
}