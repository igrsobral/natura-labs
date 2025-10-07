import { useState, useMemo, useCallback } from 'react';
import type { SalesData, TableFilters, ProcessedTableData, TableRow } from '@/shared/types';

export interface UseTableFiltersReturn {
  filters: TableFilters;
  filteredData: ProcessedTableData;
  availableBrands: string[];
  availableCategories: string[];
  updateFilters: (newFilters: Partial<TableFilters>) => void;
  resetFilters: () => void;
  setBrandFilter: (brands: string[]) => void;
  setCategoryFilter: (categories: string[]) => void;
  setDateRangeFilter: (range: [number, number]) => void;
  hasActiveFilters: boolean;
  filteredRowCount: number;
  totalRowCount: number;
}

/**
 * Custom hook for managing table filters and applying them to sales data
 * Handles brand, category, and date range filtering with aggregated totals
 */
export const useTableFilters = (
  salesData: SalesData | null,
  initialFilters?: Partial<TableFilters>
): UseTableFiltersReturn => {
  // Initialize filters with defaults
  const defaultFilters: TableFilters = {
    selectedBrands: [],
    selectedCategories: [],
    dateRange: [0, salesData?.dateRange.length ? salesData.dateRange.length - 1 : 0]
  };

  const [filters, setFilters] = useState<TableFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  // Extract available filter options from data
  const { availableBrands, availableCategories } = useMemo(() => {
    if (!salesData) {
      return { availableBrands: [], availableCategories: [] };
    }

    const brands = salesData.brands.map(brand => brand.name);
    const categories = Array.from(
      new Set(
        salesData.brands.flatMap(brand => 
          brand.categories.map(category => category.name)
        )
      )
    );

    return {
      availableBrands: brands,
      availableCategories: categories
    };
  }, [salesData]);

  // Update date range when data changes
  useMemo(() => {
    if (salesData && salesData.dateRange.length > 0) {
      const maxIndex = salesData.dateRange.length - 1;
      setFilters(prev => ({
        ...prev,
        dateRange: [0, maxIndex]
      }));
    }
  }, [salesData]);

  // Apply filters to create filtered table data
  const filteredData = useMemo(() => {
    if (!salesData) {
      return {
        headers: [],
        rows: [],
        totals: { byWeek: [], grandTotal: null }
      };
    }

    // Filter date range first to get the relevant headers and date indices
    const [startIndex, endIndex] = filters.dateRange;
    const filteredDateRange = salesData.dateRange.slice(startIndex, endIndex + 1);
    const headers = ['Brand', 'Category', ...filteredDateRange, 'Total'];

    // Filter and process rows
    const filteredRows: TableRow[] = [];

    salesData.brands.forEach(brand => {
      // Skip if brand is not selected (when brand filter is active)
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(brand.name)) {
        return;
      }

      brand.categories.forEach(category => {
        // Skip if category is not selected (when category filter is active)
        if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(category.name)) {
          return;
        }

        // Filter sales data by date range
        const filteredSales = category.sales.slice(startIndex, endIndex + 1);
        
        // Calculate row total for filtered data
        const validSales = filteredSales.filter((value): value is number => value !== null);
        const rowTotal = validSales.length > 0 
          ? validSales.reduce((sum, value) => sum + value, 0)
          : null;

        filteredRows.push({
          brand: brand.name,
          category: category.name,
          values: filteredSales,
          total: rowTotal
        });
      });
    });

    // Calculate totals by week for filtered data
    const byWeekTotals: (number | null)[] = [];
    for (let weekIndex = 0; weekIndex < filteredDateRange.length; weekIndex++) {
      const weekValues = filteredRows
        .map(row => row.values[weekIndex])
        .filter((value): value is number => value !== null);
      
      byWeekTotals.push(
        weekValues.length > 0 
          ? weekValues.reduce((sum, value) => sum + value, 0)
          : null
      );
    }

    // Calculate grand total for filtered data
    const allValidTotals = filteredRows
      .map(row => row.total)
      .filter((total): total is number => total !== null);
    
    const grandTotal = allValidTotals.length > 0
      ? allValidTotals.reduce((sum, total) => sum + total, 0)
      : null;

    return {
      headers,
      rows: filteredRows,
      totals: {
        byWeek: byWeekTotals,
        grandTotal
      }
    };
  }, [salesData, filters]);

  // Calculate total row count (unfiltered)
  const totalRowCount = useMemo(() => {
    if (!salesData) return 0;
    return salesData.brands.reduce((total, brand) => total + brand.categories.length, 0);
  }, [salesData]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (!salesData) return false;
    
    const hasDateFilter = filters.dateRange[0] !== 0 || 
                         filters.dateRange[1] !== (salesData.dateRange.length - 1);
    const hasBrandFilter = filters.selectedBrands.length > 0;
    const hasCategoryFilter = filters.selectedCategories.length > 0;

    return hasDateFilter || hasBrandFilter || hasCategoryFilter;
  }, [filters, salesData]);

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    if (!salesData) return;
    
    setFilters({
      selectedBrands: [],
      selectedCategories: [],
      dateRange: [0, salesData.dateRange.length - 1]
    });
  }, [salesData]);

  // Specific filter setters
  const setBrandFilter = useCallback((brands: string[]) => {
    setFilters(prev => ({ ...prev, selectedBrands: brands }));
  }, []);

  const setCategoryFilter = useCallback((categories: string[]) => {
    setFilters(prev => ({ ...prev, selectedCategories: categories }));
  }, []);

  const setDateRangeFilter = useCallback((range: [number, number]) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  }, []);

  return {
    filters,
    filteredData,
    availableBrands,
    availableCategories,
    updateFilters,
    resetFilters,
    setBrandFilter,
    setCategoryFilter,
    setDateRangeFilter,
    hasActiveFilters,
    filteredRowCount: filteredData.rows.length,
    totalRowCount
  };
};

