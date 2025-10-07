import React from 'react'
import { useSalesStore } from '@/store/salesStore'
import { useUIStore } from '@/store/uiStore'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { Button } from '../ui/button'

export const DashboardHeader: React.FC = () => {
  const { loadSalesData, isLoading, lastUpdated, error } = useSalesStore()
  const { resetAllFilters } = useUIStore()

  const handleRefresh = () => {
    loadSalesData()
  }

  const handleResetFilters = () => {
    resetAllFilters()
  }

  return (
    <div className="rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics Dashboard</h1>
          <p className=" mt-2">
            Comprehensive sales data analysis with interactive charts and AI insights
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
          
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error?.message || 'An error occurred'}</p>
        </div>
      )}
    </div>
  )
}