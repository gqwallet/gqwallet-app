/**
 * Tests of table row activation by mouse and keyboard.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { DataTable } from '@/components/ui/DataTable';

it('renders named columns and activates the same row with click, Enter or Space', () => {
  const onRowClick = vi.fn();
  const row = { id: '1', name: 'Comida' };
  render(<DataTable caption="Categorías" columns={[{ key: 'name', header: 'Categoría', render: (entry) => entry.name }]} rows={[row]} rowKey={(entry) => entry.id} onRowClick={onRowClick} />);
  expect(screen.getByRole('table', { name: 'Categorías' })).toBeVisible();
  const entry = screen.getByRole('row', { name: 'Comida' });
  fireEvent.click(entry);
  fireEvent.keyDown(entry, { key: 'Enter' });
  fireEvent.keyDown(entry, { key: ' ' });
  fireEvent.keyDown(entry, { key: 'Escape' });
  expect(onRowClick).toHaveBeenCalledTimes(3);
  expect(onRowClick).toHaveBeenLastCalledWith(row);
});
