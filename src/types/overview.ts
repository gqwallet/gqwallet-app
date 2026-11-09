/**
 * Dashboard and analysis types (FR-009, FR-015, FR-035 to FR-037, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { PaymentCycleStatus } from '@/types/card';
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
  /** Server cycle status. */
  status: PaymentCycleStatus;
}

/** Pending commitments, informational and separate from balances. */
export interface Commitments {
  /** Pending fixed dues. */
  dues: number;
  /** Unpaid card statements. */
  cards: number;
  /** Total pending. */
  total: number;
  /** Number of commitments. */
  count: number;
}

/** Effective money leaving accounts. */
export interface CashOutflows {
  /** Expenses paid from accounts or cash. */
  accountExpenses: number;
  /** Fixed dues already paid. */
  fixedPaid: number;
  /** Card payments. */
  cardPayments: number;
  /** Total effective outflows. */
  total: number;
}

/** Dashboard of one currency. */
export interface Dashboard {
  /** Currency. */
  currency: Currency;
  /** Actual active account balances. */
  accountsBalance: number;
  /** Outstanding card debt. */
  cardsDebt: number;
  /** Accounts balance minus card debt. */
  netPosition: number;
  /** Current month incomes. */
  monthIncomes: number;
  /** Current month income count. */
  monthIncomesCount: number;
  /** Current month effective outflows. */
  monthOutflows: CashOutflows;
  /** Commitments due through the end of this month. */
  pendingCommitments: Commitments;
  /** Budgeted usage and spending without limits. */
  budgetUsage: { totalUsage: number | null; unbudgetedConsumption: number };
  /** Upcoming fixed dues. */
  upcomingDues: DashboardDue[];
  /** Oldest unpaid card statements. */
  upcomingCards: DashboardCard[];
}

/** Current net position and its server-calculated breakdown. */
export interface NetPosition {
  /** Currency. */
  currency: Currency;
  /** Active accounts and their actual balances. */
  accounts: { accountId: string; name: string; balance: number }[];
  /** Sum of account balances. */
  accountsBalance: number;
  /** Cards and outstanding debt. */
  cards: { cardId: string; name: string; debt: number }[];
  /** Total card debt. */
  cardsDebt: number;
  /** Balance minus debt. */
  netPosition: number;
  /** Informational pending commitments. */
  commitments: Commitments;
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
  /** Expenses paid from accounts or cash. */
  accountExpenses: number;
  /** Paid fixed dues. */
  fixedPaid: number;
  /** Card payments. */
  cardPayments: number;
  /** Effective outflows or projected payments. */
  outflows: number;
  /** Informational unpaid commitments. */
  pendingCommitments: number;
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
