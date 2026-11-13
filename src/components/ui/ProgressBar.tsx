/**
 * Horizontal progress bar.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';

/** Tone of the progress fill. */
export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger' | 'caution' | 'teal' | 'sky' | 'violet' | 'neutral' | 'tertiary';

const FILL: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  success: 'bg-secondary',
  warning: 'bg-chart-3',
  tertiary: 'bg-tertiary',
  danger: 'bg-danger',
  caution: 'bg-caution-accent',
  teal: 'bg-chart-2',
  sky: 'bg-chart-4',
  violet: 'bg-chart-5',
  neutral: 'bg-chart-neutral',
};

/** Props of {@link ProgressBar}. */
export interface ProgressBarProps {
  /** Percentage; values above 100 fill the whole bar. */
  value: number;
  /**
   * Fill tone.
   *
   * @defaultValue `primary`
   */
  tone?: ProgressTone;
  /** Accessible name. */
  label: string;
  /** Layout utilities. */
  className?: string;
  /** Intrinsic bar dimensions; compact is used inside numeric table cells. */
  size?: 'default' | 'thin' | 'compact';
}

/**
 * Renders an 8 px rounded bar.
 *
 * @example
 * ```tsx
 * <ProgressBar value={32} tone="success" label="Progreso de la meta" />
 * ```
 */
export function ProgressBar({ value, tone = 'primary', label, className, size = 'default' }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)} className={cn('shrink-0 overflow-hidden rounded-full bg-surface-high', size === 'compact' ? 'h-1.5 w-11' : size === 'thin' ? 'h-1.5 w-full' : 'h-2 w-full', className)}>
      {/* Runtime width: the only inline style allowed. */}
      <div className={cn('h-full rounded-full', FILL[tone])} style={{ width: `${width}%` }} />
    </div>
  );
}
