import { ref } from 'vue';
import { metricsService } from '../services/metricsService';
import type { Metrics } from '../types/Metrics';

export function useMetrics() {
  const metrics = ref<Metrics | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      metrics.value = await metricsService.get();
    } catch {
      error.value = 'No se pudo cargar las métricas';
    } finally {
      loading.value = false;
    }
  }

  return { metrics, loading, error, fetch };
}
