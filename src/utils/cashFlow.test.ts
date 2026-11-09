/**
 * Tests the first-active-month rule of the cash flow matrix.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import type { CashFlowRow } from '@/types/overview';
import { fromFirstActiveMonth } from '@/utils/cashFlow';

const month = (m: number, values: Partial<CashFlowRow> = {}): CashFlowRow => ({
  month: `2026-${String(m).padStart(2, '0')}`, incomes: 0, accountExpenses: 0, fixedPaid: 0, cardPayments: 0, outflows: 0, pendingCommitments: 0, flow: 0, accumulated: 0, projection: false, ...values,
});

describe('fromFirstActiveMonth', () => {
  it('starts at the first month with any activity and keeps the rest of the year', () => {
    const rows = Array.from({ length: 12 }, (_, i) => month(i + 1, i + 1 === 11 ? { incomes: 7500, flow: 7500, accumulated: 8500 } : i + 1 === 12 ? { accumulated: 8500 } : {}));
    expect(fromFirstActiveMonth(rows).map((row) => row.month)).toEqual(['2026-11', '2026-12']);
  });

  it('counts an opening balance as activity', () => {
    const rows = Array.from({ length: 12 }, (_, i) => month(i + 1, i + 1 >= 10 ? { accumulated: 1000 } : {}));
    expect(fromFirstActiveMonth(rows)[0].month).toBe('2026-10');
  });

  it('returns nothing for a year without activity and everything when January is active', () => {
    expect(fromFirstActiveMonth(Array.from({ length: 12 }, (_, i) => month(i + 1)))).toEqual([]);
    expect(fromFirstActiveMonth(Array.from({ length: 12 }, (_, i) => month(i + 1, { fixedPaid: 99 })))).toHaveLength(12);
  });
});

it('keeps commitments-only months visible and accepts serialized zero amounts', () => {
  const rows = [month(1), month(2, { pendingCommitments: 50 })];
  const serialized = rows.map((row) => ({ ...row, incomes: '0.00', flow: '0.00', accumulated: '0.00' })) as unknown as CashFlowRow[];
  expect(fromFirstActiveMonth(serialized).map((row) => row.month)).toEqual(['2026-02']);
});
