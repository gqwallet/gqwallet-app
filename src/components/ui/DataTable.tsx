/**
 * Generic table that scrolls horizontally on small screens.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Column definition of a {@link DataTable}. */
export interface DataColumn<TRow> {
  /** Stable key. */
  key: string;
  /** Header text. */
  header: string;
  /** Expanded accessible name when the visible header uses a compact annotation. */
  ariaLabel?: string;
  /** Cell renderer. */
  render: (row: TRow) => ReactNode;
  /** Right-aligns numbers. */
  isNumeric?: boolean;
}

/** Props of {@link DataTable}. */
export interface DataTableProps<TRow> {
  /** Accessible caption. */
  caption: string;
  /** Columns in display order. */
  columns: DataColumn<TRow>[];
  /** Rows. */
  rows: TRow[];
  /** Key of each row. */
  rowKey: (row: TRow) => string;
  /** Optional footer row (totals). */
  footer?: TRow;
  /** Keeps a minimum width and scrolls horizontally on small screens; for tables with many columns. */
  isWide?: boolean;
  /** Shows the reference hint beneath a horizontally scrollable table. */
  showScrollHint?: boolean;
  /** Makes rows actionable; Enter and Space also trigger it. */
  onRowClick?: (row: TRow) => void;
  /** Extra classes for a row, e.g. projections. */
  rowClassName?: (row: TRow) => string | undefined;
}

/**
 * Renders a semantic table with a hidden caption and controlled horizontal scroll.
 *
 * @example
 * ```tsx
 * <DataTable caption="Presupuesto" columns={columns} rows={lines} rowKey={(line) => line.categoryId} />
 * ```
 */
export function DataTable<TRow>({ caption, columns, rows, rowKey, footer, isWide = false, onRowClick, rowClassName, showScrollHint = false }: DataTableProps<TRow>) {
  return (
    <>
    <div role="region" aria-label={caption} tabIndex={0} className="max-w-full overflow-x-auto rounded-md border border-line-subtle focus-visible:outline-2 focus-visible:outline-primary">
      <table className={cn('w-full border-collapse text-body', isWide && 'min-w-[640px]')}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="h-11 border-b border-line-subtle">
            {columns.map((column) => (
              <th key={column.key} scope="col" aria-label={column.ariaLabel} className={cn('px-4 py-3 text-label whitespace-nowrap text-content-secondary', column.isNumeric ? 'min-w-32 text-right' : 'min-w-52 text-left')}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn('border-b border-line-subtle', onRowClick && 'cursor-pointer hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary', rowClassName?.(row))}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (event) => (event.key === 'Enter' || event.key === ' ') && onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3 align-middle', column.isNumeric ? 'min-w-32 text-right whitespace-nowrap' : 'min-w-52 [overflow-wrap:anywhere]')}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="text-subtitle">
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3', column.isNumeric ? 'min-w-32 text-right whitespace-nowrap' : 'min-w-52 [overflow-wrap:anywhere]')}>
                  {column.render(footer)}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
    {showScrollHint && <p className="mt-4 text-caption text-content-muted">Desliza la tabla para ver todas las columnas.</p>}
    </>
  );
}
