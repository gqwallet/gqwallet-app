/**
 * Field that looks like a select and opens a custom picker.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Props of {@link PickerField}. */
export interface PickerFieldProps {
  /** Visible label. */
  label: string;
  /** Text of the chosen value. */
  valueText: string | null;
  /** Text shown when nothing is chosen. */
  placeholder: string;
  /** Called to open the picker. */
  onOpen: () => void;
  /** Helper below the control. */
  helper?: ReactNode;
  /** Error message. */
  error?: string | null;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a 44 px button styled as a select.
 *
 * @example
 * ```tsx
 * <PickerField label={label} valueText={name} placeholder={placeholder} onOpen={open} />
 * ```
 */
export function PickerField({ label, valueText, placeholder, onOpen, helper, error, className }: PickerFieldProps) {
  const id = useId();
  const hint = error || helper;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span id={`${id}-label`} className="text-label text-content-secondary">
        {label}
      </span>
      <button
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-invalid={Boolean(error) || undefined}
        onClick={onOpen}
        className={cn(
          'flex h-11 items-center justify-between gap-2 rounded-md border bg-surface-card px-3 text-left focus-visible:outline-2 focus-visible:outline-primary',
          error ? 'border-danger' : 'border-line-outline',
        )}
      >
        <span id={`${id}-value`} className={cn('truncate text-body', valueText ? 'text-content-primary' : 'text-content-muted')}>
          {valueText ?? placeholder}
        </span>
        <Icon name="expand_more" className="text-content-muted" />
      </button>
      {hint && (
        <p role={error ? 'alert' : undefined} className={cn('text-caption', error ? 'text-danger' : 'text-content-muted')}>
          {hint}
        </p>
      )}
    </div>
  );
}
