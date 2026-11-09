/**
 * Tests of toast announcements and dismissal.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Toast } from '@/components/ui/Toast';

it('announces the message and invokes dismissal when offered', () => {
  const onDismiss = vi.fn();
  const { rerender } = render(<Toast title="Guardado" detail="Perfil actualizado" onDismiss={onDismiss} />);
  expect(screen.getByRole('status')).toHaveTextContent('Perfil actualizado');
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
  expect(onDismiss).toHaveBeenCalledOnce();
  rerender(<Toast title="Guardado" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
