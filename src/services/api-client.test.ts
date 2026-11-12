/**
 * Tests of the HTTP gateway.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const request = vi.fn();
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, create: () => ({ request }) } };
});

const { apiClient } = await import('@/services/api-client');

beforeEach(() => { request.mockReset(); });

describe('apiClient', () => {
  it('drops empty query parameters and returns the body', async () => {
    request.mockResolvedValue({ data: { ok: true } });
    await expect(apiClient.get('/x', { params: { a: 1, b: undefined, c: '' } })).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/x', params: { a: 1 } }));
  });
  it('asks for text when exporting CSV', async () => {
    request.mockResolvedValue({ data: 'a,b' });
    await apiClient.get('/x', { accept: 'text/csv' });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ responseType: 'text', headers: { Accept: 'text/csv' } }));
  });
});

describe('ApiError', () => {
  it('keeps the status and uses the problem detail as message', async () => {
    const { ApiError } = await import('@/types/api');
    const error = new ApiError(409, { status: 409, detail: 'duplicated' });
    expect(error.status).toBe(409);
    expect(error.message).toBe('duplicated');
  });
});

describe('CSV response metadata', () => {
  it('returns decoded server filenames and preserves the CSV text', async () => {
    request.mockResolvedValue({ data: 'id,description\n1,Ahorro', headers: { 'content-disposition': "attachment; filename*=UTF-8''movimientos%20Per%C3%BA.csv" } });
    await expect(apiClient.getCsv('/transactions')).resolves.toEqual({ content: 'id,description\n1,Ahorro', fileName: 'movimientos Perú.csv' });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ responseType: 'text', headers: { Accept: 'text/csv' } }));
  });

  it('returns null for a missing filename so callers can apply Rule B-11', async () => {
    request.mockResolvedValue({ data: 'id', headers: {} });
    await expect(apiClient.getCsv('/transactions')).resolves.toEqual({ content: 'id', fileName: null });
  });
});


describe('session rejection', () => {
  it('expires once for concurrent protected 401 responses without extra HTTP calls', async () => {
    const { sessionEvents } = await import('@/services/session-events');
    sessionEvents.begin();
    const expired = vi.fn();
    const unsubscribe = sessionEvents.subscribe(expired);
    request.mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    await Promise.allSettled([apiClient.get('/accounts'), apiClient.get('/cards')]);
    expect(expired).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledTimes(2);
    unsubscribe();
    sessionEvents.end();
  });

  it.each([0, 403, 500])('preserves the session for status %s', async (status) => {
    const { sessionEvents } = await import('@/services/session-events');
    sessionEvents.begin();
    const expired = vi.fn();
    const unsubscribe = sessionEvents.subscribe(expired);
    request.mockRejectedValue({ isAxiosError: true, response: { status } });
    await expect(apiClient.get('/accounts')).rejects.toMatchObject({ status });
    expect(expired).not.toHaveBeenCalled();
    unsubscribe();
    sessionEvents.end();
  });

  it('ignores login rejection and an old request rejected after a new session starts', async () => {
    const { sessionEvents } = await import('@/services/session-events');
    sessionEvents.begin();
    const expired = vi.fn();
    const unsubscribe = sessionEvents.subscribe(expired);
    request.mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } });
    await expect(apiClient.post('/authentication/sign-in')).rejects.toMatchObject({ status: 401 });
    let rejectOld!: (error: unknown) => void;
    request.mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject; }));
    const old = apiClient.get('/accounts');
    sessionEvents.begin();
    rejectOld({ isAxiosError: true, response: { status: 401 } });
    await expect(old).rejects.toMatchObject({ status: 401 });
    expect(expired).not.toHaveBeenCalled();
    unsubscribe();
    sessionEvents.end();
  });
});
