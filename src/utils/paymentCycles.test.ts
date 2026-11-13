/**
 * Tests exact aggregation of authoritative closed-statement balances.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import type { PaymentCycle } from '@/types/card';
import { summarizeClosedStatements } from '@/utils/paymentCycles';

it('sums closed unpaid cycles exactly and excludes future and settled statements', () => {
  const cycle = (closingDate: string, amountDue: number, status: PaymentCycle['status']): PaymentCycle => ({ cycleStart: '2026-09-01', closingDate, paymentDueDate: '2026-11-20', billed: amountDue, paid: 0, amountDue, status });
  const summary = summarizeClosedStatements([
    cycle('2026-09-30', 0.1, 'OVERDUE'), cycle('2026-10-31', 0.2, 'PARTIAL'),
    cycle('2026-11-30', 100, 'OPEN'), cycle('2026-08-31', 0, 'PAID'),
  ], '2026-11-12');
  expect(summary).toEqual({ amountDue: 0.3, count: 2, overdueCount: 1 });
});

it('preserves four-decimal server values until display formatting', () => {
  const cycles: PaymentCycle[] = [0.1001, 0.2002].map(amountDue => ({ cycleStart: '2026-10-01', closingDate: '2026-10-31', paymentDueDate: '2026-11-20', billed: amountDue, paid: 0, amountDue, status: 'PENDING' }));
  expect(summarizeClosedStatements(cycles, '2026-11-12').amountDue).toBe(0.3003);
});
