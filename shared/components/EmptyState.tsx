import React from 'react';
import { generateAriaLabel } from '@/shared/utils';
import { BarChart3, Table, Search, Database } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'chart' | 'table' | 'search' | 'data';
  action?: {
    label: string;
    onClick: () => void;
    ariaLabel?: string;
  };
  className?: string;
  role?: 'status' | 'alert' | 'region';
}

const icons = {
  chart: <BarChart3 className="w-12 h-12" />,
  table: <Table className="w-12 h-12" />,
  search: <Search className="w-12 h-12" />,
  data: <Database className="w-12 h-12" />
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'data',
  action,
  className = '',
  role = 'status'
}) => {
  const iconLabels = {
    chart: 'Chart icon',
    table: 'Table icon', 
    search: 'Search icon',
    data: 'Data icon'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role={role}
      aria-live="polite"
    >
      <div 
        className="text-gray-400 dark:text-gray-500 mb-4" 
        aria-label={iconLabels[icon]}
        role="img"
      >
        {icons[icon]}
      </div>
      <h3 
        className="text-lg font-medium  dark:text-gray-100 mb-2"
        id="empty-state-title"
      >
        {title}
      </h3>
      {description && (
        <p 
          className="text-gray-500 dark:text-gray-400 mb-6 max-w-md"
          id="empty-state-description"
          aria-describedby="empty-state-title"
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 dark:0 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={action.ariaLabel || generateAriaLabel.button(action.label)}
          aria-describedby={description ? "empty-state-description" : "empty-state-title"}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};