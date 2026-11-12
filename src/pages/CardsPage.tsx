/**
 * Credit cards (11, 11.9) with their line usage and amount due.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CardSummaryCard, PayCardModal } from '@/components/cards';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCardPayment } from '@/hooks/useCardPayment';
import { useCards, type CardSummary } from '@/hooks/useCards';
import { PATHS, withId } from '@/navigation/paths';
import { formatMoney } from '@/utils/format';

/**
 * Shows the cards from {@link useCards} and pays them with {@link useCardPayment}.
 *
 * @example
 * ```tsx
 * <Route path="/tarjetas" element={<CardsPage />} />
 * ```
 */
export function CardsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { cards, accounts, isLoading, error, refetch } = useCards();
  const { pay, isSaving, error: payError } = useCardPayment();
  const [paying, setPaying] = useState<CardSummary | null>(null);

  return (
    <>
      <PageHeader informationTopic="Tarjetas"
        title="Tarjetas de crédito"
        actions={<Button label="Nueva tarjeta" icon="add" onClick={() => navigate(PATHS.newCard)} />}
      />
      {isLoading && !cards && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar tus tarjetas" action={<Button label="Reintentar" onClick={refetch} />} />}
      {cards && cards.length === 0 && (
        <Card>
          <EmptyState
            icon="credit_card"
            title="Aún no tienes tarjetas"
            text="Registra tu tarjeta para controlar su línea y su total a pagar."
            action={<Button label="Nueva tarjeta" icon="add" onClick={() => navigate(PATHS.newCard)} />}
          />
        </Card>
      )}
      {cards && cards.length > 0 && (
        <>
          <div className="mb-4 grid gap-4 lg:mb-6 lg:grid-cols-2 lg:gap-6">
            {cards.map((summary) => (
              <CardSummaryCard
                key={summary.card.id}
                {...summary}
                onOpen={() => navigate(withId(PATHS.card, summary.card.id))}
                onPay={() => setPaying(summary)}
                onEdit={() => navigate(withId(PATHS.editCard, summary.card.id))}
              />
            ))}
          </div>
          <Callout
            title="Cómo leerlo"
            text="Línea utilizada = deuda inicial + consumos con la tarjeta − pagos de tarjeta. Si pagaste de más, la línea disponible queda igual a la línea total y el excedente se muestra como saldo a favor."
          />
        </>
      )}
      {paying && (
        <PayCardModal
          isOpen
          cardName={paying.card.name}
          currency={paying.card.currency}
          cycles={paying.paymentCycles}
          accounts={accounts.filter((account) => account.currency === paying.card.currency)}
          isSaving={isSaving}
          error={payError}
          onClose={() => setPaying(null)}
          onSubmit={async (values) => {
            if (await pay({ ...values, cardId: paying.card.id, currency: paying.card.currency })) {
              const source = accounts.find((account) => account.id === values.sourceAccountId)?.alias ?? '';
              notify({ title: 'Pago de tarjeta registrado', detail: `${formatMoney(values.amount, paying.card.currency)} desde ${source}. Tus gastos del mes no cambian.` });
              setPaying(null);
              refetch();
            }
          }}
        />
      )}
    </>
  );
}
