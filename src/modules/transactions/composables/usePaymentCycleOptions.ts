import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type { PaymentCycleOption } from '@/modules/cards/types/NextBilling';

// FR-019: the cycles the selected card offers for a payment, each already priced against its
// own window — never the currently-open cycle's amount reused across both options. Distinct
// from useBillingCycleOptions (FR-018), which only lists cycles for linking a new movement.
export function usePaymentCycleOptions() {
  const cycles = ref<PaymentCycleOption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCycles(cardId: string) {
    loading.value = true;
    error.value = null;
    try {
      cycles.value = await transactionsService.listPaymentCycles(cardId);
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
