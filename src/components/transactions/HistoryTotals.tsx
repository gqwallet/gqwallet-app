/**
 * Total cards of the history by nature and currency; currencies are never mixed.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { StatCard } from '@/components/ui';
import type { HistoryTotal } from '@/types/history';
import { formatMoney } from '@/utils/format';

/** Props of {@link HistoryTotals}. */
export interface HistoryTotalsProps {
  /** Totals in display order. */
  totals: HistoryTotal[];
}

function countText(total: HistoryTotal): string {
  if (total.count === 0) return total.isIncome ? 'Sin ingresos' : 'Sin gastos';
  const noun = total.isIncome ? (total.count === 1 ? 'ingreso' : 'ingresos') : total.count === 1 ? 'gasto' : 'gastos';
  return `${total.count} ${noun}`;
}

/**
 * Renders two or four stat cards.
 *
 * @example
 * ```tsx
 * <HistoryTotals totals={totals} />
 * ```
 */
export function HistoryTotals({ totals }: HistoryTotalsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
      {totals.map((total) => (
        <StatCard
          key={total.label}
          label={total.label}
          value={formatMoney(total.total, total.currency)}
          detail={countText(total)}
          tone={total.isIncome ? 'success' : 'neutral'}
        />
      ))}
    </div>
  );
}
