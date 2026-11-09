/**
 * Top-ten table of a report (categories or merchants).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, DataTable } from '@/components/ui';
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
          caption={title}
          rows={slices.slice(0, 10)}
          rowKey={(slice) => slice.label}
          columns={[
            { key: 'label', header: labelHeader, render: (slice) => slice.label },
            { key: 'amount', header: amountHeader, isNumeric: true, render: (slice) => formatAmount(slice.amount) },
            { key: 'share', header: 'Participación', isNumeric: true, render: (slice) => formatPercent(slice.share) },
          ]}
        />
      )}
    </Card>
  );
}
