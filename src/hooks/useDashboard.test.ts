/**
 * Tests of the dashboard hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const setProfile = vi.fn();
const startSession = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'ana@correo.pe', roles: [] }, profile: { id: 'p1', firstName: 'Ana', lastName: null, preferredCurrency: 'PEN', monthlyIncome: null, lifeCushion: null, roles: [] }, setProfile, startSession, isAdmin: false }),
}));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/overview.service', () => ({ overviewService: { getDashboard: vi.fn(() => Promise.resolve({ accountsBalance: 0, cardsDebt: 0, netPosition: 0, upcomingCards: [] })) } }));
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getUpcoming: vi.fn(() => Promise.resolve({ overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] })), listDues: vi.fn(() => Promise.resolve([{ currency: 'PEN', status: 'PAID' }, { currency: 'USD', status: 'PENDING' }])) } }));
vi.mock('@/services/budgets.service', () => ({ budgetsService: { getStatus: vi.fn(() => Promise.resolve({ lines: [] })) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { getCreditLineUsage: vi.fn(() => Promise.resolve({ creditLine: 1000, used: 250, available: 750, creditBalance: 0 })), list: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 0, totalPages: 1 })) } }));
import { useDashboard } from '@/hooks/useDashboard';
import { overviewService } from '@/services/overview.service';
import { cardsService } from '@/services/cards.service';
import { accountsService } from '@/services/accounts.service';

beforeEach(() => vi.clearAllMocks());

describe('useDashboard', () => {
  it('counts the dues of the currency and detects a new user', async () => {
    const { result } = renderHook(() => useDashboard('PEN'));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.monthDues).toBe(1);
    expect(result.current.data?.paidDues).toBe(1);
    expect(result.current.data?.isEmpty).toBe(false);
  });

  it.each([false, true])('preserves financial figures and billing dates when supplemental previews fail: %s', async (previewFails) => {
    if (previewFails) {
      vi.mocked(accountsService.list).mockRejectedValueOnce(new Error('Count unavailable'));
      vi.mocked(cardsService.getCreditLineUsage).mockRejectedValueOnce(new Error('Preview unavailable'));
    }
    vi.mocked(overviewService.getDashboard).mockResolvedValueOnce({
      currency: 'PEN', accountsBalance: 0, cardsDebt: 0, netPosition: 0, monthIncomes: 0, monthIncomesCount: 0, monthOutflows: { accountExpenses: 0, fixedPaid: 0, cardPayments: 0, total: 0 }, pendingCommitments: { dues: 0, cards: 0, total: 0, count: 0 },
      budgetUsage: { totalUsage: null, unbudgetedConsumption: 0 }, upcomingDues: [], upcomingCards: [{
        cardId: 'c1', status: 'OVERDUE', name: 'Visa', currency: 'PEN', color: '#3333B2', amountDue: 250,
        paymentDueDate: '2026-11-20', billingDate: '2026-10-24',
      }],
    });
    vi.mocked(cardsService.list).mockResolvedValueOnce([{
      id: 'c1', name: 'Visa', bankName: 'BCP', bankId: null, customBankName: null, currency: 'PEN',
      creditLine: 1000, billingDate: '2026-11-24', billingCutoffTime: null, paymentDueDate: '2026-12-20',
      color: '#3333B2', insurancePercentage: null, openingDebts: [],
    }]);
    const { result } = renderHook(() => useDashboard('PEN'));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.error).toBeNull();
    expect(result.current.data?.cardUsages?.c1).toEqual(previewFails ? undefined : { creditLine: 1000, used: 250, available: 750, creditBalance: 0 });
    expect(result.current.data?.accountCount).toBe(previewFails ? undefined : 0);
    expect(cardsService.getCreditLineUsage).toHaveBeenCalledWith('c1', expect.any(AbortSignal));
    expect(result.current.data?.dashboard.upcomingCards[0]).toEqual(expect.objectContaining({
      paymentDueDate: '2026-11-20', billingDate: '2026-10-24', amountDue: 250,
    }));
  });
});
