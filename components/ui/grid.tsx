import * as React from "react"
import { cn } from "@/lib/utils"

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (1-12)
   */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /**
   * Responsive column configuration
   */
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  }
  /**
   * Gap between grid items using design system spacing
   */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  /**
   * Row gap (if different from gap)
   */
  rowGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  /**
   * Column gap (if different from gap)
   */
  colGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 1, 
    responsive,
    gap = 4,
    rowGap,
    colGap,
    children, 
    ...props 
  }, ref) => {
    const getColsClass = (columns: number) => {
      const colsMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2', 
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
      }
      return colsMap[columns]
    }

    const getGapClass = (gapValue: number, type: 'gap' | 'gap-x' | 'gap-y' = 'gap') => {
      const gapMap: Record<number, string> = {
        0: `${type}-0`,
        1: `${type}-1`,
        2: `${type}-2`,
        3: `${type}-3`,
        4: `${type}-4`,
        5: `${type}-5`,
        6: `${type}-6`,
        8: `${type}-8`,
        10: `${type}-10`,
        12: `${type}-12`,
        16: `${type}-16`,
        20: `${type}-20`,
        24: `${type}-24`,
      }
      return gapMap[gapValue]
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base grid styles
          "grid",
          // Default columns
          getColsClass(cols),
          // Responsive columns
          responsive?.sm && `sm:${getColsClass(responsive.sm)}`,
          responsive?.md && `md:${getColsClass(responsive.md)}`,
          responsive?.lg && `lg:${getColsClass(responsive.lg)}`,
          responsive?.xl && `xl:${getColsClass(responsive.xl)}`,
          // Gap handling
          !rowGap && !colGap && getGapClass(gap),
          rowGap && getGapClass(rowGap, 'gap-y'),
          colGap && getGapClass(colGap, 'gap-x'),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Grid.displayName = "Grid"

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column span (1-12)
   */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
  /**
   * Row span
   */
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full'
  /**
   * Responsive column span configuration
   */
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full'
  }
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, responsive, children, ...props }, ref) => {
    const getColSpanClass = (span: GridItemProps['colSpan']) => {
      if (span === 'full') return 'col-span-full'
      const spanMap = {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
      }
      return span ? spanMap[span] : undefined
    }

    const getRowSpanClass = (span: GridItemProps['rowSpan']) => {
      if (span === 'full') return 'row-span-full'
      const spanMap = {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
      }
      return span ? spanMap[span] : undefined
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Column span
          getColSpanClass(colSpan),
          // Row span
          getRowSpanClass(rowSpan),
          // Responsive column spans
          responsive?.sm && `sm:${getColSpanClass(responsive.sm)}`,
          responsive?.md && `md:${getColSpanClass(responsive.md)}`,
          responsive?.lg && `lg:${getColSpanClass(responsive.lg)}`,
          responsive?.xl && `xl:${getColSpanClass(responsive.xl)}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GridItem.displayName = "GridItem"

export { Grid, GridItem }