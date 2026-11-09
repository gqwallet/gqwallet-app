/**
 * Dialog to define or update the limit of a category (13.1, 13.2).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Modal, SelectField, TextField, type SelectOption } from '@/components/ui';
import type { Currency } from '@/types/api';
import { formatAmount } from '@/utils/format';
import { parseAmount } from '@/utils/parse';

/** Props of {@link LimitModal}. */
export interface LimitModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Category options. */
  categories: SelectOption[];
  /** Preselected category id. */
  categoryId: string;
  /** Current limit of each category, by id. */
  limits: Record<string, number>;
  /** Month label, e.g. `Junio 2026`. */
  monthLabel: string;
  /** Currency label, e.g. `PEN · Soles`. */
  currencyLabel: string;
  /** Currency. */
  currency: Currency;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Called with the category and limit; resolves whether it was saved. */
  onSave: (categoryId: string, limit: number) => Promise<boolean>;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the limit form; zero is valid and negatives are rejected.
 *
 * @example
 * ```tsx
 * <LimitModal isOpen categories={cats} categoryId="" limits={{}} monthLabel="Junio 2026" currencyLabel="PEN · Soles" currency="PEN" isSaving={false} onSave={save} onClose={close} />
 * ```
 */
export function LimitModal({ isOpen, categories, categoryId, limits, monthLabel, currencyLabel, isSaving, onSave, onClose }: LimitModalProps) {
  const [category, setCategory] = useState(categoryId);
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  if (opened !== isOpen) {
    setOpened(isOpen);
    if (isOpen) {
      setCategory(categoryId);
      setLimit(limits[categoryId] !== undefined ? formatAmount(limits[categoryId]) : '');
      setError(null);
    }
  }
  const handleSave = async () => {
    const value = parseAmount(limit);
    if (!category || value === null || value < 0) {
      setError('Ingresa un número mayor o igual a 0.');
      return;
    }
    setError(null);
    if (await onSave(category, value)) onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      icon="pie_chart"
      title="Definir límite"
      description="Si ya existe un límite para la misma categoría, mes y moneda, lo actualizamos."
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={error ? 'Corregir límite' : 'Guardar límite'} isLoading={isSaving} onClick={handleSave} />
        </>
      }
    >
      <SelectField
        label="Categoría"
        value={category}
        placeholder="Elige una categoría"
        options={categories}
        onChange={(next) => {
          setCategory(next);
          if (limits[next] !== undefined) setLimit(formatAmount(limits[next]));
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Mes" value="current" options={[{ value: 'current', label: monthLabel }]} onChange={() => undefined} disabled />
        <SelectField label="Moneda" value="current" options={[{ value: 'current', label: currencyLabel }]} onChange={() => undefined} disabled />
      </div>
      <TextField label="Límite" inputMode="decimal" value={limit} onChange={setLimit} helper="Un límite 0 es válido." error={error} />
    </Modal>
  );
}
