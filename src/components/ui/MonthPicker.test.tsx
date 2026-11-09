/**
 * Tests the month and year pickers: minimum October 2026, no upper limit, year and empty choices.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthField, MonthPickerPanel, YearChip } from '@/components/ui/MonthPicker';

describe('MonthPickerPanel', () => {
  it('disables months before October 2026 and the previous year', () => {
    render(<MonthPickerPanel value="2026-11" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Setiembre 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Octubre 2026' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Noviembre 2026' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('moves forward without an upper limit and emits the chosen month', () => {
    const onChange = vi.fn();
    render(<MonthPickerPanel value="2026-11" onChange={onChange} />);
    for (let index = 0; index < 5; index += 1) fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('2031')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Marzo 2031' }));
    expect(onChange).toHaveBeenCalledWith('2031-03');
  });

  it('offers the whole year and an empty choice when asked', () => {
    const onChange = vi.fn();
    render(<MonthPickerPanel value="" allowYear emptyLabel="Rango personalizado" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Todo 20\d\d/ }));
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^20\d\d$/));
    fireEvent.click(screen.getByRole('button', { name: 'Rango personalizado' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});

describe('MonthField', () => {
  it('shows the chosen month and opens the picker', () => {
    const onChange = vi.fn();
    render(<MonthField label="Mes de inicio" value="2026-12" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Mes de inicio Diciembre 2026/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Enero 2026' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Octubre 2026' }));
    expect(onChange).toHaveBeenCalledWith('2026-10');
  });
});

describe('YearChip', () => {
  it('starts the years at 2026 and pages forward', () => {
    const onChange = vi.fn();
    render(<YearChip title="Elige el año" value="2026" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '2026' }));
    expect(screen.queryByRole('button', { name: '2025' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: '2040' }));
    expect(onChange).toHaveBeenCalledWith('2040');
  });
});
