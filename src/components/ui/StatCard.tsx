/**
 * Key figure card with label, value and detail.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { InformationButton } from '@/components/ui/InformationButton';
import { Icon } from '@/components/ui/Icon';
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
  /** Optional contextual explanation, independent of the card action. */
  informationTopic?: string;
  /** Main figure. */
  value: string;
  /** Detail below the value. */
  detail?: ReactNode;
  /** Link-style footer within the single card button. */
  actionLabel?: string;
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
export function StatCard({ label, value, detail, actionLabel, tone = 'primary', onClick, className, informationTopic }: StatCardProps) {
  const body = (
    <>
      <span className={cn("min-h-10 text-body-s leading-5 line-clamp-2 text-content-secondary", informationTopic && "pr-7")}>{label}</span>
      <span data-stat-value className={cn('text-amount-s whitespace-nowrap lg:text-amount', VALUE[tone])}>{value}</span>
      <span className="mt-auto min-h-5 pt-1 text-caption text-content-muted">
        {detail}
        {actionLabel && <span className="inline-flex items-center text-primary group-hover:underline group-focus-visible:underline">{actionLabel}<Icon name="chevron_right" size={16} /></span>}
      </span>
    </>
  );
  const classes = cn('group flex h-full w-full min-w-0 flex-col gap-1 rounded-lg border border-line-subtle p-4 text-left', SURFACE[tone], className);
  const card = onClick ? (
    <button data-stat-card type="button" onClick={onClick} className={cn(classes, 'transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-primary')}>
      {body}
    </button>
  ) : (
    <div data-stat-card className={classes}>{body}</div>
  );
  return informationTopic ? <div className="relative min-w-0">{card}<InformationButton topic={informationTopic} className="absolute top-1 right-1" /></div> : card;
}
