import { ChartConfig, useUIStore } from '@/store'
import { useCallback } from 'react'

export const useChartConfig = () => {
  const { chartConfig, updateChartConfig } = useUIStore()

  const updateChartType = useCallback((type: ChartConfig['type']) => {
    updateChartConfig({ type })
  }, [updateChartConfig])

  const updateComparisonMode = useCallback((comparisonMode: ChartConfig['comparisonMode']) => {
    updateChartConfig({ comparisonMode })
  }, [updateChartConfig])

  const toggleFormulas = useCallback(() => {
    updateChartConfig({ showFormulas: !chartConfig.showFormulas })
  }, [chartConfig.showFormulas, updateChartConfig])

  const resetConfig = useCallback(() => {
    updateChartConfig({
      type: 'line',
      comparisonMode: 'week-over-week',
      showFormulas: false
    })
  }, [updateChartConfig])

  return {
    chartConfig,
    updateChartType,
    updateComparisonMode,
    toggleFormulas,
    resetConfig
  }
}