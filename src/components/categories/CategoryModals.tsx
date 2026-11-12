/**
 * Dialogs to create (20.1, 20.2) and edit or deactivate (20.4) a category.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Callout, ChipGroup, Modal, TextField } from '@/components/ui';
import type { Category, TransactionNature } from '@/types/transaction';

/** Props of {@link NewCategoryModal}. */
export interface NewCategoryModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Preselected nature. */
  nature: TransactionNature;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Server error, e.g. a repeated name. */
  error: string | null;
  /** Called with the name and nature. */
  onCreate: (name: string, nature: TransactionNature) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the new-category form.
 *
 * @example
 * ```tsx
 * <NewCategoryModal isOpen nature="EXPENSE" isSaving={false} error={null} onCreate={create} onClose={close} />
 * ```
 */
export function NewCategoryModal({ isOpen, nature, isSaving, error, onCreate, onClose }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TransactionNature>(nature);
  const [nameError, setNameError] = useState<string | null>(null);
  const handleCreate = () => {
    if (!name.trim()) {
      setNameError('Ingresa un nombre.');
      return;
    }
    setNameError(null);
    onCreate(name.trim(), kind);
  };
  return (
    <Modal
      isOpen={isOpen}
      icon="sell"
      title="Nueva categoría"
      description="El nombre debe ser único dentro de su naturaleza."
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={error ? 'Corregir nombre' : 'Crear categoría'} isLoading={isSaving} onClick={handleCreate} />
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-content-secondary">Naturaleza</span>
        <ChipGroup label="Naturaleza" options={[{ value: 'EXPENSE', label: 'Gasto' }, { value: 'INCOME', label: 'Ingreso' }]} value={kind} onChange={setKind} />
      </div>
      <TextField label="Nombre" value={name} onChange={setName} error={nameError ?? (error?.startsWith('Ya tienes una categoría con ese nombre.') ? `Ya tienes una categoría de ${kind === 'EXPENSE' ? 'gasto' : 'ingreso'} con ese nombre.` : error)} />
    </Modal>
  );
}

/** Props of {@link EditCategoryModal}. */
export interface EditCategoryModalProps {
  /** Category to edit, or `null` when closed. */
  category: Category | null;
  /** Number of movements of the category. */
  movements: number;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Server error. */
  error: string | null;
  /** Called with the new name. */
  onRename: (name: string) => void;
  /** Called to deactivate. */
  onDeactivate: () => void;
  /** Restores an inactive category to new records. */
  onReactivate: () => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the rename form and alternating category state action.
 *
 * @example
 * ```tsx
 * <EditCategoryModal category={category} movements={23} isSaving={false} error={null} onRename={rename} onDeactivate={off} onReactivate={on} onClose={close} />
 * ```
 */
export function EditCategoryModal({ category, movements, isSaving, error, onRename, onDeactivate, onReactivate, onClose }: EditCategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const isActive = category?.status === 'ACTIVE';
  return (
    <Modal
      isInlineForm
      isOpen={category !== null}
      icon="edit"
      title={`Editar ${category?.name ?? ''}`}
      description={`Categoría de ${category?.nature === 'INCOME' ? 'ingreso' : 'gasto'} · ${movements} movimientos`}
      onClose={onClose}
      footer={
        <>
          {/* Figma uses a soft reactivation action on mobile and primary on desktop. */}
          <Button label={isActive ? 'Desactivar' : 'Reactivar'} variant={isActive ? 'danger' : 'soft'} className={`min-w-0 flex-1 px-2 lg:w-dialog-action lg:flex-none ${isActive ? '' : 'lg:bg-surface-inverse lg:text-content-on-primary lg:hover:bg-content-secondary'}`} isLoading={isSaving} onClick={isActive ? onDeactivate : onReactivate} />
          <Button className="min-w-0 flex-1 px-2 lg:flex-none lg:px-4" label="Cancelar" variant="secondary" onClick={onClose} />
          <Button className="min-w-0 flex-1 px-2 lg:flex-none lg:px-4" label="Guardar" isLoading={isSaving} onClick={() => name.trim() && onRename(name.trim())} />
        </>
      }
    >
      <TextField label="Nombre" value={name} onChange={setName} error={error} />
      {isActive ? <Callout title="Si la desactivas" text={`Dejará de ofrecerse en nuevos registros, pero sus ${movements} movimientos la conservan.`} /> : <Callout title="Categoría desactivada" text="Al reactivarla volverá a aparecer en nuevos registros. Su historial se conserva." />}
    </Modal>
  );
}
