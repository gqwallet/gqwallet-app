/**
 * Responsive cash-flow charts drawn exclusively from authoritative monthly rows.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId } from 'react';
import { Card } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { CashFlowRow } from '@/types/overview';
import { cn } from '@/utils/cn';
import { formatMoney, MONTHS_LONG, todayIso } from '@/utils/format';

/** Props accepted by {@link CashFlowChart}. */
export interface CashFlowChartProps {
  /** Authoritative monthly cash-flow rows, in month order. */
  rows: CashFlowRow[];
  /** Currency shared by every row. */
  currency: Currency;
  /** Selected year. */
  year: string;
}

function compactMoney(value: number, currency: Currency): string {
  const amount = Math.abs(value);
  const number = amount >= 1_000_000 ? `${Number((amount / 1_000_000).toFixed(1))}m` : amount >= 1_000 ? `${Number((amount / 1_000).toFixed(1))}k` : String(Number(amount.toFixed(2)));
  return `${value < 0 ? '−' : ''}${currency === 'PEN' ? 'S/' : 'US$'} ${number}`;
}

function monthLabel(row: CashFlowRow): string {
  return `${MONTHS_LONG[Number(row.month.slice(5, 7)) - 1].slice(0, 3)}${row.projection ? '*' : ''}`;
}

