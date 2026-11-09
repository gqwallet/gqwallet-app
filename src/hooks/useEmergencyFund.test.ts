/**
 * Tests of the emergency fund hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/savings.service', () => ({ savingsService: { getEmergencyFund: vi.fn(() => Promise.resolve({ hasFixedPayments: true })), list: vi.fn(() => Promise.resolve([{ id: 'g1', emergencyFund: true, currency: 'PEN' }])) } }));
import { useEmergencyFund } from '@/hooks/useEmergencyFund';

beforeEach(() => vi.clearAllMocks());

describe('useEmergencyFund', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useEmergencyFund());
    await waitFor(() => expect(result.current.data?.hasPenGoal).toBe(true));
    expect(result.current.data?.hasUsdGoal).toBe(false);
  });
});
