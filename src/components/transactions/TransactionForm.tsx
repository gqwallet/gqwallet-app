/**
 * Expense or income form (07, 07.1, 07.2, 07.3, 08): amount, currency, category, date, means,
 * merchant, description and optional dimensions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Callout, Card, ChipGroup, PickerField, SelectField, TextField, TimeField } from '@/components/ui';
import { InformationButton } from '@/components/ui/InformationButton';
import { CategoryPickerModal } from '@/components/transactions/CategoryPickerModal';
import type { Account } from '@/types/account';
import type { Currency } from '@/types/api';
import type { Card as CreditCard } from '@/types/card';
import type {
  Category, Essentiality, IncomeFrequency, IncomeSource, IncomeType, Mood, PaymentMethodKind, RegisterTransactionFormInput, Transaction, TransactionNature,
} from '@/types/transaction';
import { formatAmount } from '@/utils/format';
import { CURRENCY_OPTIONS, ESSENTIALITY_LABEL, INCOME_FREQUENCY_LABEL, INCOME_SOURCE_LABEL, INCOME_TYPE_LABEL, MOOD_LABEL, toOptions } from '@/utils/options';
import { hasTwoDecimalsAtMost, parseAmount } from '@/utils/parse';
import { limaPurchaseTime } from '@/utils/limaTime';
import { isBillingClosingDate } from '@/utils/billingClosingDate';
import { MIN_DATE } from '@/utils/dateLimits';

const DESCRIPTION_MAX = 120;
const NONE = 'NONE';

/** Props of {@link TransactionForm}. */
export interface TransactionFormProps {
  /** Form element id, so external buttons can submit it. */
  id: string;
  /** Income or expense. */
  nature: TransactionNature;
  /** Categories of the nature. */
  categories: Category[];
  /** Active accounts. */
  accounts: Account[];
  /** Cards. */
  cards: CreditCard[];
  /** Main currency of the user. */
  defaultCurrency: Currency;
  /** Today as ISO date. */
  today: string;
  /** Movement to edit. */
  initial?: Transaction | null;
  /** Server error shown at the top. */
  serverError?: string | null;
  /** Called with valid values. */
  onSubmit: (input: RegisterTransactionFormInput) => void;
  /** Suggests merchants for a prefix. */
  onSuggestMerchants: (prefix: string) => Promise<string[]>;
  /** Opens the categories page. */
  onManageCategories: () => void;
}

interface Errors {
  amount?: string;
  categoryId?: string;
  description?: string;
}

/**
 * Renders the movement form and validates it before calling `onSubmit`.
 *
 * @example
 * ```tsx
 * <TransactionForm id="tx" nature="EXPENSE" categories={cats} accounts={accounts} cards={cards} defaultCurrency="PEN" today={today} onSubmit={save} onSuggestMerchants={suggest} onManageCategories={manage} />
 * ```
 */
