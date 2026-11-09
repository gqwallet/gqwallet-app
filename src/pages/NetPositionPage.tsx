/**
 * Current account balances, card debt and net position.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, EmptyState, SelectField, Spinner, StatCard } from '@/components/ui';
import { useNetPosition } from '@/hooks/useNetPosition';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { formatMoney } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';

/** Renders the server-calculated position and informational commitments. */
export function NetPositionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [currency, setCurrency] = useState<Currency>(params.get('moneda') === 'USD' ? 'USD' : 'PEN');
  const { data, isLoading, error, refetch } = useNetPosition(currency);
  const money = (value: number) => formatMoney(value, currency);
  return (
    <>
      <PageHeader breadcrumb="Dashboard / Posición neta" title="Posición neta" subtitle="Saldo en cuentas menos deuda de tarjetas, en la misma moneda." actions={<Button label="Volver al dashboard" icon="arrow_back" variant="secondary" onClick={() => navigate(PATHS.dashboard)} />} />
      <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} className="mb-4" />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar la posición neta" action={<Button label="Reintentar" onClick={refetch} />} />}
      {data && <>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Card title="Saldo en cuentas">
            {data.accounts.map((account) => <BreakdownRow key={account.accountId} label={account.name} value={money(account.balance)} />)}
            <BreakdownRow label="Total en cuentas" value={money(data.accountsBalance)} tone="total" />
          </Card>
          <Card title="Deuda de tarjetas">
            {data.cards.map((card) => <BreakdownRow key={card.cardId} label={card.name} value={money(card.debt)} />)}
            <BreakdownRow label="Total de deuda" value={money(data.cardsDebt)} tone="total" />
          </Card>
        </div>
        <StatCard label="Posición neta" value={money(data.netPosition)} className="mb-4" />
        <Card title="Compromisos próximos" className="mb-4">
          <BreakdownRow label="Pagos fijos pendientes" value={money(data.commitments.dues)} />
          <BreakdownRow label="Facturaciones de tarjetas" value={money(data.commitments.cards)} />
          <BreakdownRow label={`${data.commitments.count} compromisos`} value={money(data.commitments.total)} tone="total" />
        </Card>
        <Callout title="Cómo leerlo" text="Los compromisos son informativos: no se descuentan nuevamente de la posición neta. Un consumo con tarjeta aumenta la deuda; un pago reduce el saldo de la cuenta y la deuda de la tarjeta." />
      </>}
    </>
  );
}
