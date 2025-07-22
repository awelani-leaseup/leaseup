'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { cn } from '../utils/cn';
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from '@tanstack/react-form';
import {
  Asterisk,
  CalendarIcon,
  ChevronDown,
  CircleCheck,
  Map,
  MapPin,
  Phone,
} from 'lucide-react';
import { type FC, type ReactNode, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input/input';

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
import { Switch } from './switch';
import { Textarea } from './text-area';
import { format } from 'date-fns';
import { useAutocompleteSuggestions } from '../hooks';
import { getAddressComponent } from '../utils/google-maps';
import { DayPicker } from 'react-day-picker';

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

export const SwitchField: FC<{
  label: string;
  description?: string;
  asterisk?: boolean;
}> = ({ label, description, asterisk }) => {
  const { handleChange, handleBlur, state, name } = useFieldContext<boolean>();

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center justify-between'>
        <FieldLabel>
          {asterisk && <span className='text-danger ml-1'>*</span>}
          {label}
        </FieldLabel>
        <Switch
          name={name}
          checked={state.value}
          onCheckedChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </div>
  );
};

const CustomInput = (
  props: Omit<React.ComponentProps<'input'>, 'size'> & {
    size?: 'default' | 'sm' | 'lg' | null;
  }
) => {
  return <Input icon={<Phone />} {...props} />;
};

export const TextField: FC<
  {
    label: string;
    placeholder?: string;
    asterisk?: boolean;
    description?: string;
    icon?: ReactNode;
  } & Omit<React.ComponentProps<'input'>, 'size'>
> = ({ label, asterisk, placeholder = '', description, icon, ...props }) => {
  const { handleChange, handleBlur, state, name } = useFieldContext<
    string | number
  >();

  return (
    <label className='relative flex w-full flex-col gap-1'>
      <FieldLabel>
        {label}
        {asterisk && <span className='text-danger ml-1'>*</span>}
      </FieldLabel>
      {props.type === 'tel' ? (
        <PhoneInput
          smartCaret
          inputComponent={CustomInput}
          country='ZA'
          name={name}
          value={state.value as string}
          onChange={(value) => {
            if (value) {
              handleChange(value);
            }
          }}
          onBlur={handleBlur}
        />
      ) : (
        <Input
          icon={icon}
          placeholder={placeholder}
          name={name}
          value={state.value}
          onChange={(e) => {
            if (props.type === 'number') {
              handleChange(Number(e.target.value));
            } else {
              handleChange(e.target.value);
            }
          }}
          onBlur={handleBlur}
          className={cn(
            {
              'ring-rose-600 ring': state.meta.errors.length > 0,
            },
            'mt-1'
          )}
          {...props}
        />
      )}
      <FieldMessage />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </label>
  );
};

export const TextAreaField: FC<
  {
    label: string;
    placeholder?: string;
    asterisk?: boolean;
    description?: string;
  } & React.ComponentProps<'textarea'>
