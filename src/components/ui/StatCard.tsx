/**
 * Key figure card with label, value and detail.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Tone of a stat card. */
export type StatTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const SURFACE: Record<StatTone, string> = {
  neutral: 'bg-surface-card',
  primary: 'bg-primary-container',
  success: 'bg-secondary-container',
  warning: 'bg-tertiary-container',
  danger: 'bg-danger-container',
};

const VALUE: Record<StatTone, string> = {
  neutral: 'text-content-primary',
  primary: 'text-primary-on-container',
  success: 'text-secondary',
  warning: 'text-tertiary',
  danger: 'text-danger',
};

/** Props of {@link StatCard}. */
export interface StatCardProps {
  /** Label above the value. */
  label: string;
  /** Main figure. */
  value: string;
  /** Detail below the value. */
  detail?: ReactNode;
  /**
   * Color tone.
   *
   * @defaultValue `primary`
   */
  tone?: StatTone;
  /** Makes the whole card a button. */
  onClick?: () => void;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a stat card; it becomes a button when `onClick` is given.
 *
 * @example
 * ```tsx
 * <StatCard label="Ingresos de junio" value="S/ 7,500.00" detail="1 ingreso" tone="success" />
 * ```
 */
export function StatCard({ label, value, detail, tone = 'primary', onClick, className }: StatCardProps) {
  const body = (
    <>
      <span className="text-body-s text-content-secondary">{label}</span>
      <span className={cn('text-amount break-all', VALUE[tone])}>{value}</span>
      {detail && <span className="text-caption text-content-muted">{detail}</span>}
    </>
  );
  const classes = cn('flex flex-col gap-1 rounded-lg border border-line-subtle p-4 text-left', SURFACE[tone], className);
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(classes, 'transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-primary')}>
      {body}
    </button>
  ) : (
    <div className={classes}>{body}</div>
  );
}
