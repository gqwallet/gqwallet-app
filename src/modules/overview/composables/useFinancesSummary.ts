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
  // Same rule as useDashboard: card spending counts as expense, settling a statement
  // (CARD_PAYMENT) does not — it would double-count consumption already tallied here.
  const totalExpense = computed(() =>
    transactions.value.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
  );
  const totalCardPayments = computed(() =>
    transactions.value.filter((t) => t.type === 'CARD_PAYMENT').reduce((s, t) => s + t.amount, 0),
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

  return { totalIncome, totalExpense, totalCardPayments, loading, error, fetch };
}
