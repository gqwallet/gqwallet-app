/**
 * List of labeled share bars, used by the report breakdowns.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, ProgressBar, type ProgressTone } from '@/components/ui';
import type { ReportSlice } from '@/types/transaction';
import { formatPercent } from '@/utils/format';

/** Props of {@link ShareList}. */
export interface ShareListProps {
  /** Card title. */
  title: string;
  /** Slices. */
  slices: ReportSlice[];
  /** Turns a raw label into product language. */
  labelOf?: (label: string) => string;
  /** Tone of each slice. */
  toneOf?: (label: string) => ProgressTone;
  /** Footnote. */
  note?: string;
}

/**
 * Renders one bar per slice with its share of the total.
 *
 * @example
 * ```tsx
 * <ShareList title="Por medio de pago" slices={report.byPaymentMethod} />
 * ```
 */
export function ShareList({ title, slices, labelOf = (label) => label, toneOf = () => 'primary', note }: ShareListProps) {
  return (
    <Card title={title}>
      {slices.length === 0 ? (
        <p className="text-body text-content-secondary">Sin datos en este periodo.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {slices.map((slice, index) => (
            <div key={`${index}-${slice.label}`} className="flex flex-col gap-1">
              <div className="flex justify-between gap-2">
                <span className="text-subtitle">{labelOf(slice.label)}</span>
                <span className="text-caption text-content-secondary">{formatPercent(slice.share)}</span>
              </div>
              <ProgressBar value={slice.share} tone={toneOf(slice.label)} label={labelOf(slice.label)} />
            </div>
          ))}
        </div>
      )}
      {note && <p className="mt-3 text-caption text-content-muted">{note}</p>}
    </Card>
  );
}
