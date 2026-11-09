/**
 * Tests of button activation, submit semantics and busy state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

it('invokes the click action and only submits when configured to submit', () => {
  const onClick = vi.fn();
  const onSubmit = vi.fn((event) => event.preventDefault());
  const { rerender } = render(<form onSubmit={onSubmit}><Button label="Guardar" onClick={onClick} /></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(onClick).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
  rerender(<form onSubmit={onSubmit}><Button label="Guardar" type="submit" /></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(onSubmit).toHaveBeenCalledOnce();
});

it.each([{ isLoading: true }, { disabled: true }])('blocks clicks when %o', (state) => {
  const onClick = vi.fn();
  render(<Button label="Guardar" {...state} onClick={onClick} />);
  const button = screen.getByRole('button', { name: 'Guardar' });
  expect(button).toBeDisabled();
  if ('isLoading' in state) expect(button).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
});
