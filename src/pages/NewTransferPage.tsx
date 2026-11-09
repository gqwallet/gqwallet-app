/**
 * New transfer (09, 09.1, 09.2): between own accounts, to a goal or to a card.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, ChipGroup, EmptyState, SelectField, Spinner, TextField } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useTransferForm } from '@/hooks/useTransferForm';
import { PATHS } from '@/navigation/paths';
import type { TransferKind } from '@/types/transaction';
import { formatAmount, formatMoney, formatShortDate, todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';
import { MIN_DATE } from '@/utils/dateLimits';

const KIND_OPTIONS: Array<{ value: TransferKind; label: string }> = [
  { value: 'ACCOUNT_TO_ACCOUNT', label: 'Entre cuentas' },
  { value: 'GOAL_CONTRIBUTION', label: 'Aporte a meta' },
  { value: 'CARD_PAYMENT', label: 'Pago de tarjeta' },
];

/**
 * Registers a transfer through {@link useTransferForm}; currencies must match.
 *
 * @example
 * ```tsx
 * <Route path="/transferencias/nueva" element={<NewTransferPage />} />
 * ```
 */
export function NewTransferPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { notify } = useToast();
  const [kind, setKind] = useState<TransferKind>((params.get('tipo') as TransferKind | null) ?? 'ACCOUNT_TO_ACCOUNT');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState(params.get('destino') ?? '');
  const { lookups, isLoading, loadError, submit, paymentCycles, cyclesLoading, cyclesError, isSaving, saveError } = useTransferForm(kind === 'CARD_PAYMENT' ? targetId : undefined);
  const [closingDate, setClosingDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayIso());
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceId && lookups?.accounts.length) setSourceId(lookups.accounts[0].id);
  }, [lookups, sourceId]);

  useEffect(() => {
    const oldest = [...paymentCycles].filter((cycle) => Number(cycle.amountDue) > 0).sort((a, b) => a.closingDate.localeCompare(b.closingDate))[0];
    setClosingDate(oldest?.closingDate ?? '');
    if (oldest) setAmount(formatAmount(oldest.amountDue));
  }, [paymentCycles]);

  if (isLoading && !lookups) return <Spinner />;
  if (loadError || !lookups) return <EmptyState icon="error" title="No pudimos preparar la transferencia" />;

  const source = lookups.accounts.find((account) => account.id === sourceId);
  const targets =
    kind === 'ACCOUNT_TO_ACCOUNT'
      ? lookups.accounts.filter((account) => account.id !== sourceId).map((account) => ({ value: account.id, label: `${account.alias} · ${account.currency}`, currency: account.currency, name: account.alias }))
      : kind === 'GOAL_CONTRIBUTION'
        ? lookups.goals.map((goal) => ({ value: goal.id, label: `${goal.name} · ${goal.currency}`, currency: goal.currency, name: goal.name }))
        : lookups.cards.map((card) => ({ value: card.id, label: `${card.name} · ${card.currency}`, currency: card.currency, name: card.name }));
  const target = targets.find((option) => option.value === targetId);
  const isMismatch = Boolean(source && target && source.currency !== target.currency);
  const value = parseAmount(amount);
  const targetLabel = kind === 'ACCOUNT_TO_ACCOUNT' ? 'Cuenta de destino' : kind === 'GOAL_CONTRIBUTION' ? 'Meta de destino' : 'Tarjeta a pagar';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (value === null || value <= 0) {
      setAmountError('Ingresa un importe mayor a cero.');
      return;
    }
    setAmountError(null);
    if (!source || !target || isMismatch) return;
    if (kind === 'CARD_PAYMENT' && (cyclesLoading || cyclesError || !paymentCycles.some((cycle) => cycle.closingDate === closingDate && Number(cycle.amountDue) > 0))) return;
    if (await submit({ kind, sourceAccountId: source.id, targetId: target.value, amount: value, currency: source.currency, economicDate: date, description: description.trim() || null, cycleClosingDate: kind === 'CARD_PAYMENT' ? closingDate : null })) {
      const money = formatMoney(value, source.currency);
      notify(
        kind === 'ACCOUNT_TO_ACCOUNT'
          ? { title: 'Transferencia registrada', detail: `${money} de ${source.alias} a ${target.name}. Tus totales del mes no cambian.` }
          : kind === 'GOAL_CONTRIBUTION'
            ? { title: 'Aporte registrado', detail: `${money} de ${source.alias} a ${target.name}.` }
            : { title: 'Pago de tarjeta registrado', detail: `${money} de ${source.alias} a ${target.name}. No cuenta como gasto.` },
      );
      navigate(kind === 'ACCOUNT_TO_ACCOUNT' ? PATHS.accounts : kind === 'GOAL_CONTRIBUTION' ? PATHS.goals : PATHS.cards);
    }
  };

  return (
    <>
      <PageHeader breadcrumb="Movimientos / Transferencia" title="Nueva transferencia" subtitle="Mueve dinero entre tus cuentas, aporta a una meta o paga una tarjeta." />
      <div className="mb-4 flex flex-col gap-1.5 lg:mb-6">
        <span className="text-label text-content-secondary">Tipo de transferencia</span>
        <ChipGroup
          label="Tipo de transferencia"
          options={KIND_OPTIONS}
          value={kind}
          onChange={(next) => {
            setKind(next);
            setTargetId('');
          }}
        />
      </div>
      {lookups.accounts.length === 0 ? (
        <Card>
          <EmptyState icon="account_balance" title="Aún no tienes cuentas" text="Registra una cuenta para mover dinero." action={<Button label="Registrar cuenta" icon="add" onClick={() => navigate(PATHS.accounts)} />} />
        </Card>
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Card title="Datos de la transferencia">
            <div className="grid gap-4 lg:grid-cols-2">
              <SelectField
                label="Cuenta de origen"
                value={sourceId}
                options={lookups.accounts.map((account) => ({ value: account.id, label: `${account.alias} · ${account.currency} · ${formatMoney(account.balance, account.currency)}` }))}
                onChange={setSourceId}
              />
              <SelectField
                label={targetLabel}
                value={targetId}
                placeholder={targets.length ? 'Elige un destino' : 'No hay destinos disponibles'}
                options={targets}
                onChange={setTargetId}
                error={isMismatch ? 'Las dos cuentas deben tener la misma moneda. El cambio de moneda no está disponible en esta versión.' : null}
              />
              {kind === 'CARD_PAYMENT' && <SelectField label="Facturación" value={closingDate} options={paymentCycles.filter((cycle) => Number(cycle.amountDue) > 0).map((cycle) => ({ value: cycle.closingDate, label: `Factura el ${formatShortDate(cycle.closingDate, true)} · paga hasta ${formatShortDate(cycle.paymentDueDate, true)}` }))} onChange={(value) => {
                setClosingDate(value);
                setAmount(formatAmount(paymentCycles.find((cycle) => cycle.closingDate === value)?.amountDue ?? 0));
              }} disabled={cyclesLoading} error={cyclesError ? 'No pudimos cargar las facturaciones.' : undefined} />}
              <TextField
                label="Importe"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={setAmount}
                error={amountError}
                helper={kind === 'CARD_PAYMENT' ? 'Puedes pagar una parte; el saldo queda pendiente' : undefined}
              />
              <TextField label="Descripción (opcional)" maxLength={120} value={description} onChange={setDescription} />
              <TextField label="Fecha económica" type="date" min={MIN_DATE} value={date} onChange={setDate} />
            </div>
            {!isMismatch && source && (
              <Callout
                icon="info"
                className="mt-4"
                title={kind === 'CARD_PAYMENT' ? 'Pagar la tarjeta no es un gasto' : 'No cuenta como ingreso ni gasto'}
                text={
                  kind === 'CARD_PAYMENT'
                    ? `Se registra como transferencia desde una cuenta en ${source.currency}: baja la línea utilizada y tus gastos del mes no cambian.`
                    : `Solo mueve dinero entre tus cuentas: el origen baja ${formatMoney(value ?? 0, source.currency)}, el destino sube ${formatMoney(value ?? 0, source.currency)} y tus totales del mes no cambian.`
                }
              />
            )}
            {saveError && <Callout tone="danger" className="mt-4" text={saveError} />}
          </Card>
          <div className="mt-4 flex flex-col-reverse gap-2 lg:mt-6 lg:flex-row lg:justify-end">
            <Button label="Cancelar" variant="secondary" onClick={() => navigate(-1)} />
            {isMismatch ? (
              <Button label="Elegir otra cuenta" onClick={() => setTargetId('')} />
            ) : (
              <Button type="submit" label={kind === 'CARD_PAYMENT' ? 'Registrar pago' : kind === 'GOAL_CONTRIBUTION' ? 'Registrar aporte' : 'Registrar transferencia'} icon="check" isLoading={isSaving} disabled={!target || (kind === 'CARD_PAYMENT' && (!paymentCycles.some((cycle) => cycle.closingDate === closingDate && Number(cycle.amountDue) > 0) || cyclesLoading || Boolean(cyclesError)))} />
            )}
          </div>
        </form>
      )}
    </>
  );
}
