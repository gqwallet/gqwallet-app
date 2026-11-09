/**
 * Tests of the fixed payment summary hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getSummary: vi.fn(() => Promise.resolve({ monthlyTotal: 99 })), list: vi.fn(() => Promise.resolve([{ id: 'f1', status: 'ACTIVE', currency: 'PEN', paidInstallments: 0 }, { id: 'f2', status: 'ACTIVE', currency: 'USD', paidInstallments: 0 }])), listDues: vi.fn(() => Promise.resolve([])) } }));
import { useFixedPaymentSummary } from '@/hooks/useFixedPaymentSummary';
import { obligationsService } from '@/services/obligations.service';

beforeEach(() => vi.clearAllMocks());

describe('useFixedPaymentSummary', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useFixedPaymentSummary('PEN'));
    await waitFor(() => expect(result.current.data?.active).toHaveLength(1));
  });

  it('preserves previously paid counts and the current due label from the backend', async () => {
    vi.mocked(obligationsService.list).mockResolvedValueOnce([{
      id: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE', budgetCategoryId: 'c1',
      amount: 250, currency: 'PEN', dueDay: 28, startMonth: '2026-10', totalInstallments: 24,
      paidInstallments: 13, status: 'ACTIVE',
    }]);
    vi.mocked(obligationsService.listDues).mockResolvedValueOnce([{
      id: 'd1', fixedPaymentId: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE',
      dueDate: '2026-10-28', expectedAmount: 250, paidAmount: null, currency: 'PEN', installment: '14/24',
      usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
    }]);
    const { result } = renderHook(() => useFixedPaymentSummary('PEN'));
    await waitFor(() => expect(result.current.data?.currentDues.f1.installment).toBe('14/24'));
    expect(result.current.data?.active[0].paidInstallments).toBe(13);
  });
});
