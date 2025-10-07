import { useMemo } from 'react'
import { SalesData, TableFilters, ProcessedTableData } from '../shared/types'

export const useTableData = (data: SalesData | null, filters: TableFilters) => {
  const processedData = useMemo((): ProcessedTableData => {
    if (!data) {
      return {
        headers: [],
        rows: [],
        totals: { byWeek: [], grandTotal: 0 }
      }
    }

    // Create headers: Brand, Category, ...dateRange, Total
    const headers = ['Brand', 'Category', ...data.dateRange, 'Total']

    // Create rows from brands and categories
    const rows = data.brands.flatMap(brand =>
      brand.categories.map(category => {
        const total = category.sales.reduce((sum, value) => (sum || 0) + (value || 0), 0)
        return {
          brand: brand.name,
          category: category.name,
          values: category.sales,
          total
        }
      })
    )

    // Calculate weekly totals
    const byWeek = data.dateRange.map((_, weekIndex) => {
      return data.brands.reduce((weekTotal, brand) => {
        return brand.categories.reduce((brandTotal, category) => {
          const value = category.sales[weekIndex]
          return brandTotal + (value || 0)
        }, weekTotal)
      }, 0)
    })

    // Calculate grand total
    const grandTotal = byWeek.reduce((sum, weekTotal) => sum + weekTotal, 0)

    return {
      headers,
      rows,
      totals: { byWeek, grandTotal }
    }
  }, [data])

  // Apply filters
  const filteredData = useMemo((): ProcessedTableData => {
    if (!processedData.rows.length) return processedData

    let filteredRows = [...processedData.rows]

    // Filter by brands
    if (filters.selectedBrands.length > 0) {
      filteredRows = filteredRows.filter(row => 
        filters.selectedBrands.includes(row.brand)
      )
    }

    // Filter by categories
    if (filters.selectedCategories.length > 0) {
      filteredRows = filteredRows.filter(row => 
        filters.selectedCategories.includes(row.category)
      )
    }

    // Recalculate totals for filtered data
    const byWeek = processedData.headers.slice(2, -1).map((_, weekIndex) => {
      return filteredRows.reduce((weekTotal, row) => {
        const value = row.values[weekIndex]
        return weekTotal + (value || 0)
      }, 0)
    })

    const grandTotal = byWeek.reduce((sum, weekTotal) => sum + weekTotal, 0)

    return {
      headers: processedData.headers,
      rows: filteredRows,
      totals: { byWeek, grandTotal }
    }
  }, [processedData, filters])

  return {
    data: filteredData,
    isEmpty: filteredData.rows.length === 0,
    hasData: filteredData.rows.length > 0
  }
}