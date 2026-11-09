/**
 * Goal detail with its contributions (15.2).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { ContributeModal } from '@/components/savings';
import { Button, Card, EmptyState, ListRow, Spinner, StatCard, InfiniteScrollSentinel } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useGoalDetail } from '@/hooks/useGoals';
import { PATHS } from '@/navigation/paths';
import { formatMoney, formatPercent, formatShortDate } from '@/utils/format';

/**
 * Shows a goal from {@link useGoalDetail}.
 *
 * @example
 * ```tsx
 * <Route path="/metas/:id" element={<GoalDetailPage />} />
 * ```
 */
export function GoalDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data, accounts, isLoading, error, contribute, isSaving, saveError, totalContributions, hasMore, isLoadingMore, loadMore, paginationError } = useGoalDetail(id);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading && !data) return <Spinner />;
  if (error || !data) return <EmptyState icon="error" title="No encontramos esta meta" action={<Button label="Volver a metas" onClick={() => navigate(PATHS.goals)} />} />;
  const { goal, contributions, accountNames } = data;
  const money = (value: number) => formatMoney(value, goal.currency);
  const dateText = goal.targetDate ? `objetivo ${money(goal.target)} al ${formatShortDate(goal.targetDate, true)}` : `objetivo ${money(goal.target)}`;

  return (
    <>
      <PageHeader
        breadcrumb={`Metas / ${goal.name}`}
        title={goal.name}
        subtitle={`${goal.currency} · ${dateText}`}
        onBack={() => navigate(PATHS.goals)}
        actions={<Button label="Aportar" icon="add" onClick={() => setIsOpen(true)} />}
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
        <StatCard label="Ahorrado" value={money(goal.contributed)} detail={`${totalContributions} ${totalContributions === 1 ? 'aporte' : 'aportes'}`} />
        <StatCard label="Faltante" value={money(goal.remaining)} detail="Para llegar al objetivo" tone="neutral" />
        <StatCard label="Progreso" value={formatPercent(goal.progress)} detail={goal.targetDate ? `Objetivo al ${formatShortDate(goal.targetDate, true)}` : 'Sin fecha objetivo'} tone="success" className="col-span-2 lg:col-span-1" />
      </div>
      <Card title="Aportes">
        {contributions.length === 0 ? (
          <p className="text-body text-content-secondary">Aún no hay aportes a esta meta.</p>
        ) : (
          contributions.map((contribution) => (
            <ListRow
              key={contribution.id}
              icon="savings"
              title="Aporte"
              detail={[`${formatShortDate(contribution.economicDate, true)} · desde ${accountNames[contribution.sourceAccountId] ?? 'tu cuenta'}`, contribution.description].filter(Boolean).join(' · ')}
              amount={money(contribution.amount)}
            />
          ))
        )}
        <InfiniteScrollSentinel hasMore={hasMore} isLoadingMore={isLoadingMore} loadMore={loadMore} error={Boolean(paginationError)} />
      </Card>
      <ContributeModal
        key={String(isOpen)}
        goalName={isOpen ? goal.name : null}
        currency={goal.currency}
        accounts={accounts.filter((account) => account.currency === goal.currency)}
        isSaving={isSaving}
        error={saveError}
        onClose={() => setIsOpen(false)}
        onSubmit={async (input) => {
          if (await contribute(goal.id, input)) {
            notify({ title: 'Aporte registrado', detail: `${money(input.amount)} a ${goal.name}. No cuenta como gasto.` });
            setIsOpen(false);
          }
        }}
      />
    </>
  );
}
