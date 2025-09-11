'use client';

import { Plus, CornerDownRight, ChevronDown } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Label } from '../label';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { cn } from '../../utils/cn';
import React from 'react';

export type ConditionFilter = {
  condition: string;
  value: [number | string, number | string];
};

type FilterType = 'select' | 'checkbox' | 'number';

interface DataTableFilterProps<TData, TValue> {
  column: Column<TData, TValue> | undefined;
  title?: string;
  options?: {
    label: string;
    value: string;
  }[];
  type?: FilterType;
  formatter?: (value: unknown) => string;
  // External state management (for URL persistence with nuqs)
  value?: FilterValues;
  onValueChange?: (value: FilterValues) => void;
}

const ColumnFiltersLabel = ({
  columnFilterLabels,
  className,
}: {
  columnFilterLabels: string[] | undefined;
  className?: string;
}) => {
  if (!columnFilterLabels) return null;

  if (columnFilterLabels.length < 3) {
    return (
      <span className={cn('truncate', className)}>
        {columnFilterLabels.map((value, index) => (
          <span
            key={value}
            className={cn('font-semibold text-indigo-600 dark:text-indigo-400')}
          >
            {value}
            {index < columnFilterLabels.length - 1 && ', '}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'font-semibold text-indigo-600 dark:text-indigo-400',
        className
      )}
    >
      {columnFilterLabels[0]} and {columnFilterLabels.length - 1} more
    </span>
  );
};

type FilterValues = string | string[] | ConditionFilter | undefined;

export function DataTableFilter<TData, TValue>({
  column,
  title,
  options,
  type = 'select',
  formatter = (value) => String(value),
  value: externalValue,
  onValueChange: externalOnValueChange,
}: DataTableFilterProps<TData, TValue>) {
  const columnFilters = column?.getFilterValue() as FilterValues;

  const [localState, setLocalState] =
    React.useState<FilterValues>(columnFilters);

  // Use external state if provided, otherwise use local state
  const selectedValues = externalValue ?? localState;
  const setSelectedValues = React.useCallback(
    (value: FilterValues | ((prev: FilterValues) => FilterValues)) => {
      if (externalOnValueChange) {
        if (typeof value === 'function') {
          externalOnValueChange(value(externalValue));
        } else {
          externalOnValueChange(value);
        }
      } else {
        setLocalState(value);
      }
    },
    [externalOnValueChange, externalValue]
  );

  const columnFilterLabels = React.useMemo(() => {
    if (!selectedValues) return undefined;

    if (Array.isArray(selectedValues)) {
      return selectedValues.map((value) => formatter(value));
    }

    if (typeof selectedValues === 'string') {
      return [formatter(selectedValues)];
    }

    if (typeof selectedValues === 'object' && 'condition' in selectedValues) {
      const condition = options?.find(
        (option) => option.value === selectedValues.condition
      )?.label;
      if (!condition) return undefined;
      if (!selectedValues.value?.[0] && !selectedValues.value?.[1])
        return [`${condition}`];
      if (!selectedValues.value?.[1])
        return [`${condition} ${formatter(selectedValues.value?.[0])}`];
      return [
        `${condition} ${formatter(selectedValues.value?.[0])} and ${formatter(
          selectedValues.value?.[1]
        )}`,
      ];
    }

    return undefined;
  }, [selectedValues, options, formatter]);

  const getDisplayedFilter = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            value={selectedValues as string}
            onValueChange={(value) => {
              setSelectedValues(value);
            }}
          >
            <SelectTrigger className='mt-2 sm:py-1'>
              <SelectValue placeholder='Select' />
            </SelectTrigger>
            <SelectContent>
              {options?.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className='mt-2 space-y-2 overflow-y-auto sm:max-h-36'>
            {options?.map((option) => {
              return (
                <div key={option.label} className='flex items-center gap-2'>
                  <Checkbox
                    id={option.value}
                    checked={(selectedValues as string[])?.includes(
                      option.value
                    )}
                    onCheckedChange={(checked) => {
                      setSelectedValues((prev: FilterValues) => {
                        if (checked) {
                          return prev && Array.isArray(prev)
                            ? [...prev, option.value]
                            : [option.value];
                        } else {
                          return Array.isArray(prev)
                            ? prev.filter((value) => value !== option.value)
                            : [];
                        }
                      });
                    }}
                  />
                  <Label
                    htmlFor={option.value}
                    className='text-base sm:text-sm'
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      case 'number': {
        const isBetween =
          (selectedValues as ConditionFilter)?.condition === 'is-between';
        return (
          <div className='space-y-2'>
            <Select
              value={(selectedValues as ConditionFilter)?.condition}
              onValueChange={(value) => {
                setSelectedValues((prev: FilterValues) => {
                  const prevCondition = prev as ConditionFilter;
                  return {
                    condition: value,
                    value: [
                      value !== '' ? prevCondition?.value?.[0] || '' : '',
                      '',
                    ] as [string | number, string | number],
                  };
                });
              }}
            >
              <SelectTrigger className='mt-2 sm:py-1'>
                <SelectValue placeholder='Select condition' />
              </SelectTrigger>
              <SelectContent>
                {options?.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex w-full items-center gap-2'>
              <CornerDownRight
                className='size-4 shrink-0 text-gray-500'
                aria-hidden='true'
              />
              <Input
                disabled={!(selectedValues as ConditionFilter)?.condition}
                type='number'
                placeholder='$0'
                className='sm:[&>input]:py-1'
                value={(selectedValues as ConditionFilter)?.value?.[0]}
                onChange={(e) => {
                  setSelectedValues((prev: FilterValues) => {
                    const prevCondition = prev as ConditionFilter;
                    return {
                      condition: prevCondition?.condition || '',
                      value: [
                        e.target.value,
                        isBetween ? prevCondition?.value?.[1] || '' : '',
                      ] as [string | number, string | number],
                    };
                  });
                }}
              />
              {(selectedValues as ConditionFilter)?.condition ===
                'is-between' && (
                <>
                  <span className='text-xs font-medium text-gray-500'>and</span>
                  <Input
                    disabled={!(selectedValues as ConditionFilter)?.condition}
                    type='number'
                    placeholder='$0'
                    className='sm:[&>input]:py-1'
                    value={(selectedValues as ConditionFilter)?.value?.[1]}
                    onChange={(e) => {
                      setSelectedValues((prev: FilterValues) => {
                        const prevCondition = prev as ConditionFilter;
                        return {
                          condition: prevCondition?.condition || '',
                          value: [
                            prevCondition?.value?.[0] || '',
                            e.target.value,
                          ] as [string | number, string | number],
                        };
                      });
                    }}
                  />
                </>
              )}
            </div>
          </div>
        );
      }
    }
  };

  // Sync external state with column filters when external state is provided
  React.useEffect(() => {
    if (externalValue !== undefined && selectedValues !== columnFilters) {
      column?.setFilterValue(selectedValues);
    }
  }, [selectedValues, externalValue, column, columnFilters]);

  // Sync local state with column filters when external state is not provided
  React.useEffect(() => {
    if (externalValue === undefined) {
      setLocalState(columnFilters);
    }
  }, [columnFilters, externalValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex w-full items-center gap-x-1.5 whitespace-nowrap rounded-md border border-gray-300 px-2 py-1.5 font-medium  hover:bg-gray-50 sm:w-fit sm:text-xs',
            selectedValues &&
              ((typeof selectedValues === 'object' &&
                'condition' in selectedValues &&
                selectedValues.condition !== '') ||
                (typeof selectedValues === 'string' && selectedValues !== '') ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))
              ? ''
              : 'border-dashed'
          )}
        >
          <span
            aria-hidden='true'
            onClick={(e) => {
              if (selectedValues) {
                e.stopPropagation();
                let resetValue: FilterValues = '';
                if (type === 'checkbox') {
                  resetValue = [];
                } else if (type === 'number') {
                  resetValue = {
                    condition: '',
                    value: ['', ''] as [string | number, string | number],
                  };
                }

                column?.setFilterValue('');
                setSelectedValues(resetValue);
              }
            }}
          >
            <Plus
              className={cn(
                '-ml-px size-5 shrink-0 transition sm:size-4',
                selectedValues && 'rotate-45 hover:text-red-500'
              )}
              aria-hidden='true'
            />
          </span>
          {/* differentiation below for better mobile view */}
          {columnFilterLabels && columnFilterLabels.length > 0 ? (
            <span>{title}</span>
          ) : (
            <span className='w-full text-left sm:w-fit'>{title}</span>
          )}
          {columnFilterLabels && columnFilterLabels.length > 0 && (
            <span
              className='h-4 w-px bg-gray-300 dark:bg-gray-700'
              aria-hidden='true'
            />
          )}
          <ColumnFiltersLabel
            columnFilterLabels={columnFilterLabels}
            className='w-full text-left sm:w-fit'
          />
          <ChevronDown
            className='size-5 shrink-0 text-gray-500 sm:size-4'
            aria-hidden='true'
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={7}
        className='min-w-[calc(var(--radix-popover-trigger-width))] max-w-[calc(var(--radix-popover-trigger-width))] sm:min-w-56 sm:max-w-56'
        onInteractOutside={() => {
          if (
            !columnFilters ||
            (typeof columnFilters === 'string' && columnFilters === '') ||
            (Array.isArray(columnFilters) && columnFilters.length === 0) ||
            (typeof columnFilters === 'object' &&
              'condition' in columnFilters &&
              columnFilters.condition === '')
          ) {
            let resetValue: FilterValues = '';
            if (type === 'checkbox') {
              resetValue = [];
            } else if (type === 'number') {
              resetValue = {
                condition: '',
                value: ['', ''] as [string | number, string | number],
              };
            }

            column?.setFilterValue('');
            setSelectedValues(resetValue);
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // For external state, the column filter is already synced via useEffect
            // For local state, we need to set the column filter
            if (externalValue === undefined) {
              column?.setFilterValue(selectedValues);
            }
          }}
        >
          <div className='space-y-2'>
            <div>
              <Label className='text-base font-medium sm:text-sm'>
                Filter by {title}
              </Label>
              {getDisplayedFilter()}
            </div>
            {/* <PopoverClose className="w-full" asChild> */}
            <Button type='submit' className='w-full sm:py-1'>
              Apply
            </Button>
            {/* </PopoverClose> */}
            {columnFilterLabels && columnFilterLabels.length > 0 && (
              <Button
                variant='outlined'
                className='w-full sm:py-1'
                type='button'
                onClick={() => {
                  let resetValue: FilterValues = '';
                  if (type === 'checkbox') {
                    resetValue = [];
                  } else if (type === 'number') {
                    resetValue = {
                      condition: '',
                      value: ['', ''] as [string | number, string | number],
                    };
                  }

                  column?.setFilterValue('');
                  setSelectedValues(resetValue);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
