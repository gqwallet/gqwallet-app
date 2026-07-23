import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type { Card } from '@/modules/cards/types/Card';

export function useCardOptions() {
  const cards = ref<Card[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCardOptions() {
    loading.value = true;
    error.value = null;
    try {
      cards.value = await transactionsService.listCardOptions();
    } catch {
      error.value = 'No se pudieron cargar las tarjetas';
    } finally {
      loading.value = false;
    }
  }

  return { cards, loading, error, fetchCardOptions };
}
