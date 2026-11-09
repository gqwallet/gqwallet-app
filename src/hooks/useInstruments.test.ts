/**
 * Tests of the instruments hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([{ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null }])) } }));
import { useInstruments } from '@/hooks/useInstruments';

beforeEach(() => vi.clearAllMocks());

describe('useInstruments', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useInstruments());
    await waitFor(() => expect(result.current.instruments.names).toEqual({ a1: 'BCP', c1: 'Visa' }));
  });
});
