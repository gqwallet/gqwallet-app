/**
 * Dashboard and analysis types (FR-009, FR-015, FR-035 to FR-037, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/** Pending due shown on the dashboard. */
export interface DashboardDue {
  /** Due identifier. */
  paymentDueId: string;
  /** Description. */
  description: string;
  /** Currency. */
  currency: Currency;
  /** Expected amount. */
  amount: number;
  /** Due date (ISO date). */
  dueDate: string;
}

/** Card with the closest payment shown on the dashboard. */
export interface DashboardCard {
  /** Card identifier. */
  cardId: string;
  /** Card name. */
  name: string;
  /** Line currency. */
  currency: Currency;
  /** Payment due date (ISO date). */
  paymentDueDate: string;
  /** Billing date of the same cycle as the payment due date (ISO date). */
  billingDate: string;
  /** Identifier color as `#RRGGBB`. */
  color: string;
  /** Amount due of the next billing. */
  amountDue: number;
}

/** Dashboard of one currency (FR-009). */
export interface Dashboard {
  /** Currency. */
  currency: Currency;
  /** Available balance at today. */
  available: number;
  /** Incomes of the current month. */
  monthIncomes: number;
  /** Variable expenses of the current month. */
  monthVariableExpenses: number;
  /** Fixed payments of the current month. */
  monthFixedPayments: number;
  /** Total budget usage percentage. */
  budgetUsage: number | null;
  /** Next pending dues. */
  upcomingDues: DashboardDue[];
  /** Cards with the closest payment. */
  upcomingCards: DashboardCard[];
}

/** Available balance at a cutoff with its breakdown (FR-036). */
export interface AvailableBalance {
  /** Currency. */
  currency: Currency;
  /** Cutoff date (ISO date). */
  cutoff: string;
  /** Sum of the opening balances. */
  openingBalances: number;
  /** Accumulated incomes. */
  incomes: number;
  /** Accumulated variable expenses. */
  variableExpenses: number;
  /** Accumulated fixed payments. */
  fixedPayments: number;
  /** Resulting available balance. */
  available: number;
}

/** Referential consolidated position in the main currency (FR-047). */
export interface ConsolidatedPosition {
  /** Currency of the result. */
  targetCurrency: Currency | null;
  /** Available in soles. */
  penAvailable: number | null;
  /** Available in dollars. */
  usdAvailable: number | null;
  /** Rate used, absent without a registered rate. */
  rate: number | null;
  /** Date of the rate (ISO date). */
  rateDate: string | null;
  /** Consolidated amount, absent without a rate. */
  consolidated: number | null;
  /** Whether an exchange rate is available for consolidation. */
  available: boolean;
  /** Always true: the figure is referential. */
  referential: boolean;
}

/** One month of the cash flow matrix. */
export interface CashFlowRow {
  /** Month (`YYYY-MM`) or `TOTAL`. */
  month: string;
  /** Incomes. */
  incomes: number;
  /** Variable expenses. */
  variableExpenses: number;
  /** Fixed payments. */
  fixedPayments: number;
  /** Incomes minus expenses. */
  flow: number;
  /** Accumulated flow. */
  accumulated: number;
  /** Whether the month is a projection. */
  projection: boolean;
}

/** Cash flow of a year and currency (FR-035). */
export interface CashFlow {
  /** Year. */
  year: number;
  /** Currency. */
  currency: Currency;
  /** Twelve monthly rows. */
  rows: CashFlowRow[];
  /** Totals of the year. */
  total: CashFlowRow;
}

/** One month of the debt load series. */
export interface DebtLoadMonth {
  /** Month (`YYYY-MM`). */
  month: string;
  /** Debt payments. */
  debtPayments: number;
  /** Incomes. */
  incomes: number;
  /** Load percentage, absent without incomes. */
  load: number | null;
  /** Whether the load is above the threshold. */
  overThreshold: boolean;
}

/** Debt load series of a year and currency (FR-037). */
export interface DebtLoad {
  /** Year. */
  year: number;
  /** Currency. */
  currency: Currency;
  /** Threshold percentage. */
  threshold: number;
  /** Twelve months. */
  months: DebtLoadMonth[];
}

/** Kind of calendar entry. */
export type CalendarEntryKind = 'BILLING' | 'PAYMENT' | 'DUE';

/** Entry of the payment calendar (FR-015). */
export interface PaymentCalendarEntry {
  /** Date (ISO date). */
  date: string;
  /** Card billing, card payment or fixed-payment due. */
  kind: string;
  /** Title shown on the day. */
  title: string;
  /** Card color as `#RRGGBB`, when it applies. */
  color: string | null;
  /** Due status, when it applies. */
  status: string | null;
}
