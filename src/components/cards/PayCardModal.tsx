/**
 * Dialog to pay a card from an account of the same currency (11.6, 11.8).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Callout, Modal, SelectField, TextField } from '@/components/ui';
import type { Currency } from '@/types/api';
import { formatAmount, formatMoney, todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';

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
  /** Suggested amount: the total due. */
  suggestedAmount: number;
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
 * <PayCardModal isOpen cardName="Visa Interbank" currency="PEN" suggestedAmount={1487.4} accounts={accounts} isSaving={false} error={null} onSubmit={pay} onClose={close} />
 * ```
 */
export function PayCardModal({ isOpen, cardName, currency, suggestedAmount, accounts, isSaving, error, onSubmit, onClose }: PayCardModalProps) {
  const [sourceId, setSourceId] = useState(accounts[0]?.id ?? '');
  const [amount, setAmount] = useState(formatAmount(suggestedAmount));
  const [date, setDate] = useState(todayIso());
  const [amountError, setAmountError] = useState<string | null>(null);
  const [opened, setOpened] = useState(isOpen);
  if (opened !== isOpen) {
    setOpened(isOpen);
    if (isOpen) {
      setSourceId(accounts[0]?.id ?? '');
      setAmount(formatAmount(suggestedAmount));
      setAmountError(null);
    }
  }

  const handlePay = () => {
    const value = parseAmount(amount);
    if (value === null || value <= 0) {
      setAmountError('Ingresa un importe mayor a cero.');
      return;
    }
    onSubmit({ sourceAccountId: sourceId, amount: value, economicDate: date });
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
          <Button label="Registrar pago" isLoading={isSaving} disabled={accounts.length === 0} onClick={handlePay} />
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
      <TextField label="Importe" inputMode="decimal" value={amount} onChange={setAmount} helper="Sugerimos el total a pagar de esta facturación." error={amountError ?? error} />
      <TextField label="Fecha" type="date" value={date} onChange={setDate} />
    </Modal>
  );
}
