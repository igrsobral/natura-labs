import React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  showContent?: boolean;
  headerHeight?: 'sm' | 'md' | 'lg';
  contentLines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'default',
  padding = 'md',
  showHeader = true,
  showContent = true,
  headerHeight = 'md',
  contentLines = 3,
  className
}) => {
  const headerHeights = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8'
  };

  const cardClassName = cn(
    variant === 'elevated' && 'shadow-lg',
    variant === 'outlined' && 'border-2',
    className
  );

  const cardContentClassName = cn(
    padding === 'sm' && 'p-4',
    padding === 'md' && 'p-6',
    padding === 'lg' && 'p-8',
    padding === 'none' && 'p-0'
  );

  return (
    <Card className={cardClassName}>
      {showHeader && (
        <CardHeader className="pb-6">
          <div className="space-y-2">
            <Skeleton className={cn('w-3/4', headerHeights[headerHeight])} />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </CardHeader>
      )}
      
      {showContent && (
        <CardContent className={cardContentClassName}>
          <div className="space-y-3">
            {Array.from({ length: contentLines }).map((_, index) => (
              <Skeleton 
                key={index}
                className={cn(
                  'h-4',
                  index === contentLines - 1 ? 'w-2/3' : 'w-full'
                )}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};