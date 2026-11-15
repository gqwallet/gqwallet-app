/**
 * Responsive cash-flow charts drawn exclusively from authoritative monthly rows.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useId, useState } from 'react';
import type { PointerEvent } from 'react';
import { Card } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { CashFlowRow } from '@/types/overview';
import { cn } from '@/utils/cn';
import { niceTicks } from '@/utils/chartTicks';
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
  const columnTicks = niceTicks(rows.flatMap(row => [row.incomes, row.outflows]));
  const ceiling = columnTicks.at(-1)!;
  const balances = rows.map(row => row.accumulated);
  const balanceTicks = niceTicks(balances);
  const low = balanceTicks[0];
  const high = balanceTicks.at(-1)!;
  const range = high - low;
  const points = rows.map((row, index) => ({ x: (index + 0.5) / Math.max(1, rows.length) * 1000, y: 180 - (row.accumulated - low) / range * 160 }));
  const realPoints = points.filter((_, index) => !rows[index].projection);
  const area = realPoints.length > 1 ? `M ${realPoints[0].x} 180 L ${realPoints.map(point => `${point.x} ${point.y}`).join(' L ')} L ${realPoints.at(-1)!.x} 180 Z` : undefined;
  const currentIndex = rows.findIndex(row => row.month === todayIso().slice(0, 7));
  const lastRealIndex = rows.findLastIndex(row => !row.projection);
  const defaultIndex = currentIndex >= 0 ? currentIndex : Math.max(0, lastRealIndex);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [columnMonth, setColumnMonth] = useState<string | null>(null);
  const selectedIndex = Math.max(0, selectedMonth === null ? defaultIndex : rows.findIndex(row => row.month === selectedMonth));
  const selected = rows[selectedIndex];
  const selectedPoint = points[selectedIndex];
  const columnIndex = columnMonth === null ? defaultIndex : rows.findIndex(row => row.month === columnMonth);
  const column = rows[columnIndex];
  const selectionText = selected ? `${MONTHS_LONG[Number(selected.month.slice(5, 7)) - 1]} · ${formatMoney(selected.accumulated, currency)}${selected.projection ? ' · proyección*' : ''}` : '';

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!rows.length || bounds.width === 0) return;
    const index = Math.max(0, Math.min(rows.length - 1, Math.floor((event.clientX - bounds.left) / bounds.width * rows.length)));
    setSelectedMonth(rows[index].month);
  };

  return <Card className="mb-4 lg:mb-6">
    <h2 className="mb-4 text-title">Ingresos y salidas por mes<span className="hidden lg:inline"> · {currency} {year}</span></h2>
    <div className="mb-4 flex flex-wrap gap-2 text-caption text-content-secondary">
      {([['bg-chart-positive', 'Ingresos'], ['bg-chart-1', 'Salidas efectivas'], ['bg-chart-projection', 'Salidas proyectadas*']] as const).map(([color, label]) => <span key={label} className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"><span className={cn('size-2.5 rounded-[3px]', color)} />{label}</span>)}
    </div>
    <figure aria-label="Ingresos y salidas por mes">
      <div className="flex flex-col gap-1 lg:hidden">
        {rows.map((row, index) => <div key={row.month} data-cash-month={row.month} className={cn('grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2 rounded-md px-3 py-2', index === currentIndex && 'bg-accent-container')}>
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
          <div className="relative h-[220px] text-caption text-content-muted">{columnTicks.map(tick => <span key={tick} className="absolute left-0 -translate-y-1/2" style={{ top: `${(1 - tick / ceiling) * 100}%` }}>{compactMoney(tick, currency)}</span>)}</div>
          <div className="relative flex h-[220px] items-end">
            <svg aria-hidden="true" className="absolute inset-0 size-full">{columnTicks.map(tick => <line key={tick} x1="0" x2="100%" y1={`${(1 - tick / ceiling) * 100}%`} y2={`${(1 - tick / ceiling) * 100}%`} className="stroke-chart-grid" />)}</svg>
            {rows.map((row, index) => <div key={row.month} data-cash-month={row.month} tabIndex={0} role="img" aria-label={`${MONTHS_LONG[Number(row.month.slice(5, 7)) - 1]}: ingresos ${formatMoney(row.incomes, currency)}, salidas ${formatMoney(row.outflows, currency)}${row.projection ? ' · proyección*' : ''}`} onPointerEnter={() => setColumnMonth(row.month)} onFocus={() => setColumnMonth(row.month)} className={cn('relative flex h-full min-w-0 flex-1 items-end justify-center gap-1.5 rounded-t-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2', index === currentIndex && 'bg-accent-container')}>
              <span data-cash-income className={cn('w-5 rounded-t-sm bg-chart-positive', row.projection && 'opacity-35')} style={{ height: `${Math.max(0, row.incomes / ceiling * 100)}%` }} />
              <span data-cash-outflow className={cn('w-5 rounded-t-sm', row.projection ? 'bg-chart-projection' : 'bg-chart-1')} style={{ height: `${Math.max(0, row.outflows / ceiling * 100)}%` }} />
            </div>)}
            {column && <div data-current-cash-bubble className="pointer-events-none absolute top-2 w-max max-w-full rounded-full bg-surface-inverse px-3 py-2 text-caption break-words text-white" style={{ left: `${(columnIndex + 0.5) / rows.length * 100}%`, transform: `translateX(-${(columnIndex + 0.5) / rows.length * 100}%)` }}><p>{monthLabel(column)} · Ingresos {formatMoney(column.incomes, currency)}</p><p>{monthLabel(column)} · Salidas {formatMoney(column.outflows, currency)}{column.projection ? ' · proyección*' : ''}</p></div>}
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
        <div className="relative h-[140px] text-caption text-content-muted lg:h-[190px]">{balanceTicks.map(tick => <span key={tick} className="absolute left-0 -translate-y-1/2" style={{ top: `${10 + (high - tick) / range * 80}%` }}>{compactMoney(tick, currency)}</span>)}</div>
        <div role="slider" tabIndex={rows.length ? 0 : -1} aria-label="Explorar saldo mensual" aria-valuemin={1} aria-valuemax={Math.max(1, rows.length)} aria-valuenow={selectedIndex + 1} aria-valuetext={selectionText} aria-orientation="horizontal" className="relative h-[140px] min-w-0 touch-pan-y rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:h-[190px]" onPointerDown={event => { scrub(event); event.currentTarget.setPointerCapture?.(event.pointerId); }} onPointerMove={scrub} onKeyDown={event => {
          if (!rows.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : Math.max(0, Math.min(rows.length - 1, selectedIndex + (event.key === 'ArrowRight' ? 1 : -1)));
          setSelectedMonth(rows[next].month);
        }}>
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="size-full overflow-visible" role="img" aria-label="Saldo real y proyectado">
            <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" className="[stop-color:var(--color-primary)] [stop-opacity:0.2]" /><stop offset="100%" className="[stop-color:var(--color-primary)] [stop-opacity:0.02]" /></linearGradient></defs>
            {balanceTicks.map(tick => <line key={tick} x1="0" x2="1000" y1={20 + (high - tick) / range * 160} y2={20 + (high - tick) / range * 160} className="stroke-chart-grid" vectorEffect="non-scaling-stroke" />)}
            {area && <path data-real-area d={area} fill={`url(#${gradientId})`} />}
            {points.slice(1).map((point, index) => <line key={rows[index + 1].month} x1={points[index].x} y1={points[index].y} x2={point.x} y2={point.y} className="stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray={rows[index + 1].projection ? '5 4' : undefined} />)}
            {points.map((point, index) => !rows[index].projection && <ellipse key={rows[index].month} cx={point.x} cy={point.y} rx="2.5" ry="2.5" className="fill-surface-card stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke"><title>{monthLabel(rows[index])}: {formatMoney(rows[index].accumulated, currency)}</title></ellipse>)}
            {selectedPoint && <line data-balance-guide x1={selectedPoint.x} x2={selectedPoint.x} y1="20" y2="180" className="stroke-primary" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
          </svg>
          {selectedPoint && <>
            <span data-selected-balance-point aria-hidden="true" className="pointer-events-none absolute size-3 -translate-1/2 rounded-full border-2 border-primary bg-surface-card" style={{ left: `${selectedPoint.x / 10}%`, top: `${selectedPoint.y / 2}%` }} />
            <span data-current-balance-bubble className="pointer-events-none absolute w-max max-w-full rounded-full bg-surface-inverse px-3 py-1.5 text-center text-body-s break-words text-white" style={{ left: `${selectedPoint.x / 10}%`, transform: `translateX(-${selectedPoint.x / 10}%)`, top: selectedPoint.y < 80 ? `calc(${selectedPoint.y / 2}% + 10px)` : undefined, bottom: selectedPoint.y >= 80 ? `calc(${100 - selectedPoint.y / 2}% + 10px)` : undefined }}>{selectionText}</span>
          </>}
        </div>
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{selectionText}</span>
      <figcaption className="ml-12 flex lg:ml-14">{rows.map((row, index) => <span key={row.month} className={cn('min-w-0 flex-1 text-center text-caption text-content-muted', rows.length > 6 && index % 2 === 1 && 'invisible lg:visible')}>{monthLabel(row)}</span>)}</figcaption>
    </figure>
    <p className="mt-5 text-caption text-content-muted">*Proyección: estimado según tus pagos fijos activos; no confirma movimientos.</p>
  </Card>;
}