/** Renders mobile horizontal bars, desktop columns and the actual/projected balance line. */
export function CashFlowChart({ rows, currency, year }: CashFlowChartProps) {
  const gradientId = useId();
  const max = Math.max(1, ...rows.flatMap(row => [row.incomes, row.outflows]));
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const ceiling = Math.ceil(max / magnitude) * magnitude;
  const balances = rows.map(row => row.accumulated);
  const low = Math.min(0, ...balances);
  const high = Math.max(low + 1, 0, ...balances);
  const range = Math.max(1, high - low);
  const points = rows.map((row, index) => ({ x: (index + 0.5) / Math.max(1, rows.length) * 1000, y: 180 - (row.accumulated - low) / range * 160 }));
  const realPoints = points.filter((_, index) => !rows[index].projection);
  const area = realPoints.length > 1 ? `M ${realPoints[0].x} 180 L ${realPoints.map(point => `${point.x} ${point.y}`).join(' L ')} L ${realPoints.at(-1)!.x} 180 Z` : undefined;
  const currentIndex = rows.findIndex(row => row.month === todayIso().slice(0, 7));
  const current = rows[currentIndex];
  const currentPoint = points[currentIndex];

  return <Card className="mb-4 lg:mb-6">
    <h2 className="mb-4 text-title">Ingresos y salidas por mes<span className="hidden lg:inline"> · {currency} {year}</span></h2>
    <div className="mb-4 flex flex-wrap gap-2 text-caption text-content-secondary">
      {([['bg-chart-positive', 'Ingresos'], ['bg-chart-1', 'Salidas efectivas'], ['bg-chart-projection', 'Salidas proyectadas*']] as const).map(([color, label]) => <span key={label} className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"><span className={cn('size-2.5 rounded-sm', color)} />{label}</span>)}
    </div>
    <figure aria-label="Ingresos y salidas por mes">
      <div className="flex flex-col gap-1 lg:hidden">
        {rows.map((row, index) => <div key={row.month} data-cash-month={row.month} className={cn('grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2 rounded-md py-2', index === currentIndex && 'bg-accent-container')}>
          <span className={cn('text-body-s', row.projection && 'text-content-muted')}>{monthLabel(row)}</span>
          <div className="flex min-w-0 flex-col gap-1.5">
            {(!row.projection || row.incomes !== 0) && <div className="flex items-center gap-1.5" title={`Ingresos: ${formatMoney(row.incomes, currency)}`}>
              <span data-cash-income className={cn('h-2.5 shrink-0 rounded-full bg-chart-positive', row.projection && 'opacity-35')} style={{ width: `${Math.max(0, row.incomes / max * 72)}%` }} />
              <span className="shrink-0 text-caption text-content-secondary">{compactMoney(row.incomes, currency)}</span>
            </div>}
            <div className="flex items-center gap-1.5" title={`Salidas${row.projection ? ' proyectadas' : ''}: ${formatMoney(row.outflows, currency)}`}>
              <span data-cash-outflow className={cn('h-2.5 shrink-0 rounded-full', row.projection ? 'bg-chart-projection' : 'bg-chart-1')} style={{ width: `${Math.max(0, row.outflows / max * 72)}%` }} />
              <span className={cn('shrink-0 text-caption', row.projection ? 'text-content-muted' : 'text-content-secondary')}>{compactMoney(row.outflows, currency)}{row.projection ? '*' : ''}</span>
            </div>
          </div>
        </div>)}
      </div>
      <div className="hidden lg:block">
        <div className="grid grid-cols-[56px_minmax(0,1fr)] pt-5">
          <div className="relative h-[220px] text-caption text-content-muted">{[0, 1, 2, 3, 4].map(tick => <span key={tick} className="absolute left-0 -translate-y-1/2" style={{ top: `${tick * 25}%` }}>{compactMoney(ceiling * (1 - tick / 4), currency)}</span>)}</div>
          <div className="relative flex h-[220px] items-end">
            <svg aria-hidden="true" className="absolute inset-0 size-full">{[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" x2="100%" y1={`${y}%`} y2={`${y}%`} className="stroke-chart-grid" />)}</svg>
            {rows.map((row, index) => <div key={row.month} data-cash-month={row.month} className={cn('relative flex h-full min-w-0 flex-1 items-end justify-center gap-1.5 rounded-t-md', index === currentIndex && 'bg-accent-container')} title={`${monthLabel(row)}: ingresos ${formatMoney(row.incomes, currency)}, salidas ${formatMoney(row.outflows, currency)}`}>
              <span data-cash-income className={cn('w-5 rounded-t-sm bg-chart-positive', row.projection && 'opacity-35')} style={{ height: `${Math.max(0, row.incomes / ceiling * 100)}%` }} />
              <span data-cash-outflow className={cn('w-5 rounded-t-sm', row.projection ? 'bg-chart-projection' : 'bg-chart-1')} style={{ height: `${Math.max(0, row.outflows / ceiling * 100)}%` }} />
            </div>)}
            {current && <div data-current-cash-bubble className="pointer-events-none absolute top-2 max-w-[220px] rounded-md bg-surface-inverse px-2.5 py-2 text-caption text-white" style={{ left: `clamp(0px, ${(currentIndex + 1) / rows.length * 100}%, calc(100% - 220px))` }}><p>{monthLabel(current)} · Ingresos {formatMoney(current.incomes, currency)}</p><p>{monthLabel(current)} · Salidas {formatMoney(current.outflows, currency)}</p></div>}
          </div>
        </div>
        <div className="mt-2 ml-14 flex">{rows.map(row => <span key={row.month} className={cn('min-w-0 flex-1 text-center text-caption', row.projection ? 'text-content-muted' : 'text-content-primary')}>{monthLabel(row)}</span>)}</div>
      </div>
    </figure>
    <figure aria-label="Saldo en cuentas al cierre de cada mes" className="mt-6">
      <h3 className="mb-3 text-subtitle">Saldo en cuentas al cierre de cada mes</h3>
      <div className="mb-6 flex gap-2 text-caption text-content-secondary">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"><span className="w-4 border-t-2 border-primary" />Saldo real</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"><span className="w-4 border-t-2 border-dashed border-primary" />Proyección*</span>
      </div>
      <div className="grid grid-cols-[48px_minmax(0,1fr)] lg:grid-cols-[56px_minmax(0,1fr)]">
        <div className="relative h-[140px] text-[10px] text-content-muted lg:h-[190px] lg:text-caption">{[0, 1, 2, 3, 4].map(tick => <span key={tick} className="absolute left-0 -translate-y-1/2" style={{ top: `${10 + tick * 20}%` }}>{compactMoney(high - range * tick / 4, currency)}</span>)}</div>
        <div className="relative h-[140px] lg:h-[190px]">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="size-full overflow-visible" role="img" aria-label="Saldo real y proyectado">
            <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" className="[stop-color:var(--color-primary)] [stop-opacity:0.2]" /><stop offset="100%" className="[stop-color:var(--color-primary)] [stop-opacity:0.02]" /></linearGradient></defs>
            {[20, 60, 100, 140, 180].map(y => <line key={y} x1="0" x2="1000" y1={y} y2={y} className="stroke-chart-grid" vectorEffect="non-scaling-stroke" />)}
            {area && <path data-real-area d={area} fill={`url(#${gradientId})`} />}
            {points.slice(1).map((point, index) => <line key={rows[index + 1].month} x1={points[index].x} y1={points[index].y} x2={point.x} y2={point.y} className="stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray={rows[index + 1].projection ? '5 4' : undefined} />)}
            {points.map((point, index) => !rows[index].projection && <ellipse key={rows[index].month} cx={point.x} cy={point.y} rx="2.5" ry="2.5" className="fill-surface-card stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke"><title>{monthLabel(rows[index])}: {formatMoney(rows[index].accumulated, currency)}</title></ellipse>)}
          </svg>
          {current && currentPoint && <span data-current-balance-bubble className="pointer-events-none absolute max-w-full -translate-y-full rounded-full bg-surface-inverse px-2.5 py-1 text-center text-[10px] break-words text-white lg:text-caption" style={{ left: currentIndex < 3 ? 0 : currentIndex >= rows.length - 3 ? undefined : `${currentPoint.x / 10}%`, right: currentIndex >= rows.length - 3 ? 0 : undefined, transform: currentIndex >= 3 && currentIndex < rows.length - 3 ? 'translateX(-50%)' : undefined, top: `calc(${currentPoint.y / 2}% - 8px)` }}>{monthLabel(current)} · {formatMoney(current.accumulated, currency)}</span>}
        </div>
      </div>
      <figcaption className="ml-12 flex lg:ml-14">{rows.map(row => <span key={row.month} className="min-w-0 flex-1 text-center text-[8px] text-content-muted lg:text-caption">{monthLabel(row)}</span>)}</figcaption>
    </figure>
    <p className="mt-5 text-caption text-content-muted">*Proyección: estimado según tus pagos fijos activos; no confirma movimientos.</p>
  </Card>;
}
