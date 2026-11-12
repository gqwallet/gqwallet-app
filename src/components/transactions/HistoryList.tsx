/**
 * Movement history grouped by economic date.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Fragment } from 'react';
import { Badge, Icon, ListRow, Overline } from '@/components/ui';
import type { HistoryDay, HistoryItem } from '@/types/history';
import { formatMoney, formatSignedMoney, formatWeekdayDate } from '@/utils/format';

/** Props of {@link HistoryList}. */
export interface HistoryListProps {
  /** Day groups, newest first. */
  days: HistoryDay[];
  /** Called when a movement row is chosen; transfers are not editable. */
  onSelect: (item: HistoryItem) => void;
}

function amountOf(item: HistoryItem): string {
  return item.type === 'transfer' ? formatMoney(item.amount, item.currency) : formatSignedMoney(item.amount, item.currency, item.isIncome);
}

/**
 * Renders one overline per day and one row per movement or transfer.
 *
 * @example
 * ```tsx
 * <HistoryList days={days} onSelect={open} />
 * ```
 */
export function HistoryList({ days, onSelect }: HistoryListProps) {
  return (
    <div className="flex flex-col">
      {days.map((day) => (
        <Fragment key={day.date}>
          <Overline label={formatWeekdayDate(day.date)} className="mt-3 mb-1 px-1 first:mt-0" />
          {day.items.map((item) => (
            <ListRow
              key={`${item.type}-${item.id}`}
              icon={item.icon}
              leading={
                item.isIncome && !item.isVoided ? (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary-container text-secondary">
                    <Icon name={item.icon} />
                  </span>
                ) : undefined
              }
              title={item.title}
              detail={item.detail}
              badge={item.badge ? <Badge label={item.badge} tone={item.isVoided ? 'danger' : 'neutral'} /> : undefined}
              amount={amountOf(item)}
              amountTone={item.isVoided ? 'muted' : item.type === 'transfer' ? 'neutral' : item.isIncome ? 'income' : 'expense'}
              meta={item.type === 'transfer' ? 'No cuenta en totales' : item.isVoided ? 'Anulado' : item.currency}
              onClick={() => onSelect(item)}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
