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
  success: 'bg-surface-card',
  warning: 'bg-surface-card',
  danger: 'bg-surface-card',
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
  /** Reference dimensions for standard, report and cash-flow figures. */
  size?: 'default' | 'report' | 'flow';
  /** Responsive value typography used by the mobile summary variants. */
  valueSize?: 'default' | 'compact' | 'large';
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
export function StatCard({ label, value, detail, actionLabel, tone = 'primary', onClick, className, informationTopic, size = 'default', valueSize = 'default' }: StatCardProps) {
  const body = (
    <>
      <span className={cn("min-h-10 text-body-s [overflow-wrap:anywhere] text-content-secondary", informationTopic && "pr-9")}>{label}</span>
      <span data-stat-value className={cn('[overflow-wrap:anywhere]', valueSize === 'compact' ? 'text-title lg:text-amount' : valueSize === 'large' ? 'text-amount' : 'text-amount-s lg:text-amount', VALUE[tone])}>{value}</span>
      <span className="block min-h-4 text-caption text-content-muted">
        {detail}
        {actionLabel && <span className="flex items-center text-label text-primary underline">{actionLabel}<Icon name="chevron_right" size={16} /></span>}
      </span>
    </>
  );
  const classes = cn('group flex h-full w-full min-w-0 flex-col gap-1 rounded-information border px-4 pt-4 pb-3 text-left shadow-stat', size === 'report' ? 'min-h-stat-report' : size === 'flow' ? 'min-h-stat-compact lg:min-h-stat-flow' : valueSize === 'compact' ? 'min-h-stat-compact lg:min-h-stat' : 'min-h-stat-mobile lg:min-h-stat', tone === 'primary' ? 'border-primary-pale' : 'border-line-subtle', SURFACE[tone], !informationTopic && className);
  const card = onClick ? (
    <button data-stat-card type="button" onClick={onClick} className={cn(classes, 'transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-primary')}>
      {body}
    </button>
  ) : (
    <div data-stat-card className={classes}>{body}</div>
  );
  return informationTopic ? <div className={cn("relative min-w-0", className)}>{card}<InformationButton topic={informationTopic} className="absolute top-0.5 right-0.5" /></div> : card;
}
