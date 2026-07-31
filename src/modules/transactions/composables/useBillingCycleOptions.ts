import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type { BillingCycleOption } from '@/modules/cards/types/NextBilling';

// FR-018: the cycles the selected card offers for a new movement. Always exactly two
// (current and next) — the server decides which, so the form never derives them itself.
export function useBillingCycleOptions() {
  const cycles = ref<BillingCycleOption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCycles(cardId: string) {
    loading.value = true;
    error.value = null;
    try {
      cycles.value = await transactionsService.listBillingCycles(cardId);
    } catch {
      cycles.value = [];
      error.value = 'No se pudieron cargar los ciclos de la tarjeta';
    } finally {
      loading.value = false;
    }
  }

  function clearCycles() {
    cycles.value = [];
    error.value = null;
  }

  return { cycles, loading, error, fetchCycles, clearCycles };
}