> = ({ label, asterisk, placeholder = '', description, ...props }) => {
  const { handleChange, handleBlur, state, name } = useFieldContext<string>();
  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk && <span className='text-danger ml-1'>*</span>}
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
            'ring-rose-600 ring': state.meta.errors.length > 0,
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
  disabled?: boolean;
}> = ({
  label,
  options,
  placeholder = 'Select a value',
  asterisk,
  description,
  disabled,
}) => {
  const { handleChange, handleBlur, state } = useFieldContext<string>();
  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk && <span className='text-danger ml-1'>*</span>}
        {label}
      </FieldLabel>
      <Select
        onValueChange={handleChange}
        value={state.value}
        disabled={disabled}
      >
        <SelectTrigger
          onBlur={handleBlur}
          className={cn(
            {
              'ring-rose-600 ring': state.meta.errors.length > 0,
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

const DateField: FC<
  {
    label: string;
    asterisk?: boolean;
    description?: string;
    closeOnSelect?: boolean;
    mode: 'single' | 'multiple' | 'range';
    disabled?: boolean;
  } & React.ComponentProps<typeof DayPicker>
> = ({
  label,
  asterisk,
  description,
  closeOnSelect = true,
  disabled,
  ...props
}) => {
  // & CalendarProps
  const { handleChange, state } = useFieldContext<Date | null>();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    state?.value ? new Date(state.value) : undefined
  );

  useEffect(() => {
    handleChange(date ? new Date(date) : null);
    if (closeOnSelect) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-rose-500 absolute -top-1 -left-3 size-3 stroke-2' />
        ) : null}
        {label}
      </FieldLabel>
      <Popover modal open={open}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            variant='outlined'
            color='secondary'
            className={cn(
              'mt-1 w-full pl-3 text-left font-normal',
              !state.value && 'text-muted-foreground',
              {
                'ring-rose-600 border-0 ring': state.meta.errors.length > 0,
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
              captionLayout='dropdown'
              autoFocus
              selected={date}
              onSelect={setDate}
              required={false}
              disabled={disabled}
              {...props}
              mode='single'
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

  return (
    <label className='flex w-full flex-col gap-1'>
      <FieldLabel>
        {asterisk ? (
          <Asterisk className='text-rose-600 absolute -top-1 -left-3 size-3 stroke-2' />
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
                    <div className='flex flex-row items-center gap-2 [&_svg]:size-2 [&_svg]:shrink-0 [&_svg]:stroke-1'>
                      {option.icon}
                      {option.label}
                    </div>
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
  const form = useFieldContext<string>();

  const errors = useStore(form.store, (state) => state.meta.errors);

  const body = errors.length > 0 ? errors[0]?.message : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn('animate-in fade-in-0 text-sm font-semibold', {
        'text-rose-500': errors.length > 0,
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
          <Alert
            variant='destructive'
            color='destructive'
            className='mt-4 animate-in fade-in-0'
          >
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
          'text-rose-600': state.meta.errors.length > 0,
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
  callback?: () => void;
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

  const { handleChange, handleBlur, state, form } = useFieldContext<string>();
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
          <Asterisk className='text-rose-600 absolute -top-1 -left-3 size-3 stroke-2' />
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
            {state.value ? state.value : placeholder}
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
                      handleChange(
                        suggestion.placePrediction?.mainText?.text +
                          ' ' +
                          suggestion.placePrediction?.secondaryText?.text
                      );

                      try {
                        const place = suggestion?.placePrediction?.toPlace();
                        const result = await place?.fetchFields({
                          fields: ['addressComponents'],
                        });

                        form.setFieldValue(
                          'addressLine1',
                          `${suggestion.placePrediction?.mainText?.text} ${getAddressComponent(
                            result?.place?.addressComponents ?? [],
                            'sublocality_level_1'
                          )}`
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
                            'country',
                            false
                          )
                        );

                        form.validateAllFields('submit');
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

export const ArraySubField: FC<{
  label: string;
  placeholder?: string;
  asterisk?: boolean;
  description?: string;
  onChange: (value: string | number) => void;
  value: string | number;
  type?: 'text' | 'number';
  errors: { message: string }[];
}> = ({
  label,
  placeholder,
  asterisk,
  value,
  onChange,
  errors,
  type = 'text',
}) => {
  return (
    <label className='flex w-full flex-col gap-1'>
      <Label
        title={label?.toLocaleString().replace(',', '')}
        className={cn(
          {
            'text-rose-600': errors.length > 0,
          },
          'relative line-clamp-1 shrink-0'
        )}
        asChild
      >
        <span>
          {label}
          {asterisk ? (
            <Asterisk className='text-rose-600 absolute -top-1 -left-3 size-3 stroke-2' />
          ) : null}
        </span>
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (type === 'number') {
            onChange(Number(e.target.value));
          } else {
            onChange(e.target.value);
          }
        }}
      />
      {errors && errors.length > 0 && (
        <p className='mt-1 font-semibold text-sm tracking-tight text-rose-600'>
          {errors[0]?.message}
        </p>
      )}
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
    SwitchField,
  },
  formComponents: {
    SubmitFormButton,
    FormMessage,
    ArraySubField,
  },
});
