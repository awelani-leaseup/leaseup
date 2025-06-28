import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { cn } from '../utils/cn';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import {
  Asterisk,
  CalendarIcon,
  ChevronDown,
  CircleCheck,
  Map,
  MapPin,
} from 'lucide-react';
import { type FC, type ReactNode, useEffect, useState } from 'react';

import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Calendar } from './calendar';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './text-area';
import { format } from 'date-fns';
import { useAutocompleteSuggestions } from '../hooks';
import { getAddressComponent } from '../utils/google-maps';

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const CheckboxField: FC<{ label: string }> = ({ label }) => {
  const { handleBlur, state, name } = useFieldContext<boolean>();
  return (
    <label className='flex items-center gap-2'>
      <Checkbox name={name} checked={state.value} onBlur={handleBlur} />
      <Label>{label}</Label>
    </label>
  );
};

export const TextField: FC<{
  label: string;
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
  icon?: ReactNode;
}> = ({ label, asterisk, placeholder = '', description, icon, ...props }) => {
  // & InputProps
  const { handleChange, handleBlur, state, name } = useFieldContext<string>();
  return (
    <label className='relative flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-0 -left-3 size-3 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Input
        // icon={icon}
        placeholder={placeholder}
        name={name}
        value={state.value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          {
            'ring-danger ring': state.meta.errors.length > 0,
          },
          'mt-1'
        )}
        {...props}
      />
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

export const TextAreaField: FC<{
  label: string;
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
}> = ({ label, asterisk, placeholder = '', description, ...props }) => {
  const { handleChange, handleBlur, state, name } = useFieldContext<string>();
  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-0 -left-3 size-2 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Textarea
        placeholder={placeholder}
        name={name}
        value={state.value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          {
            'ring-danger ring': state.meta.errors.length > 0,
          },
          'mt-1'
        )}
        {...props}
      />
      <FieldMessage />
      <FieldDescription>{description}</FieldDescription>
    </label>
  );
};

