/**
 * Reversible category state actions.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { EditCategoryModal } from '@/components/categories/CategoryModals';

it('offers reactivation for an inactive category without submitting a rename', () => {
  const reactivate = vi.fn();
  const rename = vi.fn();
  render(<EditCategoryModal category={{ id: 'c1', name: 'Comida', nature: 'EXPENSE', status: 'INACTIVE' }} movements={12} isSaving={false} error={null} onRename={rename} onDeactivate={vi.fn()} onReactivate={reactivate} onClose={vi.fn()} />);
  expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reactivar' }));
  expect(reactivate).toHaveBeenCalledOnce();
  expect(rename).not.toHaveBeenCalled();
  expect(screen.getByText(/Su historial se conserva/)).toBeVisible();
});
