/**
 * Fixed payment and payment due types (FR-029 to FR-032).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';
import type { PaymentMethodKind } from '@/types/transaction';

/** Fixed category of a fixed payment (Annex A). */
export type FixedPaymentKind = 'HOUSEHOLD_SERVICES' | 'SUBSCRIPTIONS' | 'MEMBERSHIPS' | 'DEBT' | 'RENT' | 'INSTALLMENT_PURCHASE';

/** Whether the fixed payment keeps generating dues. */
export type FixedPaymentStatus = 'ACTIVE' | 'FINISHED';

/** State of a monthly due. */
export type DueStatus = 'PENDING' | 'PAID' | 'VOIDED';

/** Recurring obligation that generates one due per month. */
export interface FixedPayment {
  /** Fixed payment identifier. */
  id: string;
  /** Description, e.g. `Internet`. */
  description: string;
  /** Fixed category. */
  kind: FixedPaymentKind;
  /** Budget category the paid amount counts against. */
  budgetCategoryId: string | null;
  /** Expected monthly amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Day of the month it is due, 1 to 31. */
  dueDay: number;
  /** First month (`YYYY-MM`). */
  startMonth: string;
  /** Number of installments for installment purchases. */
  totalInstallments: number | null;
  /** Active or finished. */
  status: FixedPaymentStatus;
}

/** Data required to register a fixed payment. */
export interface RegisterFixedPaymentInput {
  /** Description. */
  description: string;
  /** Fixed category. */
  kind: FixedPaymentKind;
  /** Budget category. */
  budgetCategoryId: string | null;
  /** Expected amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Due day. */
  dueDay: number;
  /** First month (`YYYY-MM`). */
  startMonth: string;
  /** Installments, when applicable. */
  totalInstallments: number | null;
  /** Usual means of payment. */
  usualPaymentMethodKind: PaymentMethodKind | null;
  /** Usual account or card. */
  usualInstrumentId: string | null;
}

/** Editable fixed-payment fields. */
export interface UpdateFixedPaymentInput {
  /** Description. */
  description: string;
  /** Budget category. */
  budgetCategoryId: string | null;
  /** Expected amount. */
  amount: number;
  /** Due day. */
  dueDay: number;
  /** Usual means of payment. */
  usualPaymentMethodKind: PaymentMethodKind | null;
  /** Usual account or card. */
  usualInstrumentId: string | null;
}

/** Monthly due generated from a fixed payment. */
export interface PaymentDue {
  /** Due identifier. */
  id: string;
  /** Source fixed payment. */
  fixedPaymentId: string;
  /** Description. */
  description: string;
  /** Fixed category. */
  kind: FixedPaymentKind;
  /** Due date (ISO date). */
  dueDate: string;
  /** Expected amount. */
  expectedAmount: number;
  /** Amount actually paid, when it differed. */
  paidAmount: number | null;
  /** Usual means of payment. */
  usualPaymentMethodKind: PaymentMethodKind | null;
  /** Usual account or card. */
  usualInstrumentId: string | null;
  /** Currency. */
  currency: Currency;
  /** Installment label, e.g. `12/36`. */
  installment: string | null;
  /** Pending, paid or voided. */
  status: DueStatus;
}

/** Pending dues grouped by urgency (FR-031). */
export interface UpcomingDues {
  /** Overdue dues. */
  overdue: PaymentDue[];
  /** Due today. */
  today: PaymentDue[];
  /** Due tomorrow. */
  tomorrow: PaymentDue[];
  /** Due in two or three days. */
  inTwoToThreeDays: PaymentDue[];
  /** Due later this month. */
  laterThisMonth: PaymentDue[];
}

/** Data submitted to mark a due as paid in one step (FR-030). */
export interface SettleDueInput {
  /** Account or card used. */
  paymentMethodKind: PaymentMethodKind;
  /** Account or card identifier. */
  instrumentId: string;
  /** Payment date (ISO date). */
  economicDate: string;
  /** Amount paid when it differs from the expected one. */
  paidAmount: number | null;
}

/** Monthly and annual totals of one fixed category. */
export interface KindTotal {
  /** Fixed category. */
  kind: FixedPaymentKind;
  /** Monthly total. */
  monthly: number;
  /** Projected annual total. */
  annual: number;
}

/** Fixed payments summary of one currency (FR-032). */
export interface FixedPaymentSummary {
  /** Currency. */
  currency: Currency;
  /** Monthly total. */
  monthlyTotal: number;
  /** Projected annual total. */
  annualTotal: number;
  /** Breakdown by fixed category. */
  byKind: KindTotal[];
}
