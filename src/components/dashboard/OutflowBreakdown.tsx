/**
 * Cash-basis outflow breakdown of the selected dashboard month.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, IconTile, StackedBar, type ChartSegment, type IconTileTone } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { CashOutflows } from '@/types/overview';
import { formatMoney } from '@/utils/format';

/** Props accepted by {@link OutflowBreakdown}. */
export interface OutflowBreakdownProps {
  /** Server-computed cash-basis figures. */
  outflows: CashOutflows;
  /** Currency shared by every amount. */
  currency: Currency;
  /** Selected month name. */
  monthName: string;
  /** Layout utilities. */
  className?: string;
}

/** Shows the existing outflow figures as a stacked bar and an amount legend. */
export function OutflowBreakdown({ outflows, currency, monthName, className }: OutflowBreakdownProps) {
  const segments: ChartSegment[] = [
    { label: 'Gastos desde cuentas', value: outflows.accountExpenses, color: '1' },
    { label: 'Pagos fijos pagados', value: outflows.fixedPaid, color: '3' },
    { label: 'Pagos de tarjeta', value: outflows.cardPayments, color: '2' },
  ];
  const tiles: Array<{ icon: string; tone: IconTileTone }> = [
    { icon: 'account_balance', tone: 'indigo' },
    { icon: 'event_repeat', tone: 'amber' },
    { icon: 'credit_card', tone: 'teal' },
  ];
  return <Card className={className}>
    <h2 className="text-title">Salidas de {monthName}</h2>
    <p className="mt-1 mb-4 text-body-s text-content-muted">Desglose de {formatMoney(outflows.total, currency)} en salidas efectivas.</p>
    <StackedBar label="Distribución de salidas" segments={segments} />
    <div className="mt-4 flex flex-col gap-2.5">
      {segments.map((item, index) => <div key={item.label} className="flex items-center gap-3 text-body"><IconTile icon={tiles[index].icon} tone={tiles[index].tone} /><span className="flex-1 text-content-secondary">{item.label}</span><span className="text-subtitle">{formatMoney(item.value, currency)}</span></div>)}
    </div>
  </Card>;
}
