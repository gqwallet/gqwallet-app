import { ref } from 'vue';
import { transactionsService } from '../services/transactionsService';
import type {
  RegisterCardPaymentPayload,
  RegisterTransactionPayload,
  Transaction,
} from '../types/Transaction';

export function useTransactions() {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

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

  async function payCard(cardId: string, payload: RegisterCardPaymentPayload) {
    const created = await transactionsService.payCard(cardId, payload);
    transactions.value.unshift(created);
    return created;
  }

  async function getAvailableCredit(cardId: string) {
    return transactionsService.getAvailableCredit(cardId);
  }

  // FR-021: the composable owns the error, not the caller — surfaces the backend's own
  // rejection reason (e.g. "Cannot delete this payment while a later cycle is already
  // paid") the same way NewTransactionView.registerTransaction's failure path already does,
  // instead of a generic message that would hide *why* the delete was rejected.
  async function removeTransaction(id: string) {
    deleteError.value = null;
    try {
      await transactionsService.remove(id);
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (err) {
      const backendMessage = (err as { response?: { data?: unknown } })?.response?.data;
      deleteError.value = typeof backendMessage === 'string' && backendMessage
        ? backendMessage
        : 'No se pudo eliminar el movimiento.';
    }
  }

  return {
    transactions,
    loading,
    error,
    deleteError,
    fetchTransactions,
    registerTransaction,
    payCard,
    getAvailableCredit,
    removeTransaction,
  };
}
