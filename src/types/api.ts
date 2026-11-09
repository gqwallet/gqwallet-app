/**
 * Transport-level types shared by every service: errors and pagination.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** RFC 7807 problem body the backend returns for every handled error. */
export interface ProblemDetail {
  /** HTTP status code. */
  status: number;
  /** Short, stable summary of the problem type. */
  title?: string;
  /** Human-readable explanation for this occurrence. */
  detail?: string;
}

/** Error thrown by the API client for every non-successful response or network failure. */
export class ApiError extends Error {
  /** HTTP status code, or `0` when the request never reached the server. */
  readonly status: number;
  /** Parsed problem body, when the server sent one. */
  readonly problem?: ProblemDetail;

  constructor(status: number, problem?: ProblemDetail) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

/** Supported currencies; every amount carries exactly one (FR-018). */
export type Currency = 'PEN' | 'USD';

/** Currency filter used by exports, where `BOTH` exports each currency separately (FR-041). */
export type CurrencyFilter = Currency | 'BOTH';

/** Generic page wrapper returned by paginated endpoints. */
export interface Page<TItem> {
  /** Items of the current page. */
  content: TItem[];
  /** Zero-based page index. */
  page: number;
  /** Requested page size. */
  size: number;
  /** Total number of matching items. */
  totalElements: number;
  /** Total number of pages. */
  totalPages: number;
}

/** CSV document produced by an export endpoint. */
export interface CsvFile {
  /** Server-provided file name; null when the header is missing or invalid. */
  fileName: string | null;
  /** File content as UTF-8 text. */
  content: string;
}
