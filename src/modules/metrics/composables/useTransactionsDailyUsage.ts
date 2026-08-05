import { ref } from 'vue';
import { metricsService } from '../services/metricsService';
import type { DailyTransactionCount } from '../types/DailyTransactionCount';

export function useTransactionsDailyUsage() {
  const counts = ref<DailyTransactionCount[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      counts.value = await metricsService.getDailyTransactionCounts();
    } catch {
      error.value = 'No se pudo cargar el uso diario de la plataforma';
    } finally {
      loading.value = false;
    }
  }

  return { counts, loading, error, fetch };
}
