import { useCallback } from 'react'
import { useUIStore } from '../store/uiStore'
import { TableFilters } from '../shared/types'

export const useTableFilters = () => {
  const { tableFilters, updateTableFilters } = useUIStore()

  const updateBrands = useCallback((brands: string[]) => {
    updateTableFilters({ selectedBrands: brands })
  }, [updateTableFilters])

  const updateCategories = useCallback((categories: string[]) => {
    updateTableFilters({ selectedCategories: categories })
  }, [updateTableFilters])

  const updateDateRange = useCallback((dateRange: TableFilters['dateRange']) => {
    updateTableFilters({ dateRange })
  }, [updateTableFilters])

  const clearFilters = useCallback(() => {
    updateTableFilters({
      selectedBrands: [],
      selectedCategories: [],
      dateRange: [0, 0]
    })
  }, [updateTableFilters])

  const hasActiveFilters = useCallback(() => {
    return (
      tableFilters.selectedBrands.length > 0 ||
      tableFilters.selectedCategories.length > 0 ||
      (tableFilters.dateRange[0] !== 0 || tableFilters.dateRange[1] !== 0)
    )
  }, [tableFilters])

  return {
    tableFilters,
    updateBrands,
    updateCategories,
    updateDateRange,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  }
}