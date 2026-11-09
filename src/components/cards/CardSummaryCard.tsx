/**
 * Card tile of the cards page: line usage bar, available line, credit balance and amount due.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { BreakdownRow, Button, Card, ProgressBar } from '@/components/ui';
import type { Card as CreditCard, CreditLineUsage, NextBilling } from '@/types/card';
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
export function CardSummaryCard({ card, usage, nextBilling, onOpen, onPay, onEdit }: CardSummaryCardProps) {
  const money = (value: number) => formatMoney(value, card.currency);
  const percent = usage.creditLine > 0 ? (usage.used / usage.creditLine) * 100 : 0;
  const billed = nextBilling.billingDate <= todayIso();
  const hasDue = nextBilling.amountDue > 0;
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
      <BreakdownRow label={billed ? `Total a pagar · facturó el ${formatShortDate(nextBilling.billingDate)}` : 'Total a pagar'} value={money(nextBilling.amountDue)} />
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
