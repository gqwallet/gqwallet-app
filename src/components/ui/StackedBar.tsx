/**
 * Proportional stacked bar with optional categorical legend.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { CHART_COLORS, type ChartSegment } from '@/components/ui/chartTokens';

/** Props accepted by {@link StackedBar}. */
export interface StackedBarProps {
  /** Accessible description. */
  label: string;
  /** Segments in their visual order. */
  segments: ChartSegment[];
  /** Shows a wrapping legend below the bar. */
  showLegend?: boolean;
}

/**
 * Renders a stacked bar whose proportions follow the provided values.
 * @example
 * ```tsx
 * <StackedBar label="Distribution" segments={segments} showLegend />
 * ```
 */
export function StackedBar({ label, segments, showLegend = false }: StackedBarProps) {
  const total = segments.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return <figure aria-label={label}>
    <div role="img" aria-label={label} className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-high">
      {segments.filter(item => item.value > 0).map((item, index) => <span key={index} title={item.label} style={{ flex: item.value / (total || 1), backgroundColor: CHART_COLORS[item.color] }} />)}
    </div>
    {showLegend && <figcaption className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
      {segments.map((item, index) => <span key={index} className="inline-flex items-center gap-1.5 text-caption text-content-secondary"><span className="size-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[item.color] }} />{item.label}</span>)}
    </figcaption>}
  </figure>;
}
