/**
 * Dialog that combines every history filter (06.3).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, ChipGroup, Modal, SelectField, TextField, type SelectOption } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { Essentiality, MovementStatus, TransactionNature } from '@/types/transaction';

/** Filters edited by {@link HistoryFilterModal}. */
export interface HistoryFilterValues {
  /** Start date (ISO date) of a custom range. */
  from: string;
  /** End date (ISO date) of a custom range. */
  to: string;
  /** Month key `YYYY-MM`, or empty for a custom range. */
  month: string;
  /** Currency, or empty for both. */
  currency: Currency | '';
  /** Category id, or empty for all. */
  categoryId: string;
  /** Account or card id, or empty for all. */
  instrumentId: string;
  /** Free text. */
  text: string;
  /** Nature, or `ALL`. */
  nature: TransactionNature | 'ALL';
  /** Essential mark, or `ALL`. */
  essentiality: Essentiality | 'ALL';
  /** Status, or `ALL`. */
  status: MovementStatus | 'ALL';
}

/** Props of {@link HistoryFilterModal}. */
export interface HistoryFilterModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Current filters. */
  value: HistoryFilterValues;
  /** Filters applied by `Limpiar`. */
  defaults: HistoryFilterValues;
  /** Month options. */
  months: SelectOption[];
  /** Category options. */
  categories: SelectOption[];
  /** Account and card options. */
  instruments: SelectOption[];
  /** Called with the applied filters. */
  onApply: (value: HistoryFilterValues) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the filter form; nothing is applied until `Aplicar filtros`.
 *
 * @example
 * ```tsx
 * <HistoryFilterModal isOpen value={filters} defaults={DEFAULTS} months={months} categories={cats} instruments={inst} onApply={apply} onClose={close} />
 * ```
 */
export function HistoryFilterModal({ isOpen, value, defaults, months, categories, instruments, onApply, onClose }: HistoryFilterModalProps) {
  const [draft, setDraft] = useState(value);
  const [opened, setOpened] = useState(isOpen);
  if (isOpen !== opened) {
    setOpened(isOpen);
    if (isOpen) setDraft(value);
  }
  const set = <TKey extends keyof HistoryFilterValues>(key: TKey, next: HistoryFilterValues[TKey]) => setDraft((current) => ({ ...current, [key]: next }));

  return (
    <Modal
      isOpen={isOpen}
      isWide
      icon="filter_list"
      title="Filtrar movimientos"
      description="Combina los filtros que necesites."
      onClose={onClose}
      footer={
        <>
          <Button label="Limpiar" variant="secondary" onClick={() => setDraft(defaults)} />
          <Button label="Aplicar filtros" onClick={() => onApply(draft)} />
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Desde" type="date" value={draft.from} onChange={(next) => setDraft((current) => ({ ...current, from: next, month: '' }))} />
          <TextField label="Hasta" type="date" value={draft.to} onChange={(next) => setDraft((current) => ({ ...current, to: next, month: '' }))} />
        </div>
        <SelectField label="Mes" value={draft.month} options={months} placeholder="Rango personalizado" onChange={(next) => set('month', next)} />
        <SelectField
          label="Moneda"
          value={draft.currency}
          options={[{ value: 'PEN', label: 'PEN · Soles' }, { value: 'USD', label: 'USD · Dólares' }]}
          placeholder="Todas"
          onChange={(next) => set('currency', next as Currency | '')}
        />
        <SelectField label="Categoría" value={draft.categoryId} options={categories} placeholder="Todas" onChange={(next) => set('categoryId', next)} />
        <SelectField label="Medio de pago" value={draft.instrumentId} options={instruments} placeholder="Todos" onChange={(next) => set('instrumentId', next)} />
        <TextField label="Texto en descripción o comercio" placeholder="Opcional" value={draft.text} onChange={(next) => set('text', next)} />
      </div>
      <FilterChips label="Naturaleza" value={draft.nature} onChange={(next) => set('nature', next)} options={[['ALL', 'Todas'], ['INCOME', 'Ingresos'], ['EXPENSE', 'Gastos']]} />
      <FilterChips label="Gasto esencial" value={draft.essentiality} onChange={(next) => set('essentiality', next)} options={[['ALL', 'Todos'], ['True', 'Sí'], ['False', 'No'], ['UNKNOWN', 'Sin dato']]} />
      <FilterChips label="Estado" value={draft.status} onChange={(next) => set('status', next)} options={[['ACTIVE', 'Vigentes'], ['VOIDED', 'Anulados'], ['ALL', 'Todos']]} />
    </Modal>
  );
}

function FilterChips<TValue extends string>({ label, value, options, onChange }: { label: string; value: TValue; options: Array<[TValue, string]>; onChange: (value: TValue) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label text-content-secondary">{label}</span>
      <ChipGroup label={label} value={value} onChange={onChange} options={options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel }))} />
    </div>
  );
}
