/**
 * Grouped cash-flow bars and the actual/projected account-balance line.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, CHART_COLORS } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { CashFlowRow } from '@/types/overview';
import { formatMoney, MONTHS_LONG } from '@/utils/format';

/** Props accepted by {@link CashFlowChart}. */
export interface CashFlowChartProps {
  /** Twelve authoritative monthly cash-flow rows. */
  rows: CashFlowRow[];
  /** Currency of every value. */
  currency: Currency;
  /** Selected year. */
  year: string;
}

/** Renders cash movements and balances without altering the monthly matrix. */
export function CashFlowChart({ rows, currency, year }: CashFlowChartProps) {
  const max = Math.max(1, ...rows.flatMap(row => [row.incomes, row.outflows]));
  const balances = rows.map(row => row.accumulated);
  const low = Math.min(...balances);
  const range = Math.max(1, Math.max(...balances) - low);
  const points = rows.map((row, index) => ({ x: 40 + index * 84, y: 108 - (row.accumulated - low) / range * 96 }));
  return <Card className="mb-4 lg:mb-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-title">Ingresos y salidas por mes<span className="hidden lg:inline"> · {currency} {year}</span></h2>
      <div className="flex flex-wrap gap-4 text-caption text-content-secondary">
        {([['positive', 'Ingresos'], ['1', 'Salidas efectivas'], ['projection', 'Proyección*']] as const).map(([color, label]) => <span key={color} className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[color] }} />{label}</span>)}
      </div>
    </div>
    <div className="overflow-x-auto">
      <figure aria-label="Ingresos y salidas por mes" className="min-w-0">
        <div className="relative flex h-chart-bars items-end pt-1.5 lg:h-chart-height">
          <svg aria-hidden="true" className="absolute inset-0 size-full">{[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" x2="100%" y1={`${y}%`} y2={`${y}%`} className="stroke-chart-grid" />)}</svg>
          {/* Runtime bar heights preserve the server figures; all fixed dimensions and paints use tokens. */}
          {rows.map(row => <div key={row.month} className="relative flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 lg:gap-1.5" title={`${row.month}: ingresos ${formatMoney(row.incomes, currency)}, salidas ${formatMoney(row.outflows, currency)}`}>
            <span className="w-chart-bar rounded-t-xs bg-chart-positive lg:w-4.5" style={{ height: `${Math.max(0, row.incomes / max * 100)}%` }} />
            <span className={row.projection ? 'w-chart-bar rounded-t-xs bg-chart-1 opacity-35 lg:w-4.5' : 'w-chart-bar rounded-t-xs bg-chart-1 lg:w-4.5'} style={{ height: `${Math.max(0, row.outflows / max * 100)}%` }} />
          </div>)}
        </div>
        <figcaption className="mt-2 flex">{rows.map(row => <span key={row.month} className="min-w-0 flex-1 text-center text-caption text-content-muted"><span className="lg:hidden">{MONTHS_LONG[Number(row.month.slice(5, 7)) - 1].slice(0, 1)}</span><span className="hidden lg:inline">{MONTHS_LONG[Number(row.month.slice(5, 7)) - 1].slice(0, 3)}</span>{row.projection ? '*' : ''}</span>)}</figcaption>
      </figure>
      <figure aria-label="Saldo en cuentas al cierre de cada mes" className="mt-4 min-w-0">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-subtitle">Saldo en cuentas al cierre de cada mes</h3><span className="hidden text-caption text-content-secondary lg:inline">Real · Proyección*</span></div>
        <svg viewBox="0 0 1004 120" preserveAspectRatio="none" className="h-chart-line-mobile w-full overflow-visible lg:h-chart-line" role="img" aria-label="Saldo real y proyectado">
          {[0, 40, 80, 120].map(y => <line key={y} x1="0" x2="1004" y1={y} y2={y} className="stroke-chart-grid" />)}
          {points.slice(1).map((point, index) => <line key={index} x1={points[index].x} y1={points[index].y} x2={point.x} y2={point.y} className="stroke-primary" strokeWidth="2" strokeDasharray={rows[index + 1].projection ? '5 4' : undefined} />)}
          {points.map((point, index) => !rows[index].projection && <circle key={index} cx={point.x} cy={point.y} r="2.5" className="fill-surface-card stroke-primary" strokeWidth="2"><title>{formatMoney(rows[index].accumulated, currency)}</title></circle>)}
        </svg>
      </figure>
      <p className="mt-4 text-caption text-content-muted lg:hidden">Línea punteada: proyección*.</p>
    </div>
  </Card>;
}
