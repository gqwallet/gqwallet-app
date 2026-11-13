/**
 * Compact ring and explanatory text for percentage-based summaries.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { DonutChart } from '@/components/ui/DonutChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatPercent } from '@/utils/format';

/** Props accepted by {@link UsageSummary}. */
export interface UsageSummaryProps {
  /** Heading beside the ring. */
  title: string;
  /** Server-calculated percentage; null indicates no defined limit. */
  usage: number | null;
  /** Main explanatory line, already formatted. */
  detail: string;
  /** Secondary explanatory line. */
  note: string;
  /** Adds the horizontal dashboard bar below the heading. */
  showBar?: boolean;
}

/**
 * Renders a percentage ring with its text and optional progress bar.
 * @example
 * ```tsx
 * <UsageSummary title="Usage" usage={50} detail="50 of 100" note="This month" />
 * ```
 */
export function UsageSummary({ title, usage, detail, note, showBar = false }: UsageSummaryProps) {
  const value = usage ?? 0;
  const color = value > 100 ? 'negative' : value >= 75 ? '3' : 'positive';
  return <div className={showBar ? 'flex items-center gap-4' : 'flex items-center gap-4 lg:gap-5'}>
    <DonutChart label={title} isCompact isSmall isResponsive={!showBar} isEmbedded={showBar} centerLabel={usage === null ? '—' : formatPercent(value)} segments={[{ label: title, value: Math.min(100, Math.max(0, value)), color }, { label: 'Restante', value: Math.max(0, 100 - value), color: 'grid' }]} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-center justify-between gap-2"><span className={showBar ? 'min-w-0 flex-1 text-subtitle [overflow-wrap:anywhere]' : 'text-subtitle lg:text-title'}>{title}</span>{showBar && <span className="max-w-[75%] shrink-0 text-body-s text-content-secondary [overflow-wrap:anywhere]">{detail}</span>}</div>
      {showBar ? <ProgressBar value={value} tone={value > 100 ? 'danger' : value >= 75 ? 'warning' : 'success'} label={title} /> : <span className="text-body-s text-content-secondary lg:text-body">{detail}</span>}
      <span className={showBar ? 'mt-1 text-body-s text-content-muted' : 'text-body-s text-content-muted'}>{note}</span>
    </div>
  </div>;
}
