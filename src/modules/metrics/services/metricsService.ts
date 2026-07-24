import { httpClient } from '@/shared/http/httpClient';
import type { Metrics } from '../types/Metrics';

const BASE = '/metrics';

export const metricsService = {
  async get(): Promise<Metrics> {
    const { data } = await httpClient.get<Metrics>(BASE);
    return data;
  },
};
