import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center"
      data-testid="empty-state"
    >
      {icon && (
        <div className="mb-4 text-gray-400" data-testid="empty-state-icon">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className=" mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          data-testid="empty-state-action"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}