/**
 * On/off switch with a label and optional description.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Props of {@link Toggle}. */
export interface ToggleProps {
  /** Visible label. */
  label: string;
  /** Text below the label. */
  description?: ReactNode;
  /** Error shown in place of the description. */
  error?: string | null;
  /** Whether the switch is on. */
  isOn: boolean;
  /** Called with the new state. */
  onChange: (isOn: boolean) => void;
  /** Blocks the switch and dims it. */
  isDisabled?: boolean;
}

/**
 * Renders a 44×24 switch; on uses the secondary green.
 *
 * @example
 * ```tsx
 * <Toggle label="Fondo de emergencia" isOn={isFund} onChange={setIsFund} />
 * ```
 */
export function Toggle({ label, description, error, isOn, onChange, isDisabled = false }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span id={`${id}-label`} className="text-subtitle text-content-primary">
          {label}
        </span>
        {(error || description) && (
          <span role={error ? 'alert' : undefined} className={cn('text-caption', error ? 'text-danger' : 'text-content-muted')}>
            {error || description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-labelledby={`${id}-label`}
        disabled={isDisabled}
        onClick={() => onChange(!isOn)}
        className={cn(
          '-my-2.5 flex size-11 shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span className={cn('flex h-6 w-11 items-center rounded-full p-0.5 transition-colors', isOn ? 'bg-secondary' : 'bg-surface-high')}>
          <span className={cn('size-5 rounded-full bg-surface-card shadow-card transition-transform', isOn && 'translate-x-5')} />
        </span>
      </button>
    </div>
  );
}
