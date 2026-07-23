import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type { CategoryCode } from '@/shared/domain/categories';

// The canonical set comes from the backend (GET /transactions/categories); the frontend
// never hard-codes it.
export function useCategories() {
  const categories = ref<CategoryCode[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      categories.value = await transactionsService.listCategories();
    } catch {
      error.value = 'No se pudieron cargar las categorías';
    } finally {
      loading.value = false;
    }
  }

  return { categories, loading, error, fetchCategories };
}
