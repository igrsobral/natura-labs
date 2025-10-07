'use client';

import React, { useState, useMemo } from 'react';
import type { ProcessedTableData } from '@/shared/types';
import { sortTableRows } from '../hooks/useTableData';
import { EmptyState } from '@/shared/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonTable } from '@/components/ui/skeleton-table';
import { LoadingTransition } from '@/components/ui/loading-transition';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface SalesTableProps {
  data: ProcessedTableData;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  title?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  title
}) => {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  });

  // Sort the table data based on current sort state
  const sortedRows = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return data.rows;
    }

    return sortTableRows(data.rows, sortState.column, sortState.direction);
  }, [data.rows, sortState]);

  // Handle column header click for sorting
  const handleSort = (column: string) => {
    setSortState(prev => {
      if (prev.column === column) {
        // Cycle through: asc -> desc -> null
        const nextDirection: SortDirection = 
          prev.direction === 'asc' ? 'desc' :
          prev.direction === 'desc' ? null : 'asc';
        
        return {
          column: nextDirection ? column : null,
          direction: nextDirection
        };
      } else {
        // New column, start with ascending
        return {
          column,
          direction: 'asc'
        };
      }
    });
  };

  // Get sort indicator for column headers
  const getSortIndicator = (column: string) => {
    if (sortState.column !== column) {
      return (
        <ArrowUpDown className="w-4 h-4 text-muted-foreground/50" />
      );
    }
    
    return sortState.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  // Format cell value for display
  const formatCellValue = (value: number | null): string => {
    if (value === null) {
      return '-';
    }
    return value.toLocaleString();
  };

  // Loading state - use skeleton loader
  if (isLoading) {
    return (
      <SkeletonTable
        className={className}
        title={!!title}
        rows={8}
        columns={data.headers?.length || 6}
        showHeader={true}
        showFooter={true}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center py-12">
          <EmptyState
            title="Error Loading Table"
            description={error}
            icon="data"
          />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data.rows.length) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center py-12">
          <EmptyState
            title="No Data Available"
            description="No sales data matches the current filters."
            icon="table"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Card Header */}
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}

      {/* Table Content */}
      <CardContent className={title ? '' : 'pt-6'}>
        <LoadingTransition
          isLoading={isLoading}
          fallback={
            <SkeletonTable
              variant="default"
              title={false}
              rows={8}
              columns={data.headers?.length || 6}
              showHeader={true}
              showFooter={true}
            />
          }
        >
          <div className="w-full overflow-x-auto">
            <div className="rounded-md border">
              <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  {data.headers.map((header, index) => {
                    const isDateColumn = index >= 2 && index < data.headers.length - 1;
                    const columnKey = isDateColumn ? index.toString() : header;
                    
                    return (
                      <th
                        key={header}
                        className={`h-12 px-3 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors ${
                          index === 0 ? 'min-w-[120px]' : 
                          index === 1 ? 'min-w-[100px]' : 
                          'min-w-[80px] text-center'
                        }`}
                        onClick={() => handleSort(columnKey)}
                      >
                        <div className="flex items-center space-x-1 justify-center">
                          <span className="text-xs uppercase tracking-wide whitespace-nowrap">
                            {isDateColumn ? formatDateHeader(header) : header}
                          </span>
                          {getSortIndicator(columnKey)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr 
                    key={`${row.brand}-${row.category}`}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-3 py-2 align-middle font-medium text-sm">
                      <div className="truncate max-w-[120px]" title={row.brand}>
                        {row.brand}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle text-sm">
                      <div className="truncate max-w-[100px]" title={row.category}>
                        {row.category}
                      </div>
                    </td>
                    {row.values.map((value, valueIndex) => (
                      <td 
                        key={valueIndex}
                        className="px-2 py-2 align-middle text-center text-sm tabular-nums"
                      >
                        {formatCellValue(value)}
                      </td>
                    ))}
                    <td className="px-3 py-2 align-middle text-center font-medium bg-muted/30 text-sm tabular-nums">
                      {formatCellValue(row.total)}
                    </td>
                  </tr>
                ))}
                
                {/* Totals row */}
                <tr className="border-b-2 bg-muted font-medium">
                  <td className="px-3 py-3 align-middle font-bold text-sm">
                    TOTAL
                  </td>
                  <td className="px-3 py-3 align-middle text-muted-foreground text-sm">
                    —
                  </td>
                  {data.totals.byWeek.map((total, index) => (
                    <td 
                      key={index}
                      className="px-2 py-3 align-middle text-center font-bold text-sm tabular-nums"
                    >
                      {formatCellValue(total)}
                    </td>
                  ))}
                  <td className="px-3 py-3 align-middle text-center font-bold bg-primary/10 text-sm tabular-nums">
                    {formatCellValue(data.totals.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
          
          {/* Table summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {sortedRows.length} row{sortedRows.length !== 1 ? 's' : ''}
            </span>
            <span className="font-medium">
              Grand Total: <span className="text-foreground tabular-nums">{formatCellValue(data.totals.grandTotal)}</span>
            </span>
          </div>
        </LoadingTransition>
      </CardContent>
    </Card>
  );
};

/**
 * Format date header for better readability
 */
function formatDateHeader(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

export default SalesTable;