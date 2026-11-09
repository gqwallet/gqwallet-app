/**
 * Credit card types (FR-004 to FR-006, FR-017, FR-022, FR-023).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/** Initial debt assigned to a confirmed billing cycle. */
export interface OpeningDebt {
  /** Positive amount. */
  amount: number;
  /** Confirmed closing date. */
  closingDate: string;
}

/** Server state of a payment cycle. */
export type PaymentCycleStatus = 'PENDING' | 'PARTIAL' | 'OVERDUE' | 'PAID' | 'OPEN';

/** Registered credit card. */
export interface Card {
  /** Card identifier. */
  id: string;
  /** Card name, e.g. `Visa Interbank`. */
  name: string;
  /** Issuing bank. */
  bankName: string;
  /** Catalog bank identifier. */
  bankId: string | null;
  /** Custom bank name when outside the catalog. */
  customBankName: string | null;
  /** Currency of the credit line. */
  currency: Currency;
  /** Credit line amount. */
  creditLine: number;
  /** Next billing date (ISO date). */
  billingDate: string;
  /** Optional closing-day cut-off as `HH:mm`, in five-minute increments. */
  billingCutoffTime: string | null;
  /** Next payment due date (ISO date). */
  paymentDueDate: string;
  /** Identifier color as `#RRGGBB`. */
  color: string;
  /** Optional credit-life insurance percentage, 0 to 100. */
  insurancePercentage: number | null;
  /** Existing debt assigned to billing cycles. */
  openingDebts: OpeningDebt[];
}

/** Data required to register a card. */
export interface RegisterCardInput {
  /** Card name. */
  name: string;
  /** Issuing bank. */
  bankId: string | null;
  /** Bank name used for the other bank option. */
  customBankName: string | null;
  /** Currency of the credit line. */
  currency: Currency;
  /** Credit line amount. */
  creditLine: number;
  /** Billing date (ISO date). */
  billingDate: string;
  /** Optional closing-day cut-off as `HH:mm`, in five-minute increments. */
  billingCutoffTime: string | null;
  /** Payment due date (ISO date); after the billing date. */
  paymentDueDate: string;
  /** Identifier color. */
  color: string;
  /** Optional insurance percentage. */
  insurancePercentage: number | null;
  /** Existing debt assigned to billing cycles. */
  openingDebts: OpeningDebt[];
}

/** Editable card fields; the currency is immutable. */
export type UpdateCardInput = Omit<RegisterCardInput, 'currency'>;

/** Closing and payment date pair a movement can be assigned to. */
export interface BillingCycleOption {
  /** Cycle closing date (ISO date). */
  closingDate: string;
  /** Payment due date of that cycle (ISO date). */
  paymentDueDate: string;
}

/** Credit line usage of a card (Rule B-7). */
export interface CreditLineUsage {
  /** Card identifier. */
  cardId: string;
  /** Line currency. */
  currency: Currency;
  /** Total line. */
  creditLine: number;
  /** Used line. */
  used: number;
  /** Available line, never above the total line. */
  available: number;
  /** Credit balance in favor of the user, shown apart. */
  creditBalance: number;
}

/** Projection of the next billing of a card (FR-017). */
export interface NextBilling {
  /** First day of the cycle (ISO date). */
  cycleStart: string;
  /** Billing date (ISO date). */
  billingDate: string;
  /** Payment due date (ISO date). */
  paymentDueDate: string;
  /** Expenses linked to the cycle. */
  expenses: number;
  /** Payments made in the cycle. */
  payments: number;
  /** Insurance percentage applied. */
  insurancePercentage: number | null;
  /** Insurance charge. */
  insuranceCharge: number;
  /** Total amount due, computed by the server. */
  amountDue: number;
}

/** Past or current payment cycle of a card. */
export interface PaymentCycle {
  /** First day of the cycle. */
  cycleStart: string;
  /** Total billed by the server. */
  billed: number;
  /** Payments applied by the server. */
  paid: number;
  /** Server-calculated cycle status. */
  status: PaymentCycleStatus;
  /** Closing date (ISO date). */
  closingDate: string;
  /** Payment due date (ISO date). */
  paymentDueDate: string;
  /** Amount due for the cycle. */
  amountDue: number;
}
