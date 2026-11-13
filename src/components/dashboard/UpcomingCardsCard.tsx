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

/** Props of {@link CardLineUsage}. */
interface CardLineUsageProps {
  /** Card the usage belongs to. */
  card: DashboardCard;
  /** Server-calculated usage; never derived from transactions. */
  usage: CreditLineUsage;
}

/** Renders the used credit line of a card as amounts and a bar aligned with its row. */
function CardLineUsage({ card, usage }: CardLineUsageProps) {
  const percentage = usage.creditLine > 0 ? (usage.used / usage.creditLine) * 100 : 0;
  return (
    <div className="mt-1 px-1 lg:px-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-label text-content-secondary">Línea utilizada</span>
        <span className="text-body-s text-content-secondary">
          {formatMoney(usage.used, card.currency)} de {formatMoney(usage.creditLine, card.currency)}
        </span>
      </div>
      <ProgressBar label={`Línea utilizada de ${card.name}`} value={percentage} />
    </div>
  );
}

/**
 * Renders one block per card: the amount due of its next billing and, when available,
 * its used credit line. Blocks are separated by a divider so each bar reads with its own card.
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
        <ul className="divide-y divide-line-subtle">
          {cards.map((card) => {
            const billed = card.billingDate <= today;
            const billing = `${billed ? 'facturó' : 'factura'} el ${formatShortDate(card.billingDate)}`;
            const usage = usages?.[card.cardId];
            return (
              <li key={card.cardId} className="py-3 first:pt-0 last:pb-0">
                <ListRow
                  icon="credit_card"
                  title={card.name}
                  detail={card.amountDue > 0 ? `Paga hasta el ${formatShortDate(card.paymentDueDate)} · ${billing}` : `Sin pagos pendientes · ${billing}`}
                  amount={formatMoney(card.amountDue, card.currency)}
                  meta="Total a pagar"
                  onClick={() => onSelect(card.cardId)}
                />
                {usage && <CardLineUsage card={card} usage={usage} />}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
