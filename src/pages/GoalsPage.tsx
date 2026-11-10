/**
 * Savings goals (15, 15.4).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { ContributeModal, GoalCard } from '@/components/savings';
import { Button, Callout, Card, EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useGoals } from '@/hooks/useGoals';
import { PATHS, withId } from '@/navigation/paths';
import type { SavingsGoal } from '@/types/savings';
import { formatMoney } from '@/utils/format';

/**
 * Shows the goals from {@link useGoals} and registers contributions.
 *
 * @example
 * ```tsx
 * <Route path="/metas" element={<GoalsPage />} />
 * ```
 */
export function GoalsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data, isLoading, error, contribute, isSaving, saveError } = useGoals();
  const [target, setTarget] = useState<SavingsGoal | null>(null);

  return (
    <>
      <PageHeader informationTopic="Metas"
        title="Metas de ahorro"
        subtitle="Tu progreso hacia cada meta, en su moneda."
        actions={[
          <Button key="fund" label="Fondo de emergencia" icon="shield" variant="secondary" onClick={() => navigate(PATHS.emergencyFund)} />,
          <Button key="new" label="Nueva meta" icon="add" onClick={() => navigate(PATHS.newGoal)} />,
        ]}
      />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar tus metas" />}
      {data && data.goals.length === 0 && (
        <Card className="mb-4">
          <EmptyState icon="savings" title="Aún no tienes metas" text="Crea una meta y aporta desde tus cuentas de la misma moneda." action={<Button label="Nueva meta" icon="add" onClick={() => navigate(PATHS.newGoal)} />} />
        </Card>
      )}
      {data && data.goals.length > 0 && (
        <div className="mb-4 grid gap-4 lg:mb-6 lg:grid-cols-3 lg:gap-6">
          {data.goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              coverageMonths={data.coverage[goal.id]}
              minimum={data.minimum[goal.id]}
              onOpen={() => navigate(goal.emergencyFund ? PATHS.emergencyFund : withId(PATHS.goal, goal.id))}
              onContribute={() => setTarget(goal)}
            />
          ))}
        </div>
      )}
      <Callout title="Los aportes no son gastos" text="Cada aporte es una transferencia desde una cuenta de la misma moneda: no cuenta en tu presupuesto ni en tu flujo de caja." />
      <ContributeModal
        key={target?.id ?? 'closed'}
        goalName={target?.name ?? null}
        currency={target?.currency ?? 'PEN'}
        accounts={data?.accounts.filter((account) => account.currency === target?.currency) ?? []}
        isSaving={isSaving}
        error={saveError}
        onClose={() => setTarget(null)}
        onSubmit={async (input) => {
          if (target && (await contribute(target.id, input))) {
            notify({ title: 'Aporte registrado', detail: `${formatMoney(input.amount, input.currency)} a ${target.name}. No cuenta como gasto.` });
            setTarget(null);
          }
        }}
      />
    </>
  );
}
