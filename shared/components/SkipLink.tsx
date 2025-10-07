'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SkipLink component for keyboard accessibility
 * Allows users to skip to main content or other important sections
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className
}) => {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible on focus
        'sr-only focus:not-sr-only',
        // Positioning and styling when focused
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Smooth transitions
        'transition-all duration-200',
        // Typography
        'text-sm font-medium',
        className
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Focus the target element if it's focusable
            if (target instanceof HTMLElement && target.tabIndex >= 0) {
              target.focus();
            }
          }
        }
      }}
    >
      {children}
    </a>
  );
};

/**
 * Common skip links for the dashboard
 */
export const DashboardSkipLinks: React.FC = () => {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#dashboard-content">
        Skip to dashboard
      </SkipLink>
    </div>
  );
};

export default SkipLink;