export function TransactionForm(props: TransactionFormProps) {
  const { id, nature, categories, accounts, cards, defaultCurrency, today, initial, serverError, onSubmit, onSuggestMerchants, onManageCategories } = props;
  const isExpense = nature === 'EXPENSE';
  const [amount, setAmount] = useState(initial ? formatAmount(initial.amount) : '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? defaultCurrency);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [date, setDate] = useState(initial?.economicDate ?? today);
  const [instrument, setInstrument] = useState(initial?.instrumentId ? `${initial.paymentMethodKind}:${initial.instrumentId}` : '');
  const [merchant, setMerchant] = useState(initial?.merchant ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [essentiality, setEssentiality] = useState<Essentiality>(initial?.essentiality ?? 'UNKNOWN');
  const [mood, setMood] = useState<Mood | null>(initial?.mood ?? null);
  const [incomeType, setIncomeType] = useState<IncomeType | null>(initial?.incomeType ?? null);
  const [incomeSource, setIncomeSource] = useState<IncomeSource | null>(initial?.incomeSource ?? null);
  const [incomeFrequency, setIncomeFrequency] = useState<IncomeFrequency | null>(initial?.incomeFrequency ?? null);
  const [errors, setErrors] = useState<Errors>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const instrumentOptions = useMemo(() => {
    const ofCurrency = accounts.filter((account) => account.currency === currency).map((account) => ({ value: `ACCOUNT:${account.id}`, label: `${account.alias} · ${account.currency}` }));
    const cardOptions = isExpense ? cards.filter((card) => card.currency === currency).map((card) => ({ value: `CARD:${card.id}`, label: `${card.name} · ${card.currency}` })) : [];
    return [...ofCurrency, ...cardOptions];
  }, [accounts, cards, currency, isExpense]);
  const selectedCard = isExpense ? cards.find((card) => instrument === `CARD:${card.id}` && card.currency === currency) : undefined;
  const showPurchaseTime = Boolean(selectedCard?.billingCutoffTime && isBillingClosingDate(date, selectedCard.billingDate));
  const [purchaseTime, setPurchaseTime] = useState('');
  useEffect(() => {
    setPurchaseTime(showPurchaseTime ? limaPurchaseTime(date) : '');
  }, [date, instrument, showPurchaseTime]);
  const hasInstruments = accounts.length + (isExpense ? cards.length : 0) > 0;

  useEffect(() => {
    if (!instrument && instrumentOptions.length > 0 && !initial) setInstrument(instrumentOptions[0].value);
    if (instrument && instrument !== NONE && !instrumentOptions.some((option) => option.value === instrument)) setInstrument(instrumentOptions[0]?.value ?? '');
  }, [instrumentOptions, instrument, initial]);

  useEffect(() => {
    if (!isExpense || merchant.trim().length < 2) {
      setSuggestion(null);
      return undefined;
    }
    let isCurrent = true;
    const timer = setTimeout(() => {
      void onSuggestMerchants(merchant.trim()).then((names) => {
        if (!isCurrent) return;
        const match = names.find((name) => name.toLowerCase() !== merchant.trim().toLowerCase());
        setSuggestion(match ?? null);
      });
    }, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [merchant, isExpense, onSuggestMerchants]);

  const categoryName = categories.find((category) => category.id === categoryId)?.name ?? null;
  const word = isExpense ? 'gasto' : 'ingreso';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = parseAmount(amount);
    const next: Errors = {};
    if (value === null || value <= 0 || !hasTwoDecimalsAtMost(value)) next.amount = 'Ingresa un importe mayor a cero.';
    if (!categories.some((category) => category.id === categoryId && category.status === 'ACTIVE')) next.categoryId = `Elige una categoría de ${word} activa.`;
    if (description.length > DESCRIPTION_MAX) next.description = `La descripción supera los ${DESCRIPTION_MAX} caracteres (${description.length}/${DESCRIPTION_MAX}).`;
    setErrors(next);
    if (Object.keys(next).length > 0 || value === null) return;
    const [kind, instrumentId] = instrument && instrument !== NONE ? instrument.split(':') : [null, null];
    onSubmit({
      nature,
      amount: value,
      currency,
      categoryId,
      economicDate: date,
      paymentMethodKind: kind as PaymentMethodKind | null,
      instrumentId,
      cycleClosingDate: null,
      purchaseTime: showPurchaseTime ? purchaseTime : '',
      description: description.trim() || null,
      merchant: isExpense ? merchant.trim() || null : null,
      essentiality: isExpense ? essentiality : null,
      mood: isExpense ? mood : null,
      incomeType: isExpense ? null : incomeType,
      incomeSource: isExpense ? null : incomeSource,
      incomeFrequency: isExpense ? null : incomeFrequency,
    });
  };

  const hasErrors = Object.keys(errors).length > 0;
  return (
    <form id={id} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-6">
      {hasErrors && <Callout tone="danger" title="Revisa los campos marcados" text={`No guardamos el ${word} hasta que los datos sean válidos.`} />}
      {serverError && <Callout tone="danger" text={serverError} />}
      <Card title={`Datos del ${word}`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Importe" inputMode="decimal" placeholder="0.00" value={amount} onChange={setAmount} error={errors.amount} />
          <SelectField
            label="Moneda"
            value={currency}
            options={CURRENCY_OPTIONS}
            onChange={(next) => setCurrency(next as Currency)}
            helper={initial ? undefined : 'Por defecto, tu moneda principal.'}
          />
          <PickerField
            label="Categoría"
            valueText={categoryName}
            placeholder="Elige una categoría"
            onOpen={() => setIsPickerOpen(true)}
            error={errors.categoryId}
          />
          <TextField label="Fecha económica" type="date" min={MIN_DATE} value={date} onChange={setDate} helper={initial ? undefined : 'Por defecto, hoy (hora de Lima).'} />
          {hasInstruments ? (
            <SelectField
              label={isExpense ? 'Medio de pago' : 'Cuenta de destino'}
              value={instrument}
              options={[...instrumentOptions, { value: NONE, label: isExpense ? 'Sin medio de pago' : 'Sin cuenta de destino' }]}
              onChange={setInstrument}
              helper={isExpense ? `Solo se muestran cuentas y tarjetas en ${currency}.` : `Solo se muestran cuentas en ${currency}.`}
            />
          ) : (
            <SelectField label={isExpense ? 'Medio de pago' : 'Cuenta de destino'} value={NONE} options={[{ value: NONE, label: isExpense ? 'Sin medio de pago' : 'Sin cuenta de destino' }]} onChange={setInstrument} disabled />
          )}
          {showPurchaseTime && (
            <TimeField label="Hora del consumo" value={purchaseTime} onChange={setPurchaseTime} helper={`Opcional. Después de las ${selectedCard?.billingCutoffTime} pasa al ciclo siguiente.`} />
          )}
          {isExpense ? (
            <TextField
              label="Comercio"
              placeholder="Opcional · ej. Tambo"
              value={merchant}
              onChange={setMerchant}
              helper={
                suggestion ? (
                  <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setMerchant(suggestion)}>
                    Sugerencia: {suggestion} (ya lo usaste antes).
                  </button>
                ) : undefined
              }
            />
          ) : (
            <TextField label="Descripción" placeholder={`Opcional · máximo ${DESCRIPTION_MAX} caracteres`} value={description} onChange={setDescription} error={errors.description} />
          )}
          {isExpense && (
            <TextField
              label="Descripción"
              placeholder={`Opcional · máximo ${DESCRIPTION_MAX} caracteres`}
              value={description}
              onChange={setDescription}
              error={errors.description}
              className="lg:col-span-2"
            />
          )}
        </div>
        {!hasInstruments && (
          <Callout
            tone="warning"
            icon="info"
            className="mt-4"
            title="Aún no tienes cuentas ni tarjetas"
            text={`Puedes guardar este ${word} sin medio de pago. Registra una cuenta o tarjeta para que tus ${word}s se reflejen en sus saldos.`}
          />
        )}
      </Card>
      <Card title="Detalles opcionales">
        <p className="mb-4 text-body text-content-secondary">
          {isExpense ? 'Si no los completas, el gasto se guarda con esencial «Sin dato» y sin estado de ánimo.' : 'Si no los completas, aparecerán como «Sin dato» en tus reportes.'}
        </p>
        {isExpense ? (
          <div className="flex flex-col gap-4">
            <Dimension label="¿Es un gasto esencial?">
              <ChipGroup label="¿Es un gasto esencial?" options={toOptions(ESSENTIALITY_LABEL)} value={essentiality} onChange={setEssentiality} />
            </Dimension>
            <Dimension label="¿Cómo te sentías?">
              <ChipGroup label="¿Cómo te sentías?" options={toOptions(MOOD_LABEL)} value={mood} onChange={(next) => setMood(next === mood ? null : next)} />
            </Dimension>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Dimension label="Tipo de ingreso" informationTopic="Tipo de ingreso">
              <ChipGroup label="Tipo de ingreso" options={toOptions(INCOME_TYPE_LABEL)} value={incomeType} onChange={(next) => setIncomeType(next === incomeType ? null : next)} />
            </Dimension>
            <Dimension label="Fuente">
              <ChipGroup label="Fuente" options={toOptions(INCOME_SOURCE_LABEL)} value={incomeSource} onChange={(next) => setIncomeSource(next === incomeSource ? null : next)} />
            </Dimension>
            <Dimension label="Frecuencia">
              <ChipGroup label="Frecuencia" options={toOptions(INCOME_FREQUENCY_LABEL)} value={incomeFrequency} onChange={(next) => setIncomeFrequency(next === incomeFrequency ? null : next)} />
            </Dimension>
          </div>
        )}
      </Card>
      <CategoryPickerModal
        isOpen={isPickerOpen}
        nature={nature}
        categories={categories}
        value={categoryId}
        onSelect={setCategoryId}
        onManage={onManageCategories}
        onClose={() => setIsPickerOpen(false)}
      />
    </form>
  );
}

function Dimension({ label, children, informationTopic }: { label: string; children: ReactNode; informationTopic?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between"><span className="text-label text-content-secondary">{label}</span>{informationTopic && <InformationButton topic={informationTopic} />}</div>
      {children}
    </div>
  );
}
