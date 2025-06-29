import { cn } from '../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const inputVariants = cva(
  'col-start-1 row-start-1 flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        default: '',
        sm: 'h-8 px-2 py-1 text-xs md:text-xs',
        lg: 'h-11 px-4 py-2 md:text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, icon, ...props }, ref) => {
    return (
      <div className='grid grid-cols-1'>
        <input
          spellCheck={false}
          type={type}
          className={cn(inputVariants({ size }), className, {
            'pl-9': icon,
          })}
          ref={ref}
          {...props}
        />
        {icon && (
          <span
            aria-hidden='true'
            className='pointer-events-none col-start-1 row-start-1 ml-3 mt-1 self-center [&_svg]:size-5 [&_svg]:text-gray-400 [&_svg]:sm:size-4'
          >
            {icon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
