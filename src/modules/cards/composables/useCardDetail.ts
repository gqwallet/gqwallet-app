import { computed, ref } from 'vue';
import { cardsService } from '../services/cardsService';
import type { Card } from '../types/Card';
import type { NextBilling } from '../types/NextBilling';
import type { Transaction } from '@/modules/transactions/types/Transaction';

// Composes cards + transactions: the card itself plus its linked expenses, which the
// backend does not join server-side (one aggregate per transaction) — derived here.
export function useCardDetail(cardId: string) {
  const card = ref<Card | null>(null);
  const linkedTransactions = ref<Transaction[]>([]);
  const nextBilling = ref<NextBilling | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const linkedTotal = computed(() =>
    linkedTransactions.value.reduce((sum, t) => sum + t.amount, 0),
  );

  // FR-017: the total to pay is a server-computed figure — exposed straight from the
  // next-billing projection, never recomputed from linkedTotal (NFR-004).
  const amountDue = computed(() => nextBilling.value?.amountDue ?? null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const [fetchedCard, linked, billing] = await Promise.all([
        cardsService.get(cardId),
        cardsService.listLinkedTransactions(cardId),
        cardsService.getNextBilling(cardId),
      ]);
      card.value = fetchedCard;
      linkedTransactions.value = linked;
      nextBilling.value = billing;
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
    loading,
    error,
    fetch,
    removeCard,
  };
}
