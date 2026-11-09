/**
 * Labels of the backend enums in product language (Annex A).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';
import type { AccountType } from '@/types/account';
import type { FixedPaymentKind } from '@/types/obligation';
import type { Essentiality, IncomeFrequency, IncomeSource, IncomeType, Mood } from '@/types/transaction';

/** Currency chips: `PEN · Soles` and `USD · Dólares`. */
export const CURRENCY_OPTIONS: Array<{ value: Currency; label: string }> = [
  { value: 'PEN', label: 'PEN · Soles' },
  { value: 'USD', label: 'USD · Dólares' },
];

/** Account type labels. */
export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = { DEBIT: 'Débito', SAVINGS: 'Ahorro', CASH: 'Efectivo' };

/** Fixed category labels. */
export const FIXED_KIND_LABEL: Record<FixedPaymentKind, string> = {
  HOUSEHOLD_SERVICES: 'Servicios del hogar',
  SUBSCRIPTIONS: 'Suscripciones',
  MEMBERSHIPS: 'Membresías',
  DEBT: 'Deuda',
  RENT: 'Alquiler',
  INSTALLMENT_PURCHASE: 'Consumo en cuotas',
};

/** Fixed category icons. */
export const FIXED_KIND_ICON: Record<FixedPaymentKind, string> = {
  HOUSEHOLD_SERVICES: 'wifi',
  SUBSCRIPTIONS: 'subscriptions',
  MEMBERSHIPS: 'card_membership',
  DEBT: 'account_balance',
  RENT: 'home',
  INSTALLMENT_PURCHASE: 'shopping_bag',
};

/** Essential mark labels. */
export const ESSENTIALITY_LABEL: Record<Essentiality, string> = { True: 'Sí', False: 'No', UNKNOWN: 'Sin dato' };

/** Mood labels. */
export const MOOD_LABEL: Record<Mood, string> = {
  HAPPY: 'Feliz',
  CONTENT: 'Contento',
  NEUTRAL: 'Neutral',
  SAD: 'Triste',
  WORRIED: 'Preocupado',
  ANXIOUS: 'Ansioso',
  ANNOYED: 'Molesto',
  STRESSED: 'Estresado',
};

/** Income type labels. */
export const INCOME_TYPE_LABEL: Record<IncomeType, string> = { FIXED: 'Fijo', VARIABLE: 'Variable', EXTRAORDINARY: 'Extraordinario' };

/** Income source labels. */
export const INCOME_SOURCE_LABEL: Record<IncomeSource, string> = {
  EMPLOYER: 'Empresa',
  CLIENT: 'Cliente',
  PLATFORM: 'Plataformas',
  FAMILY: 'Familia',
  FRIENDS: 'Amigos',
};

/** Income frequency labels. */
export const INCOME_FREQUENCY_LABEL: Record<IncomeFrequency, string> = {
  DAILY: 'Diaria',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};

/**
 * Turns a label map into chip or select options.
 *
 * @typeParam TValue - Enum value.
 * @param labels - Map of value to label.
 * @returns Options in declaration order.
 * @example
 * ```ts
 * toOptions(MOOD_LABEL);
 * ```
 */
export function toOptions<TValue extends string>(labels: Record<TValue, string>): Array<{ value: TValue; label: string }> {
  return (Object.keys(labels) as TValue[]).map((value) => ({ value, label: labels[value] }));
}
