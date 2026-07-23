import { computed, ref } from 'vue';
import { overviewService } from '../services/overviewService';
import type { Transaction } from '@/modules/transactions/types/Transaction';

// Income/expense totals for the finances hub summary card (screen 12) — a narrower slice
// than useDashboard, which also carries balance and upcoming cards this screen doesn't show.
export function useFinancesSummary() {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const totalIncome = computed(() =>
    transactions.value.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
  );
  const totalExpense = computed(() =>
    transactions.value.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
  );

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      transactions.value = await overviewService.listTransactions();
    } catch {
      error.value = 'No se pudo cargar el resumen';
    } finally {
      loading.value = false;
    }
  }

  return { totalIncome, totalExpense, loading, error, fetch };
}
