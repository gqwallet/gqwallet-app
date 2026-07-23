import { httpClient } from '@/shared/http/httpClient';
import { profilesService } from '@/modules/profiles/services/profilesService';
import { transactionsService } from '@/modules/transactions/services/transactionsService';
import type { Dashboard, PaymentCalendarEntry } from '../types/Overview';
import type { Transaction } from '@/modules/transactions/types/Transaction';

export const overviewService = {
  async getDashboard(): Promise<Dashboard> {
    const { data } = await httpClient.get<Dashboard>('/dashboard');
    return data;
  },

  async getPaymentCalendar(): Promise<PaymentCalendarEntry[]> {
    const { data } = await httpClient.get<PaymentCalendarEntry[]>('/payment-calendar');
    return data;
  },

  // Outbound reads (qs-vue-frontend module-boundary rule): overview has no aggregate of
  // its own, so it composes profiles' and transactions' public contracts here, in the
  // Model layer — mirrors the backend's ExternalCardsService/ExternalTransactionsService
  // adapters that `overview` already uses server-side for cards/transactions.
  async getMonthlyIncome(): Promise<number | null> {
    const profile = await profilesService.getMe();
    return profile.monthlyIncome;
  },

  async listTransactions(): Promise<Transaction[]> {
    return transactionsService.list();
  },
};
