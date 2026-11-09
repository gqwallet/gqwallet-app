/**
 * Labeled text input with helper and error text.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Props of {@link TextField}. */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Visible label. */
  label: string;
  /** Current value. */
  value: string;
  /** Called with the new text. */
  onChange: (value: string) => void;
  /** Helper shown below the control. */
  helper?: ReactNode;
  /** Error message; turns the field red and replaces the helper. */
  error?: string | null;
  /** Fixed text before the value, e.g. a currency symbol. */
  prefix?: string;
  /** Trailing icon ligature. */
  trailingIcon?: string;
  /** Layout utilities for the wrapper. */
  className?: string;
}

/**
 * Renders a 44 px input with label, optional prefix and helper; errors are announced to assistive tech.
 *
 * @example
 * ```tsx
 * <TextField label="Correo" type="email" value={email} onChange={setEmail} error={emailError} />
 * ```
 */
export function TextField({ label, value, onChange, helper, error, prefix, trailingIcon, className, id, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const hint = error || helper;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-label text-content-secondary">
        {label}
      </label>
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-md border bg-surface-card px-3 focus-within:outline-2 focus-within:outline-primary',
          error ? 'border-danger' : 'border-line-outline',
        )}
      >
        {prefix && <span className="text-body text-content-primary">{prefix}</span>}
        <input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint ? hintId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-body text-content-primary outline-none placeholder:text-content-muted"
          {...rest}
        />
        {trailingIcon && <Icon name={trailingIcon} className="text-content-muted" />}
      </div>
      {hint && (
        <p id={hintId} role={error ? 'alert' : undefined} className={cn('text-caption', error ? 'text-danger' : 'text-content-muted')}>
          {hint}
        </p>
      )}
    </div>
  );
}
