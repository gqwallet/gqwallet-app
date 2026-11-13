/**
 * Labeled native select styled like a text field.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** One option of a {@link SelectField}. */
export interface SelectOption {
  /** Submitted value. */
  value: string;
  /** Visible text. */
  label: string;
}

/** Props of {@link SelectField}. */
export interface SelectFieldProps {
  /** Visible label. */
  label: string;
  /** Selected value; empty string shows the placeholder. */
  value: string;
  /** Options in display order. */
  options: SelectOption[];
  /** Called with the chosen value. */
  onChange: (value: string) => void;
  /** Text of the empty option. */
  placeholder?: string;
  /** Helper shown below the control. */
  helper?: ReactNode;
  /** Error message. */
  error?: string | null;
  /** Disables the control. */
  disabled?: boolean;
  /** Layout utilities for the wrapper. */
  className?: string;
}

/**
 * Renders a 44 px native select with label and helper.
 *
 * @example
 * ```tsx
 * <SelectField label={label} value={id} options={accounts} onChange={setId} placeholder={placeholder} />
 * ```
 */
export function SelectField({ label, value, options, onChange, placeholder, helper, error, disabled, className }: SelectFieldProps) {
  const id = useId();
  const hint = error || helper;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label text-content-secondary">
        {label}
      </label>
      <div className={cn('relative flex h-11 items-center rounded-md border bg-surface-card focus-within:outline-2 focus-within:outline-primary', error ? 'border-danger' : 'border-line-outline', disabled && 'opacity-60')}>
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="h-full w-full appearance-none bg-transparent pr-9 pl-3 text-[16px]/[22px] text-content-primary lg:text-body outline-none"
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="expand_more" className="pointer-events-none absolute right-3 text-content-muted" />
      </div>
      {hint && (
        <p id={`${id}-hint`} role={error ? 'alert' : undefined} className={cn('text-caption', error ? 'text-danger' : 'text-content-muted')}>
          {hint}
        </p>
      )}
    </div>
  );
}
