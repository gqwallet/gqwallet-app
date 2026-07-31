import { render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import DashboardView from './DashboardView.vue';
import { useDashboard } from '../composables/useDashboard';

vi.mock('../composables/useDashboard');
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

function mockDashboard(amountDue: number) {
  vi.mocked(useDashboard).mockReturnValue({
    dashboard: ref({
      balance: 3000,
      upcomingCards: [
        { cardId: 'card-1', name: 'Visa', paymentDueDate: '2026-09-05', color: '#3366cc', amountDue },
      ],
    }),
    monthlyIncome: ref(3000),
    totalIncome: ref(3000),
    totalExpense: ref(450),
    nextPayment: ref(null),
    totalCardDebt: ref(amountDue),
    loading: ref(false),
    error: ref(null),
    fetch: vi.fn(),
  } as never);
}

describe('DashboardView', () => {
  it('shows what is owed on each upcoming card, on mobile and on desktop', () => {
    mockDashboard(400);

    render(DashboardView);

    // Both breakpoints render their own markup (one is hidden by CSS, both are in the DOM),
    // so the label must be present twice — a regression in either block fails here.
    expect(screen.getAllByText(/Por pagar: S\/\. 400/)).toHaveLength(2);
  });

  it('keeps the available balance free of card spending', () => {
    mockDashboard(400);

    render(DashboardView);

    expect(screen.getAllByText('S/. 3,000').length).toBeGreaterThan(0);
  });

  it('still renders the row when the cycle is fully settled', () => {
    mockDashboard(0);

    render(DashboardView);

    expect(screen.getAllByText(/Por pagar: S\/\. 0/)).toHaveLength(2);
  });
});
