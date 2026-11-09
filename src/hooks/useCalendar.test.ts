/**
 * Tests of the calendar hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { listCalendarEntries: vi.fn(() => Promise.resolve([{ date: '2026-06-10', kind: 'BILLING', title: 'Visa Interbank', color: '#3333B2', status: null }])) } }));
vi.mock('@/services/obligations.service', () => ({ obligationsService: { listDues: vi.fn(() => Promise.resolve([{ id: 'd1', dueDate: '2026-06-01', description: 'Gym', status: 'PENDING', expectedAmount: 10, paidAmount: null, currency: 'PEN', installment: null }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([{ id: 'c1', name: 'Visa Interbank', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null }])), getNextBilling: vi.fn(() => Promise.resolve({ paymentDueDate: '2026-06-28', amountDue: 5 })) } }));
vi.mock('@/services/platform.service', () => ({ platformService: { linkCalendar: vi.fn(() => Promise.resolve({ id: 'l1', status: 'ACTIVE', lastSyncedAt: null })), unlink: vi.fn(() => Promise.resolve(undefined)) } }));
import { useCalendar } from '@/hooks/useCalendar';

beforeEach(() => vi.clearAllMocks());

describe('useCalendar', () => {
  it('merges card dates and dues and remembers the link', async () => {
    localStorage.clear();
    const { result } = renderHook(() => useCalendar('2026-06'));
    await waitFor(() => expect(result.current.data?.marks).toHaveLength(2));
    await act(async () => { await result.current.connect('code'); });
    expect(result.current.link?.id).toBe('l1');
  });
});
