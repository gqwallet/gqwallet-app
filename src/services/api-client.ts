/**
 * Single HTTP gateway to the backend. Wraps axios, sends the session cookie and turns every
 * failure into a typed {@link ApiError}.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { sessionEvents } from '@/services/session-events';
import axios, { type AxiosRequestConfig, type AxiosResponse, isAxiosError } from 'axios';
import { ApiError, type CsvFile, type ProblemDetail } from '@/types/api';
import { API_PREFIX, API_URL } from '@/services/config';
import { fileNameFromDisposition } from '@/utils/download';

const http = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  // The JWT travels in an httpOnly cookie; the browser only sends it cross-origin with credentials.
  withCredentials: true,
});

/** Query string values accepted by the client; `undefined` and empty strings are dropped. */
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Options accepted by every client method. */
export interface RequestOptions {
  /** Query string parameters. */
  params?: QueryParams;
  /** Signal used to cancel the request. */
  signal?: AbortSignal;
  /** Value of the `Accept` header, e.g. `text/csv`. */
  accept?: string;
}

function cleanParams(params?: QueryParams): QueryParams | undefined {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    if (axios.isCancel(error)) return new ApiError(0, { status: 0, title: 'Cancelled' });
    const status = error.response?.status ?? 0;
    const data: unknown = error.response?.data;
    const problem = typeof data === 'object' && data !== null ? (data as ProblemDetail) : undefined;
    return new ApiError(status, problem);
  }
  return new ApiError(0);
}

async function send<TResponse>(config: AxiosRequestConfig, options: RequestOptions = {}): Promise<AxiosResponse<TResponse>> {
  const generation = sessionEvents.current();
  try {
    const response = await http.request<TResponse>({
      ...config,
      params: cleanParams(options.params),
      signal: options.signal,
      headers: options.accept ? { Accept: options.accept } : undefined,
      responseType: options.accept?.startsWith('text/') ? 'text' : 'json',
    });
    return response;
  } catch (error) {
    const failure = toApiError(error);
    if (failure.status === 401 && !config.url?.startsWith('/authentication/')) sessionEvents.expire(generation);
    throw failure;
  }
}

async function request<TResponse>(config: AxiosRequestConfig, options?: RequestOptions): Promise<TResponse> {
  return (await send<TResponse>(config, options)).data;
}

/** Typed HTTP verbs used by every service. */
export const apiClient = {
  /**
   * Downloads CSV text together with the server-provided filename.
   *
   * @param url - Path relative to `/api/v1`.
   * @param options - Query parameters and cancellation signal.
   * @returns CSV content and the decoded filename, or null when unavailable.
   * @throws {@link ApiError} When the response is not successful.
   */
  getCsv: async (url: string, options?: RequestOptions): Promise<CsvFile> => {
    const response = await send<string>({ method: 'GET', url }, { ...options, accept: 'text/csv' });
    const disposition: unknown = response.headers?.['content-disposition'];
    return { content: response.data, fileName: fileNameFromDisposition(typeof disposition === 'string' ? disposition : null) };
  },
  /**
   * Sends a GET request.
   *
   * @param url - Path relative to `/api/v1`.
   * @param options - Query, cancellation and accept header.
   * @returns The parsed response body.
   * @throws {@link ApiError} When the response is not successful.
   */
  get: <TResponse>(url: string, options?: RequestOptions) => request<TResponse>({ method: 'GET', url }, options),
  /**
   * Sends a POST request with a JSON body.
   *
   * @param url - Path relative to `/api/v1`.
   * @param body - Payload serialized as JSON.
   * @param options - Query and cancellation.
   * @returns The parsed response body.
   * @throws {@link ApiError} When the response is not successful.
   */
  post: <TResponse>(url: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>({ method: 'POST', url, data: body }, options),
  /**
   * Sends a PUT request with a JSON body.
   *
   * @param url - Path relative to `/api/v1`.
   * @param body - Payload serialized as JSON.
   * @param options - Query and cancellation.
   * @returns The parsed response body.
   * @throws {@link ApiError} When the response is not successful.
   */
  put: <TResponse>(url: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>({ method: 'PUT', url, data: body }, options),
  /**
   * Sends a DELETE request.
   *
   * @param url - Path relative to `/api/v1`.
   * @param options - Query and cancellation.
   * @returns The parsed response body, usually empty.
   * @throws {@link ApiError} When the response is not successful.
   */
  delete: <TResponse = void>(url: string, options?: RequestOptions) => request<TResponse>({ method: 'DELETE', url }, options),
};
