/**
 * View model of the movement history: movements and transfers merged by economic date.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

/** One row of the history. */
export interface HistoryItem {
  /** Movement or transfer identifier. */
  id: string;
  /** Movement or transfer. */
  type: 'transaction' | 'transfer';
  /** Economic date (ISO date). */
  date: string;
  /** Row title, e.g. the category name. */
  title: string;
  /** Row detail, e.g. merchant and payment means. */
  detail: string;
  /** Icon ligature. */
  icon: string;
  /** Amount. */
  amount: number;
  /** Currency. */
  currency: Currency;
  /** Whether it adds money (income). */
  isIncome: boolean;
  /** Whether it was voided. */
  isVoided: boolean;
  /** Badge text such as `Pago fijo` or `Transferencia`. */
  badge: string | null;
}

/** Total card of the history header. */
export interface HistoryTotal {
  /** Card label, e.g. `Ingresos PEN`. */
  label: string;
  /** Sum. */
  total: number;
  /** Currency. */
  currency: Currency;
  /** Number of movements. */
  count: number;
  /** Income or expense. */
  isIncome: boolean;
}

/** Day group of the history. */
export interface HistoryDay {
  /** Economic date (ISO date). */
  date: string;
  /** Rows of the day. */
  items: HistoryItem[];
}
