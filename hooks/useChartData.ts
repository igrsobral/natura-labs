import { useMemo } from 'react'
import { SalesData, ChartConfig, ProcessedChartData } from '../shared/types'

export const useChartData = (
  data: SalesData | null, 
  config: ChartConfig, 
  isLoading?: boolean, 
  error?: string | null
) => {
  const chartData = useMemo((): ProcessedChartData => {
    if (!data || isLoading || error) {
      return { labels: [], datasets: [] }
    }

    // Create labels from date range
    const labels = data.dateRange

    // Create datasets from brands and categories
    const datasets = data.brands.flatMap(brand =>
      brand.categories.map(category => ({
        label: `${brand.name} - ${category.name}`,
        data: category.sales,
        brandName: brand.name,
        categoryName: category.name
      }))
    )

    return { labels, datasets }
  }, [data, isLoading, error])

  const hasData = chartData.datasets.length > 0
  const isEmpty = !hasData && !isLoading && !error

  return {
    chartData,
    hasData,
    isEmpty,
    error
  }
}