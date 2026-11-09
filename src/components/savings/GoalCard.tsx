/**
 * Goal tile with progress and actions (15).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Badge, Button, Card, ProgressBar } from '@/components/ui';
import type { SavingsGoal } from '@/types/savings';
import { formatMoney, formatPercent, formatShortDate } from '@/utils/format';

/** Props of {@link GoalCard}. */
export interface GoalCardProps {
  /** Goal. */
  goal: SavingsGoal;
  /** Months covered, for emergency funds. */
  coverageMonths?: number | null;
  /** Minimum recommended fund, for emergency funds. */
  minimum?: number;
  /** Opens the detail or the fund page. */
  onOpen: () => void;
  /** Opens the contribution dialog. */
  onContribute: () => void;
}

/**
 * Renders a goal; an emergency fund measures progress against the minimum recommended.
 *
 * @example
 * ```tsx
 * <GoalCard goal={goal} onOpen={open} onContribute={contribute} />
 * ```
 */
export function GoalCard({ goal, coverageMonths, minimum, onOpen, onContribute }: GoalCardProps) {
  const money = (value: number) => formatMoney(value, goal.currency);
  const isAchieved = goal.status === 'ACHIEVED';
  const isFund = goal.emergencyFund && minimum !== undefined && minimum > 0;
  const fundProgress = isFund ? (goal.contributed / minimum) * 100 : 0;
  return (
    <Card title={goal.name}>
      <p className="-mt-2 mb-4 text-body-s text-content-secondary">
        {goal.currency} · {goal.emergencyFund ? 'marcada como fondo de emergencia' : goal.targetDate ? `objetivo al ${formatShortDate(goal.targetDate, true)}` : 'sin fecha objetivo'}
      </p>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-subtitle">
          {isFund ? `${formatPercent(fundProgress)} del mínimo` : isAchieved ? '100 %' : formatPercent(goal.progress)}
          {isAchieved && <Badge label="Cumplida" tone="success" />}
        </span>
        <span className="text-body-s text-content-secondary">
          {money(goal.contributed)} de {money(isFund && minimum !== undefined ? minimum : goal.target)}
        </span>
      </div>
      <ProgressBar value={isFund ? fundProgress : goal.progress} tone={isFund ? 'warning' : isAchieved ? 'success' : 'primary'} label={`Progreso de ${goal.name}`} className="mb-1" />
      <p className="mb-4 text-caption text-content-muted">
        {isFund && coverageMonths !== undefined && coverageMonths !== null
          ? `Cubre ${coverageMonths.toFixed(1)} meses de pagos fijos`
          : isAchieved
            ? 'Sigue admitiendo aportes.'
            : `Faltan ${money(goal.remaining)}`}
      </p>
      <div className="flex flex-wrap gap-3">
        {goal.emergencyFund ? (
          <Button label="Ver fondo" icon="shield" variant="soft" onClick={onOpen} />
        ) : (
          <>
            {!isAchieved && <Button label="Ver detalle" icon="visibility" variant="soft" onClick={onOpen} />}
            <Button label="Aportar" icon="add" variant="secondary" onClick={onContribute} />
          </>
        )}
      </div>
    </Card>
  );
}
