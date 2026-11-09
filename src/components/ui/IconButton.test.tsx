/**
 * Tests of icon button names and activation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { IconButton } from '@/components/ui/IconButton';

it('provides an accessible name and blocks clicks when disabled', () => {
  const onClick = vi.fn();
  const { rerender } = render(<IconButton label="Abrir menú" icon="menu" onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
  expect(onClick).toHaveBeenCalledOnce();
  rerender(<IconButton label="Abrir menú" icon="menu" disabled onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
  expect(onClick).toHaveBeenCalledOnce();
});
