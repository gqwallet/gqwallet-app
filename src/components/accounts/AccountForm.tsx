/**
 * Account fields (10.1, 10.2, 10.3): type, alias, bank, currency, opening balance and its date.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { ChipGroup, SelectField, TextField } from '@/components/ui';
import type { Account, AccountType, RegisterAccountInput } from '@/types/account';
import type { Currency } from '@/types/api';
import type { Bank } from '@/types/catalog';
import { formatAmount } from '@/utils/format';
import { ACCOUNT_TYPE_LABEL, CURRENCY_OPTIONS, toOptions } from '@/utils/options';
import { parseAmount } from '@/utils/parse';
import { MIN_DATE } from '@/utils/dateLimits';

/** Props of {@link AccountForm}. */
export interface AccountFormProps {
  /** Form id, so external buttons can submit it. */
  id: string;
  /** Active banks from the profile country. */
  banks: Bank[];
  /** Account to edit; type and currency are then read-only. */
  initial?: Account | null;
  /** Default currency for new accounts. */
  defaultCurrency: Currency;
  /** Today as ISO date. */
  today: string;
  /** Alias error from the server. */
  aliasError?: string | null;
  /** Called with valid values. */
  onSubmit: (input: RegisterAccountInput) => void;
}

/**
 * Renders the account fields and validates them; the opening balance must be zero or more.
 *
 * @example
 * ```tsx
 * <AccountForm id="account" defaultCurrency="PEN" today={today} onSubmit={save} />
 * ```
 */
export function AccountForm({ id, banks, initial, defaultCurrency, today, aliasError, onSubmit }: AccountFormProps) {
  const [type, setType] = useState<AccountType>(initial?.type ?? 'DEBIT');
  const [alias, setAlias] = useState(initial?.alias ?? '');
  const [bank, setBank] = useState(initial?.bankId ?? (initial?.customBankName ? 'OTHER' : ''));
  const [customBankName, setCustomBankName] = useState(initial?.customBankName ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? defaultCurrency);
  const [opening, setOpening] = useState(initial ? formatAmount(initial.openingBalance) : '0.00');
  const [date, setDate] = useState(initial?.openingBalanceAsOf ?? today);
  const [errors, setErrors] = useState<{ alias?: string; opening?: string; bank?: string }>({});
  const isEdit = Boolean(initial);
  const bankOptions = [{ value: '', label: 'Selecciona un banco' }, ...banks.map((item) => ({ value: item.id, label: item.name })),
    ...(initial?.bankId && !banks.some((item) => item.id === initial.bankId) ? [{ value: initial.bankId, label: initial.bankName ?? 'Banco no disponible' }] : []),
    { value: 'OTHER', label: 'Otro banco' }];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = parseAmount(opening);
    const next: { alias?: string; opening?: string; bank?: string } = {};
    if (!alias.trim()) next.alias = 'Ingresa un alias.';
    if (value === null || value < 0) next.opening = 'El saldo inicial debe ser mayor o igual a cero.';
    if (type !== 'CASH' && (!bank || (bank === 'OTHER' && (!customBankName.trim() || customBankName.trim().length > 150)))) next.bank = 'Selecciona un banco o ingresa su nombre (máximo 150 caracteres).';
    setErrors(next);
    if (Object.keys(next).length || value === null) return;
    onSubmit({ type, alias: alias.trim(), bankId: type === 'CASH' || bank === 'OTHER' ? null : bank, customBankName: type !== 'CASH' && bank === 'OTHER' ? customBankName.trim() : null, currency, openingBalance: value, openingBalanceAsOf: date });
  };

  return (
    <form id={id} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isEdit ? (
        <SelectField label="Tipo de cuenta" value={type} options={toOptions(ACCOUNT_TYPE_LABEL)} onChange={() => undefined} disabled />
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-content-secondary">Tipo de cuenta</span>
          <ChipGroup label="Tipo de cuenta" options={toOptions(ACCOUNT_TYPE_LABEL)} value={type} onChange={setType} />
        </div>
      )}
      <TextField label="Alias" value={alias} onChange={setAlias} helper={isEdit ? undefined : 'Un nombre único para reconocerla.'} error={errors.alias ?? aliasError} />
      {type !== 'CASH' && <>
        <SelectField label="Banco" value={bank} options={bankOptions} onChange={setBank} error={errors.bank} />
        {bank === 'OTHER' && <TextField label="Nombre del banco" value={customBankName} onChange={setCustomBankName} maxLength={150} error={errors.bank} />}
      </>}
      <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} disabled={isEdit} />
      <TextField label="Saldo inicial" inputMode="decimal" value={opening} onChange={setOpening} helper={isEdit ? undefined : 'Mayor o igual a cero.'} error={errors.opening} />
      <TextField label="Fecha del saldo inicial" type="date" min={MIN_DATE} value={date} onChange={setDate} />
    </form>
  );
}
