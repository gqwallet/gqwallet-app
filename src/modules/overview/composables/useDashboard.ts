import { computed, ref } from 'vue';
import { overviewService } from '../services/overviewService';
import type { Dashboard } from '../types/Overview';

// Composes the dashboard endpoint (balance + upcoming cards) with the profile's monthly
// income and the income/expense totals derived from transactions — matching screen 05,
// minus the AI recommendation card (out of scope for this phase).
export function useDashboard() {
  const dashboard = ref<Dashboard | null>(null);
  const monthlyIncome = ref<number | null>(null);
  const totalIncome = ref(0);
  const totalExpense = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const nextPayment = computed(() => dashboard.value?.upcomingCards[0] ?? null);

  // FR-018: what the holder still owes across every card, kept separate from `balance`
  // (their cash) because card spending is debt until the statement is settled.
  const totalCardDebt = computed(() =>
    (dashboard.value?.upcomingCards ?? []).reduce((sum, card) => sum + card.amountDue, 0),
  );

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const [dash, income, transactions] = await Promise.all([
        overviewService.getDashboard(),
        overviewService.getMonthlyIncome(),
        overviewService.listTransactions(),
      ]);
      dashboard.value = dash;
      monthlyIncome.value = income;
      totalIncome.value = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      // "Gastos" is everything consumed in the period, whatever the payment method — so it
      // includes card spending and excludes CARD_PAYMENT, which is settling a debt already
      // counted here, not new consumption. Consequence: income − expense deliberately does
      // not reconcile with `balance` (FR-018).
      totalExpense.value = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    } catch {
      error.value = 'No se pudo cargar el panel';
    } finally {
      loading.value = false;
    }
  }

  return {
    dashboard,
    monthlyIncome,
    totalIncome,
    totalExpense,
    nextPayment,
    totalCardDebt,
    loading,
    error,
    fetch,
  };
}
