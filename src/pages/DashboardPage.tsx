/**
 * Dashboard (05, 05.1, 05.2): figures of the month by currency, dues, budget and cards.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BudgetUsageCard, FirstSteps, UpcomingCardsCard } from '@/components/dashboard';
import { DueGroups } from '@/components/obligations';
import { Button, Callout, Card, ChipGroup, EmptyState, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { PATHS, withId } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { formatMoney, formatWeekdayDate, MONTHS_LONG, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Shows the dashboard of the chosen currency with data from {@link useDashboard}.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={<DashboardPage />} />
 * ```
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { data, isLoading, error, refetch } = useDashboard(currency);
  const today = todayIso();
  const month = MONTHS_LONG[Number(today.slice(5, 7)) - 1].toLowerCase();
  const name = profile?.firstName ? `Hola, ${profile.firstName}` : 'Hola';
  const currencyWord = currency === 'PEN' ? 'soles' : 'dólares';

  if (isLoading && !data) return <Spinner />;
  if (error || !data) {
    return <EmptyState icon="error" title="No pudimos cargar tu dashboard" text="Revisa tu conexión e inténtalo de nuevo." action={<Button label="Reintentar" onClick={refetch} />} />;
  }

  const { dashboard, dues, budget } = data;
  const newMovement = <Button key="new" label="Nuevo movimiento" icon="add" onClick={() => navigate(PATHS.newTransaction)} />;
  const currencyPicker = (
    <div className="mb-4 flex flex-col gap-2">
      <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
      <p className="text-caption text-content-muted">Cada moneda se muestra por separado; nunca sumamos soles con dólares.</p>
    </div>
  );
  const stats = (
    <div className="mb-4 grid grid-cols-2 items-stretch gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
      <StatCard label="Saldo en cuentas" value={formatMoney(dashboard.accountsBalance, currency)} tone="neutral" />
      <StatCard label="Deuda de tarjetas" value={formatMoney(dashboard.cardsDebt, currency)} tone="warning" />
      <StatCard label="Posición neta" value={formatMoney(dashboard.netPosition, currency)} actionLabel="Ver desglose" onClick={() => navigate(`${PATHS.netPosition}?moneda=${currency}`)} />
      <StatCard label="Ingresos" value={formatMoney(dashboard.monthIncomes, currency)} detail={plural(dashboard.monthIncomesCount, 'ingreso', 'ingresos')} tone="success" />
      <StatCard label="Salidas" value={formatMoney(dashboard.monthOutflows.total, currency)} detail={`Gastos desde cuentas ${formatMoney(dashboard.monthOutflows.accountExpenses, currency)} · Pagos fijos pagados ${formatMoney(dashboard.monthOutflows.fixedPaid, currency)} · Pagos de tarjeta ${formatMoney(dashboard.monthOutflows.cardPayments, currency)}`} tone="neutral" />
      <StatCard label="Compromisos" value={formatMoney(dashboard.pendingCommitments.total, currency)} detail={`${dashboard.pendingCommitments.count} por vencer`} tone="warning" />
    </div>
  );

  if (data.isEmpty) {
    return (
      <>
        <PageHeader title={name} subtitle="Tu billetera está lista. Empecemos con lo básico." actions={newMovement} />
        {profile?.monthlyIncome === null && (
          <Callout
            icon="tune"
            title="Completa tu configuración"
            text={`Por ahora usamos ${profile.preferredCurrency} como moneda principal. Registra tu ingreso mensual y tu colchón de vida para personalizar tus indicadores.`}
            action={<Button label="Ir a mi perfil" variant="ghost" onClick={() => navigate(PATHS.profile)} />}
            className="mb-4"
          />
        )}
        {currencyPicker}
        {stats}
        <div className="grid gap-4 lg:grid-cols-[1fr_440px] lg:gap-6">
          <Card>
            <EmptyState
              icon="account_balance_wallet"
              title="Aún no tienes registros"
              text="Registra tu primera cuenta, tarjeta o movimiento para ver tus indicadores."
              action={<Button label="Registrar movimiento" icon="add" onClick={() => navigate(PATHS.newTransaction)} />}
            />
          </Card>
          <FirstSteps
            steps={[
              { title: 'Registra una cuenta', detail: 'Débito, ahorro o efectivo', icon: 'account_balance', onSelect: () => navigate(PATHS.accounts) },
              { title: 'Registra una tarjeta', detail: 'Línea, facturación y pago', icon: 'credit_card', onSelect: () => navigate(PATHS.cards) },
              { title: 'Registra tus pagos fijos', detail: 'Servicios, suscripciones, deudas', icon: 'event_repeat', onSelect: () => navigate(PATHS.fixedPayments) },
              { title: 'Revisa tu calendario', detail: 'Fechas de tarjetas y pagos fijos', icon: 'calendar_month', onSelect: () => navigate(PATHS.calendar) },
              { title: 'Fondo de emergencia', detail: 'Cuánto deberías reservar', icon: 'savings', onSelect: () => navigate(PATHS.emergencyFund) },
            ]}
          />
        </div>
      </>
    );
  }

  const hasDues = Object.values(dues).some((list) => list.length > 0);
  return (
    <>
      <PageHeader
        title={name}
        subtitle={`Resumen de ${month} en ${currencyWord} al ${formatWeekdayDate(today).toLowerCase()} ${today.slice(0, 4)}.`}
        actions={[<Button key="transfer" label="Nueva transferencia" icon="swap_horiz" variant="secondary" onClick={() => navigate(PATHS.newTransfer)} />, newMovement]}
      />
      {currencyPicker}
      {stats}
      <div className="grid gap-4 lg:grid-cols-[1fr_436px] lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card title="Próximos vencimientos" action={<Button label="Ver todos" variant="ghost" onClick={() => navigate(PATHS.fixedPayments)} />}>
            {hasDues ? (
              <DueGroups dues={dues} today={today} isCompact onSelect={() => navigate(PATHS.fixedPayments)} />
            ) : (
              <p className="text-body text-content-secondary">No tienes vencimientos pendientes en esta moneda.</p>
            )}
          </Card>
          <BudgetUsageCard budget={budget} monthName={month} action={<Button label="Ver presupuesto" variant="ghost" onClick={() => navigate(PATHS.budget)} />} />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <UpcomingCardsCard
            cards={dashboard.upcomingCards}
            action={<Button label="Ver tarjetas" variant="ghost" onClick={() => navigate(PATHS.cards)} />}
            onSelect={(id) => navigate(withId(PATHS.card, id))}
          />
          <Card title="Vista consolidada">
            <p className="mb-4 text-body text-content-secondary">Referencial: convierte tus {currency === 'PEN' ? 'dólares a soles' : 'soles a dólares'} con un tipo de cambio que tú registras.</p>
            <Button label="Abrir vista consolidada" icon="currency_exchange" variant="soft" isBlock className="lg:w-auto" onClick={() => navigate(PATHS.consolidated)} />
          </Card>
        </div>
      </div>
    </>
  );
}
