/**
 * Selectable chip and horizontally scrolling chip group.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Props of {@link Chip}. */
export interface ChipProps {
  /** Visible text. */
  label: string;
  /** Whether the chip is selected. */
  isSelected?: boolean;
  /** Leading icon; a check is shown automatically when selected. */
  icon?: string;
  /** Called when the chip is pressed. */
  onClick?: () => void;
}

/**
 * Renders a 30 px chip; selected chips use the primary color and a check.
 *
 * @example
 * ```tsx
 * <Chip label="PEN · Soles" isSelected onClick={selectPen} />
 * ```
 */
export function Chip({ label, isSelected = false, icon, onClick }: ChipProps) {
  const glyph = isSelected ? 'check' : icon;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={cn(
        'inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-label whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-primary',
        isSelected ? 'border-primary bg-primary text-content-on-primary' : 'border-line-outline bg-surface-card text-content-secondary hover:bg-surface-container',
      )}
    >
      {glyph && <Icon name={glyph} size={16} />}
      {label}
    </button>
  );
}

/** One option of a {@link ChipGroup}. */
export interface ChipOption<TValue extends string> {
  /** Option value. */
  value: TValue;
  /** Visible text. */
  label: string;
  /** Optional icon. */
  icon?: string;
}

/** Props of {@link ChipGroup}. */
export interface ChipGroupProps<TValue extends string> {
  /** Accessible name of the group. */
  label: string;
  /** Options in display order. */
  options: ChipOption<TValue>[];
  /** Selected value. */
  value: TValue | null;
  /** Called with the chosen value. */
  onChange: (value: TValue) => void;
  /** Wraps into several lines instead of sliding; used for long catalogs. */
  isWrapping?: boolean;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a single-choice chip row that slides horizontally instead of wrapping.
 *
 * @example
 * ```tsx
 * <ChipGroup label="Moneda" options={CURRENCIES} value={currency} onChange={setCurrency} />
 * ```
 */
export function ChipGroup<TValue extends string>({ label, options, value, onChange, isWrapping = false, className }: ChipGroupProps<TValue>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('-mx-1 flex min-w-0 max-w-full gap-2 px-1', isWrapping ? 'flex-wrap' : 'overflow-x-auto [scrollbar-width:none]', className)}
    >
      {options.map((option) => (
        <Chip key={option.value} label={option.label} icon={option.icon} isSelected={option.value === value} onClick={() => onChange(option.value)} />
      ))}
    </div>
  );
}
