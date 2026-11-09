/**
 * Movement, category, transfer and report types (FR-007, FR-008, FR-019, FR-024 to FR-028, FR-040).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency, Page } from '@/types/api';

/** Nature of a movement. */
export type TransactionNature = 'INCOME' | 'EXPENSE';

/** Whether a movement or transfer still counts in calculations. */
export type MovementStatus = 'ACTIVE' | 'VOIDED';

/** Means used to pay an expense or receive an income. */
export type PaymentMethodKind = 'ACCOUNT' | 'CARD';

/**
 * Essential-expense mark (FR-024).
 *
 * @remarks
 * The backend serializes yes and no as `True` and `False`; `UNKNOWN` means no data.
 */
export type Essentiality = 'True' | 'False' | 'UNKNOWN';

/** Mood catalog of Annex A. */
export type Mood = 'HAPPY' | 'CONTENT' | 'NEUTRAL' | 'SAD' | 'WORRIED' | 'ANXIOUS' | 'ANNOYED' | 'STRESSED';

/** Income type (FR-025). */
export type IncomeType = 'FIXED' | 'VARIABLE' | 'EXTRAORDINARY';

/** Income source (FR-025). */
export type IncomeSource = 'EMPLOYER' | 'CLIENT' | 'PLATFORM' | 'FAMILY' | 'FRIENDS';

/** Income frequency (FR-025). */
export type IncomeFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

/** Income or expense movement. */
export interface Transaction {
  /** Movement identifier. */
  id: string;
  /** Income or expense. */
  nature: TransactionNature;
  /** Positive amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Category identifier. */
  categoryId: string;
  /** Economic date (ISO date). */
  economicDate: string;
  /** Account or card. */
  paymentMethodKind: PaymentMethodKind | null;
  /** Account or card identifier. */
  instrumentId: string | null;
  /** Card cycle the expense belongs to (ISO date). */
  cycleClosingDate: string | null;
  /** Optional description, up to 120 characters. */
  description: string | null;
  /** Merchant of an expense. */
  merchant: string | null;
  /** Essential mark of an expense. */
  essentiality: Essentiality | null;
  /** Mood of an expense. */
  mood: Mood | null;
  /** Income type. */
  incomeType: IncomeType | null;
  /** Income source. */
  incomeSource: IncomeSource | null;
  /** Income frequency. */
  incomeFrequency: IncomeFrequency | null;
  /** Fixed-payment due settled by this movement. */
  paymentDueId: string | null;
  /** Active or voided. */
  status: MovementStatus;
  /** Reason given when voiding. */
  voidReason: string | null;
  /** Registration instant (ISO instant). */
  registeredAt: string;
  /** Last update instant (ISO instant). */
  updatedAt: string | null;
}

/** Fields submitted to register or edit a movement. */
export interface TransactionInput {
  /** Positive amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Category identifier. */
  categoryId: string;
  /** Economic date (ISO date). */
  economicDate: string;
  /** Account or card. */
  paymentMethodKind: PaymentMethodKind | null;
  /** Account or card identifier. */
  instrumentId: string | null;
  /** Card cycle (ISO date). */
  cycleClosingDate: string | null;
  /** Optional description. */
  description: string | null;
  /** Merchant. */
  merchant: string | null;
  /** Essential mark. */
  essentiality: Essentiality | null;
  /** Mood. */
  mood: Mood | null;
  /** Income type. */
  incomeType: IncomeType | null;
  /** Income source. */
  incomeSource: IncomeSource | null;
  /** Income frequency. */
  incomeFrequency: IncomeFrequency | null;
}

/** Data required to register a movement. */
export interface RegisterTransactionInput extends TransactionInput {
  /** Income or expense. */
  nature: TransactionNature;
}

/** Form-only movement fields; the purchase time is never sent to the API. */
export interface TransactionFormInput extends TransactionInput {
  /** Optional purchase time as `HH:mm`, used only to select the billing cycle. */
  purchaseTime?: string;
}

/** Registration form fields, including the transient purchase time. */
export interface RegisterTransactionFormInput extends TransactionFormInput {
  /** Income or expense. */
  nature: TransactionNature;
}

/** Total of the filtered movements for one nature and currency. */
export interface NatureTotal {
  /** Income or expense. */
  nature: TransactionNature;
  /** Currency. */
  currency: Currency;
  /** Sum of the active movements. */
  total: number;
}

