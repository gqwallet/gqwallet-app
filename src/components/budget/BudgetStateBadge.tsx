/**
 * Visual state of a budget line (FR-034).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Badge, type BadgeTone } from '@/components/ui';
import type { BudgetState } from '@/types/budget';

const LABEL: Record<BudgetState, string> = {
  NORMAL: 'Normal',
  ATTENTION: 'Atención',
  REACHED: 'Alcanzado',
  EXCEEDED: 'Excedido',
  NO_SPENDING: 'Sin gasto',
  NO_BUDGET: 'Sin presupuesto',
};

const TONE: Record<BudgetState, BadgeTone> = {
  NORMAL: 'success',
  ATTENTION: 'warning',
  REACHED: 'caution',
  EXCEEDED: 'danger',
  NO_SPENDING: 'success',
  NO_BUDGET: 'neutral',
};

/** Props of {@link BudgetStateBadge}. */
export interface BudgetStateBadgeProps {
  /** State computed by the server. */
  state: BudgetState;
}

/**
 * Renders the state label with its tone.
 *
 * @example
 * ```tsx
 * <BudgetStateBadge state="ATTENTION" />
 * ```
 */
export function BudgetStateBadge({ state }: BudgetStateBadgeProps) {
  return <Badge label={LABEL[state]} tone={TONE[state]} />;
}
