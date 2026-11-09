/**
 * Tests of the calendar hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { listCalendarEntries: vi.fn(() => Promise.resolve([{ date: '2026-06-10', kind: 'BILLING', title: 'Visa Interbank', color: '#3333B2', status: null }])) } }));
vi.mock('@/services/obligations.service', () => ({ obligationsService: { listDues: vi.fn(() => Promise.resolve([{ id: 'd1', dueDate: '2026-06-01', description: 'Gym', kind: 'MEMBERSHIPS', status: 'PENDING', expectedAmount: 10, paidAmount: null, currency: 'PEN', installment: null }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([{ id: 'c1', name: 'Visa Interbank', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null }])), getNextBilling: vi.fn(() => Promise.resolve({ paymentDueDate: '2026-06-28', amountDue: 5 })) } }));
vi.mock('@/services/platform.service', () => ({ platformService: { linkCalendar: vi.fn(() => Promise.resolve({ id: 'l1', status: 'ACTIVE', lastSyncedAt: null })), unlink: vi.fn(() => Promise.resolve(undefined)) } }));
import { useCalendar } from '@/hooks/useCalendar';
import { obligationsService } from '@/services/obligations.service';

beforeEach(() => vi.clearAllMocks());

describe('useCalendar', () => {
  it('merges card dates and dues and remembers the link', async () => {
    localStorage.clear();
    const { result } = renderHook(() => useCalendar('2026-06'));
    await waitFor(() => expect(result.current.data?.marks).toHaveLength(2));
    expect(result.current.data?.marks.find((mark) => mark.key === 'due-d1')?.fixedPaymentKind).toBe('MEMBERSHIPS');
    expect(result.current.data?.marks.find((mark) => mark.kind === 'BILLING')?.fixedPaymentKind).toBeNull();
    await act(async () => { await result.current.connect('code'); });
    expect(result.current.link?.id).toBe('l1');
  });

  it('keeps the supplied installment number for a previously paid purchase', async () => {
    vi.mocked(obligationsService.listDues).mockResolvedValueOnce([{
      id: 'd1', fixedPaymentId: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE',
      dueDate: '2026-10-28', expectedAmount: 250, paidAmount: null, currency: 'PEN', installment: '14/24',
      usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
    }]);
    const { result } = renderHook(() => useCalendar('2026-10'));
    await waitFor(() => expect(result.current.data?.marks.find((mark) => mark.key === 'due-d1')?.installment).toBe('14/24'));
  });
});
