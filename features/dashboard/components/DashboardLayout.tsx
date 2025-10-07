'use client';

import React from 'react';
import { ErrorBoundary } from '@/shared/components';
import { Container } from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  /**
   * Container size variant
   */
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /**
   * Vertical spacing between sections
   */
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
}

export function DashboardLayout({ 
  children, 
  title,
  className = "",
  containerSize = '2xl',
  spacing = 6
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <ErrorBoundary>
        <Container 
          size={containerSize}
          padding="md"
          className="py-4 sm:py-6"
        >
          <Stack 
            direction="vertical" 
            spacing={spacing}
            responsive={{
              sm: Math.max(4, spacing - 2) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24,
              md: spacing,
              lg: spacing
            }}
          >
            {title && (
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  {title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Interactive sales data visualization and analysis
                </p>
              </div>
            )}
            
            {/* Main content area using design system spacing */}
            <div className="w-full">
              {children}
            </div>
          </Stack>
        </Container>
      </ErrorBoundary>
    </div>
  );
}