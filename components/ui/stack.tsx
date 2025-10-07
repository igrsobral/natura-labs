import * as React from "react"
import { cn } from "@/lib/utils"

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   */
  direction?: 'vertical' | 'horizontal'
  /**
   * Spacing between stack items using design system spacing
   */
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  /**
   * Alignment of items along the main axis
   */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /**
   * Justification of items along the cross axis
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /**
   * Whether items should wrap
   */
  wrap?: boolean
  /**
   * Responsive spacing configuration
   */
  responsive?: {
    sm?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
    md?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
    lg?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
    xl?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
  }
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = 'vertical',
    spacing = 4,
    align,
    justify,
    wrap = false,
    responsive,
    children, 
    ...props 
  }, ref) => {
    const getSpacingClass = (spacingValue: number, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : ''
      const property = direction === 'vertical' ? 'space-y' : 'space-x'
      
      const spacingMap: Record<number, string> = {
        0: `${prefix}${property}-0`,
        1: `${prefix}${property}-1`,
        2: `${prefix}${property}-2`,
        3: `${prefix}${property}-3`,
        4: `${prefix}${property}-4`,
        5: `${prefix}${property}-5`,
        6: `${prefix}${property}-6`,
        8: `${prefix}${property}-8`,
        10: `${prefix}${property}-10`,
        12: `${prefix}${property}-12`,
        16: `${prefix}${property}-16`,
        20: `${prefix}${property}-20`,
        24: `${prefix}${property}-24`,
      }
      return spacingMap[spacingValue]
    }

    const getAlignClass = () => {
      if (!align) return undefined
      
      if (direction === 'vertical') {
        const alignMap = {
          start: 'items-start',
          center: 'items-center',
          end: 'items-end',
          stretch: 'items-stretch',
        }
        return alignMap[align]
      } else {
        const alignMap = {
          start: 'items-start',
          center: 'items-center', 
          end: 'items-end',
          stretch: 'items-stretch',
        }
        return alignMap[align]
      }
    }

    const getJustifyClass = () => {
      if (!justify) return undefined
      
      const justifyMap = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      }
      return justifyMap[justify]
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base flex styles
          "flex",
          // Direction
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          // Wrapping
          wrap && 'flex-wrap',
          // Spacing
          getSpacingClass(spacing),
          // Responsive spacing
          responsive?.sm && getSpacingClass(responsive.sm, 'sm'),
          responsive?.md && getSpacingClass(responsive.md, 'md'),
          responsive?.lg && getSpacingClass(responsive.lg, 'lg'),
          responsive?.xl && getSpacingClass(responsive.xl, 'xl'),
          // Alignment
          getAlignClass(),
          // Justification
          getJustifyClass(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Stack.displayName = "Stack"

export interface StackItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex grow factor
   */
  grow?: boolean | number
  /**
   * Flex shrink factor
   */
  shrink?: boolean | number
  /**
   * Flex basis
   */
  basis?: 'auto' | 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4'
}

const StackItem = React.forwardRef<HTMLDivElement, StackItemProps>(
  ({ className, grow, shrink, basis, children, ...props }, ref) => {
    const getGrowClass = () => {
      if (grow === true) return 'flex-grow'
      if (grow === false) return 'flex-grow-0'
      if (typeof grow === 'number') return `flex-grow-${grow}`
      return undefined
    }

    const getShrinkClass = () => {
      if (shrink === true) return 'flex-shrink'
      if (shrink === false) return 'flex-shrink-0'
      if (typeof shrink === 'number') return `flex-shrink-${shrink}`
      return undefined
    }

    const getBasisClass = () => {
      if (!basis) return undefined
      
      const basisMap = {
        auto: 'flex-auto',
        full: 'flex-1',
        '1/2': 'flex-1/2',
        '1/3': 'flex-1/3',
        '2/3': 'flex-2/3',
        '1/4': 'flex-1/4',
        '3/4': 'flex-3/4',
      }
      return basisMap[basis]
    }

    return (
      <div
        ref={ref}
        className={cn(
          getGrowClass(),
          getShrinkClass(),
          getBasisClass(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StackItem.displayName = "StackItem"

export { Stack, StackItem }