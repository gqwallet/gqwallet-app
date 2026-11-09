/**
 * Tests of the fixed payment form hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/obligations.service', () => ({ obligationsService: { get: vi.fn(() => Promise.resolve({ id: 'f1', paidInstallments: 0 })), listDues: vi.fn(() => Promise.resolve([{ fixedPaymentId: 'f1', dueDate: '2026-05-15' }, { fixedPaymentId: 'f2', dueDate: '2026-06-15' }])), register: vi.fn(() => Promise.resolve({ paidInstallments: 0 })), update: vi.fn(() => Promise.resolve({ paidInstallments: 0 })), finish: vi.fn(() => Promise.resolve({ id: 'f1', paidInstallments: 0 })) } }));
import { obligationsService } from '@/services/obligations.service';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])) } }));
import { useFixedPaymentForm } from '@/hooks/useFixedPaymentForm';

beforeEach(() => vi.clearAllMocks());

describe('useFixedPaymentForm', () => {
  it('keeps only the dues of the edited fixed payment and finishes it', async () => {
    const { result } = renderHook(() => useFixedPaymentForm('f1'));
    await waitFor(() => expect(result.current.data?.dues).toHaveLength(1));
    await act(async () => { await result.current.finish(); });
    expect(obligationsService.finish).toHaveBeenCalledWith('f1');
  });
});
