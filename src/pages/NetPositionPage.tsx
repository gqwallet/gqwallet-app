/**
 * Current account balances, card debt and net position.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Card, EmptyState, Overline, SelectField, Spinner, StatCard } from '@/components/ui';
import { useNetPosition } from '@/hooks/useNetPosition';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { formatMoney, formatShortDate, todayIso } from '@/utils/format';
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
      <PageHeader breadcrumb="Dashboard / Posición neta" title="Posición neta"  actions={<Button label="Volver al dashboard" icon="arrow_back" variant="secondary" onClick={() => navigate(PATHS.dashboard)} />} />
      <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} className="mb-4 lg:mb-6 lg:w-[calc(50%-0.5rem)]" />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar la posición neta" action={<Button label="Reintentar" onClick={refetch} />} />}
      {data && <>
          <Card title={`Desglose al ${formatShortDate(todayIso(), true)}`} className="mb-4 lg:mb-6">
            <Overline label="Cuentas" className="mb-2" />
            {data.accounts.map((account) => <BreakdownRow key={account.accountId} label={account.name} value={money(account.balance)} />)}
            <BreakdownRow label="Total en cuentas" value={money(data.accountsBalance)} tone="total" />
            <Overline label="Tarjetas" className="mt-3 mb-2" />
            {data.cards.map((card) => <BreakdownRow key={card.cardId} label={card.name} value={money(card.debt)} />)}
            <BreakdownRow label="Total de deuda" value={money(data.cardsDebt)} tone="total" />
            <BreakdownRow label="Posición neta" value={money(data.netPosition)} tone="total" />
          </Card>
        <StatCard informationTopic="Posición neta" label="Posición neta" value={money(data.netPosition)} className="mb-4 lg:mb-6" />
        <Card informationTopic="Compromisos" title="Compromisos próximos · no se restan" className="mb-4">
          <BreakdownRow label="Pagos fijos pendientes" value={money(data.commitments.dues)} />
          <BreakdownRow label="Facturaciones de tarjetas" value={money(data.commitments.cards)} />
          <BreakdownRow label={`${data.commitments.count} compromisos`} value={money(data.commitments.total)} tone="total" />
        </Card>
      </>}
    </>
  );
}
