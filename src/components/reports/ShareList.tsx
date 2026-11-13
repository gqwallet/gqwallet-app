/**
 * List of labeled share bars, used by the report breakdowns.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { InformationButton } from '@/components/ui/InformationButton';
import { Card, DonutChart, ProgressBar, CHART_PALETTE, type ChartColor, type ProgressTone } from '@/components/ui';
import type { ReportSlice } from '@/types/transaction';
import { formatPercent } from '@/utils/format';

/** Props of {@link ShareList}. */
export interface ShareListProps {
  /** Card title. */
  title: string;
  /** Contextual explanation beside the title. */
  informationTopic?: string;
  /** Slices. */
  slices: ReportSlice[];
  /** Turns a raw label into product language. */
  labelOf?: (label: string) => string;
  /** Tone of each slice. */
  toneOf?: (label: string) => ProgressTone;
  /** Footnote. */
  note?: string;
  /** Adds the report donut using the same slices and colors as its legend. */
  showDonut?: boolean;
}

/**
 * Renders one bar per slice with its share of the total.
 *
 * @example
 * ```tsx
 * <ShareList title="Por medio de pago" slices={report.byPaymentMethod} />
 * ```
 */
export function ShareList({ title, slices, labelOf = (label) => label, toneOf = () => 'primary', note, informationTopic, showDonut = false }: ShareListProps) {
  const colors: ChartColor[] = slices.map((slice, index) => showDonut && ['True', 'False', 'UNKNOWN'].includes(slice.label) ? ({ True: 'positive', False: '3', UNKNOWN: 'neutral' } as const)[slice.label as 'True' | 'False' | 'UNKNOWN'] : CHART_PALETTE[index % CHART_PALETTE.length]);
  const tones: Partial<Record<ChartColor, ProgressTone>> = { '1': 'primary', '2': 'teal', '3': 'warning', '4': 'sky', '5': 'violet', '6': 'neutral', positive: 'success', neutral: 'neutral' };
  return (
    <Card title={title} action={informationTopic ? <InformationButton topic={informationTopic} /> : undefined}>
      {slices.length === 0 ? (
        <p className="text-body text-content-secondary">Sin datos en este periodo.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {showDonut && <DonutChart label={title} segments={slices.map((slice, index) => ({ label: labelOf(slice.label), value: slice.amount, color: colors[index] }))} />}
          {slices.map((slice, index) => (
            <div key={`${index}-${slice.label}`} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-2">
                <span className="text-subtitle">{labelOf(slice.label)}</span>
                <span className="text-caption text-content-secondary">{formatPercent(slice.share)}</span>
              </div>
              <ProgressBar value={slice.share} tone={showDonut ? tones[colors[index]] ?? 'primary' : toneOf(slice.label)} label={labelOf(slice.label)} />
            </div>
          ))}
        </div>
      )}
      {note && <p className="mt-3 text-caption text-content-muted">{note}</p>}
    </Card>
  );
}
