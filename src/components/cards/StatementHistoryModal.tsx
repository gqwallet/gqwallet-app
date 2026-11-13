/**
 * Read-only history of all server-calculated card statements, including settled cycles.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Badge, Button, DataTable, Modal } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { PaymentCycle } from '@/types/card';
import { formatMoney, formatShortDate } from '@/utils/format';
import { paymentCycleLabel } from '@/utils/paymentCycles';

/** Props of {@link StatementHistoryModal}. */
export interface StatementHistoryModalProps {
  /** Whether the statement history is visible. */
  isOpen: boolean;
  /** Authoritative statement balances and dates. */
  cycles: PaymentCycle[];
  /** Currency of every statement. */
  currency: Currency;
  /** Restores the card detail and focus. */
  onClose: () => void;
}

/**
 * Keeps settled statements consultable without adding them to the pending payment list.
 * @example
 * ```tsx
 * <StatementHistoryModal isOpen={isOpen} cycles={cycles} currency="PEN" onClose={close} />
 * ```
 */
export function StatementHistoryModal({ isOpen, cycles, currency, onClose }: StatementHistoryModalProps) {
  return <Modal isOpen={isOpen} title="Historial de facturaciones" icon="history" isWide onClose={onClose} footer={<Button label="Cerrar historial" onClick={onClose} />}>
    <DataTable caption={`Historial de facturaciones · ${currency}`} isWide showScrollHint
      rows={[...cycles].sort((a, b) => b.closingDate.localeCompare(a.closingDate))}
      rowKey={cycle => cycle.closingDate}
      columns={[
        { key: 'start', header: 'Inicio', render: cycle => formatShortDate(cycle.cycleStart, true) },
        { key: 'close', header: 'Cierre', render: cycle => formatShortDate(cycle.closingDate, true) },
        { key: 'due', header: 'Paga hasta', render: cycle => formatShortDate(cycle.paymentDueDate, true) },
        { key: 'billed', header: 'Facturado', isNumeric: true, render: cycle => formatMoney(cycle.billed, currency) },
        { key: 'paid', header: 'Pagado', isNumeric: true, render: cycle => formatMoney(cycle.paid, currency) },
        { key: 'remaining', header: 'Pendiente', isNumeric: true, render: cycle => formatMoney(cycle.amountDue, currency) },
        { key: 'status', header: 'Estado', render: cycle => <Badge label={paymentCycleLabel(cycle.status)} tone={cycle.status === 'PAID' ? 'success' : cycle.status === 'OVERDUE' ? 'danger' : cycle.status === 'PARTIAL' ? 'warning' : 'neutral'} /> },
      ]} />
  </Modal>;
}
