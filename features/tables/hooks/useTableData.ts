import { useMemo } from 'react';
import type { SalesData, ProcessedTableData, TableRow, TableTotals } from '@/shared/types';

export interface UseTableDataReturn {
  tableData: ProcessedTableData;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  isEmpty: boolean;
}

/**
 * Custom hook for processing sales data into table format with pivot-style layout
 * Handles data aggregation, totals calculation, and null value processing
 */
export const useTableData = (
  salesData: SalesData | null,
  isLoading: boolean = false,
  error: string | null = null
): UseTableDataReturn => {
  const processedData = useMemo(() => {
    if (!salesData) {
      return {
        headers: [],
        rows: [],
        totals: { byWeek: [], grandTotal: null }
      };
    }

    // Create headers: Brand, Category, then each date
    const headers = ['Brand', 'Category', ...salesData.dateRange, 'Total'];

    // Process rows for each brand/category combination
    const rows: TableRow[] = [];
    
    salesData.brands.forEach(brand => {
      brand.categories.forEach(category => {
        // Calculate row total (excluding null values)
        const validSales = category.sales.filter((value): value is number => value !== null);
        const rowTotal = validSales.length > 0 
          ? validSales.reduce((sum, value) => sum + value, 0)
          : null;

        rows.push({
          brand: brand.name,
          category: category.name,
          values: category.sales,
          total: rowTotal
        });
      });
    });

    // Calculate totals by week (column totals)
    const byWeekTotals: (number | null)[] = [];
    for (let weekIndex = 0; weekIndex < salesData.dateRange.length; weekIndex++) {
      const weekValues = rows
        .map(row => row.values[weekIndex])
        .filter((value): value is number => value !== null);
      
      byWeekTotals.push(
        weekValues.length > 0 
          ? weekValues.reduce((sum, value) => sum + value, 0)
          : null
      );
    }

    // Calculate grand total
    const allValidTotals = rows
      .map(row => row.total)
      .filter((total): total is number => total !== null);
    
    const grandTotal = allValidTotals.length > 0
      ? allValidTotals.reduce((sum, total) => sum + total, 0)
      : null;

    const totals: TableTotals = {
      byWeek: byWeekTotals,
      grandTotal
    };

    return {
      headers,
      rows,
      totals
    };
  }, [salesData]);

  const hasData = useMemo(() => {
    return processedData.rows.length > 0 && 
           processedData.rows.some(row => 
             row.values.some(value => value !== null)
           );
  }, [processedData]);

  const isEmpty = useMemo(() => {
    return !salesData || 
           salesData.brands.length === 0 || 
           !hasData;
  }, [salesData, hasData]);

  return {
    tableData: processedData,
    isLoading,
    error,
    hasData,
    isEmpty
  };
};

/**
 * Sort table rows by specified column and direction
 */
export function sortTableRows(
  rows: TableRow[],
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): TableRow[] {
  return [...rows].sort((a, b) => {
    let aValue: string | number | null;
    let bValue: string | number | null;

    switch (sortColumn) {
      case 'Brand':
        aValue = a.brand;
        bValue = b.brand;
        break;
      case 'Category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'Total':
        aValue = a.total;
        bValue = b.total;
        break;
      default:
        // Handle date column sorting
        const dateIndex = parseInt(sortColumn);
        if (!isNaN(dateIndex)) {
          aValue = a.values[dateIndex];
          bValue = b.values[dateIndex];
        } else {
          return 0;
        }
    }

    // Handle null values - always sort them to the end
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    // Sort based on type and direction
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    return 0;
  });
}

/**
 * Calculate aggregated statistics for table data
 */
export function calculateTableStats(rows: TableRow[]): {
  totalRows: number;
  totalBrands: number;
  totalCategories: number;
  averageSalesPerRow: number | null;
  highestTotal: number | null;
  lowestTotal: number | null;
} {
  const totalRows = rows.length;
  const uniqueBrands = new Set(rows.map(row => row.brand));
  const uniqueCategories = new Set(rows.map(row => row.category));
  
  const validTotals = rows
    .map(row => row.total)
    .filter((total): total is number => total !== null);

  const averageSalesPerRow = validTotals.length > 0
    ? validTotals.reduce((sum, total) => sum + total, 0) / validTotals.length
    : null;

  const highestTotal = validTotals.length > 0
    ? Math.max(...validTotals)
    : null;

  const lowestTotal = validTotals.length > 0
    ? Math.min(...validTotals)
    : null;

  return {
    totalRows,
    totalBrands: uniqueBrands.size,
    totalCategories: uniqueCategories.size,
    averageSalesPerRow,
    highestTotal,
    lowestTotal
  };
}

/**
 * Format table data for export (CSV, etc.)
 */
export function formatTableForExport(
  tableData: ProcessedTableData,
  includeHeaders: boolean = true
): string[][] {
  const result: string[][] = [];

  if (includeHeaders) {
    result.push(tableData.headers);
  }

  // Add data rows
  tableData.rows.forEach(row => {
    const formattedRow = [
      row.brand,
      row.category,
      ...row.values.map(value => value?.toString() ?? ''),
      row.total?.toString() ?? ''
    ];
    result.push(formattedRow);
  });

  // Add totals row
  const totalsRow = [
    'TOTAL',
    '',
    ...tableData.totals.byWeek.map(total => total?.toString() ?? ''),
    tableData.totals.grandTotal?.toString() ?? ''
  ];
  result.push(totalsRow);

  return result;
}

/**
 * Validate table data structure
 */
export function validateTableData(data: unknown): data is ProcessedTableData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const tableData = data as { headers?: unknown; rows?: unknown };

  // Check headers
  if (!Array.isArray(tableData.headers)) {
    return false;
  }

  // Check rows
  if (!Array.isArray(tableData.rows)) {
    return false;
  }

  // Validate each row structure
  for (const row of tableData.rows) {
    if (!row || typeof row !== 'object') {
      return false;
    }

    if (typeof row.brand !== 'string' || typeof row.category !== 'string') {
      return false;
    }

    if (!Array.isArray(row.values)) {
      return false;
    }

    if (row.total !== null && typeof row.total !== 'number') {
      return false;
    }
  }

  // Check totals structure
  if (!tableData.totals || typeof tableData.totals !== 'object') {
    return false;
  }

  if (!Array.isArray(tableData.totals.byWeek)) {
    return false;
  }

  if (tableData.totals.grandTotal !== null && typeof tableData.totals.grandTotal !== 'number') {
    return false;
  }

  return true;
}