'use client';

import React, { useMemo } from 'react';
import { EmptyState } from '@/shared/components';
import { SkeletonTable } from '@/components/ui/skeleton-table';
import { Filter } from 'lucide-react';

import { SalesTable } from './SalesTable';
import TableFilters from './TableFilters';
import { TablePagination, usePagination } from './TablePagination';
import { useTableData, useTableFilters } from '../hooks';
import { useSalesStore } from '@/store/salesStore';

interface TableContainerProps {
  className?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  className = ''
}) => {
  let salesData, isLoading, error;
  
  try {
    const storeState = useSalesStore();
    salesData = storeState.salesData;
    isLoading = storeState.isLoading;
    error = storeState.error;
  } catch (hmrError) {
    console.warn('HMR issue with store, using fallback state:', hmrError);
    salesData = null;
    isLoading = true;
    error = null;
  }

  let tableData, hasData, isEmpty;
  try {
    const tableDataResult = useTableData(salesData, isLoading, error?.message || null);
    tableData = tableDataResult.tableData;
    hasData = tableDataResult.hasData;
    isEmpty = tableDataResult.isEmpty;
  } catch (hmrError) {
    console.warn('HMR issue with useTableData, using fallback:', hmrError);
    tableData = { headers: [], rows: [], totals: { byWeek: [], grandTotal: null } };
    hasData = false;
    isEmpty = true;
  }

  let filters: unknown, filteredData: unknown, availableBrands: string[], availableCategories: string[], updateFilters: unknown, resetFilters: unknown, hasActiveFilters: boolean, filteredRowCount: number, totalRowCount: number;
  try {
    const filterResult = useTableFilters(salesData);
    filters = filterResult.filters;
    filteredData = filterResult.filteredData;
    availableBrands = filterResult.availableBrands;
    availableCategories = filterResult.availableCategories;
    updateFilters = filterResult.updateFilters;
    resetFilters = filterResult.resetFilters;
    hasActiveFilters = filterResult.hasActiveFilters;
    filteredRowCount = filterResult.filteredRowCount;
    totalRowCount = filterResult.totalRowCount;
  } catch (hmrError) {
    console.warn('HMR issue with useTableFilters, using fallback:', hmrError);
    filters = { selectedBrands: [], selectedCategories: [], dateRange: [0, 0] as [number, number] };
    filteredData = tableData;
    availableBrands = [];
    availableCategories = [];
    updateFilters = () => {};
    resetFilters = () => {};
    hasActiveFilters = false;
    filteredRowCount = 0;
    totalRowCount = 0;
  }

  let currentPage: number, totalPages: number, itemsPerPage: number, startIndex: number, endIndex: number, handlePageChange: unknown, handleItemsPerPageChange: unknown;
  try {
    const paginationResult = usePagination(filteredRowCount, 25);
    currentPage = paginationResult.currentPage;
    totalPages = paginationResult.totalPages;
    itemsPerPage = paginationResult.itemsPerPage;
    startIndex = paginationResult.startIndex;
    endIndex = paginationResult.endIndex;
    handlePageChange = paginationResult.handlePageChange;
    handleItemsPerPageChange = paginationResult.handleItemsPerPageChange;
  } catch (hmrError) {
    console.warn('HMR issue with usePagination, using fallback:', hmrError);
    currentPage = 1;
    totalPages = 1;
    itemsPerPage = 25;
    startIndex = 0;
    endIndex = 0;
    handlePageChange = () => {};
    handleItemsPerPageChange = () => {};
  }

  const paginatedRows = useMemo(() => {
    return filteredData.rows.slice(startIndex, endIndex);
  }, [filteredData.rows, startIndex, endIndex]);

  const paginatedTableData = useMemo(() => ({
    ...filteredData,
    rows: paginatedRows
  }), [filteredData, paginatedRows]);

  const handleResetFilters = () => {
    resetFilters();
    handlePageChange(1); 
  };

  // Loading state - use skeleton loader
  if (isLoading && !salesData) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Skeleton for filters */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 min-w-48">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 min-w-48">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton table */}
        <SkeletonTable
          variant="default"
          title={false}
          rows={10}
          columns={6}
          showHeader={true}
          showFooter={true}
        />
      </div>
    );
  }

  // Error state
  if (error && !salesData) {
    return (
      <div className={className}>
        <EmptyState
          title="Unable to Load Data"
          description={error.message}
          icon="data"
          action={{
            label: "Try Again",
            onClick: () => {
              // Retry loading data
              const store = useSalesStore.getState();
              store.retryLoad();
            }
          }}
        />
      </div>
    );
  }

  // Empty data state
  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          title="No Sales Data Available"
          description="There is no sales data to display. Please check back later or contact support if this issue persists."
          icon="table"
        />
      </div>
    );
  }

  // No filtered results state
  if (hasActiveFilters && filteredRowCount === 0) {
    return (
      <div className={className}>
        <div className="space-y-6">
          <TableFilters
            filters={filters}
            availableBrands={availableBrands}
            availableCategories={availableCategories}
            dateRange={salesData?.dateRange || []}
            onFiltersChange={updateFilters}
            onReset={handleResetFilters}
          />
          
          <EmptyState
            title="No Results Found"
            description="No sales data matches your current filter criteria. Try adjusting your filters or clearing them to see all data."
            icon="search"
            action={{
              label: "Clear All Filters",
              onClick: handleResetFilters
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <TableFilters
        filters={filters}
        availableBrands={availableBrands}
        availableCategories={availableCategories}
        dateRange={salesData?.dateRange || []}
        onFiltersChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className=" border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-primary">
                Showing {filteredRowCount} of {totalRowCount} rows
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-700 hover:text-primary font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full">
        <SalesTable
          data={paginatedTableData}
          isLoading={isLoading}
          error={error?.message || null}
        />
        
        {/* Pagination */}
        {filteredRowCount > 0 && (
          <div className="mt-4">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRowCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Table Statistics */}
      {hasData && (
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-medium  mb-3">Summary Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold ">
                {filteredData.totals.grandTotal?.toLocaleString() || '-'}
              </div>
              <div className="text-sm text-gray-500">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold ">
                {filteredRowCount}
              </div>
              <div className="text-sm text-gray-500">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold ">
                {availableBrands.length}
              </div>
              <div className="text-sm text-gray-500">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold ">
                {availableCategories.length}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableContainer;