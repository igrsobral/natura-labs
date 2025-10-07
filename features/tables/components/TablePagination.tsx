'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = ''
}) => {
  // Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle page navigation
  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Handle previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't render if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 ${className}`}>
      {/* Items per page selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm ">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm ">per page</span>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center space-x-4">
        {/* Results info */}
        <div className="text-sm ">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>

        {/* Navigation buttons */}
        <nav className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium text-gray-500 hover: disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'z-10  border-blue-500 text-blue-600'
                  : page === '...'
                  ? 'border-gray-300 text-gray-500 cursor-default'
                  : 'border-gray-300 text-gray-500 hover:'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium text-gray-500 hover: disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

/**
 * Hook for managing pagination state
 */
export const usePagination = (totalItems: number, initialItemsPerPage: number = 25) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page when items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Reset to first page when total items changes significantly
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  // Calculate slice indices for data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    handlePageChange,
    handleItemsPerPageChange
  };
};

export default TablePagination;