/**
 * Data-driven donut and compact usage-ring primitive.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { CHART_COLORS, type ChartSegment } from '@/components/ui/chartTokens';

/** Props accepted by {@link DonutChart}. */
export interface DonutChartProps {
  /** Accessible description of the chart. */
  label: string;
  /** Values supplied by the caller; no financial totals are derived. */
  segments: ChartSegment[];
  /** Optional centered usage label. */
  centerLabel?: string;
  /** Renders the compact 72 px usage ring instead of the 132 px report donut. */
  isCompact?: boolean;
  /** Within the compact variant, uses the 64 px ring with a tighter centered label, for rings beside other content. */
  isEmbedded?: boolean;
}

/**
 * Renders proportional segments with an empty neutral track when all values are zero.
 * @example
 * ```tsx
 * <DonutChart label="Uso" segments={segments} centerLabel="50 %" isCompact />
 * ```
 */
export function DonutChart({ label, segments, centerLabel, isCompact = false, isEmbedded = false }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  const graph = (size: number) => {
    const radius = isCompact ? 50 - 400 / size : 41;
    const strokeWidth = isCompact ? 800 / size : 18;
    const circumference = 2 * Math.PI * radius;
    return <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r={radius} fill="none" className="stroke-surface-high" strokeWidth={strokeWidth} />
      {segments.map((segment, index) => {
        const length = total > 0 ? Math.max(0, segment.value) / total * circumference : 0;
        const start = total > 0 ? segments.slice(0, index).reduce((sum, item) => sum + Math.max(0, item.value), 0) / total * circumference : 0;
        return length > 0 ? <circle key={index} cx="50" cy="50" r={radius} fill="none" stroke={CHART_COLORS[segment.color]} strokeWidth={strokeWidth} strokeDasharray={`${Math.max(0, length - (isCompact ? 0 : 0.7))} ${circumference}`} strokeDashoffset={-start} /> : null;
      })}
    </svg>;
  };
  return (
    <figure role="img" aria-label={label} className={cn('relative shrink-0', isCompact ? isEmbedded ? 'size-16' : 'size-chart-ring' : 'mx-auto size-chart-donut')}>
      {graph(isCompact && isEmbedded ? 64 : 72)}
      {centerLabel && <span className={cn('absolute inset-0 flex items-center justify-center whitespace-nowrap tabular-nums', isEmbedded ? 'text-overline tracking-normal' : 'text-label')}>{centerLabel}</span>}
    </figure>
  );
}
