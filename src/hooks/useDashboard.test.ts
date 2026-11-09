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
vi.mock('@/services/overview.service', () => ({ overviewService: { getDashboard: vi.fn(() => Promise.resolve({ available: 0, upcomingCards: [] })) } }));
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getUpcoming: vi.fn(() => Promise.resolve({ overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] })), listDues: vi.fn(() => Promise.resolve([{ currency: 'PEN', status: 'PAID' }, { currency: 'USD', status: 'PENDING' }])) } }));
vi.mock('@/services/budgets.service', () => ({ budgetsService: { getStatus: vi.fn(() => Promise.resolve({ lines: [] })) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 0, totalPages: 1 })) } }));
import { useDashboard } from '@/hooks/useDashboard';

beforeEach(() => vi.clearAllMocks());

describe('useDashboard', () => {
  it('counts the dues of the currency and detects a new user', async () => {
    const { result } = renderHook(() => useDashboard('PEN'));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.monthDues).toBe(1);
    expect(result.current.data?.paidDues).toBe(1);
    expect(result.current.data?.isEmpty).toBe(false);
  });
});
