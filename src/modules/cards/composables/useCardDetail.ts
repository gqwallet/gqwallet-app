import { computed, ref } from 'vue';
import { cardsService } from '../services/cardsService';
import type { Card } from '../types/Card';
import type { Transaction } from '@/modules/transactions/types/Transaction';

// Composes cards + transactions: the card itself plus its linked expenses, which the
// backend does not join server-side (one aggregate per transaction) — derived here.
export function useCardDetail(cardId: string) {
  const card = ref<Card | null>(null);
  const linkedTransactions = ref<Transaction[]>([]);
  const amountDue = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const linkedTotal = computed(() =>
    linkedTransactions.value.reduce((sum, t) => sum + t.amount, 0),
  );

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const [fetchedCard, linked, due] = await Promise.all([
        cardsService.get(cardId),
        cardsService.listLinkedTransactions(cardId),
        cardsService.getAmountDue(cardId),
      ]);
      card.value = fetchedCard;
      linkedTransactions.value = linked;
      amountDue.value = due;
    } catch {
      error.value = 'No se pudo cargar la tarjeta';
    } finally {
      loading.value = false;
    }
  }

  async function removeCard() {
    await cardsService.remove(cardId);
  }

  return { card, linkedTransactions, linkedTotal, amountDue, loading, error, fetch, removeCard };
}
