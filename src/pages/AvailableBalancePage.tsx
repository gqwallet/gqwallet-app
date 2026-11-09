/**
 * Available balance at a cutoff (05.3, FR-036).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, EmptyState, SelectField, Spinner, TextField } from '@/components/ui';
import { useAvailableBalance } from '@/hooks/useAvailableBalance';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { formatMoney, formatShortDate, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { MIN_DATE } from '@/utils/dateLimits';

/**
 * Shows the breakdown from {@link useAvailableBalance} for a chosen cutoff and currency.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard/disponible" element={<AvailableBalancePage />} />
 * ```
 */
export function AvailableBalancePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [currency, setCurrency] = useState<Currency>(params.get('moneda') === 'USD' ? 'USD' : 'PEN');
  const [cutoff, setCutoff] = useState(todayIso());
  const { data, isLoading, error } = useAvailableBalance(currency, cutoff);

  return (
    <>
      <PageHeader
        breadcrumb="Dashboard / Disponible"
        title="Disponible a la fecha"
        subtitle="Calculado con tus registros hasta la fecha de corte."
        actions={<Button label="Volver al dashboard" icon="arrow_back" variant="secondary" onClick={() => navigate(PATHS.dashboard)} />}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <TextField label="Fecha de corte" type="date" min={MIN_DATE} value={cutoff} onChange={setCutoff} />
        <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} />
      </div>
      <Card title={`Desglose al ${formatShortDate(cutoff || todayIso(), true)}`} className="mb-4">
        {isLoading && !data && <Spinner />}
        {error && <EmptyState icon="error" title="No pudimos calcular el disponible" text="Revisa la fecha de corte e inténtalo de nuevo." />}
        {data && (
          <>
            <BreakdownRow label="Saldo inicial de cuentas" value={formatMoney(data.openingBalances, currency)} />
            <BreakdownRow label="Ingresos acumulados" value={formatMoney(data.incomes, currency)} tone="income" />
            <BreakdownRow label="Gastos variables acumulados" value={formatMoney(-data.variableExpenses, currency)} />
            <BreakdownRow label="Pagos fijos acumulados" value={formatMoney(-data.fixedPayments, currency)} />
            <BreakdownRow label="Disponible calculado" value={formatMoney(data.available, currency)} tone="total" />
          </>
        )}
      </Card>
      <Callout
        title="Cómo leerlo"
        text="Es lo que te queda según tus registros hasta la fecha de corte. No incluye movimientos con fecha posterior y no es tu saldo bancario."
      />
    </>
  );
}
