/**
 * Profile and exchange-rate types (FR-003, FR-014, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';
import type { Role } from '@/types/auth';

/** Personal data and financial preferences of the signed-in user. */
export interface Profile {
  /** ISO alpha two country code. */
  countryCode: string;
  /** Profile identifier. */
  id: string;
  /** Given name; empty until the user fills it. */
  firstName: string | null;
  /** Family name; empty until the user fills it. */
  lastName: string | null;
  /** Main currency, used as default everywhere (FR-014). */
  preferredCurrency: Currency;
  /** Reference monthly income in the main currency. */
  monthlyIncome: number | null;
  /** Life cushion in the main currency. */
  lifeCushion: number | null;
  /** Optional birth date in ISO local-date format. */
  birthDate: string | null;
  /** Debt load threshold percentage, from 0.01 to 100. */
  debtLoadThreshold: number;
  /** Granted roles. */
  roles: Role[];
}

/** Editable profile fields; names are always required. */
export interface UpdateProfileInput {
  /** Optional country change; null preserves the current country. */
  countryCode?: string | null;
  /** Required given name, up to 150 characters. */
  firstName: string;
  /** Required family name, up to 150 characters. */
  lastName: string;
  /** Birth date in ISO local-date format; null clears it. */
  birthDate: string | null;
  /** Debt load threshold percentage; null or omission preserves it. */
  debtLoadThreshold?: number | null;
  /** Main currency; null when both financial amounts are absent. */
  preferredCurrency: Currency | null;
  /** Reference monthly income. */
  monthlyIncome: number | null;
  /** Life cushion; must not exceed the monthly income. */
  lifeCushion: number | null;
}

/** Referential PEN/USD rate registered by the user (FR-047). */
export interface ExchangeRate {
  /** Rate identifier. */
  id: string;
  /** Soles per one dollar. */
  penPerUsd: number;
  /** Date the rate applies from (ISO date). */
  effectiveDate: string;
}

/** Data required to register an exchange rate. */
export interface RegisterExchangeRateInput {
  /** Soles per one dollar; greater than zero. */
  penPerUsd: number;
  /** Date the rate applies from (ISO date). */
  effectiveDate: string;
}
