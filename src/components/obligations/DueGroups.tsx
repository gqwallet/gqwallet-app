/**
 * Pending dues grouped by urgency (FR-031).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Fragment } from 'react';
import { Badge, ListRow, Overline } from '@/components/ui';
import type { PaymentDue, UpcomingDues } from '@/types/obligation';
import { chargesOnDay } from '@/utils/fixedPaymentKinds';
import { formatMoney, formatShortDate } from '@/utils/format';
import { FIXED_KIND_ICON, FIXED_KIND_LABEL } from '@/utils/options';

/** Props of {@link DueGroups}. */
export interface DueGroupsProps {
  /** Dues grouped by urgency. */
  dues: UpcomingDues;
  /** Today as ISO date, for the `Hoy` and `Mañana` labels. */
  today: string;
  /** Name of the usual account or card of each due, by instrument id. */
  instrumentNames?: Record<string, string>;
  /** Called when a due is chosen. */
  onSelect?: (due: PaymentDue) => void;
  /** Hides the instrument to keep rows short (dashboard). */
  isCompact?: boolean;
}

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function detailOf(due: PaymentDue, isOverdue: boolean, instrumentNames: Record<string, string>, isCompact: boolean): string {
  const parts = [FIXED_KIND_LABEL[due.kind], chargesOnDay(due.kind) ? `se cobra el ${formatShortDate(due.dueDate)}` : isOverdue ? `vencía ${formatShortDate(due.dueDate)}` : formatShortDate(due.dueDate)];
  if (due.installment) parts.push(`cuota ${due.installment}`);
  else if (!isCompact) parts.push(due.usualInstrumentId ? instrumentNames[due.usualInstrumentId] ?? 'medio habitual' : 'sin medio habitual');
  return parts.join(' · ');
}

/**
 * Renders the groups `Vencidos`, `Hoy`, `Mañana`, `En 2–3 días` and `Este mes`; empty groups are skipped.
 *
 * @example
 * ```tsx
 * <DueGroups dues={dues} today="2026-06-03" onSelect={openConfirm} />
 * ```
 */
export function DueGroups({ dues, today, instrumentNames = {}, onSelect, isCompact = false }: DueGroupsProps) {
  const groups: Array<{ key: string; label: string; items: PaymentDue[]; isOverdue?: boolean }> = [
    { key: 'overdue', label: 'Vencidos', items: dues.overdue, isOverdue: true },
    { key: 'today', label: `Hoy · ${formatShortDate(today)}`, items: dues.today },
    { key: 'tomorrow', label: `Mañana · ${formatShortDate(addDays(today, 1))}`, items: dues.tomorrow },
    { key: 'soon', label: 'En 2–3 días', items: dues.inTwoToThreeDays },
    { key: 'month', label: 'Este mes', items: dues.laterThisMonth },
  ];
  return (
    <div className="flex flex-col gap-1">
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <Fragment key={group.key}>
            <Overline label={group.label} tone={group.isOverdue ? 'danger' : 'muted'} className="px-1 pt-2 pb-0.5" />
            {group.items.map((due) => (
              <ListRow
                key={due.id}
                icon={FIXED_KIND_ICON[due.kind]}
                title={due.description}
                detail={detailOf(due, Boolean(group.isOverdue), instrumentNames, isCompact)}
                badge={group.isOverdue ? <Badge label={chargesOnDay(due.kind) ? 'Cobro pendiente' : 'Vencido'} tone="danger" /> : undefined}
                showMobileBadge={false}
                amount={formatMoney(due.expectedAmount, due.currency)}
                meta={group.isOverdue ? <><span className="text-danger sm:hidden">{chargesOnDay(due.kind) ? 'Cobro pendiente' : 'Vencido'}</span><span className="hidden sm:inline">{due.currency}</span></> : due.currency}
                onClick={onSelect ? () => onSelect(due) : undefined}
              />
            ))}
          </Fragment>
        ))}
    </div>
  );
}
