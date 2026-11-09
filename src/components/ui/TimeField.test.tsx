/**
 * Tests of controlled time selection and accessible labels.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeField } from '@/components/ui/TimeField';

function ControlledTime() {
  const [value, setValue] = useState('');
  return <TimeField label="Hora de corte" value={value} onChange={setValue} helper="Opcional" />;
}

describe('TimeField', () => {
  it('offers every hour and only five-minute increments with an empty choice', () => {
    render(<ControlledTime />);
    const group = screen.getByRole('group', { name: 'Hora de corte' });
    expect(group).toHaveAccessibleDescription('Opcional');
    const hour = within(group).getByLabelText('Hora de corte');
    const minute = within(group).getByLabelText('Minutos');
    expect(hour).toHaveValue('');
    expect(minute).toHaveValue('');
    expect(within(hour).getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['', ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))]);
    expect(within(minute).getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['', ...Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))]);
    expect(within(hour).getByRole('option', { name: 'Sin hora' })).toBeInTheDocument();
  });

  it('selects hours and minutes and clears the whole value from either select', () => {
    render(<ControlledTime />);
    const hour = screen.getByLabelText('Hora de corte');
    const minute = screen.getByLabelText('Minutos');
    fireEvent.change(hour, { target: { value: '22' } });
    expect(minute).toHaveValue('00');
    fireEvent.change(minute, { target: { value: '30' } });
    expect(hour).toHaveValue('22');
    fireEvent.change(minute, { target: { value: '' } });
    expect(hour).toHaveValue('');
    fireEvent.change(minute, { target: { value: '55' } });
    expect(hour).toHaveValue('00');
    fireEvent.change(hour, { target: { value: '' } });
    expect(minute).toHaveValue('');
  });

  it('emits complete formatted times and respects external values and disabled state', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TimeField label="Corte" value="22:00" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Minutos'), { target: { value: '05' } });
    expect(onChange).toHaveBeenLastCalledWith('22:05');
    fireEvent.change(screen.getByLabelText('Corte'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
    rerender(<TimeField label="Corte" value="00:55" onChange={onChange} disabled />);
    expect(screen.getByLabelText('Corte')).toHaveValue('00');
    expect(screen.getByLabelText('Minutos')).toHaveValue('55');
    expect(screen.getByLabelText('Corte')).toBeDisabled();
    expect(screen.getByLabelText('Minutos')).toBeDisabled();
  });
});
