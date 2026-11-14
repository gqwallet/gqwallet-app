/**
 * Tests of dialog visibility, dismissal, focus and scroll cleanup.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';

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

it('keeps focus in a controlled reason field while typing with an inline close callback', async () => {
  function VoidDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    return <>
      <button onClick={() => setIsOpen(true)}>Anular</button>
      <Modal isOpen={isOpen} title="¿Anular este gasto?" onClose={() => setIsOpen(false)}>
        <TextField label="Motivo" value={reason} onChange={setReason} />
      </Modal>
    </>;
  }
  const user = userEvent.setup();
  render(<VoidDialog />);
  const trigger = screen.getByRole('button', { name: 'Anular' });
  await user.click(trigger);
  const input = screen.getByLabelText('Motivo');
  await user.type(input, 'Lo registré dos veces');
  expect(input).toHaveValue('Lo registré dos veces');
  expect(input).toHaveFocus();
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(document.body.style.overflow).toBe('hidden');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it('uses the latest close callback without moving focus on rerender', () => {
  const initialClose = vi.fn();
  const latestClose = vi.fn();
  const { rerender } = render(<Modal isOpen title="Editar" onClose={initialClose}><input aria-label="Motivo" /></Modal>);
  const input = screen.getByLabelText('Motivo');
  input.focus();
  rerender(<Modal isOpen title="Editar" onClose={latestClose}><input aria-label="Motivo" /></Modal>);
  expect(input).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(initialClose).not.toHaveBeenCalled();
  expect(latestClose).toHaveBeenCalledOnce();
});

it('keeps Tab and Shift+Tab inside the dialog after the close callback changes', async () => {
  const user = userEvent.setup();
  const content = <><input aria-label="Nombre" /><button disabled>Deshabilitado</button><button>Guardar</button></>;
  const { rerender } = render(<Modal isOpen title="Editar" onClose={vi.fn()}>{content}</Modal>);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  await user.tab();
  expect(screen.getByLabelText('Nombre')).toHaveFocus();
  rerender(<Modal isOpen title="Editar" onClose={vi.fn()}>{content}</Modal>);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Guardar' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Guardar' })).toHaveFocus();
});
