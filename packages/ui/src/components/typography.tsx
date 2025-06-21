import * as React from 'react';

import { cn } from '../utils/cn';

function H1({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot='typography-h1'
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot='typography-h2'
      className={cn(
        'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
        className
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot='typography-h3'
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function H4({ className, ...props }: React.ComponentProps<'h4'>) {
  return (
    <h4
      data-slot='typography-h4'
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function H5({ className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5
      data-slot='typography-h5'
      className={cn(
        'scroll-m-20 text-lg font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function H6({ className, ...props }: React.ComponentProps<'h6'>) {
  return (
    <h6
      data-slot='typography-h6'
      className={cn(
        'scroll-m-20 text-base font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function P({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='typography-p'
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    />
  );
}

function Blockquote({
  className,
  ...props
}: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      data-slot='typography-blockquote'
      className={cn(
        'mt-6 border-l-2 pl-6 italic text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function Lead({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='typography-lead'
      className={cn('text-xl text-muted-foreground', className)}
      {...props}
    />
  );
}

function Large({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='typography-large'
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function Small({ className, ...props }: React.ComponentProps<'small'>) {
  return (
    <small
      data-slot='typography-small'
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function Muted({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='typography-muted'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { H1, H2, H3, H4, H5, H6, P, Blockquote, Lead, Large, Small, Muted };
