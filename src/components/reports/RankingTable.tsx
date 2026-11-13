/**
 * Top-ten table of a report (categories or merchants).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, DataTable, ProgressBar } from '@/components/ui';
import type { ReportSlice } from '@/types/transaction';
import { formatAmount, formatPercent } from '@/utils/format';

/** Props of {@link RankingTable}. */
export interface RankingTableProps {
  /** Card title. */
  title: string;
  /** Header of the first column. */
  labelHeader: string;
  /** Header of the amount column. */
  amountHeader: string;
  /** Slices, ordered by amount. */
  slices: ReportSlice[];
}

/**
 * Renders up to ten rows with amount and share.
 *
 * @example
 * ```tsx
 * <RankingTable title={title} labelHeader={labelHeader} amountHeader={amountHeader} slices={report.topCategories} />
 * ```
 */
export function RankingTable({ title, labelHeader, amountHeader, slices }: RankingTableProps) {
  return (
    <Card title={title}>
      {slices.length === 0 ? (
        <p className="text-body text-content-secondary">Sin datos en este periodo.</p>
      ) : (
        <DataTable
          layout="ranking"
          showScrollHint
          caption={title}
          rows={slices.slice(0, 10)}
          rowKey={(slice) => slice.label}
          columns={[
            { key: 'label', header: labelHeader, render: (slice) => slice.label },
            { key: 'amount', header: amountHeader, isNumeric: true, render: (slice) => formatAmount(slice.amount) },
            { key: 'share', header: 'Participación', isNumeric: true, render: (slice) => <span className="flex items-center justify-end gap-3"><ProgressBar size="compact" label={`Participación de ${slice.label}`} value={slice.share} />{formatPercent(slice.share)}</span> },
          ]}
        />
      )}
    </Card>
  );
}
