import { cn } from '../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 gap-1 tracking-tight whitespace-nowrap ',
  {
    variants: {
      variant: {
        solid: '',
        outlined: 'border-[0.6px]',
        soft: 'bg-opacity-20 border-[0.6px] ',
      },
      color: {
        primary: '',
        secondary: '',
        danger: '',
        success: '',
        warning: '',
        info: '',
        outline: 'text-foreground',
      },
      size: {
        sm: 'px-1.5 py-1 text-xs [&_svg]:size-3',
        md: 'px-2 py-1.5 text-sm [&_svg]:size-4',
        lg: 'px-2 py-1.5 text-base [&_svg]:size-5',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        color: 'primary',
        class:
          'bg-primary border-transparent text-primary-foreground hover:bg-primary/80 shadow',
      },
      {
        variant: 'solid',
        color: 'secondary',
        class:
          'bg-secondary border-transparent text-secondary-foreground hover:bg-secondary/80',
      },
      {
        variant: 'solid',
        color: 'danger',
        class:
          'bg-destructive border-transparent text-destructive-foreground hover:bg-destructive/80 shadow',
      },
      {
        variant: 'solid',
        color: 'success',
        class:
          'bg-success border-transparent text-success-foreground hover:bg-success/80 shadow',
      },
      {
        variant: 'solid',
        color: 'warning',
        class:
          'bg-warning border-transparent text-warning-foreground hover:bg-warning/80 shadow',
      },
      {
        variant: 'solid',
        color: 'info',
        class:
          'bg-info text-info-foreground border-transparent hover:bg-info/80 shadow',
      },
      {
        variant: 'outlined',
        color: 'primary',
        class: 'text-primary border-primary',
      },
      {
        variant: 'outlined',
        color: 'secondary',
        class: 'text-secondary border-secondary',
      },
      {
        variant: 'outlined',
        color: 'danger',
        class: 'text-destructive border-destructive',
      },
      {
        variant: 'outlined',
        color: 'success',
        class: 'text-success border-success',
      },
      {
        variant: 'outlined',
        color: 'warning',
        class: 'text-warning border-warning',
      },
      { variant: 'outlined', color: 'info', class: 'text-info border-info' },
      {
        variant: 'soft',
        color: 'primary',
        class: 'bg-primary/10 text-primary border-primary',
      },
      {
        variant: 'soft',
        color: 'secondary',
        class: 'bg-secondary/10 text-secondary border-secondary',
      },
      {
        variant: 'soft',
        color: 'danger',
        class: 'bg-destructive/10 text-destructive border-destructive',
      },
      {
        variant: 'soft',
        color: 'success',
        class: 'bg-success/10 text-success border-success',
      },
      {
        variant: 'soft',
        color: 'warning',
        class: 'bg-warning/10 text-warning border-warning',
      },
      {
        variant: 'soft',
        color: 'info',
        class: 'bg-info/10 text-info border-info',
      },
    ],
    defaultVariants: {
      color: 'primary',
      variant: 'solid',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ color, variant, size }), className)}
      {...props}
    />
  );
}
export { Badge, badgeVariants };