/** Page of movements plus totals by nature and currency (FR-027). */
export interface TransactionPage extends Page<Transaction> {
  /** Totals of the whole filter, never mixing currencies. */
  totals: NatureTotal[];
}

/** History filters (FR-027). */
export interface TransactionFilter {
  /** Start date (ISO date). */
  from?: string;
  /** End date (ISO date). */
  to?: string;
  /** Currency. */
  currency?: Currency;
  /** Nature. */
  nature?: TransactionNature;
  /** Category identifier. */
  categoryId?: string;
  /** Account or card identifier. */
  instrumentId?: string;
  /** Essential mark. */
  essentiality?: Essentiality;
  /** Status. */
  status?: MovementStatus;
  /** Free text over description and merchant. */
  text?: string;
  /** Zero-based page. */
  page?: number;
  /** Page size. */
  size?: number;
}

/** Whether a category can be chosen for new movements. */
export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

/** Income or expense category (FR-019). */
export interface Category {
  /** Category identifier. */
  id: string;
  /** Unique name per nature. */
  name: string;
  /** Income or expense. */
  nature: TransactionNature;
  /** Active or deactivated. */
  status: CategoryStatus;
}

/** Kind of transfer (FR-023, FR-028). */
export type TransferKind = 'ACCOUNT_TO_ACCOUNT' | 'CARD_PAYMENT' | 'GOAL_CONTRIBUTION';

/** Movement of money between own accounts, to a card or to a goal. */
export interface Transfer {
  /** Optional description, up to 120 characters. */
  description?: string | null;
  /** Transfer identifier. */
  id: string;
  /** Kind. */
  kind: TransferKind;
  /** Source account. */
  sourceAccountId: string;
  /** Target account, card or goal. */
  targetId: string;
  /** Positive amount. */
  amount: number;
  /** Currency shared by both sides. */
  currency: Currency;
  /** Card cycle paid (ISO date). */
  cycleClosingDate: string | null;
  /** Economic date (ISO date). */
  economicDate: string;
  /** Active or voided. */
  status: MovementStatus;
}

/** Data required to register a transfer. */
export interface RegisterTransferInput {
  /** Optional description, up to 120 characters. */
  description?: string | null;
  /** Kind. */
  kind: TransferKind;
  /** Source account. */
  sourceAccountId: string;
  /** Target account or card. */
  targetId: string;
  /** Positive amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Card cycle paid (ISO date). */
  cycleClosingDate: string | null;
  /** Economic date (ISO date). */
  economicDate: string;
}

/** One slice of a report breakdown. */
export interface ReportSlice {
  /** Slice label (month, category, merchant, …). */
  label: string;
  /** Amount of the slice. */
  amount: number;
  /** Share of the total, 0 to 100. */
  share: number;
}

/** Expense report of a period and currency (FR-040). */
export interface ExpenseReport {
  /** Currency. */
  currency: Currency;
  /** Total spent. */
  total: number;
  /** Average per transaction. */
  average: number;
  /** Largest expense. */
  max: number;
  /** Smallest expense. */
  min: number;
  /** Number of expenses. */
  transactions: number;
  /** Monthly evolution. */
  monthly: ReportSlice[];
  /** Top categories. */
  topCategories: ReportSlice[];
  /** Top merchants. */
  topMerchants: ReportSlice[];
  /** Split by payment method. */
  byPaymentMethod: ReportSlice[];
  /** Split by essential mark. */
  byEssentiality: ReportSlice[];
  /** Split by mood. */
  byMood: ReportSlice[];
}

/** Income report of a period and currency (FR-040). */
export interface IncomeReport {
  /** Currency. */
  currency: Currency;
  /** Total received. */
  total: number;
  /** Average per income. */
  average: number;
  /** Largest income. */
  max: number;
  /** Smallest income. */
  min: number;
  /** Number of incomes. */
  incomes: number;
  /** Monthly evolution. */
  monthly: ReportSlice[];
  /** Split by category. */
  byCategory: ReportSlice[];
  /** Split by type. */
  byType: ReportSlice[];
  /** Split by source. */
  bySource: ReportSlice[];
  /** Split by frequency. */
  byFrequency: ReportSlice[];
}
