/**
 * Currency distinction and status preservation in compact movement rows.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { HistoryList } from './HistoryList';
import type { HistoryItem } from '@/types/history';
it('keeps both currency symbols and meaningful statuses without redundant currency lines', () => {
  const base: HistoryItem = { id: '1', type: 'transaction', date: '2026-11-12', title: 'Café', detail: 'Local', icon: 'coffee', amount: 12, currency: 'PEN', isIncome: false, isVoided: false, badge: null };
  render(<HistoryList days={[{ date: base.date, items: [base, { ...base, id: '2', currency: 'USD' }, { ...base, id: '3', isVoided: true }, { ...base, id: '4', type: 'transfer' }] }]} onSelect={vi.fn()} />);
  expect(screen.getAllByText('−S/ 12.00')).toHaveLength(2);
  expect(screen.getByText('−US$ 12.00')).toBeVisible();
  expect(screen.queryByText('PEN')).not.toBeInTheDocument();
  expect(screen.queryByText('USD')).not.toBeInTheDocument();
  expect(screen.getByText('Anulado')).toBeVisible();
  expect(screen.getByText('No cuenta en totales')).toBeVisible();
});
