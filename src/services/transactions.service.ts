/**
 * Movement, category, transfer, merchant and report endpoints (FR-007, FR-019, FR-024 to FR-028, FR-040).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient, type QueryParams } from '@/services/api-client';
import type { Currency, CurrencyFilter } from '@/types/api';
import type {
  Category, ExpenseReport, IncomeReport, RegisterTransactionInput, RegisterTransferInput, Transaction,
  TransactionFilter, TransactionInput, TransactionNature, TransactionPage, Transfer,
} from '@/types/transaction';
import type { Page } from '@/types/api';
import type { LedgerEntry } from '@/types/ledger';

/** Report period: a year and, optionally, one month. */
export interface ReportPeriod {
  /** Year. */
  year: number;
  /** Month 1 to 12; whole year when omitted. */
  month?: number;
  /** Mandatory currency. */
  currency: Currency;
}

/** Movements, categories, transfers and reports of the signed-in user. */
export const transactionsService = {
  /**
   * Fetches a database paginated feed of movements and transfers.
   *
   * @param filter - Ledger filters and page index.
   * @param signal - Cancels the request.
   * @returns A unified page in stable server order.
   * @throws {@link ApiError} When the request fails.
   */
  listLedger: (filter: TransactionFilter, signal?: AbortSignal) => apiClient.get<Page<LedgerEntry>>('/ledger-entries', { params: { ...filter } as QueryParams, signal }),
  /**
   * Lists movements matching the filters, newest economic date first.
   *
   * @param filter - History filters and page.
   * @param signal - Cancels the request.
   * @returns A page of movements plus totals by nature and currency.
   * @throws {@link ApiError} When the request fails.
   */
  list: (filter: TransactionFilter, signal?: AbortSignal) =>
    apiClient.get<TransactionPage>('/transactions', { params: { ...filter } as QueryParams, signal }),
  /**
   * Fetches one movement.
   *
   * @param id - Movement identifier.
   * @param signal - Cancels the request.
   * @returns The movement.
   * @throws {@link ApiError} When the request fails.
   */
  get: (id: string, signal?: AbortSignal) => apiClient.get<Transaction>(`/transactions/${id}`, { signal }),
  /**
   * Registers an income or an expense.
   *
   * @param input - Movement data.
   * @returns The created movement.
   * @throws {@link ApiError} When the request fails.
   */
  register: (input: RegisterTransactionInput) => apiClient.post<Transaction>('/transactions', input),
  /**
   * Edits a movement, keeping its registration date.
   *
   * @param id - Movement identifier.
   * @param input - Editable fields.
   * @returns The updated movement.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, input: TransactionInput) => apiClient.put<Transaction>(`/transactions/${id}`, input),
  /**
   * Voids a movement with a reason, without deleting it.
   *
   * @param id - Movement identifier.
   * @param reason - Reason shown in the history.
   * @returns The voided movement.
   * @throws {@link ApiError} When the request fails.
   */
  voidTransaction: (id: string, reason: string) => apiClient.post<Transaction>(`/transactions/${id}/voids`, { reason }),
  /**
   * Exports movements as CSV.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param currency - Currency or `BOTH`.
   * @param signal - Cancels the request.
   * @returns CSV content and the server-provided filename.
   * @throws {@link ApiError} When the request fails.
   */
  exportCsv: (from: string, to: string, currency: CurrencyFilter, signal?: AbortSignal) =>
    apiClient.getCsv('/transactions', { params: { from, to, currency }, signal }),
  /**
   * Suggests merchants already used that start with a prefix (FR-024).
   *
   * @param prefix - Typed text.
   * @param signal - Cancels the request.
   * @returns Matching merchant names.
   * @throws {@link ApiError} When the request fails.
   */
  suggestMerchants: async (prefix: string, signal?: AbortSignal) =>
    (await apiClient.get<{ name: string }[]>('/merchant-suggestions', { params: { prefix }, signal })).map((item) => item.name),
  /**
   * Lists categories of one nature, active and deactivated.
   *
   * @param nature - Income or expense.
   * @param signal - Cancels the request.
   * @returns Categories.
   * @throws {@link ApiError} When the request fails.
   */
  listCategories: (nature: TransactionNature, signal?: AbortSignal) =>
    apiClient.get<Category[]>('/categories', { params: { nature }, signal }),
  /**
   * Creates a category with a unique name per nature.
   *
   * @param name - Category name.
   * @param nature - Income or expense.
   * @returns The created category.
   * @throws {@link ApiError} When the request fails.
   */
  createCategory: (name: string, nature: TransactionNature) => apiClient.post<Category>('/categories', { name, nature }),
  /**
   * Renames a category.
   *
   * @param id - Category identifier.
   * @param name - New name.
   * @returns The renamed category.
   * @throws {@link ApiError} When the request fails.
   */
  renameCategory: (id: string, name: string) => apiClient.put<Category>(`/categories/${id}`, { name }),
  /**
   * Deactivates a category, keeping its history.
   *
   * @param id - Category identifier.
   * @returns The deactivated category.
   * @throws {@link ApiError} When the request fails.
   */
  deactivateCategory: (id: string) => apiClient.post<Category>(`/categories/${id}/deactivations`),
  /**
   * Lists transfers.
   *
   * @param filter - Dates, currency and page.
   * @param signal - Cancels the request.
   * @returns A page of transfers.
   * @throws {@link ApiError} When the request fails.
   */
  listTransfers: (filter: { accountId?: string; from?: string; to?: string; currency?: Currency; page?: number; size?: number }, signal?: AbortSignal) =>
    apiClient.get<Page<Transfer>>('/transfers', { params: filter, signal }),
  /**
   * Registers a transfer between own accounts or a card payment.
   *
   * @param input - Transfer data.
   * @returns The created transfer.
   * @throws {@link ApiError} When the request fails.
   */
  registerTransfer: (input: RegisterTransferInput) => apiClient.post<Transfer>('/transfers', input),
  /**
   * Voids a transfer, reverting both sides.
   *
   * @param id - Transfer identifier.
   * @param reason - Reason.
   * @returns The voided transfer.
   * @throws {@link ApiError} When the request fails.
   */
  voidTransfer: (id: string, reason: string) => apiClient.post<Transfer>(`/transfers/${id}/voids`, { reason }),
  /**
   * Fetches the expense report of a period.
   *
   * @param period - Year, optional month and currency.
   * @param signal - Cancels the request.
   * @returns The report.
   * @throws {@link ApiError} When the request fails.
   */
  getExpenseReport: (period: ReportPeriod, signal?: AbortSignal) =>
    apiClient.get<ExpenseReport>('/expense-reports/me', { params: { ...period }, signal }),
  /**
   * Fetches the income report of a period.
   *
   * @param period - Year, optional month and currency.
   * @param signal - Cancels the request.
   * @returns The report.
   * @throws {@link ApiError} When the request fails.
   */
  getIncomeReport: (period: ReportPeriod, signal?: AbortSignal) =>
    apiClient.get<IncomeReport>('/income-reports/me', { params: { ...period }, signal }),
};
