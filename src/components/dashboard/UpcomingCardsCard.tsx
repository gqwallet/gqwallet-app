/**
 * Cards with the closest payment on the dashboard.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { Card, ListRow } from '@/components/ui';
import type { DashboardCard } from '@/types/overview';
import { formatMoney, formatShortDate } from '@/utils/format';

/** Props of {@link UpcomingCardsCard}. */
export interface UpcomingCardsCardProps {
  /** Cards ordered by payment date. */
  cards: DashboardCard[];
  /** Billing date by card id. */
  billingDates: Record<string, string>;
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
 * <UpcomingCardsCard cards={cards} billingDates={dates} action={link} onSelect={open} />
 * ```
 */
export function UpcomingCardsCard({ cards, billingDates, action, onSelect }: UpcomingCardsCardProps) {
  return (
    <Card title="Tarjetas con pago más próximo" action={action}>
      {cards.length === 0 ? (
        <p className="text-body text-content-secondary">No tienes tarjetas en esta moneda.</p>
      ) : (
        cards.map((card) => {
          const billing = billingDates[card.cardId];
          return (
            <ListRow
              key={card.cardId}
              icon="credit_card"
              title={card.name}
              detail={`Paga hasta el ${formatShortDate(card.paymentDueDate)}${billing ? ` · facturó el ${formatShortDate(billing)}` : ''}`}
              amount={formatMoney(card.amountDue, card.currency)}
              meta="Total a pagar"
              onClick={() => onSelect(card.cardId)}
            />
          );
        })
      )}
    </Card>
  );
}
