/**
 * Dialog that lists the active categories of one nature as chips (07.5).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Button, ChipGroup, Modal } from '@/components/ui';
import type { Category, TransactionNature } from '@/types/transaction';

/** Props of {@link CategoryPickerModal}. */
export interface CategoryPickerModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Nature of the categories. */
  nature: TransactionNature;
  /** Categories; inactive ones are hidden. */
  categories: Category[];
  /** Chosen category id. */
  value: string;
  /** Called with the chosen id. */
  onSelect: (categoryId: string) => void;
  /** Opens the categories page. */
  onManage: () => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the category chips; choosing one closes the dialog.
 *
 * @example
 * ```tsx
 * <CategoryPickerModal isOpen nature="EXPENSE" categories={cats} value={id} onSelect={choose} onManage={manage} onClose={close} />
 * ```
 */
export function CategoryPickerModal({ isOpen, nature, categories, value, onSelect, onManage, onClose }: CategoryPickerModalProps) {
  const active = categories.filter((category) => category.status === 'ACTIVE');
  return (
    <Modal
      isOpen={isOpen}
      isWide
      icon="sell"
      title="Elige una categoría"
      description={`Categorías de ${nature === 'EXPENSE' ? 'gasto' : 'ingreso'} activas. Las desactivadas no aparecen aquí.`}
      onClose={onClose}
      footer={<Button label="Administrar categorías" icon="settings" variant="ghost" onClick={onManage} />}
    >
      <ChipGroup
        label="Categorías"
        isWrapping
        value={value || null}
        options={active.map((category) => ({ value: category.id, label: category.name }))}
        onChange={(id) => {
          onSelect(id);
          onClose();
        }}
      />
    </Modal>
  );
}
