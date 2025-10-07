import React from 'react'
import { useSalesStore } from '@/store/salesStore'
import { calculateAverageSales, calculateWeekOverWeek, calculateCumulative } from '@/shared/utils/calculationUtils'

interface CalculationCardProps {
  type: 'average' | 'wow' | 'cumulative'
  title: string
  description: string
}

const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercentage = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(1)}%`
}

export const CalculationCard: React.FC<CalculationCardProps> = ({ type, title, description }) => {
  const { salesData } = useSalesStore()

  const calculateValue = () => {
    if (!salesData || !salesData.brands || salesData.brands.length === 0) {
      return 'N/A'
    }

    // Get all sales data from all categories
    const allSalesData: (number | null)[] = []
    salesData.brands.forEach(brand => {
      brand.categories.forEach(category => {
        category.sales.forEach(sale => {
          allSalesData.push(sale)
        })
      })
    })

    switch (type) {
      case 'average': {
        const result = calculateAverageSales(allSalesData)
        return formatCurrency(result.value)
      }
      case 'wow': {
        // Calculate week-over-week for the first category as an example
        if (salesData.brands[0]?.categories[0]?.sales) {
          const result = calculateWeekOverWeek(salesData.brands[0].categories[0].sales)
          const lastValidWoW = result.data.filter(val => val !== null).pop()
          return formatPercentage(lastValidWoW || null)
        }
        return 'N/A'
      }
      case 'cumulative': {
        const result = calculateCumulative(allSalesData)
        return formatCurrency(result.totalSum)
      }
      default:
        return 'N/A'
    }
  }

  return (
    <div className="rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-2xl font-bold text-blue-600">
          {calculateValue()}
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}