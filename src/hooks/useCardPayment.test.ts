/**
 * Tests of the card payment hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { registerTransfer: vi.fn(() => Promise.resolve({})) } }));
import { transactionsService } from '@/services/transactions.service';
import { useCardPayment } from '@/hooks/useCardPayment';

describe('useCardPayment', () => {
  it('pays the selected cycle without replacing it', async () => {
    const { result } = renderHook(() => useCardPayment());
    await act(async () => { await result.current.pay({ cardId: 'c1', cycleClosingDate: '2026-05-10', sourceAccountId: 'a1', amount: 5, currency: 'PEN', economicDate: '2026-06-03' }); });
    expect(transactionsService.registerTransfer).toHaveBeenCalledWith(expect.objectContaining({ kind: 'CARD_PAYMENT', cycleClosingDate: '2026-05-10' }));
  });
});
