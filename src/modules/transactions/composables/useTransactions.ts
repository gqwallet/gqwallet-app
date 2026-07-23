import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type { RegisterTransactionPayload, Transaction } from '../types/Transaction';

export function useTransactions() {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTransactions() {
    loading.value = true;
    error.value = null;
    try {
      transactions.value = await transactionsService.list();
    } catch {
      error.value = 'No se pudieron cargar los movimientos';
    } finally {
      loading.value = false;
    }
  }

  async function registerTransaction(payload: RegisterTransactionPayload) {
    const created = await transactionsService.register(payload);
    transactions.value.unshift(created);
    return created;
  }

  async function getAvailableCredit(cardId: string) {
    return transactionsService.getAvailableCredit(cardId);
  }

  return { transactions, loading, error, fetchTransactions, registerTransaction, getAvailableCredit };
}
