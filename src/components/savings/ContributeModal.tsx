/**
 * Dialog to contribute to a goal from an account of its currency (15.3).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Callout, Modal, SelectField, TextField } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { RegisterContributionInput } from '@/types/savings';
import { formatMoney, todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';

/** Account offered as source. */
export interface SourceAccount {
  /** Account id. */
  id: string;
  /** Alias. */
  alias: string;
  /** Currency. */
  currency: Currency;
  /** Balance. */
  balance: number;
}

/** Props of {@link ContributeModal}. */
export interface ContributeModalProps {
  /** Goal name, or `null` when closed. */
  goalName: string | null;
  /** Goal currency. */
  currency: Currency;
  /** Accounts in the goal currency. */
  accounts: SourceAccount[];
  /** Whether it is saving. */
  isSaving: boolean;
  /** Server error. */
  error: string | null;
  /** Called with the contribution. */
  onSubmit: (input: RegisterContributionInput) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the contribution form; contributions are transfers, not expenses.
 *
 * @example
 * ```tsx
 * <ContributeModal goalName={goal.name} currency="USD" accounts={accounts} isSaving={false} error={null} onSubmit={save} onClose={close} />
 * ```
 */
export function ContributeModal({ goalName, currency, accounts, isSaving, error, onSubmit, onClose }: ContributeModalProps) {
  const [sourceId, setSourceId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayIso());
  const [amountError, setAmountError] = useState<string | null>(null);
  const source = sourceId || accounts[0]?.id || '';
  const handleSave = () => {
    const value = parseAmount(amount);
    if (value === null || value <= 0) {
      setAmountError('Ingresa un importe mayor a cero.');
      return;
    }
    setAmountError(null);
    onSubmit({ sourceAccountId: source, amount: value, currency, economicDate: date, description: description.trim() || null });
  };
  return (
    <Modal
      isOpen={goalName !== null}
      icon="savings"
      title={`Aportar a ${goalName ?? ''}`}
      description="Es una transferencia: no cuenta como gasto."
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label="Registrar aporte" isLoading={isSaving} disabled={!source} onClick={handleSave} />
        </>
      }
    >
      {accounts.length === 0 ? (
        <Callout tone="warning" icon="info" text={`No tienes cuentas activas en ${currency}. Registra una para aportar a esta meta.`} />
      ) : (
        <SelectField
          label="Cuenta de origen"
          value={source}
          options={accounts.map((account) => ({ value: account.id, label: `${account.alias} · ${formatMoney(account.balance, account.currency)}` }))}
          onChange={setSourceId}
          helper={`Solo cuentas en ${currency}, la moneda de la meta.`}
        />
      )}
      <TextField label="Importe" inputMode="decimal" placeholder="0.00" value={amount} onChange={setAmount} error={amountError ?? error} />
      <TextField label="Descripción (opcional)" maxLength={120} value={description} onChange={setDescription} />
      <TextField label="Fecha" type="date" value={date} onChange={setDate} />
    </Modal>
  );
}
