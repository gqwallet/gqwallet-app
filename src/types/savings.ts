/**
 * Savings goal and emergency fund types (FR-038, FR-039).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/** Whether the goal target was reached. */
export type GoalStatus = 'ACTIVE' | 'ACHIEVED';

/** Savings goal with its progress. */
export interface SavingsGoal {
  /** Goal identifier. */
  id: string;
  /** Goal name. */
  name: string;
  /** Target amount. */
  target: number;
  /** Currency. */
  currency: Currency;
  /** Optional target date (ISO date). */
  targetDate: string | null;
  /** Whether the goal is the emergency fund of its currency. */
  emergencyFund: boolean;
  /** Net contributed amount. */
  contributed: number;
  /** Amount still missing. */
  remaining: number;
  /** Progress percentage. */
  progress: number;
  /** Active or achieved. */
  status: GoalStatus;
}

/** Data required to create a goal. */
export interface CreateSavingsGoalInput {
  /** Goal name. */
  name: string;
  /** Target amount. */
  target: number;
  /** Currency. */
  currency: Currency;
  /** Optional target date (ISO date). */
  targetDate: string | null;
  /** Marks the goal as emergency fund; one per currency. */
  emergencyFund: boolean;
}

/** Editable goal fields. */
export interface UpdateSavingsGoalInput {
  /** Goal name. */
  name: string;
  /** Target amount. */
  target: number;
  /** Optional target date (ISO date). */
  targetDate: string | null;
}

/** Contribution made to a goal from an account. */
export interface Contribution {
  /** Optional description, up to 120 characters. */
  description?: string | null;
  /** Contribution identifier. */
  id: string;
  /** Goal identifier. */
  goalId: string;
  /** Source account. */
  sourceAccountId: string;
  /** Amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Economic date (ISO date). */
  economicDate: string;
}

/** Data required to contribute to a goal. */
export interface RegisterContributionInput {
  /** Optional description, up to 120 characters. */
  description?: string | null;
  /** Source account. */
  sourceAccountId: string;
  /** Amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Economic date (ISO date). */
  economicDate: string;
}

/** Recommended emergency fund of one currency (FR-039). */
export interface EmergencyFund {
  /** Currency. */
  currency: Currency;
  /** Monthly fixed payments. */
  monthlyFixed: number;
  /** Minimum fund, three months of fixed payments. */
  minimum: number;
  /** Ideal fund, six months of fixed payments. */
  ideal: number;
  /** Saved in the emergency-fund goal. */
  saved: number;
  /** Months covered by the saved amount. */
  coverageMonths: number | null;
  /** Whether there are active fixed payments in the currency. */
  hasFixedPayments: boolean;
}
