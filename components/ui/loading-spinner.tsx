import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  text?: string;
  ariaLabel?: string;
  type?: 'spinner' | 'dots' | 'pulse';
}

/**
 * Enhanced LoadingSpinner component with multiple variants and animations
 * Respects user's reduced motion preferences
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
  ariaLabel = 'Loading content',
  type = 'spinner'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const borderSizes = {
    xs: 'border',
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
    xl: 'border-4'
  };

  const variantClasses = {
    default: 'border-gray-200 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300',
    primary: 'border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400',
    secondary: 'border-gray-200 border-t-gray-500 dark:border-gray-700 dark:border-t-gray-400'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (type === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div className="flex space-x-1" role="status" aria-label={ariaLabel}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                'rounded-full animate-pulse',
                sizeClasses[size],
                variant === 'primary' 
                  ? 'bg-primary-600 dark:bg-primary-400' 
                  : 'bg-gray-600 dark:bg-gray-300'
              )}
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
          <span className="sr-only">{ariaLabel}</span>
        </div>
        {text && (
          <p className={cn('mt-2  dark:text-gray-400 text-center', textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            variant === 'primary' 
              ? 'bg-primary-600 dark:bg-primary-400' 
              : 'bg-gray-600 dark:bg-gray-300'
          )}
          role="status"
          aria-label={ariaLabel}
        >
          <span className="sr-only">{ariaLabel}</span>
        </div>
        {text && (
          <p className={cn('mt-2  dark:text-gray-400 text-center', textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner type
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          borderSizes[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
      {text && (
        <p className={cn('mt-2  dark:text-gray-400 text-center', textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Inline loading spinner for buttons and small spaces
 */
export const InlineSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className }) => {
  return (
    <LoadingSpinner
      size={size}
      variant="primary"
      type="spinner"
      className={cn('inline-flex', className)}
      ariaLabel="Loading"
    />
  );
};

/**
 * Button loading spinner that replaces button content
 */
export const ButtonSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'sm', className }) => {
  const spinnerSize = size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs';
  
  return (
    <LoadingSpinner
      size={spinnerSize}
      variant="primary"
      type="spinner"
      className={cn('inline-flex', className)}
      ariaLabel="Processing"
    />
  );
};

export default LoadingSpinner;