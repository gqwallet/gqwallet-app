/**
 * Categories by nature (20 to 20.5, FR-019).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState } from 'react';
import { EditCategoryModal, NewCategoryModal } from '@/components/categories';
import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, ChipGroup, EmptyState, ListRow, Overline, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import type { Category, TransactionNature } from '@/types/transaction';
import { categoryIcon } from '@/utils/categoryIcons';

/**
 * Lists the categories from {@link useCategories} and creates, renames or deactivates them.
 *
 * @example
 * ```tsx
 * <Route path="/categorias" element={<CategoriesPage />} />
 * ```
 */
export function CategoriesPage() {
  const { notify } = useToast();
  const [nature, setNature] = useState<TransactionNature>('EXPENSE');
  const { categories, isLoading, error, create, rename, deactivate, reactivate, isSaving, saveError, resetError, countMovements } = useCategories(nature);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const active = categories.filter((category) => category.status === 'ACTIVE');
  const inactive = categories.filter((category) => category.status === 'INACTIVE');

  useEffect(() => {
    let isCurrent = true;
    const ids = [...inactive.map((category) => category.id), ...(editing ? [editing.id] : [])].filter((id) => counts[id] === undefined);
    void Promise.all(ids.map(async (id) => [id, await countMovements(id)] as const)).then((entries) => {
      if (isCurrent && entries.length) setCounts((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });
    return () => {
      isCurrent = false;
    };
  }, [inactive, editing, counts, countMovements]);

  const isSeed = (category: Category) => categoryIcon(category.name) !== 'sell';
  const close = () => {
    setIsNewOpen(false);
    setEditing(null);
    resetError();
  };

  return (
    <>
      <PageHeader
        title="Categorías"
        actions={<Button label="Nueva categoría" icon="add" onClick={() => setIsNewOpen(true)} />}
      />
      <ChipGroup label="Naturaleza" options={[{ value: 'EXPENSE', label: 'Gasto' }, { value: 'INCOME', label: 'Ingreso' }]} value={nature} onChange={setNature} className="mb-4" />
      <Card>
        {isLoading && categories.length === 0 && <Spinner />}
        {error && <EmptyState icon="error" title="No pudimos cargar tus categorías" />}
        {active.length > 0 && <Overline label={`Activas · ${active.length}`} className="mb-1 px-1" />}
        {active.map((category) => (
          <ListRow
            key={category.id}
            icon={categoryIcon(category.name)}
            title={category.name}
            detail={isSeed(category) ? undefined : 'Categoría propia'}
            badge={isSeed(category) ? undefined : <Badge label="Propia" tone="primary" />}
            onClick={() => setEditing(category)}
          />
        ))}
        {inactive.length > 0 && <Overline label="Desactivadas" className="mt-3 mb-1 px-1" />}
        {inactive.map((category) => (
          <ListRow
            key={category.id}
            icon={categoryIcon(category.name)}
            title={category.name}
            detail={`No se ofrece en nuevos registros · conserva ${counts[category.id] ?? 0} movimientos`}
            badge={<Badge label="Desactivada" tone="neutral" />}
            onClick={() => setEditing(category)}
          />
        ))}
      </Card>
      <NewCategoryModal
        key={`new-${String(isNewOpen)}-${nature}`}
        isOpen={isNewOpen}
        nature={nature}
        isSaving={isSaving}
        error={saveError}
        onClose={close}
        onCreate={async (name, kind) => {
          const created = await create(name, kind);
          if (created) {
            setNature(created.nature);
            notify({ title: 'Categoría creada', detail: `${created.name} ya está disponible en tus registros.` });
            close();
          }
        }}
      />
      <EditCategoryModal
        key={editing?.id ?? 'none'}
        category={editing}
        movements={editing ? counts[editing.id] ?? 0 : 0}
        isSaving={isSaving}
        error={saveError}
        onClose={close}
        onRename={async (name) => {
          if (editing && (await rename(editing.id, name))) {
            notify({ title: 'Cambios guardados', detail: `La categoría ahora se llama ${name}.` });
            close();
          }
        }}
        onReactivate={async () => {
          const updated = editing ? await reactivate(editing.id) : null;
          if (updated && editing) {
            setEditing((current) => current?.id === updated.id ? updated : current);
          }
        }}
        onDeactivate={async () => {
          const updated = editing ? await deactivate(editing.id) : null;
          if (updated && editing) {
            setEditing((current) => current?.id === updated.id ? updated : current);
          }
        }}
      />
    </>
  );
}
