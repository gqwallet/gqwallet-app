/**
 * Row of a list: leading icon, title and detail, optional badge, amount and chevron.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Color of the row amount. */
export type AmountTone = 'neutral' | 'income' | 'expense' | 'muted';

const AMOUNT: Record<AmountTone, string> = {
  neutral: 'text-content-primary',
  income: 'text-secondary',
  expense: 'text-danger',
  muted: 'text-content-muted line-through',
};

/** Props of {@link ListRow}. */
export interface ListRowProps {
  /** Main text. */
  title: string;
  /** Secondary text. */
  detail?: ReactNode;
  /** Leading icon ligature. */
  icon?: string;
  /** Custom leading element, replaces the icon box. */
  leading?: ReactNode;
  /** Badge or other element before the amount. */
  badge?: ReactNode;
  /** Amount text. */
  amount?: string;
  /** Text below the amount. */
  meta?: ReactNode;
  /**
   * Amount color.
   *
   * @defaultValue `neutral`
   */
  amountTone?: AmountTone;
  /** Makes the row a button with a chevron. */
  onClick?: () => void;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders an adaptive list row; with `onClick` it is a button and shows a chevron.
 *
 * @example
 * ```tsx
 * <ListRow icon="wifi" title="Internet" detail={detail} amount="S/ 99.00" meta="PEN" onClick={open} />
 * ```
 */
export function ListRow({ title, detail, icon, leading, badge, amount, meta, amountTone = 'neutral', onClick, className }: ListRowProps) {
  const content = (
    <>
      {leading ?? (icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-background text-content-secondary">
          <Icon name={icon} />
        </span>
      ))}
      <span data-list-copy className="col-start-2 row-start-1 flex min-w-0 flex-col sm:flex-1">
        <span className="text-subtitle text-content-primary [overflow-wrap:anywhere]">{title}</span>
        {detail && <span className="text-body-s text-content-muted [overflow-wrap:anywhere]">{detail}</span>}
      </span>
      {badge && <span className="col-start-2 min-w-0 justify-self-start [overflow-wrap:anywhere] sm:max-w-[25%]">{badge}</span>}
      {(amount || meta) && (
        <span className="col-start-2 flex min-w-0 flex-col items-start [overflow-wrap:anywhere] sm:ml-auto sm:max-w-[45%] sm:items-end sm:text-right">
          {amount && <span className={cn('text-subtitle', AMOUNT[amountTone])}>{amount}</span>}
          {meta && <span className="text-caption text-content-muted">{meta}</span>}
        </span>
      )}
      {onClick && <Icon name="chevron_right" className="col-start-3 row-start-1 shrink-0 text-content-muted" />}
    </>
  );
  const classes = cn('grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 gap-y-1 py-3 text-left sm:flex sm:gap-3', className);
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(classes, 'rounded-md px-1 transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary')}>
      {content}
    </button>
  ) : (
    <div className={cn(classes, 'px-1')}>{content}</div>
  );
}
