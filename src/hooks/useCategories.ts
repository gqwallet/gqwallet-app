/**
 * Categories of one nature, with create, rename and deactivate actions (FR-019).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback, useRef } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { transactionsService } from '@/services/transactions.service';
import type { ApiError } from '@/types/api';
import type { Category, TransactionNature } from '@/types/transaction';

/** Result of {@link useCategories}. */
export interface CategoriesState {
  /** Categories sorted by name. */
  categories: Category[];
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Creates a category of the requested nature (current nature by default). */
  create: (name: string, kind?: TransactionNature) => Promise<Category | null>;
  /** Renames a category; resolves it or `null`. */
  rename: (id: string, name: string) => Promise<Category | null>;
  /** Deactivates a category; resolves it or `null`. */
  deactivate: (id: string) => Promise<Category | null>;
  /** Reactivates a category; resolves it or `null`. */
  reactivate: (id: string) => Promise<Category | null>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Message of the last write error, e.g. a duplicated name. */
  saveError: string | null;
  /** Clears the write error. */
  resetError: () => void;
  /** Number of movements of a category. */
  countMovements: (id: string) => Promise<number>;
}

/**
 * Loads the categories of a nature and exposes their write actions.
 *
 * @param nature - Income or expense.
 * @returns Categories and actions.
 * @example
 * ```ts
 * const { categories, create } = useCategories('EXPENSE');
 * ```
 */
export function useCategories(nature: TransactionNature): CategoriesState {
  const { data, isLoading, error, refetch } = useResource((signal) => transactionsService.listCategories(nature, signal), [nature]);
  const write = useMutation((run: () => Promise<Category>) => run());
  const { submit } = write;
  const isWriting = useRef(false);
  const wrap = useCallback(
    async (run: () => Promise<Category>) => {
      if (isWriting.current) return null;
      isWriting.current = true;
      try {
        const result = await submit(run);
        if (result) refetch();
        return result;
      } finally {
        isWriting.current = false;
      }
    },
    [submit, refetch],
  );
  const create = useCallback((name: string, kind: TransactionNature = nature) => wrap(() => transactionsService.createCategory(name, kind)), [wrap, nature]);
  const rename = useCallback((id: string, name: string) => wrap(() => transactionsService.renameCategory(id, name)), [wrap]);
  const deactivate = useCallback((id: string) => wrap(() => transactionsService.deactivateCategory(id)), [wrap]);
  const reactivate = useCallback((id: string) => wrap(() => transactionsService.reactivateCategory(id)), [wrap]);
  const countMovements = useCallback(async (id: string) => {
    try {
      return (await transactionsService.list({ categoryId: id, size: 1 })).totalElements;
    } catch {
      return 0;
    }
  }, []);
  const categories = [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return {
    categories,
    isLoading,
    error,
    create,
    rename,
    deactivate,
    reactivate,
    isSaving: write.isSubmitting,
    saveError: write.error ? (write.error.status === 409 ? 'Ya tienes una categoría con ese nombre. Usa otro nombre.' : 'No pudimos guardar la categoría. Inténtalo de nuevo.') : null,
    resetError: write.reset,
    countMovements,
  };
}
