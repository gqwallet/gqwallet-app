/**
 * Budget usage of the month on the dashboard: total bar and categories to review.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { Callout, Card, ProgressBar } from '@/components/ui';
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

function joinNames(names: string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
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
  const parts: string[] = [];
  if (attention.length) {
    parts.push(
      `${joinNames(attention.map((line) => `${line.categoryName}${line.usage !== null ? ` (${formatPercent(line.usage)})` : ''}`))} ${attention.length === 1 ? 'está' : 'están'} en atención`,
    );
  }
  if (over.length) parts.push(`${joinNames(over.map((line) => line.categoryName))} ${over.length === 1 ? 'superó' : 'superaron'} su límite`);
  const review = attention.length + over.length;
  const usage = budget.totalUsage ?? 0;
  return (
    <Card title={`Uso del presupuesto de ${monthName}`} action={action}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-subtitle">Total del mes</span>
        <span className="text-body-s text-content-secondary">
          {formatMoney(budget.totalConsumption, budget.currency)} de {formatMoney(budget.totalLimit, budget.currency)} · {formatPercent(usage)}
        </span>
      </div>
      <ProgressBar value={usage} tone={usage > 100 ? 'danger' : usage >= 75 ? 'warning' : 'success'} label="Uso total del presupuesto" />
      {review > 0 && (
        <Callout
          tone="warning"
          className="mt-4"
          title={`Revisa ${review} ${review === 1 ? 'categoría' : 'categorías'}`}
          text={`${parts.join('; ')}.`}
        />
      )}
      {budget.totalLimit === 0 && <p className="mt-3 text-body-s text-content-muted">Aún no defines límites para este mes.</p>}
    </Card>
  );
}
