import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  type?: 'fade' | 'slide' | 'scale';
}

/**
 * LoadingTransition component provides smooth transitions between loading and content states
 * Supports fade-in animations and skeleton-to-content transitions
 */
export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  fallback,
  className,
  duration = 300,
  delay = 0,
  type = 'fade'
}) => {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => {
     
        requestAnimationFrame(() => {
          setShowContent(true);
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  const transitionClasses = {
    fade: {
      base: 'transition-opacity ease-in-out',
      entering: 'opacity-0',
      entered: 'opacity-100'
    },
    slide: {
      base: 'transition-all ease-in-out transform',
      entering: 'opacity-0 translate-y-4',
      entered: 'opacity-100 translate-y-0'
    },
    scale: {
      base: 'transition-all ease-in-out transform',
      entering: 'opacity-0 scale-95',
      entered: 'opacity-100 scale-100'
    }
  };

  const transition = transitionClasses[type];

  if (isLoading) {
    return (
      <div className={cn('transition-opacity duration-150', className)}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={cn(
        transition.base,
        showContent ? transition.entered : transition.entering,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * FadeIn component for simple fade-in animations
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className, delay = 0, duration = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * SkeletonToContent component for smooth skeleton-to-content transitions
 */
export const SkeletonToContent: React.FC<{
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, skeleton, children, className }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Skeleton overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 ease-in-out',
          isLoading ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        )}
      >
        {skeleton}
      </div>
      
      {/* Content */}
      <div
        className={cn(
          'transition-opacity duration-300 ease-in-out',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default LoadingTransition;