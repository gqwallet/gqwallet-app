/**
 * CSV exports of movements, fixed payments with dues, budgets and cash flow (FR-041, Rule B-11).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { budgetsService } from '@/services/budgets.service';
import { obligationsService } from '@/services/obligations.service';
import { overviewService } from '@/services/overview.service';
import { transactionsService } from '@/services/transactions.service';
import type { ApiError, CsvFile, CurrencyFilter } from '@/types/api';
import { parseCsvRecords } from '@/utils/csv';
import { downloadText, exportFileName } from '@/utils/download';

/** What can be exported. */
export type ExportEntity = 'MOVEMENTS' | 'FIXED_PAYMENTS' | 'BUDGETS' | 'CASH_FLOW';

/** One file of an export. */
export interface ExportFile {
  /** File name. */
  fileName: string;
  /** CSV content. */
  content: string;
  /** Data rows, without the header. */
  rows: number;
  /** Header columns. */
  columns: string[];
}

/** Result of {@link useExport}. */
export interface ExportState {
  /** Files of the current selection. */
  files: ExportFile[] | null;
  /** Whether the preview is loading. */
  isLoading: boolean;
  /** Preview error. */
  error: ApiError | null;
  /** Downloads the files; resolves whether it succeeded. */
  download: () => Promise<boolean>;
  /** Whether the download is running. */
  isDownloading: boolean;
}

function toFile(entity: string, from: string, to: string, file: CsvFile): ExportFile {
  const { content } = file;
  const records = parseCsvRecords(content);
  return { fileName: file.fileName ?? exportFileName(entity, from, to), content, rows: Math.max(0, records.length - 1), columns: records[0] ?? [] };
}

/**
 * Prepares the CSV files of a selection to preview their rows and download them.
 *
 * @param entity - What to export.
 * @param from - Start date (ISO date).
 * @param to - End date (ISO date).
 * @param currency - Currency or `BOTH`.
 * @returns Files, state and download action.
 * @example
 * ```ts
 * const { files, download } = useExport('MOVEMENTS', '2026-01-01', '2026-12-31', 'BOTH');
 * ```
 */
export function useExport(entity: ExportEntity, from: string, to: string, currency: CurrencyFilter): ExportState {
  const isValid = Boolean(from && to && from <= to);
  const { data, isLoading, error } = useResource(
    isValid
      ? async (signal) => {
          switch (entity) {
            case 'MOVEMENTS':
              return [toFile('movimientos', from, to, await transactionsService.exportCsv(from, to, currency, signal))];
            case 'FIXED_PAYMENTS': {
              const [payments, dues] = await Promise.all([obligationsService.exportFixedPaymentsCsv(from, to, currency, signal), obligationsService.exportDuesCsv(from, to, currency, signal)]);
              return [toFile('pagos_fijos', from, to, payments), toFile('vencimientos', from, to, dues)];
            }
            case 'BUDGETS':
              return [toFile('presupuestos', from, to, await budgetsService.exportCsv(from, to, currency, signal))];
            default:
              return [toFile('flujo_caja', from, to, await overviewService.exportCashFlowCsv(from, to, currency, signal))];
          }
        }
      : null,
    [entity, from, to, currency],
  );
  const { submit, isSubmitting } = useMutation(async (files: ExportFile[]) => {
    files.forEach((file) => downloadText(file.fileName, file.content));
    return true;
  });
  const download = useCallback(async () => (data ? (await submit(data)) === true : false), [submit, data]);
  return { files: data, isLoading, error, download, isDownloading: isSubmitting };
}
