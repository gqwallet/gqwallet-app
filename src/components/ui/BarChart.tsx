/**
 * Vertical bar chart with an optional threshold line, drawn with plain elements.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';

/** Tone of a bar. */
export type BarTone = 'success' | 'danger' | 'primary';

const FILL: Record<BarTone, string> = { success: 'bg-secondary', danger: 'bg-danger', primary: 'bg-primary' };

/** One bar of {@link BarChart}. */
export interface BarDatum {
  /** Axis label. */
  label: string;
  /** Value, or `null` to show the empty text. */
  value: number | null;
  /** Text above the bar. */
  valueLabel?: string;
  /** Bar tone. */
  tone?: BarTone;
}

/** Props of {@link BarChart}. */
export interface BarChartProps {
  /** Accessible description. */
  label: string;
  /** Bars in order. */
  data: BarDatum[];
  /** Threshold drawn as a red line. */
  threshold?: number;
  /** Text shown for bars without value. */
  emptyText?: string;
  /** Unit caption above the plot, as used by monthly reports. */
  caption?: string;
}

/**
 * Renders the bars scaled to the largest value (or the threshold); it scrolls horizontally on small screens.
 *
 * @example
 * ```tsx
 * <BarChart label="Carga de deuda" data={months} threshold={7} emptyText="Sin ingresos" />
 * ```
 */
export function BarChart({ label, data, threshold, emptyText = '—', caption }: BarChartProps) {
  const max = Math.max(threshold ?? 0, ...data.map((datum) => datum.value ?? 0)) || 1;
  return (
    <figure aria-label={label} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      {caption && <figcaption className="mb-1.5 text-caption text-content-muted">{caption}</figcaption>}
      <div className="relative flex h-[150px] min-w-[560px] items-end gap-2.5">
        {threshold !== undefined && <div aria-hidden="true" className="absolute inset-x-0 h-px bg-danger" style={{ bottom: `${(threshold / max) * 126}px` }} />}
        {data.map((datum) => (
          <div key={datum.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            {datum.value === null ? (
              <span className="mb-1 border-b-2 border-line-subtle pb-1 text-caption whitespace-nowrap text-content-muted">{emptyText}</span>
            ) : (
              <>
                {datum.valueLabel && <span className="text-caption whitespace-nowrap text-content-secondary">{datum.valueLabel}</span>}
                <div className={cn('w-[calc(100%_-_12px)] rounded-t-sm', FILL[datum.tone ?? 'primary'])} style={{ height: `${Math.max(0, (datum.value / max) * 126)}px` }} />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex min-w-[560px] gap-2.5">{data.map(datum => <span key={datum.label} className="flex-1 text-center text-caption text-content-muted">{datum.label}</span>)}</div>
    </figure>
  );
}
