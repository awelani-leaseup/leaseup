import { cn } from '../utils/cn';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:stroke-1 [&_svg]:shrink-0 relative overflow-hidden',
  {
    variants: {
      color: {
        default: '',
        destructive: '',
        secondary: '',
        success: '',
        link: '',
        danger: '',
        info: '',
        warning: '',
      },
      size: {
        default: 'h-8 px-2 py-1.5',
        sm: 'h-7 px-1.5 text-xs',
        lg: 'h-9 px-4',
        icon: 'size-8',
      },
      variant: {
        solid: '',
        outlined: '',
        text: '',
        soft: '',
        icon: 'size-9',
      },
      rounded: {
        none: 'rounded-md',
        top: 'rounded-t-xl',
        bottom: 'rounded-b-xl',
      },
    },
    compoundVariants: [
      {
        color: 'default',
        variant: 'solid',
        class: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      },
      {
        color: 'default',
        variant: 'outlined',
        class:
          'border border-primary bg-transparent text-primary shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      {
        color: 'default',
        variant: 'text',
        class: 'text-primary underline-offset-4 hover:underline',
      },
      {
        color: 'default',
        variant: 'soft',
        class: 'bg-primary/10 text-primary hover:bg-primary/20',
      },
      {
        color: 'destructive',
        variant: 'solid',
        class:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      },
      {
        color: 'destructive',
        variant: 'outlined',
        class:
          'border border-destructive text-destructive shadow-sm hover:bg-destructive/10',
      },
      {
        color: 'destructive',
        variant: 'text',
        class: 'text-destructive underline-offset-4 hover:underline',
      },
      {
        color: 'destructive',
        variant: 'soft',
        class: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      },
      {
        color: 'secondary',
        variant: 'solid',
        class:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      },
      {
        color: 'secondary',
        variant: 'outlined',
        class:
          'border border-secondary text-secondary shadow-sm hover:bg-secondary/10',
      },
      {
        color: 'secondary',
        variant: 'text',
        class: 'text-secondary underline-offset-4 hover:underline',
      },
      {
        color: 'secondary',
        variant: 'soft',
        class: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
      },
      {
        color: 'success',
        variant: 'solid',
        class:
          'bg-success text-success-foreground shadow-sm hover:bg-success/80',
      },
      {
        color: 'success',
        variant: 'outlined',
        class:
          'border border-success text-success shadow-sm hover:bg-success/10',
      },
      {
        color: 'success',
        variant: 'text',
        class: 'text-success underline-offset-4 hover:underline',
      },
      {
        color: 'success',
        variant: 'soft',
        class: 'bg-success/10 text-success hover:bg-success/20',
      },
      {
        color: 'link',
        variant: 'solid',
        class: 'text-primary underline-offset-4 hover:underline',
      },
      {
        color: 'link',
        variant: 'outlined',
        class:
          'border border-transparent text-primary underline-offset-4 hover:underline',
      },
      {
        color: 'link',
        variant: 'text',
        class: 'text-primary underline-offset-4 hover:underline',
      },
      {
        color: 'danger',
        variant: 'solid',
        class: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90',
      },
      {
        color: 'danger',
        variant: 'outlined',
        class: 'border border-danger text-danger shadow-sm hover:bg-danger/10',
      },
      {
        color: 'danger',
        variant: 'text',
        class: 'text-danger underline-offset-4 hover:underline',
      },
      {
        color: 'danger',
        variant: 'soft',
        class: 'bg-danger/10 text-danger hover:bg-danger/20',
      },
      {
        color: 'info',
        variant: 'solid',
        class: 'bg-info text-info-foreground shadow-sm hover:bg-info/90',
      },
      {
        color: 'info',
        variant: 'outlined',
        class: 'border border-info text-info shadow-sm hover:bg-info/10',
      },
      {
        color: 'info',
        variant: 'text',
        class: 'text-info underline-offset-4 hover:underline',
      },
      {
        color: 'info',
        variant: 'soft',
        class: 'bg-info/10 text-info hover:bg-info/20',
      },
      {
        color: 'warning',
        variant: 'solid',
        class:
          'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90',
      },
      {
        color: 'warning',
        variant: 'outlined',
        class:
          'border border-warning text-warning shadow-sm hover:bg-warning/10',
      },
      {
        color: 'warning',
        variant: 'text',
        class: 'text-warning underline-offset-4 hover:underline',
      },
      {
        color: 'warning',
        variant: 'soft',
        class: 'bg-warning/10 text-warning hover:bg-warning/20',
      },
      {
        color: 'warning',
        variant: 'icon',
        class: ' text-warning hover:bg-warning/20',
      },
      {
        color: 'danger',
        variant: 'icon',
        class: 'text-danger hover:bg-danger/20',
      },
      {
        color: 'info',
        variant: 'icon',
        class: ' text-info hover:bg-info/20',
      },
      {
        color: 'success',
        variant: 'icon',
        class: ' text-success hover:bg-success/20',
      },
      {
        color: 'secondary',
        variant: 'icon',
        class: ' text-secondary hover:bg-secondary/20',
      },
    ],
    defaultVariants: {
      color: 'default',
      size: 'default',
      variant: 'solid',
      rounded: 'none',
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      color,
      rounded,
      isLoading,
      size,
      variant,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ color, size, variant, className, rounded })
        )}
        ref={ref}
        disabled={isLoading}
        aria-disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span aria-hidden={isLoading} className='opacity-0'>
              {children}
            </span>
            <span className='point absolute inset-0 grid h-full w-full place-content-center'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='sr-only'>Loading</span>
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
