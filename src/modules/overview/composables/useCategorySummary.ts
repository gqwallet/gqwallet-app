import { computed, ref } from 'vue';
import { overviewService } from '../services/overviewService';
import type { CategoryCode } from '@/shared/domain/categories';

export interface CategorySlice {
  code: CategoryCode;
  total: number;
  pct: number;
}

// Derived entirely from the transactions list (expenses grouped by category) — no
// dedicated backend endpoint, matching screen 16.
export function useCategorySummary() {
  const slices = ref<CategorySlice[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isEmpty = computed(() => total.value === 0);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const transactions = await overviewService.listTransactions();
      // Only EXPENSE rows carry a category (a card payment settles a debt, it is not a
      // spending bucket), so the null guard both satisfies the type and states the rule.
      const expenses = transactions.filter(
        (t): t is typeof t & { category: CategoryCode } => t.type === 'EXPENSE' && t.category !== null,
      );
      const grandTotal = expenses.reduce((s, t) => s + t.amount, 0);
      const byCategory = new Map<CategoryCode, number>();
      for (const t of expenses) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);

      total.value = grandTotal;
      slices.value = [...byCategory.entries()]
        .map(([code, amount]) => ({ code, total: amount, pct: grandTotal ? Math.round((amount / grandTotal) * 100) : 0 }))
        .sort((a, b) => b.total - a.total);
    } catch {
      error.value = 'No se pudo cargar el resumen';
    } finally {
      loading.value = false;
    }
  }

  return { slices, total, isEmpty, loading, error, fetch };
}
