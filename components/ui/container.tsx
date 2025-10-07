import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container size variant
   * - 'sm': max-width 640px
   * - 'md': max-width 768px  
   * - 'lg': max-width 1024px
   * - 'xl': max-width 1280px
   * - '2xl': max-width 1536px
   * - 'full': no max-width constraint
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /**
   * Whether to center the container
   */
  centered?: boolean
  /**
   * Custom padding override
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', centered = true, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base container styles
          "w-full",
          // Centering
          centered && "mx-auto",
          // Size variants
          {
            'max-w-screen-sm': size === 'sm',
            'max-w-screen-md': size === 'md', 
            'max-w-screen-lg': size === 'lg',
            'max-w-screen-xl': size === 'xl',
            'max-w-screen-2xl': size === '2xl',
            'max-w-none': size === 'full',
          },
          // Responsive padding using design tokens
          {
            'px-0': padding === 'none',
            'px-3 sm:px-4 lg:px-6': padding === 'sm',
            'px-4 sm:px-6 lg:px-8': padding === 'md' || (!padding && size !== 'full'),
            'px-6 sm:px-8 lg:px-12': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container }