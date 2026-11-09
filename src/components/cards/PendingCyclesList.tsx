/**
 * Outstanding card statements and partial payment progress.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Badge, Button, Card } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { PaymentCycle } from '@/types/card';
import { formatMoney, formatShortDate } from '@/utils/format';
import { paymentCycleLabel } from '@/utils/paymentCycles';

/** Props of the pending statement list. */
export interface PendingCyclesListProps {
  /** Server payment cycles. */
  cycles: PaymentCycle[];
  /** Card currency. */
  currency: Currency;
  /** Opens payment for the selected cycle. */
  onPay: (closingDate: string) => void;
}

/** Lists unpaid cycles in payment order, including overdue and open cycles. */
export function PendingCyclesList({ cycles, currency, onPay }: PendingCyclesListProps) {
  const pending = [...cycles].filter((cycle) => Number(cycle.amountDue) > 0).sort((a, b) => a.closingDate.localeCompare(b.closingDate));
  return <Card title="Facturaciones pendientes" className="mb-4 lg:mb-6">
    {pending.length === 0 && <p className="text-body-s text-content-muted">Sin pagos pendientes</p>}
    {pending.map((cycle) => <div key={cycle.closingDate} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-subtle py-3 last:border-0 sm:flex-nowrap">
      <div className="flex min-w-0 basis-full flex-col gap-0.5 sm:flex-1 sm:basis-auto">
        <span className="text-subtitle">{cycle.status === 'OPEN' ? 'Factura el' : 'Facturó el'} {formatShortDate(cycle.closingDate)}</span>
        <span className="text-body-s text-content-secondary">
          {cycle.status === 'OVERDUE' ? 'Venció el' : 'Paga hasta el'} {formatShortDate(cycle.paymentDueDate)}
          {Number(cycle.paid) > 0 && <> · <span>Pagado {formatMoney(cycle.paid, currency)} de {formatMoney(cycle.billed, currency)}</span></>}
        </span>
      </div>
      <Badge label={paymentCycleLabel(cycle.status)} tone={cycle.status === 'OVERDUE' ? 'danger' : cycle.status === 'PARTIAL' ? 'warning' : 'neutral'} />
      <span className="ml-auto text-subtitle sm:ml-0">{formatMoney(cycle.amountDue, currency)}</span>
      <Button label="Pagar" variant="secondary" onClick={() => onPay(cycle.closingDate)} />
    </div>)}
  </Card>;
}
