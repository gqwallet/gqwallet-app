import { httpClient } from '@/shared/http/httpClient';
import type { Metrics } from '../types/Metrics';
import type { DailyTransactionCount } from '../types/DailyTransactionCount';

const BASE = '/metrics';

export const metricsService = {
  async get(): Promise<Metrics> {
    const { data } = await httpClient.get<Metrics>(BASE);
    return data;
  },

  async getDailyTransactionCounts(): Promise<DailyTransactionCount[]> {
    const { data } = await httpClient.get<DailyTransactionCount[]>(`${BASE}/transactions/daily-count`);
    return data;
  },
};
