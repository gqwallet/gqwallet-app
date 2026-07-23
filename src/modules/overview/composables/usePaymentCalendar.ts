import { ref } from 'vue';
import { overviewService } from '../services/overviewService';
import type { PaymentCalendarEntry } from '../types/Overview';

export function usePaymentCalendar() {
  const entries = ref<PaymentCalendarEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await overviewService.getPaymentCalendar();
    } catch {
      error.value = 'No se pudo cargar el calendario';
    } finally {
      loading.value = false;
    }
  }

  return { entries, loading, error, fetch };
}
