import React from 'react'
import { ErrorBoundary } from '../shared/ErrorBoundary'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 gap-8">
            {children}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}