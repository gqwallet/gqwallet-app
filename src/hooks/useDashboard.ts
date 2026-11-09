/**
 * Dashboard of one currency (FR-009): figures, upcoming dues, budget usage and closest card payments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useAuth } from '@/context/AuthContext';
import { useResource } from '@/hooks/useResource';
import { budgetsService } from '@/services/budgets.service';
import { cardsService } from '@/services/cards.service';
import { obligationsService } from '@/services/obligations.service';
import { overviewService } from '@/services/overview.service';
import { transactionsService } from '@/services/transactions.service';
import type { ApiError, Currency } from '@/types/api';
import type { BudgetStatus } from '@/types/budget';
import type { PaymentDue, UpcomingDues } from '@/types/obligation';
import type { Dashboard } from '@/types/overview';
import { monthOf, monthRange, todayIso } from '@/utils/format';

/** Everything the dashboard page shows. */
export interface DashboardData {
  /** Server figures of the currency. */
  dashboard: Dashboard;
  /** Pending dues of the currency grouped by urgency. */
  dues: UpcomingDues;
  /** Budget table of the current month. */
  budget: BudgetStatus;
  /** Number of incomes of the month. */
  incomeCount: number;
  /** Number of expenses of the month. */
  expenseCount: number;
  /** Dues of the month in the currency. */
  monthDues: number;
  /** Paid dues of the month in the currency. */
  paidDues: number;
  /** Whether the user has not registered anything yet. */
  isEmpty: boolean;
}

/** Result of {@link useDashboard}. */
export interface DashboardState {
  /** Loaded data. */
  data: DashboardData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Last error. */
  error: ApiError | null;
  /** Reloads. */
  refetch: () => void;
}

function byCurrency(dues: UpcomingDues, currency: Currency): UpcomingDues {
  const keep = (list: PaymentDue[]) => list.filter((due) => due.currency === currency);
  return {
    overdue: keep(dues.overdue),
    today: keep(dues.today),
    tomorrow: keep(dues.tomorrow),
    inTwoToThreeDays: keep(dues.inTwoToThreeDays),
    laterThisMonth: keep(dues.laterThisMonth),
  };
}

/**
 * Loads the dashboard of a currency, combining the server dashboard with the grouped dues, the
 * budget table and the month counters; card presence also determines the empty state.
 *
 * @param currency - Currency to show.
 * @returns Data, loading flag, error and refetch.
 * @example
 * ```ts
 * const { data } = useDashboard('PEN');
 * ```
 */
export function useDashboard(currency: Currency): DashboardState {
  const { profile } = useAuth();
  const state = useResource(
    async (signal) => {
      const period = monthOf(todayIso());
      const { from, to } = monthRange(period);
      const [dashboard, dues, budget, cards, incomes, expenses, monthDueList] = await Promise.all([
        overviewService.getDashboard(currency, signal),
        obligationsService.getUpcoming(signal),
        budgetsService.getStatus(period, currency, signal),
        cardsService.list(signal),
        transactionsService.list({ from, to, currency, nature: 'INCOME', status: 'ACTIVE', size: 1 }, signal),
        transactionsService.list({ from, to, currency, nature: 'EXPENSE', status: 'ACTIVE', size: 1 }, signal),
        obligationsService.listDues(from, to, signal),
      ]);
      const ofCurrency = monthDueList.filter((due) => due.currency === currency && due.status !== 'VOIDED');
      const grouped = byCurrency(dues, currency);
      const hasDues = Object.values(grouped).some((list) => list.length > 0);
      return {
        dashboard,
        dues: grouped,
        budget,
        incomeCount: incomes.totalElements,
        expenseCount: expenses.totalElements,
        monthDues: ofCurrency.length,
        paidDues: ofCurrency.filter((due) => due.status === 'PAID').length,
        isEmpty:
          cards.length === 0 &&
          !hasDues &&
          dashboard.available === 0 &&
          incomes.totalElements === 0 &&
          expenses.totalElements === 0 &&
          ofCurrency.length === 0,
      };
    },
    [currency, profile?.id],
  );
  return state;
}
