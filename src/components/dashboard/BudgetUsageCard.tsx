/**
 * Budget usage of the month on the dashboard: usage ring, total bar and categories to review.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { Badge, Callout, Card, UsageSummary } from '@/components/ui';
import type { BudgetStatus } from '@/types/budget';
import { formatMoney, formatPercent } from '@/utils/format';

/** Props of {@link BudgetUsageCard}. */
export interface BudgetUsageCardProps {
  /** Budget table of the month. */
  budget: BudgetStatus;
  /** Month name, e.g. `junio`. */
  monthName: string;
  /** Link to the budget page. */
  action: ReactNode;
}

/**
 * Renders the total usage and a warning that names categories in attention or over their limit.
 *
 * @example
 * ```tsx
 * <BudgetUsageCard budget={budget} monthName="junio" action={link} />
 * ```
 */
export function BudgetUsageCard({ budget, monthName, action }: BudgetUsageCardProps) {
  const attention = budget.lines.filter((line) => line.state === 'ATTENTION');
  const over = budget.lines.filter((line) => line.state === 'EXCEEDED');
  const categories = [...attention, ...over];
  const review = categories.length;
  const usage = budget.totalUsage ?? 0;
  const unbudgeted = budget.lines.filter((line) => line.limit === null && line.consumption > 0).length;
  return (
    <Card title={`Uso del presupuesto de ${monthName}`} action={action}>
      <UsageSummary title="Con presupuesto" usage={budget.totalUsage}
        detail={`${formatMoney(budget.budgetedConsumption, budget.currency)} de ${formatMoney(budget.totalLimit, budget.currency)} · ${formatPercent(usage)}`}
        breakdown={[
          { label: 'Sin presupuesto', value: `${formatMoney(budget.unbudgetedConsumption, budget.currency)} · ${unbudgeted} ${unbudgeted === 1 ? 'categoría' : 'categorías'}` },
          { label: 'Total gastado', value: formatMoney(budget.totalConsumption, budget.currency) },
        ]} />
      {review > 0 && (
        <Callout
          tone="warning"
          className="mt-4"
          title={`Revisa ${review} ${review === 1 ? 'categoría' : 'categorías'}`}
          text={null}
          items={<ul className="flex min-w-0 flex-col gap-2" aria-label="Categorías por revisar">
            {categories.slice(0, 3).map(line => <li key={line.categoryId} className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 truncate" title={line.categoryName}>{line.categoryName}</span>
              <Badge tone={line.state === 'EXCEEDED' ? 'danger' : 'caution'} label={`${line.state === 'EXCEEDED' ? 'Excedido' : 'Atención'} · ${line.usage === null ? '—' : formatPercent(line.usage)}`} />
            </li>)}
            {review > 3 && <li className="text-content-secondary">y {review - 3} más</li>}
          </ul>}
          action={review > 3 ? action : undefined}
        />
      )}
      {budget.totalLimit === 0 && <p className="mt-3 text-body-s text-content-muted">Aún no defines límites para este mes.</p>}
    </Card>
  );
}
