/**
 * Tests of dialog visibility, dismissal, focus and scroll cleanup.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Modal } from '@/components/ui/Modal';

it('renders only when open, focuses the dialog and restores scrolling on close', () => {
  document.body.style.overflow = 'auto';
  const { rerender, unmount } = render(<Modal isOpen={false} title="Editar" onClose={vi.fn()} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<Modal isOpen title="Editar" onClose={vi.fn()}>Contenido</Modal>);
  expect(screen.getByRole('dialog', { name: 'Editar' })).toHaveFocus();
  expect(screen.getByText('Contenido')).toBeVisible();
  expect(document.body.style.overflow).toBe('hidden');
  unmount();
  expect(document.body.style.overflow).toBe('auto');
  document.body.style.overflow = '';
});

it('dismisses with Escape, the close button and backdrop, but not content clicks', () => {
  const onClose = vi.fn();
  const { unmount } = render(<Modal isOpen title="Editar" onClose={onClose}>Contenido</Modal>);
  fireEvent.mouseDown(screen.getByText('Contenido'));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
  expect(onClose).toHaveBeenCalledTimes(3);
  unmount();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(3);
});
