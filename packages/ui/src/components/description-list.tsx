import { cn } from '../utils/cn';

export const DescriptionList = ({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentPropsWithoutRef<'dl'> & {
  orientation?: 'horizontal' | 'vertical';
}) => {
  return (
    <dl
      {...props}
      className={cn(
        className,
        'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6',
        orientation === 'vertical' &&
          'sm:flex sm:flex-col *:sm:border-0 [&>dd]:pt-0 [&>dt]:pt-4'
      )}
    />
  );
};

export const DescriptionTerm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'dt'>) => {
  return (
    <dt
      {...props}
      className={cn(
        className,
        'col-start-1 border-t border-zinc-950/5 pt-3 font-semibold text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3'
      )}
    />
  );
};

export const DescriptionDetails = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'dd'>) => {
  return (
    <dd
      {...props}
      className={cn(
        className,
        'pt-1 pb-3 font-semibold text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none'
      )}
    />
  );
};
