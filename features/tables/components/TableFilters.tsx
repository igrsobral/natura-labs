'use client';

import React, { useState } from 'react';
import type { TableFilters } from '@/shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TableFiltersProps {
  filters: TableFilters;
  availableBrands: string[];
  availableCategories: string[];
  dateRange: string[];
  onFiltersChange: (filters: Partial<TableFilters>) => void;
  onReset: () => void;
  className?: string;
}

export const TableFiltersComponent: React.FC<TableFiltersProps> = ({
  filters,
  availableBrands,
  availableCategories,
  dateRange,
  onFiltersChange,
  onReset,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle brand selection
  const handleBrandChange = (brand: string, checked: boolean) => {
    const updatedBrands = checked
      ? [...filters.selectedBrands, brand]
      : filters.selectedBrands.filter(b => b !== brand);
    
    onFiltersChange({ selectedBrands: updatedBrands });
  };

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.selectedCategories, category]
      : filters.selectedCategories.filter(c => c !== category);
    
    onFiltersChange({ selectedCategories: updatedCategories });
  };

  // Handle date range change
  const handleDateRangeChange = (type: 'start' | 'end', value: number) => {
    const [currentStart, currentEnd] = filters.dateRange;
    const newRange: [number, number] = type === 'start' 
      ? [value, Math.max(value, currentEnd)]
      : [Math.min(value, currentStart), value];
    
    onFiltersChange({ dateRange: newRange });
  };

  // Select/deselect all brands
  const handleSelectAllBrands = (selectAll: boolean) => {
    onFiltersChange({ 
      selectedBrands: selectAll ? [...availableBrands] : [] 
    });
  };

  // Select/deselect all categories
  const handleSelectAllCategories = (selectAll: boolean) => {
    onFiltersChange({ 
      selectedCategories: selectAll ? [...availableCategories] : [] 
    });
  };

  // Check if filters are active
  const hasActiveFilters = 
    filters.selectedBrands.length > 0 ||
    filters.selectedCategories.length > 0 ||
    filters.dateRange[0] !== 0 ||
    filters.dateRange[1] !== dateRange.length - 1;

  return (
    <Card className={className}>
      {/* Filter Header */}
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Filter Content */}
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Brand Filter */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">
                Brands ({filters.selectedBrands.length} selected)
              </Label>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllBrands(true)}
                  disabled={filters.selectedBrands.length === availableBrands.length}
                  className="text-xs h-7 px-2"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllBrands(false)}
                  disabled={filters.selectedBrands.length === 0}
                  className="text-xs h-7 px-2"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-32 overflow-y-auto p-3 border rounded-md bg-muted/50">
              {availableBrands.map(brand => (
                <div key={brand} className="flex items-center space-x-3">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                  />
                  <Label 
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">
                Categories ({filters.selectedCategories.length} selected)
              </Label>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllCategories(true)}
                  disabled={filters.selectedCategories.length === availableCategories.length}
                  className="text-xs h-7 px-2"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllCategories(false)}
                  disabled={filters.selectedCategories.length === 0}
                  className="text-xs h-7 px-2"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-32 overflow-y-auto p-3 border rounded-md bg-muted/50">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <Label className="text-sm font-medium mb-4 block">
              Date Range
            </Label>
            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
              <div>
                <Label className="text-xs font-medium mb-2 block">From</Label>
                <Select
                  value={filters.dateRange[0].toString()}
                  onValueChange={(value) => handleDateRangeChange('start', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRange.map((date, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {formatDateOption(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium mb-2 block">To</Label>
                <Select
                  value={filters.dateRange[1].toString()}
                  onValueChange={(value) => handleDateRangeChange('end', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRange.map((date, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {formatDateOption(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Quick Filter Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md border">
            {filters.selectedBrands.length > 0 && (
              <Badge variant="secondary">
                {filters.selectedBrands.length} brand{filters.selectedBrands.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {filters.selectedCategories.length > 0 && (
              <Badge variant="secondary">
                {filters.selectedCategories.length} categor{filters.selectedCategories.length !== 1 ? 'ies' : 'y'}
              </Badge>
            )}
            {(filters.dateRange[0] !== 0 || filters.dateRange[1] !== dateRange.length - 1) && (
              <Badge variant="secondary">
                Custom date range
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Format date option for select dropdown
 */
function formatDateOption(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

export default TableFiltersComponent;