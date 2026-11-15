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
import { Bonny, Button, Callout, Card, EmptyState, Spinner } from '@/components/ui';
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
        stackActionsOnMobile
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
        <section aria-label="Tus metas de ahorro" className="relative mb-4 flex min-h-[124px] items-center overflow-hidden rounded-xl bg-linear-[143deg] from-accent-container to-chart-4-container py-5 pr-[150px] pl-5 shadow-card lg:mb-6 lg:min-h-[140px] lg:px-7 lg:pr-[210px]">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <h2 className="text-title lg:text-headline">Tus metas de ahorro</h2>
            <p className="text-body-s text-content-secondary">{data.goals.length} {data.goals.length === 1 ? 'meta' : 'metas'} · {data.goals.filter(goal => goal.status === 'ACHIEVED').length} {data.goals.filter(goal => goal.status === 'ACHIEVED').length === 1 ? 'cumplida' : 'cumplidas'}</p>
            <span className="rounded-full bg-primary-container px-2.5 py-1 text-label text-primary">Aportes manuales</span>
          </div>
          <Bonny pose="celebra" position="absolute" className="right-1.5 bottom-0 lg:right-6" />
        </section>
      )}
      {data && data.goals.length > 0 && (
        <div className="mb-4 grid items-start gap-4 lg:mb-6 lg:grid-cols-3 lg:gap-6">
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
