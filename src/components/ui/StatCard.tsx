/**
 * Key figure card with label, value and detail.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { InformationButton } from '@/components/ui/InformationButton';
import { Icon } from '@/components/ui/Icon';
import { IconTile, type IconTileTone } from '@/components/ui/IconTile';
import { cn } from '@/utils/cn';

/** Tone of a stat card. */
export type StatTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'featured';

const SURFACE: Record<StatTone, string> = {
  neutral: 'bg-surface-card',
  primary: 'bg-primary-container',
  success: 'bg-surface-card',
  warning: 'bg-surface-card',
  danger: 'bg-surface-card',
  featured: 'bg-linear-[132deg] from-featured-start to-featured-end',
};

const VALUE: Record<StatTone, string> = {
  neutral: 'text-content-primary',
  primary: 'text-primary-on-container',
  success: 'text-secondary',
  warning: 'text-tertiary',
  danger: 'text-danger',
  featured: 'text-white',
};

const TILE_TONE: Record<StatTone, IconTileTone> = { neutral: 'indigo', primary: 'indigo', success: 'positive', warning: 'amber', danger: 'negative', featured: 'featured' };
const TILE_ICON: Record<StatTone, string> = { neutral: 'account_balance_wallet', primary: 'account_balance_wallet', success: 'trending_up', warning: 'event', danger: 'trending_down', featured: 'balance' };

/** Props of {@link StatCard}. */
export interface StatCardProps {
  /** Label above the value. */
  label: string;
  /** Decorative category identity above the label. */
  icon?: string;
  /** Optional category color independent of the amount tone. */
  iconTone?: IconTileTone;
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
   * @defaultValue `featured`
   */
  tone?: StatTone;
  /** Reference dimensions for standard, report and cash-flow figures. */
  size?: 'default' | 'report' | 'flow';
  /** Compatibility hint; refreshed tiles use the same 22 px amount at every viewport. */
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
export function StatCard({ label, value, detail, actionLabel, tone = 'featured', onClick, className, informationTopic, icon, iconTone, size = 'default' }: StatCardProps) {
  const isFeatured = tone === 'featured';
  const amount = /^(.*)(\.\d+)([^\d]*)$/.exec(value);
  const body = (
    <>
      <IconTile icon={icon ?? TILE_ICON[tone]} tone={iconTone ?? TILE_TONE[tone]} className="mb-2.5" />
      <span className={cn('text-body-s [overflow-wrap:anywhere]', size === 'report' ? 'min-h-8' : size === 'flow' ? 'min-h-8 lg:min-h-4' : 'min-h-4', isFeatured ? 'text-white/85' : 'text-content-secondary')}>{label}</span>
      <span data-stat-value className={cn('text-amount tabular-nums [overflow-wrap:anywhere]', VALUE[tone])}>{amount ? <>{amount[1]}<span className="text-[16px]">{amount[2]}</span>{amount[3]}</> : value}</span>
      <span className={cn('mt-auto block min-h-4 text-caption', isFeatured ? 'text-white' : 'text-content-muted')}>
        {detail}
        {actionLabel && <span className={cn('flex items-center underline', isFeatured ? 'text-white' : 'text-primary')}>{actionLabel}<Icon name="chevron_right" size={16} /></span>}
      </span>
    </>
  );
  const classes = cn('group flex h-full min-h-kpi w-full min-w-0 flex-col gap-1 rounded-xl border p-4 text-left shadow-stat', isFeatured ? 'border-transparent' : 'border-line-subtle', SURFACE[tone], !informationTopic && className);
  const card = onClick ? (
    <button data-stat-card type="button" onClick={onClick} className={cn(classes, 'transition-[box-shadow,border-color] hover:border-accent-container-strong hover:shadow-card active:shadow-stat focus-visible:outline-2 focus-visible:outline-primary')}>
      {body}
    </button>
  ) : (
    <div data-stat-card className={classes}>{body}</div>
  );
  return informationTopic ? <div className={cn('relative min-w-0', className)}>{card}<InformationButton topic={informationTopic} className={cn('absolute top-3 right-1', isFeatured && '[&>.material-symbols-rounded]:text-white hover:bg-white/20')} /></div> : card;
}
