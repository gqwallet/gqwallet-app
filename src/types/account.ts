/**
 * Bank and cash account types (FR-020, FR-021).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/** Kind of account. */
export type AccountType = 'DEBIT' | 'SAVINGS' | 'CASH';

/** Whether the account can receive new movements. */
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

/** Debit, savings or cash account. */
export interface Account {
  /** Account identifier. */
  id: string;
  /** User-chosen alias, unique per user. */
  alias: string;
  /** Resolved bank name, absent for cash. */
  bankName: string | null;
  /** Catalog bank identifier, or null for custom banks and cash. */
  bankId: string | null;
  /** Custom bank spelling when the bank is outside the catalog. */
  customBankName: string | null;
  /** Kind of account. */
  type: AccountType;
  /** Account currency. */
  currency: Currency;
  /** Opening balance, never negative. */
  openingBalance: number;
  /** Date of the opening balance (ISO date). */
  openingBalanceAsOf: string;
  /** Active or deactivated. */
  status: AccountStatus;
}

/** Data required to register an account. */
export interface RegisterAccountInput {
  /** Alias. */
  alias: string;
  /** Bank name. */
  bankId: string | null;
  /** Bank name used for the other bank option. */
  customBankName: string | null;
  /** Kind of account. */
  type: AccountType;
  /** Currency. */
  currency: Currency;
  /** Opening balance. */
  openingBalance: number;
  /** Date of the opening balance (ISO date). */
  openingBalanceAsOf: string;
}

/** Editable account fields; the currency and type are immutable. */
export interface UpdateAccountInput {
  /** Alias. */
  alias: string;
  /** Bank name. */
  bankId: string | null;
  /** Bank name used for the other bank option. */
  customBankName: string | null;
  /** Opening balance. */
  openingBalance: number;
  /** Date of the opening balance (ISO date). */
  openingBalanceAsOf: string;
}

/** Calculated balance of an account at a cutoff date (Rule B-6). */
export interface AccountBalance {
  /** Account identifier. */
  accountId: string;
  /** Account currency. */
  currency: Currency;
  /** Cutoff date (ISO date). */
  cutoff: string;
  /** Opening balance plus incomes minus expenses plus or minus transfers. */
  balance: number;
  /** Whether the balance is below zero. */
  negative: boolean;
  /** All active outgoing transfers through the cutoff, calculated by the server. */
  transfersOut: number;
  /** All active incoming transfers through the cutoff, calculated by the server. */
  transfersIn: number;
}