/**
 * Get filter summary text for display
 */
export function getFilterSummary(
  filters: TableFilters,
  availableBrands: string[],
  availableCategories: string[],
  dateRange: string[]
): string {
  const summaryParts: string[] = [];

  // Brand filter summary
  if (filters.selectedBrands.length > 0) {
    if (filters.selectedBrands.length === 1) {
      summaryParts.push(`Brand: ${filters.selectedBrands[0]}`);
    } else {
      summaryParts.push(`Brands: ${filters.selectedBrands.length} selected`);
    }
  }

  // Category filter summary
  if (filters.selectedCategories.length > 0) {
    if (filters.selectedCategories.length === 1) {
      summaryParts.push(`Category: ${filters.selectedCategories[0]}`);
    } else {
      summaryParts.push(`Categories: ${filters.selectedCategories.length} selected`);
    }
  }

  // Date range filter summary
  const [startIndex, endIndex] = filters.dateRange;
  if (startIndex !== 0 || endIndex !== dateRange.length - 1) {
    const startDate = dateRange[startIndex];
    const endDate = dateRange[endIndex];
    summaryParts.push(`Date: ${startDate} to ${endDate}`);
  }

  return summaryParts.length > 0 
    ? summaryParts.join(' • ')
    : 'No filters applied';
}

/**
 * Check if a specific filter type is active
 */
export function isFilterActive(
  filters: TableFilters,
  filterType: 'brand' | 'category' | 'date',
  totalDateRange: number = 0
): boolean {
  switch (filterType) {
    case 'brand':
      return filters.selectedBrands.length > 0;
    case 'category':
      return filters.selectedCategories.length > 0;
    case 'date':
      return filters.dateRange[0] !== 0 || filters.dateRange[1] !== (totalDateRange - 1);
    default:
      return false;
  }
}

/**
 * Get filter options with counts
 */
export function getFilterOptionsWithCounts(
  salesData: SalesData | null
): {
  brandOptions: Array<{ value: string; label: string; count: number }>;
  categoryOptions: Array<{ value: string; label: string; count: number }>;
} {
  if (!salesData) {
    return { brandOptions: [], categoryOptions: [] };
  }

  // Count occurrences for brands
  const brandCounts = new Map<string, number>();
  salesData.brands.forEach(brand => {
    brandCounts.set(brand.name, brand.categories.length);
  });

  // Count occurrences for categories
  const categoryCounts = new Map<string, number>();
  salesData.brands.forEach(brand => {
    brand.categories.forEach(category => {
      const currentCount = categoryCounts.get(category.name) || 0;
      categoryCounts.set(category.name, currentCount + 1);
    });
  });

  const brandOptions = Array.from(brandCounts.entries()).map(([brand, count]) => ({
    value: brand,
    label: brand,
    count
  }));

  const categoryOptions = Array.from(categoryCounts.entries()).map(([category, count]) => ({
    value: category,
    label: category,
    count
  }));

  return { brandOptions, categoryOptions };
}