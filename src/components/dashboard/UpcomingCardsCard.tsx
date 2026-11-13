/**
 * Cards with the closest payment on the dashboard.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { Card, ListRow, ProgressBar } from '@/components/ui';
import type { CreditLineUsage } from '@/types/card';
import type { DashboardCard } from '@/types/overview';
import { formatMoney, formatShortDate, todayIso } from '@/utils/format';

/** Props of {@link UpcomingCardsCard}. */
export interface UpcomingCardsCardProps {
  /** Cards ordered by payment date. */
  cards: DashboardCard[];
  /** Server-calculated line usage for each displayed card. */
  usages?: Record<string, CreditLineUsage>;
  /** Link to the cards page. */
  action: ReactNode;
  /** Called when a card is chosen. */
  onSelect: (cardId: string) => void;
}

/**
 * Renders one row per card with the amount due of its next billing.
 *
 * @example
 * ```tsx
 * <UpcomingCardsCard cards={cards} action={link} onSelect={open} />
 * ```
 */
export function UpcomingCardsCard({ cards, usages, action, onSelect }: UpcomingCardsCardProps) {
  const today = todayIso();
  return (
    <Card title="Tarjetas con pago más próximo" action={action}>
      {cards.length === 0 ? (
        <p className="text-body text-content-secondary">No tienes tarjetas en esta moneda.</p>
      ) : (
        cards.map((card) => {
          const billed = card.billingDate <= today;
          return (
            <div key={card.cardId}><ListRow
              key={card.cardId}
              icon="credit_card"
              title={card.name}
              detail={card.amountDue > 0
                ? `Paga hasta el ${formatShortDate(card.paymentDueDate)} · ${billed ? 'facturó' : 'factura'} el ${formatShortDate(card.billingDate)}`
                : `Sin pagos pendientes · ${billed ? 'facturó' : 'factura'} el ${formatShortDate(card.billingDate)}`}
              amount={formatMoney(card.amountDue, card.currency)}
              meta="Total a pagar"
              onClick={() => onSelect(card.cardId)}
            />
            {usages?.[card.cardId] && <div className="mt-3"><div className="mb-1.5 flex items-center justify-between gap-2"><span className="text-subtitle">Línea utilizada</span><span className="text-body-s text-content-secondary">{formatMoney(usages[card.cardId].used, card.currency)} de {formatMoney(usages[card.cardId].creditLine, card.currency)}</span></div><ProgressBar label={`Línea utilizada de ${card.name}`} value={usages[card.cardId].creditLine > 0 ? usages[card.cardId].used / usages[card.cardId].creditLine * 100 : 0} /></div>}
            </div>
          );
        })
      )}
    </Card>
  );
}
