/**
 * Route table of the app.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Navigate, Route, Routes } from 'react-router';
import { PublicOnly, RequireAuth, ShellLayout } from '@/navigation/guards';
import { PATHS } from '@/navigation/paths';
import { AccountDetailPage } from '@/pages/AccountDetailPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { CashFlowPage } from '@/pages/CashFlowPage';
import { DebtLoadPage } from '@/pages/DebtLoadPage';
import { EmergencyFundPage } from '@/pages/EmergencyFundPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { NewGoalPage } from '@/pages/NewGoalPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { CalendarCallbackPage } from '@/pages/CalendarCallbackPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { ExportPage } from '@/pages/ExportPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CardDetailPage } from '@/pages/CardDetailPage';
import { CardFormPage } from '@/pages/CardFormPage';
import { CardsPage } from '@/pages/CardsPage';
import { FixedPaymentFormPage } from '@/pages/FixedPaymentFormPage';
import { FixedPaymentsPage } from '@/pages/FixedPaymentsPage';
import { FixedPaymentsSummaryPage } from '@/pages/FixedPaymentsSummaryPage';
import { NewAccountPage } from '@/pages/NewAccountPage';
import { AvailableBalancePage } from '@/pages/AvailableBalancePage';
import { ConsolidatedPage } from '@/pages/ConsolidatedPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewTransactionPage } from '@/pages/NewTransactionPage';
import { NewTransferPage } from '@/pages/NewTransferPage';
import { TransactionDetailPage } from '@/pages/TransactionDetailPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { WelcomePage } from '@/pages/WelcomePage';

/**
 * Declares public, authenticated and administrator routes.
 *
 * @example
 * ```tsx
 * <BrowserRouter><AppRoutes /></BrowserRouter>
 * ```
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path={PATHS.welcome} element={<WelcomePage />} />
        <Route path={PATHS.signUp} element={<SignUpPage />} />
        <Route path={PATHS.signIn} element={<SignInPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path={PATHS.onboarding} element={<OnboardingPage />} />
        <Route element={<ShellLayout />}>
          <Route path={PATHS.dashboard} element={<DashboardPage />} />
          <Route path={PATHS.availableBalance} element={<AvailableBalancePage />} />
          <Route path={PATHS.consolidated} element={<ConsolidatedPage />} />
          <Route path={PATHS.exchangeRate} element={<ConsolidatedPage />} />
          <Route path={PATHS.transactions} element={<TransactionsPage />} />
          <Route path={PATHS.newTransaction} element={<NewTransactionPage />} />
          <Route path={PATHS.transaction} element={<TransactionDetailPage />} />
          <Route path={PATHS.newTransfer} element={<NewTransferPage />} />
          <Route path={PATHS.accounts} element={<AccountsPage />} />
          <Route path={PATHS.newAccount} element={<NewAccountPage />} />
          <Route path={PATHS.account} element={<AccountDetailPage />} />
          <Route path={PATHS.cards} element={<CardsPage />} />
          <Route path={PATHS.newCard} element={<CardFormPage />} />
          <Route path={PATHS.card} element={<CardDetailPage />} />
          <Route path={PATHS.editCard} element={<CardFormPage />} />
          <Route path={PATHS.fixedPayments} element={<FixedPaymentsPage />} />
          <Route path={PATHS.fixedPaymentsSummary} element={<FixedPaymentsSummaryPage />} />
          <Route path={PATHS.newFixedPayment} element={<FixedPaymentFormPage />} />
          <Route path={PATHS.editFixedPayment} element={<FixedPaymentFormPage />} />
          <Route path={PATHS.budget} element={<BudgetPage />} />
          <Route path={PATHS.cashFlow} element={<CashFlowPage />} />
          <Route path={PATHS.debtLoad} element={<DebtLoadPage />} />
          <Route path={PATHS.goals} element={<GoalsPage />} />
          <Route path={PATHS.newGoal} element={<NewGoalPage />} />
          <Route path={PATHS.emergencyFund} element={<EmergencyFundPage />} />
          <Route path={PATHS.goal} element={<GoalDetailPage />} />
          <Route path={PATHS.reports} element={<ReportsPage />} />
          <Route path={PATHS.calendar} element={<CalendarPage />} />
          <Route path={PATHS.calendarCallback} element={<CalendarCallbackPage />} />
          <Route path={PATHS.categories} element={<CategoriesPage />} />
          <Route path={PATHS.exports} element={<ExportPage />} />
          <Route path={PATHS.profile} element={<ProfilePage />} />
          <Route path={PATHS.metrics} element={<MetricsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={PATHS.welcome} replace />} />
    </Routes>
  );
}
