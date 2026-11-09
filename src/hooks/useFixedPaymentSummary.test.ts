/**
 * Tests of the fixed payment summary hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getSummary: vi.fn(() => Promise.resolve({ monthlyTotal: 99 })), list: vi.fn(() => Promise.resolve([{ id: 'f1', status: 'ACTIVE', currency: 'PEN' }, { id: 'f2', status: 'ACTIVE', currency: 'USD' }])), listDues: vi.fn(() => Promise.resolve([])) } }));
import { useFixedPaymentSummary } from '@/hooks/useFixedPaymentSummary';

beforeEach(() => vi.clearAllMocks());

describe('useFixedPaymentSummary', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useFixedPaymentSummary('PEN'));
    await waitFor(() => expect(result.current.data?.active).toHaveLength(1));
  });
});