export const SelectField: FC<{
  label: string;
  options: {
    label: string;
    id: string;
    icon?: ReactNode;
    disabled?: boolean;
  }[];
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
}> = ({
  label,
  options,
  placeholder = 'Select a value',
  asterisk,
  description,
}) => {
  const { handleChange, handleBlur, state } = useFieldContext<string>();
  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-1 -left-3 size-3 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Select onValueChange={handleChange} value={state.value}>
        <SelectTrigger
          onBlur={handleBlur}
          className={cn(
            {
              'ring-danger ring': state.meta.errors.length > 0,
            },
            'mt-1 w-full'
          )}
        >
          <SelectValue placeholder={placeholder}>
            {state.value
              ? options.find(({ id }) => id === state.value)?.label
              : ''}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className='md:max-w-96'>
          {options.map(({ id, label, icon, disabled }) => (
            <SelectItem key={id} value={id} disabled={disabled}>
              <div className='flex flex-row items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:stroke-1'>
                {icon}
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

const DateField: FC<{
  label: string;
  asterisk?: boolean;
  description?: string;
  closeOnSelect?: boolean;
  mode: 'single' | 'multiple' | 'range';
}> = ({ label, asterisk, description, closeOnSelect = true, ...props }) => {
  // & CalendarProps
  const { handleChange, state } = useFieldContext<string>();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    state?.value ? new Date(state.value) : undefined
  );

  useEffect(() => {
    handleChange(date ? new Date(date).toISOString() : '');
    if (closeOnSelect) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-1 -left-3 size-3 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Popover modal open={open}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => setOpen((prev) => !prev)}
            variant='outlined'
            color='secondary'
            className={cn(
              'mt-1 w-full pl-3 text-left font-normal',
              !state.value && 'text-muted-foreground',
              {
                'ring-danger border-0 ring': state.meta.errors.length > 0,
              }
            )}
          >
            {state.value ? (
              format(new Date(state.value), 'dd MMM yyyy')
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          {props.mode === 'single' ? (
            <Calendar
              mode='single'
              autoFocus
              selected={date}
              onSelect={setDate}
              required={false}
              // {...props}
            />
          ) : null}
        </PopoverContent>
      </Popover>
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

export const ComboboxField: FC<{
  label: string;
  options: {
    label: string;
    id: string;
    icon?: ReactNode;
    disabled?: boolean;
  }[];
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
}> = ({
  label,
  options,
  placeholder = 'Select a value',
  asterisk,
  description,
}) => {
  const { handleChange, handleBlur, state } = useFieldContext<string>();
  const [open, setOpen] = useState(false);
  // const { suggestions, resetSession } = useAutocompleteSuggestions(
  //   debouncedAddress,
  //   {
  //     input: debouncedAddress,
  //   },
  // );
  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-1 -left-3 size-3 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            color='secondary'
            role='combobox'
            aria-expanded={open}
            className="border-input ring-offset-background data-[placeholder]:text-muted-foreground focus:ring-ring [&>span]:line-clamp-1' relative mt-1 flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm overflow-ellipsis whitespace-nowrap shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className='mr-3 flex w-full items-center overflow-clip'>
              {state.value
                ? options.find((option) => option.id === state.value)?.label
                : placeholder}
            </span>
            <ChevronDown className='absolute right-3 ml-2 h-4 w-4 shrink-0 bg-white text-gray-400' />
          </button>
        </PopoverTrigger>
        <PopoverContent onBlur={handleBlur} className='w-fit p-0 md:max-w-96'>
          <Command>
            <CommandInput placeholder='Search...' />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={(currentValue) => {
                      handleChange(
                        currentValue === state.value ? '' : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    <CircleCheck
                      className={cn(
                        'mr-2 h-4 w-4 stroke-1',
                        state.value === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

export const FieldMessage: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const { state } = useFieldContext<string>();
  const body =
    state.meta.errors.length > 0 ? state.meta.errors[0]?.message : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn('animate-in fade-in-0 text-sm font-semibold', {
        'text-danger': state.meta.errors.length > 0,
      })}
    >
      {body}
    </p>
  );
};

export const FormMessage: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  const { Subscribe } = useFormContext();

  if (children) {
    return (
      <Alert variant='destructive' color='destructive' className='mt-4'>
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Subscribe
      selector={(state) => ({
        errors: state.errors,
      })}
    >
      {({ errors }) => {
        if (errors.length === 0) {
          return null;
        }
        return (
          <Alert variant='default' color='destructive' className='mt-4'>
            <AlertDescription>
              Fix all the errors before submitting the form.
            </AlertDescription>
          </Alert>
        );
      }}
    </Subscribe>
  );
};

export const FieldLabel: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { state } = useFieldContext();
  return (
    <Label
      title={children?.toLocaleString().replace(',', '')}
      className={cn(
        {
          'text-danger': state.meta.errors.length > 0,
        },
        'relative line-clamp-1 shrink-0'
      )}
      asChild
    >
      <span>{children}</span>
    </Label>
  );
};

export const FieldDescription: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return <p className='text-muted-foreground text-sm'>{children}</p>;
};

export const SubmitFormButton: FC<{ children: ReactNode }> = ({
  children,
  ...props
}) => {
  const { handleSubmit, Subscribe } = useFormContext();
  return (
    <Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isSubmitting }) => (
        <Button
          onClick={handleSubmit}
          {...props}
          type='submit'
          isLoading={isSubmitting}
          className='mt-4'
        >
          {children}
        </Button>
      )}
    </Subscribe>
  );
};

export const AddressField: FC<{
  label: string;
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
}> = ({
  label,
  placeholder = 'Enter address',
  asterisk,
  description,
  ...props
}) => {
  const [address, setAddress] = useState('');
  const [open, setOpen] = useState(false);
  const [debouncedAddress, setDebouncedAddress] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAddress(address);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [address]);

  const { handleChange, handleBlur, state, form } = useFieldContext<{
    placeId: string;
    text: string;
  }>();
  const { suggestions, resetSession } = useAutocompleteSuggestions(
    debouncedAddress,
    {
      input: debouncedAddress,
    }
  );

  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {label}{' '}
        {asterisk ? (
          <Asterisk className='text-danger absolute -top-1 -left-3 size-3 stroke-2' />
        ) : null}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outlined'
            role='combobox'
            aria-expanded={open}
            className='justify-between truncate mt-1'
          >
            {state.value ? state.value.text : placeholder}
            <Map className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          onBlur={handleBlur}
          className='p-0 w-full md:w-96'
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search address...'
              className='h-9'
              onValueChange={(value) => {
                setAddress(value);
              }}
            />
            <CommandList>
              <CommandEmpty>
                <p className='text-sm font-bold text-center text-muted-foreground tracking-tight'>
                  No address found.
                </p>
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.placePrediction?.placeId}
                    value={suggestion.placePrediction?.mainText?.text}
                    onSelect={async (currentValue) => {
                      handleChange({
                        placeId: suggestion.placePrediction?.placeId ?? '',
                        text: currentValue,
                      });

                      try {
                        const place = suggestion?.placePrediction?.toPlace();
                        const result = await place?.fetchFields({
                          fields: ['addressComponents'],
                        });

                        form.setFieldValue(
                          'addressLine1',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'sublocality_level_1'
                          )
                        );

                        form.setFieldValue(
                          'addressLine2',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'locality'
                          )
                        );

                        form.setFieldValue(
                          'city',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'administrative_area_level_2'
                          )
                        );

                        form.setFieldValue(
                          'state',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'administrative_area_level_1'
                          )
                        );

                        form.setFieldValue(
                          'zip',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'postal_code'
                          )
                        );

                        form.setFieldValue(
                          'countryCode',
                          getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'country'
                          )
                        );
                      } catch (error) {
                        console.error('Error fetching place details:', error);
                      }

                      resetSession();
                      setOpen(false);
                    }}
                  >
                    <MapPin className='mr-2 size-4 stroke-1' />
                    {suggestion.placePrediction?.text?.text}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    FieldLabel,
    DateField,
    FieldMessage,
    FieldDescription,
    TextAreaField,
    ComboboxField,
    AddressField,
  },
  formComponents: {
    SubmitFormButton,
    FormMessage,
  },
});
