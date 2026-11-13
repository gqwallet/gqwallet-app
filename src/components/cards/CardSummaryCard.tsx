/**
 * Card tile of the cards page: line usage bar, available line, credit balance and amount due.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { BreakdownRow, Button, Card, CreditCardMark, ProgressBar } from '@/components/ui';
import type { Card as CreditCard, CreditLineUsage, NextBilling, PaymentCycle } from '@/types/card';
import { cardTone } from '@/utils/cardPalette';
import { formatMoney, parseIsoDate, todayIso } from '@/utils/format';
import { summarizeClosedStatements } from '@/utils/paymentCycles';

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
export function CardSummaryCard({ card, usage, paymentCycles, onOpen, onPay, onEdit }: CardSummaryCardProps) {
  const money = (value: number) => formatMoney(value, card.currency);
  const percent = usage.creditLine > 0 ? (usage.used / usage.creditLine) * 100 : 0;
  const oldest = [...paymentCycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).find((cycle) => Number(cycle.amountDue) > 0);
  const summary = summarizeClosedStatements(paymentCycles, todayIso());
  const hasDue = Boolean(oldest);
  return (
    <Card titleLabel={card.name} informationTopic="Resumen de tarjeta" className="pt-3 [&>header]:min-h-11" title={hasDue ? <span className="inline-flex items-center"><CreditCardMark color={card.color} />{card.name}</span> : <button type="button" aria-label="Ver detalle" onClick={onOpen} className="inline-flex items-center rounded-sm text-left focus-visible:outline-2 focus-visible:outline-primary"><CreditCardMark color={card.color} />{card.name}</button>}>
      <p className="mb-4 text-body-s text-content-muted">
        {card.currency} · Facturación día {parseIsoDate(card.billingDate).getDate()}{card.billingCutoffTime ? ` · corte ${card.billingCutoffTime}` : ''} · Pago día {parseIsoDate(card.paymentDueDate).getDate()}
      </p>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-subtitle">Línea utilizada</span>
        <span className="text-body-s text-content-secondary">
          {money(usage.used)} de {money(usage.creditLine)}
        </span>
      </div>
      <ProgressBar value={percent} tone={cardTone(card.color)} label={`Línea utilizada de ${card.name}`} className="mb-4" />
      <BreakdownRow label="Línea disponible" value={money(usage.available)} tone="income" />
      {usage.creditBalance > 0 && <BreakdownRow label="Saldo a favor" value={money(usage.creditBalance)} tone="income" />}
      <BreakdownRow label={<>Total a pagar{oldest?.status === 'OVERDUE' ? <> · <span>Vencida · pagar</span></> : oldest?.status === 'PARTIAL' ? <> · <span>Parcial · falta {money(oldest.amountDue)}</span></> : null}</>} value={money(summary.amountDue)} tone={summary.overdueCount > 0 ? 'danger' : 'neutral'} />
      <div className={hasDue ? 'mt-4 grid grid-cols-2 gap-3' : 'mt-4 grid gap-3'}>
        {hasDue ? (
          <>
            <Button label="Ver detalle" icon="visibility" variant="soft" onClick={onOpen} />
            <Button label="Pagar tarjeta" icon="payments" variant="secondary" onClick={onPay} />
          </>
        ) : (
          <Button label="Editar tarjeta" icon="edit" variant="soft" onClick={onEdit} />
        )}
      </div>
    </Card>
  );
}
