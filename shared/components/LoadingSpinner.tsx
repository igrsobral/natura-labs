import React from 'react';
import { useAccessibilityPreferences } from '@/shared/hooks';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  ariaLabel?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
  ariaLabel = 'Loading content'
}) => {
  const { prefersReducedMotion } = useAccessibilityPreferences();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const borderClasses = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4'
  };

  // Use a static indicator if user prefers reduced motion
  const shouldAnimate = !prefersReducedMotion();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${borderClasses[size]} 
          border-gray-200 border-t-blue-600 rounded-full
          ${shouldAnimate ? 'animate-spin' : ''}
        `}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
      {text && (
        <p className="mt-2 text-sm  text-center" aria-live="polite">
          {text}
        </p>
      )}
      {!shouldAnimate && (
        <p className="mt-1 text-xs text-gray-500 text-center">
          Loading...
        </p>
      )}
    </div>
  );
};