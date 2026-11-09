/**
 * Optional time selection in five-minute increments without free-form input.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId } from 'react';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/utils/cn';

const HOURS = Array.from({ length: 24 }, (_, index) => {
  const value = String(index).padStart(2, '0');
  return { value, label: value };
});
const MINUTES = Array.from({ length: 12 }, (_, index) => {
  const value = String(index * 5).padStart(2, '0');
  return { value, label: value };
});

/** Props of {@link TimeField}. */
export interface TimeFieldProps {
  /** Visible group label. */
  label: string;
  /** Selected time as `HH:mm`, or empty for no time. */
  value: string;
  /** Called with a complete time or an empty string. */
  onChange: (value: string) => void;
  /** Helper shown below both selects. */
  helper?: string;
  /** Disables both selects. */
  disabled?: boolean;
  /** Layout utilities for the group. */
  className?: string;
}

/**
 * Renders the hour select (named after `label`) and the minute select side by side, so the field lines up with
 * single-select neighbors; the legend stays for screen readers only. Clearing either select clears the time.
 * Choosing a part while empty defaults the other part to `00`.
 *
 * @param props - Controlled time and presentation settings.
 * @returns An accessible group of native selects.
 */
export function TimeField({ label, value, onChange, helper, disabled, className }: TimeFieldProps) {
  const id = useId();
  const [hour = '', minute = ''] = value.split(':');
  return (
    <fieldset aria-describedby={helper ? `${id}-hint` : undefined} className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <legend className="sr-only">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label={label} value={hour} options={HOURS} placeholder="Sin hora" disabled={disabled} onChange={(next) => onChange(next ? `${next}:${minute || '00'}` : '')} />
        <SelectField label="Minutos" value={minute} options={MINUTES} placeholder="Sin hora" disabled={disabled} onChange={(next) => onChange(next ? `${hour || '00'}:${next}` : '')} />
      </div>
      {helper && <p id={`${id}-hint`} className="text-caption text-content-muted">{helper}</p>}
    </fieldset>
  );
}
