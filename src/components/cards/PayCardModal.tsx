/**
 * Dialog to pay a card from an account of the same currency (11.6, 11.8).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Callout, Modal, SelectField, TextField } from '@/components/ui';
import type { PaymentCycle } from '@/types/card';
import type { Currency } from '@/types/api';
import { formatAmount, formatMoney, formatShortDate, todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';
import { MIN_DATE } from '@/utils/dateLimits';

/** Account offered as payment source. */
export interface PayingAccountOption {
  /** Account id. */
  id: string;
  /** Alias. */
  alias: string;
  /** Currency. */
  currency: Currency;
  /** Balance at today. */
  balance: number;
}

/** Values submitted by {@link PayCardModal}. */
export interface PayCardValues {
  /** Selected billing closing date. */
  cycleClosingDate: string;
  /** Paying account. */
  sourceAccountId: string;
  /** Amount. */
  amount: number;
  /** Payment date. */
  economicDate: string;
}

/** Props of {@link PayCardModal}. */
export interface PayCardModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Card name. */
  cardName: string;
  /** Currency of the line. */
  currency: Currency;
  /** Server payment cycles. */
  cycles: PaymentCycle[];
  /** Optional cycle selected from the pending list. */
  initialClosingDate?: string;
  /** Accounts in the card currency. */
  accounts: PayingAccountOption[];
  /** Whether it is saving. */
  isSaving: boolean;
  /** Server error. */
  error: string | null;
  /** Called with the payment. */
  onSubmit: (values: PayCardValues) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the payment form; only accounts in the line currency are offered.
 *
 * @example
 * ```tsx
 * <PayCardModal isOpen cardName="Visa Interbank" currency="PEN" cycles={cycles} accounts={accounts} isSaving={false} error={null} onSubmit={pay} onClose={close} />
 * ```
 */
export function PayCardModal({ isOpen, cardName, currency, cycles, initialClosingDate, accounts, isSaving, error, onSubmit, onClose }: PayCardModalProps) {
  const today = todayIso();
  const selectable = [...cycles].filter((cycle) => Number(cycle.amountDue) > 0 || cycle.closingDate >= today).sort((a, b) => a.closingDate.localeCompare(b.closingDate));
  const unpaid = selectable.filter((cycle) => Number(cycle.amountDue) > 0);
  const initial = selectable.find((cycle) => cycle.closingDate === initialClosingDate) ?? unpaid[0] ?? selectable[0];
  const [closingDate, setClosingDate] = useState(initial?.closingDate ?? '');
  const [sourceId, setSourceId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState(formatAmount(initial?.amountDue ?? 0));
  const [date, setDate] = useState(todayIso());
  const [amountError, setAmountError] = useState<string | null>(null);
  const [opened, setOpened] = useState(isOpen);
  if (opened !== isOpen) {
    setOpened(isOpen);
    if (isOpen) {
      setClosingDate(initial?.closingDate ?? '');
      setSourceId(accounts[0]?.id ?? '');
      setAmount(formatAmount(initial?.amountDue ?? 0));
      setAmountError(null);
    }
  }

  const handlePay = () => {
    const value = parseAmount(amount);
    if (value === null || value <= 0) {
      setAmountError('Ingresa un importe mayor a cero.');
      return;
    }
    if (!selectable.some((cycle) => cycle.closingDate === closingDate) || !accounts.some((account) => account.id === sourceId)) return;
    onSubmit({ cycleClosingDate: closingDate, sourceAccountId: sourceId, amount: value, economicDate: date });
  };

  return (
    <Modal
      isOpen={isOpen}
      icon="payments"
      title={`Pagar ${cardName}`}
      description={`Se registra como transferencia desde una cuenta en ${currency}, no como gasto.`}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label="Registrar pago" isLoading={isSaving} disabled={accounts.length === 0 || !selectable.some((cycle) => cycle.closingDate === closingDate)} onClick={handlePay} />
        </>
      }
    >
      {accounts.length === 0 ? (
        <Callout tone="warning" icon="info" text={`Solo puedes pagar con una cuenta en la misma moneda de la línea (${currency}). Registra una cuenta en ${currency}.`} />
      ) : (
        <SelectField
          label="Cuenta de origen"
          value={sourceId}
          options={accounts.map((account) => ({ value: account.id, label: `${account.alias} · ${account.currency} · ${formatMoney(account.balance, account.currency)}` }))}
          onChange={setSourceId}
          helper={`Solo puedes pagar con una cuenta en la misma moneda de la línea (${currency}).`}
        />
      )}
      <SelectField label="Facturación" value={closingDate} options={selectable.map((cycle) => ({ value: cycle.closingDate, label: `${cycle.closingDate <= today ? 'Facturó' : 'Factura'} el ${formatShortDate(cycle.closingDate, true)} · paga hasta ${formatShortDate(cycle.paymentDueDate, true)} · ${formatMoney(cycle.amountDue, currency)}` }))} onChange={(value) => {
        setClosingDate(value);
        setAmount(formatAmount(selectable.find((cycle) => cycle.closingDate === value)?.amountDue ?? 0));
        setAmountError(null);
      }} />
      <TextField label="Importe" inputMode="decimal" value={amount} onChange={setAmount} helper="Puedes pagar una parte; el saldo queda pendiente" error={amountError ?? error} />
      <TextField label="Fecha" type="date" min={MIN_DATE} value={date} onChange={setDate} />
    </Modal>
  );
}
