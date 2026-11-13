/**
 * Usage ring with heading, amounts, progress bar and breakdown for percentage-based summaries.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { DonutChart } from '@/components/ui/DonutChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatPercent } from '@/utils/format';

/** One labelled figure below the bar. */
export interface UsageBreakdownItem {
  /** Concept name, such as `Total gastado`. */
  label: string;
  /** Formatted value, already including its currency. */
  value: string;
}

/** Props accepted by {@link UsageSummary}. */
export interface UsageSummaryProps {
  /** Heading beside the ring. */
  title: string;
  /** Server-calculated percentage; null indicates no defined limit. */
  usage: number | null;
  /** Amounts line, already formatted. */
  detail: string;
  /** Secondary figures below the bar, one whole line each on mobile. */
  breakdown: readonly UsageBreakdownItem[];
}

/**
 * Renders a percentage ring beside its heading, amounts, progress bar and breakdown.
 * Heading and amounts stack on mobile and share one row from `lg`; the breakdown is a full-width
 * footer with one label/value row per item on mobile, sharing one row from `lg`.
 * @example
 * ```tsx
 * <UsageSummary title="Usage" usage={50} detail="50 of 100" breakdown={[{ label: 'Total', value: '120' }]} />
 * ```
 */
export function UsageSummary({ title, usage, detail, breakdown }: UsageSummaryProps) {
  const value = usage ?? 0;
  const color = value > 100 ? 'negative' : value >= 75 ? '3' : 'positive';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <DonutChart label={title} isCompact isEmbedded centerLabel={usage === null ? '—' : formatPercent(value)}
          segments={[{ label: title, value: Math.min(100, Math.max(0, value)), color }, { label: 'Restante', value: Math.max(0, 100 - value), color: 'grid' }]} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Stacked on mobile so the heading never competes with the amounts for width. */}
          <div className="flex flex-col gap-0.5 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
            <span className="text-subtitle">{title}</span>
            <span className="text-body-s text-content-secondary">{detail}</span>
          </div>
          <ProgressBar value={value} tone={value > 100 ? 'danger' : value >= 75 ? 'warning' : 'success'} label={title} className="mt-1" />
        </div>
      </div>
      {/* Full-width footer, one row per figure: line breaks fall between concepts, never inside one. */}
      <dl className="flex flex-col gap-1 border-t border-line-subtle pt-3 text-body-s lg:flex-row lg:gap-8">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-3 lg:justify-start lg:gap-2">
            <dt className="text-content-muted">{item.label}</dt>
            <dd className="text-right tabular-nums text-content-secondary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
