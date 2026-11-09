/**
 * Platform metrics for administrators (FR-013).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { platformService } from '@/services/platform.service';
import type { DailyTransactionCount, PlatformMetrics } from '@/types/platform';
import { parseIsoDate, toIsoDate, todayIso } from '@/utils/format';

/** Data of the metrics page. */
export interface MetricsData {
  /** Registered and active users. */
  metrics: PlatformMetrics;
  /** Movements registered per day of the last six days. */
  daily: DailyTransactionCount[];
}

/**
 * Loads the metrics and the daily series of the last six days.
 *
 * @returns The metrics state; a 403 error means the user is not an administrator.
 * @example
 * ```ts
 * const { data, error } = useMetrics();
 * ```
 */
export function useMetrics(): ResourceState<MetricsData> {
  return useResource(async (signal) => {
    const to = todayIso();
    const start = parseIsoDate(to);
    const from = toIsoDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() - 5));
    const [metrics, daily] = await Promise.all([platformService.getMetrics(signal), platformService.listDailyCounts(from, to, signal)]);
    return { metrics, daily };
  }, []);
}
