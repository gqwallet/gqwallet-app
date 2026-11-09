/**
 * Describes a server ordered unified ledger row.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';
import type { MovementStatus, PaymentMethodKind, TransactionNature, TransferKind } from '@/types/transaction';

/** Movement or transfer in the unified feed. */
export interface LedgerEntry {
  /** Globally unique entry identifier. */
  id: string;
  /** Source entry category. */
  entryType: 'MOVEMENT' | 'TRANSFER';
  /** Income, expense or neutral transfer. */
  nature: TransactionNature | 'TRANSFER';
  /** Transfer subtype for neutral entries. */
  transferKind: TransferKind | null;
  /** Positive amount. */
  amount: number;
  /** Amount currency. */
  currency: Currency;
  /** Economic date in ISO format. */
  economicDate: string;
  /** Registration timestamp used to break date ties. */
  registeredAt: string;
  /** Server resolved row title. */
  title: string;
  /** Movement category, absent for transfers. */
  categoryId: string | null;
  /** Resolved payment instrument. */
  paymentMethod: {
    /** Instrument kind, absent for unlinked entries. */
    kind: PaymentMethodKind | null;
    /** Instrument identifier. */
    instrumentId: string | null;
    /** Current instrument label. */
    label: string;
  };
  /** Optional description. */
  description: string | null;
  /** Active or voided state. */
  status: MovementStatus;
  /** Normalized display spelling for expense merchants. */
  merchant: string | null;
}
