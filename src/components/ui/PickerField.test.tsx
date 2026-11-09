/**
 * Tests of custom picker activation and errors.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PickerField } from '@/components/ui/PickerField';

it('names its placeholder or selection and opens the picker', () => {
  const onOpen = vi.fn();
  const { rerender } = render(<PickerField label="Categoría" valueText={null} placeholder="Elige" onOpen={onOpen} />);
  fireEvent.click(screen.getByRole('button', { name: 'Categoría Elige' }));
  expect(onOpen).toHaveBeenCalledOnce();
  rerender(<PickerField label="Categoría" valueText="Comida" placeholder="Elige" onOpen={onOpen} error="Revisa la categoría" />);
  expect(screen.getByRole('button', { name: 'Categoría Comida' })).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa la categoría');
});
