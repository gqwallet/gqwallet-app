/**
 * Budget types (FR-033, FR-034).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/**
 * Visual state of a budget line.
 *
 * @remarks
 * `NO_SPENDING` is a zero limit with zero consumption; `NO_BUDGET` is a category without a limit.
 */
export type BudgetState = 'NORMAL' | 'ATTENTION' | 'REACHED' | 'EXCEEDED' | 'NO_SPENDING' | 'NO_BUDGET';

/** Limit of one category, month and currency. */
export interface Budget {
  /** Budget identifier. */
  id: string;
  /** Expense category. */
  categoryId: string;
  /** Month (`YYYY-MM`). */
  period: string;
  /** Currency. */
  currency: Currency;
  /** Limit, zero or more. */
  limit: number;
}

/** Data required to define a limit. */
export interface CreateBudgetInput {
  /** Expense category. */
  categoryId: string;
  /** Month (`YYYY-MM`). */
  period: string;
  /** Currency. */
  currency: Currency;
  /** Limit. */
  limit: number;
}

/** One row of the budget table. */
export interface BudgetLine {
  /** Expense category. */
  categoryId: string;
  /** Category name. */
  categoryName: string;
  /** Limit, absent without budget. */
  limit: number | null;
  /** Consumption of the month. */
  consumption: number;
  /** Limit minus consumption, absent without budget. */
  balance: number | null;
  /** Usage percentage, absent when the limit is zero or missing. */
  usage: number | null;
  /** Visual state. */
  state: BudgetState;
}

/** Budget table of one month and currency (FR-034). */
export interface BudgetStatus {
  /** Month (`YYYY-MM`). */
  period: string;
  /** Currency. */
  currency: Currency;
  /** Rows by category. */
  lines: BudgetLine[];
  /** Sum of the limits. */
  totalLimit: number;
  /** Sum of the consumption. */
  totalConsumption: number;
  /** Total usage percentage. */
  totalUsage: number | null;
}

/** Result of copying limits between months. */
export interface BudgetCopy {
  /** Source month. */
  fromPeriod: string;
  /** Target month. */
  toPeriod: string;
  /** Number of limits created; existing ones are not overwritten. */
  created: number;
}
