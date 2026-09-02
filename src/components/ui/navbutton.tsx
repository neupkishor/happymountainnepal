//to be remade

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '#/core/utils'
import { Button, type ButtonProps } from '#/components/ui/button'

const navButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:bg-primary/10 hover:text-primary active:bg-primary/25 active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      active: {
        false: '',
        true: 'bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary active:bg-primary/40',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

export type NavButtonProps = ButtonProps & VariantProps<typeof navButtonVariants> & {
  isActive?: boolean
  tooltip?: React.ReactNode
}

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ className, active, isActive, tooltip: _tooltip, variant, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant ?? 'plain'}
        data-active={(active ?? isActive) || undefined}
        className={cn(navButtonVariants({ active, className }), active && 'active')}
        {...props}
      />
    )
  }
)
NavButton.displayName = 'NavButton'

export { NavButton, navButtonVariants }
