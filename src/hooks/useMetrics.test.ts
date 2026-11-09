/**
 * Tests of the metrics hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/platform.service', () => ({ platformService: { getMetrics: vi.fn(() => Promise.resolve({ registeredUsers: 2, activeUsers: 1, activeWindowDays: 30 })), listDailyCounts: vi.fn(() => Promise.resolve([])) } }));
import { useMetrics } from '@/hooks/useMetrics';

beforeEach(() => vi.clearAllMocks());

describe('useMetrics', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useMetrics());
    await waitFor(() => expect(result.current.data?.metrics.activeUsers).toBe(1));
  });
});
