import { Search, ShieldAlert } from 'lucide-react';
import { FC, ReactNode } from 'react';
// @ts-expect-error - tailwind-variants is not typed
import { tv, type VariantProps } from 'tailwind-variants';

import { Button } from './button';
import { Card, CardContent } from './card';

const emptyStateVariants = tv({
  base: 'overflow-hidden border-2 border-dashed shadow-none',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const EmptyState: FC<{
  title: string;
  description?: string;
  buttons?: ReactNode;
  icon?: ReactNode;
  size?: VariantProps<typeof emptyStateVariants>['size'];
}> = ({ buttons, description, title, icon, size }) => {
  return (
    <Card className={emptyStateVariants({ size })}>
      <CardContent className='overflow-hidden bg-white pt-6'>
        <div className='text-center'>
          <span
            aria-hidden
            className='text-gray-400 [&_svg]:mx-auto [&_svg]:size-6'
          >
            {icon}
          </span>
          <h3 className='mt-2 font-semibold tracking-tight text-gray-900 capitalize'>
            {title}
          </h3>
          <p className='mx-auto mt-1 max-w-md text-pretty text-gray-500'>
            {description}
          </p>
          {buttons && (
            <div className='mt-6 flex justify-center gap-2'>{buttons}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface NoPermissionProps {
  resourceText?: string;
}

const NoPermission: FC<NoPermissionProps> = ({ resourceText }) => {
  return (
    <EmptyState
      title='No Permission'
      description={
        resourceText
          ? `You do not have permission to ${resourceText}.`
          : 'You do not have permission to access this resource.'
      }
      icon={<ShieldAlert />}
      buttons={<Button variant='outlined'>Contact Admin</Button>}
    />
  );
};

const NoSearchResults: FC<{
  searchString?: string;
  onResetFilter?: () => void;
  className?: string;
}> = ({ searchString, onResetFilter }) => {
  return (
    <EmptyState
      title='No search results found'
      description={
        searchString
          ? `No results found for "${searchString}". Try a different search term and/or filters.`
          : 'No results found. Try a different search term and/or filters.'
      }
      icon={<Search />}
      buttons={
        <Button variant='outlined' size='sm' onClick={onResetFilter}>
          Clear Filters
        </Button>
      }
    />
  );
};

export { EmptyState, NoSearchResults, NoPermission };
