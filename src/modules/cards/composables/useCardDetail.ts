import { computed, ref } from 'vue';
import { cardsService } from '../services/cardsService';
import type { Card } from '../types/Card';
import type { NextBilling, PaymentCycleOption } from '../types/NextBilling';
import type { Transaction } from '@/modules/transactions/types/Transaction';

// Composes cards + transactions: the card itself plus its linked expenses, which the
// backend does not join server-side (one aggregate per transaction) — derived here.
export function useCardDetail(cardId: string) {
  const card = ref<Card | null>(null);
  const linkedTransactions = ref<Transaction[]>([]);
  const nextBilling = ref<NextBilling | null>(null);
  const paymentCycles = ref<PaymentCycleOption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // FR-018: a payment linked to the card reduces what was charged to it, so summing every
  // linked row indiscriminately would inflate the total instead of drawing it down.
  const linkedTotal = computed(() =>
    linkedTransactions.value.reduce((sum, t) => {
      if (t.type === 'CARD_PAYMENT') return sum - t.amount;
      return sum + t.amount;
    }, 0),
  );

  // FR-017: the total to pay is a server-computed figure — exposed straight from the
  // next-billing projection, never recomputed from linkedTotal (NFR-004).
  const amountDue = computed(() => nextBilling.value?.amountDue ?? null);

  // FR-019/FR-018: a payment is possible whenever ANY selectable cycle still carries a
  // balance — not just the currently-open one. Deriving this from `amountDue` alone left
  // the "pay" action disabled once the open cycle was settled, even when an earlier cycle
  // (which must be settled first, see assertWithinOutstandingBalance) still owed something.
  const hasOutstandingBalance = computed(() => paymentCycles.value.some((cycle) => cycle.amountDue > 0));

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const [fetchedCard, linked, billing, cycles] = await Promise.all([
        cardsService.get(cardId),
        cardsService.listLinkedTransactions(cardId),
        cardsService.getNextBilling(cardId),
        cardsService.listPaymentCycles(cardId),
      ]);
      card.value = fetchedCard;
      linkedTransactions.value = linked;
      nextBilling.value = billing;
      paymentCycles.value = cycles;
    } catch {
      error.value = 'No se pudo cargar la tarjeta';
    } finally {
      loading.value = false;
    }
  }

  async function removeCard() {
    await cardsService.remove(cardId);
  }

  return {
    card,
    linkedTransactions,
    linkedTotal,
    nextBilling,
    amountDue,
    paymentCycles,
    hasOutstandingBalance,
    loading,
    error,
    fetch,
    removeCard,
  };
}
