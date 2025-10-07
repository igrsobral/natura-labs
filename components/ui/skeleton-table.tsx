import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface SkeletonTableProps {
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  title?: boolean;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * SkeletonTable component that matches the structure of the SalesTable component
 * Used for loading states while table data is being fetched
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  className,
  variant = 'default',
  title = true,
  rows = 5,
  columns = 6,
  showHeader = true,
  showFooter = true
}) => {
  return (
    <Card className={cn(
      variant === 'elevated' && 'shadow-lg',
      variant === 'outlined' && 'border-2',
      className
    )}>
      {/* Card Header with Title */}
      {title && (
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
      )}

      {/* Table Content */}
      <CardContent className={title ? '' : 'pt-6'}>
        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <div className="min-w-full">
            {/* Table Header */}
            {showHeader && (
              <div className=" dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8">
                  {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton 
                      key={index}
                      className={cn(
                        'h-4',
                        index === 0 ? 'w-24' : index === 1 ? 'w-20' : 'w-16'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Table Rows */}
            <div className="dark:bg-gray-900">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div 
                  key={rowIndex}
                  className={cn(
                    'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
                    rowIndex % 2 === 0 
                      ? 'dark:bg-gray-900' 
                      : '/50 dark:bg-gray-800/50'
                  )}
                >
                  <div className="flex space-x-8">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <Skeleton 
                        key={colIndex}
                        className={cn(
                          'h-4',
                          colIndex === 0 ? 'w-24' : 
                          colIndex === 1 ? 'w-20' : 
                          colIndex === columns - 1 ? 'w-20' : 'w-16'
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Totals Row */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border-t-2 border-primary-200 dark:border-primary-700 px-6 py-4">
                <div className="flex space-x-8">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                  {Array.from({ length: columns - 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-16" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Table Footer/Summary */}
        {showFooter && (
          <div className="mt-4 px-4 py-3  dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Compact skeleton table for smaller spaces
 */
export const SkeletonTableCompact: React.FC<Omit<SkeletonTableProps, 'rows' | 'showFooter'>> = ({
  className,
  variant = 'default',
  title = false,
  columns = 4,
  showHeader = true
}) => {
  return (
    <SkeletonTable
      className={className}
      variant={variant}
      title={title}
      rows={3}
      columns={columns}
      showHeader={showHeader}
      showFooter={false}
    />
  );
};

export default SkeletonTable;