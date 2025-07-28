'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { cn } from '../../utils/cn';
import * as React from 'react';

import { DataTablePagination } from './data-table-pagination';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, Row, Table as TableType } from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  table?: TableType<TData>; // Optional external table instance for manual pagination
  onRowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData>({
  columns,
  data,
  table: externalTable,
  onRowClick,
}: DataTableProps<TData>) {
  const pageSize = 20;
  const [rowSelection, setRowSelection] = React.useState({});

  // Use external table if provided, otherwise create internal table
  const internalTable = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    enableRowSelection: true,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const table = externalTable || internalTable;

  return (
    <div className='space-y-3'>
      <div className='relative overflow-hidden overflow-x-auto'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-y'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'whitespace-nowrap py-1'
                      // header.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='group select-none hover:bg-gray-50'
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        row.getIsSelected()
                          ? 'bg-gray-50 dark:bg-gray-900'
                          : '',
                        'relative whitespace-nowrap py-2 first:w-10'
                        // cell.column.columnDef.meta?.className
                      )}
                    >
                      {index === 0 && row.getIsSelected() && (
                        <div className='absolute inset-y-0 left-0 w-0.5 bg-blue-500 dark:bg-blue-500' />
                      )}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* <DataTableBulkEditor table={table} rowSelection={rowSelection} /> */}
      </div>
      {/* Only show pagination if not using external table (external table handles its own pagination) */}
      {!externalTable && (
        <DataTablePagination table={table} pageSize={pageSize} />
      )}
    </div>
  );
}
