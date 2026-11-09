/**
 * Card tile of the cards page: line usage bar, available line, credit balance and amount due.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { BreakdownRow, Button, Card, ProgressBar } from '@/components/ui';
import type { Card as CreditCard, CreditLineUsage, NextBilling, PaymentCycle } from '@/types/card';
import { cardTone } from '@/utils/cardPalette';
import { formatMoney, formatShortDate, parseIsoDate, todayIso } from '@/utils/format';

/** Props of {@link CardSummaryCard}. */
export interface CardSummaryCardProps {
  /** Card. */
  card: CreditCard;
  /** Line usage. */
  usage: CreditLineUsage;
  /** Next billing. */
  nextBilling: NextBilling;
  /** Payment cycle history. */
  paymentCycles: PaymentCycle[];
  /** Opens the detail. */
  onOpen: () => void;
  /** Opens the payment dialog. */
  onPay: () => void;
  /** Opens the edition. */
  onEdit: () => void;
}

/**
 * Renders a card tile; with nothing to pay it offers editing instead of paying.
 *
 * @example
 * ```tsx
 * <CardSummaryCard card={card} usage={usage} nextBilling={billing} onOpen={open} onPay={pay} onEdit={edit} />
 * ```
 */
export function CardSummaryCard({ card, usage, nextBilling, paymentCycles, onOpen, onPay, onEdit }: CardSummaryCardProps) {
  const money = (value: number) => formatMoney(value, card.currency);
  const percent = usage.creditLine > 0 ? (usage.used / usage.creditLine) * 100 : 0;
  const oldest = [...paymentCycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).find((cycle) => Number(cycle.amountDue) > 0);
  const closingDate = oldest?.closingDate ?? nextBilling.billingDate;
  const billed = closingDate <= todayIso();
  const hasDue = Boolean(oldest);
  return (
    <Card title={card.name}>
      <p className="-mt-2 mb-4 text-body-s text-content-secondary">
        {card.currency} · Facturación día {parseIsoDate(card.billingDate).getDate()}{card.billingCutoffTime ? ` · corte ${card.billingCutoffTime}` : ''} · Pago día {parseIsoDate(card.paymentDueDate).getDate()}
      </p>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="text-subtitle">Línea utilizada</span>
        <span className="text-body-s text-content-secondary">
          {money(usage.used)} de {money(usage.creditLine)}
        </span>
      </div>
      <ProgressBar value={Math.max(percent, usage.used > 0 ? 2 : 0)} tone={cardTone(card.color)} label={`Línea utilizada de ${card.name}`} className="mb-3" />
      <BreakdownRow label="Línea disponible" value={money(usage.available)} tone="income" />
      {usage.creditBalance > 0 && <BreakdownRow label="Saldo a favor" value={money(usage.creditBalance)} tone="income" />}
      <BreakdownRow label={`Total a pagar · ${billed ? 'facturó' : 'factura'} el ${formatShortDate(closingDate)}`} value={money(oldest?.amountDue ?? nextBilling.amountDue)} />
      {oldest?.status === 'OVERDUE' && <p className="mt-2 text-body-s text-danger">Vencida · pagar</p>}
      {oldest && Number(oldest.paid) > 0 && Number(oldest.amountDue) > 0 && <p className="mt-2 text-body-s text-tertiary">Parcial · falta {money(oldest.amountDue)}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {hasDue ? (
          <>
            <Button label="Ver detalle" icon="visibility" variant="soft" onClick={onOpen} />
            <Button label="Pagar tarjeta" icon="payments" variant="secondary" onClick={onPay} />
          </>
        ) : (
          <>
            <Button label="Ver detalle" icon="visibility" variant="soft" onClick={onOpen} />
            <Button label="Editar tarjeta" icon="edit" variant="secondary" onClick={onEdit} />
          </>
        )}
      </div>
    </Card>
  );
}
