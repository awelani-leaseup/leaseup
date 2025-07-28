import { Button } from '../button';
import { cn } from '../../utils/cn';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import type { Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSize: number;
  totalCount?: number; // For manual pagination
  totalPages?: number; // For manual pagination
  currentPage?: number; // For manual pagination
}

export function DataTablePagination<TData>({
  table,
  pageSize,
  totalCount,
  totalPages,
  currentPage,
}: DataTablePaginationProps<TData>) {
  const isManualPagination = totalCount !== undefined;

  const paginationButtons = [
    {
      icon: ChevronsLeft,
      onClick: () => table.setPageIndex(0),
      disabled: !table.getCanPreviousPage(),
      srText: 'First page',
      mobileView: 'hidden sm:block',
    },
    {
      icon: ChevronLeft,
      onClick: () => table.previousPage(),
      disabled: !table.getCanPreviousPage(),
      srText: 'Previous page',
      mobileView: '',
    },
    {
      icon: ChevronRight,
      onClick: () => table.nextPage(),
      disabled: !table.getCanNextPage(),
      srText: 'Next page',
      mobileView: '',
    },
    {
      icon: ChevronsRight,
      onClick: () => table.setPageIndex(table.getPageCount() - 1),
      disabled: !table.getCanNextPage(),
      srText: 'Last page',
      mobileView: 'hidden sm:block',
    },
  ];

  // Calculate pagination info based on manual vs client-side pagination
  const totalRows = isManualPagination
    ? totalCount!
    : table.getFilteredRowModel().rows.length;
  const currentPageIndex = isManualPagination
    ? currentPage! - 1
    : table.getState().pagination.pageIndex;
  const firstRowIndex = currentPageIndex * pageSize + 1;
  const lastRowIndex = Math.min(totalRows, firstRowIndex + pageSize - 1);

  return (
    <div className='flex items-center justify-between'>
      <div className='text-sm tabular-nums text-gray-500'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className='flex items-center gap-x-6 lg:gap-x-8'>
        <p className='hidden text-sm tabular-nums text-gray-500 sm:block'>
          Showing{' '}
          <span className='font-medium text-gray-900'>
            {totalRows > 0 ? firstRowIndex : 0}-
            {totalRows > 0 ? lastRowIndex : 0}
          </span>{' '}
          of <span className='font-medium text-gray-900'>{totalRows}</span>
        </p>
        <div className='flex items-center gap-x-1.5'>
          {paginationButtons.map((button, index) => (
            <Button
              key={index}
              variant='outlined'
              className={cn(button.mobileView, 'p-1.5')}
              onClick={() => {
                button.onClick();
                table.resetRowSelection();
              }}
              disabled={button.disabled}
            >
              <span className='sr-only'>{button.srText}</span>
              <button.icon className='size-4 shrink-0' aria-hidden='true' />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
