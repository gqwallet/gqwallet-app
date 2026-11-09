/**
 * Tests of repeated report slice labels.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ShareList } from '@/components/reports/ShareList';

it('renders distinct slices with repeated labels without React key warnings', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    render(<ShareList title="Medios" slices={[{ label: 'Medio no disponible', share: 40, amount: 40 }, { label: 'Medio no disponible', share: 60, amount: 60 }]} />);
    expect(screen.getAllByText('Medio no disponible')).toHaveLength(2);
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
  } finally {
    error.mockRestore();
  }
});
