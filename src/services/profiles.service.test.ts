/**
 * Tests of the profiles service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue([]), post: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => vi.clearAllMocks());
import { profilesService } from '@/services/profiles.service';

describe('profilesService', () => {
  it('calls GET for getMine', async () => {
    await profilesService.getMine();
    expect(apiClient.get).toHaveBeenCalledWith('/profiles/me', { signal: undefined });
  });
  it('calls GET for listExchangeRates', async () => {
    await profilesService.listExchangeRates();
    expect(apiClient.get).toHaveBeenCalledWith('/exchange-rates', { signal: undefined });
  });
  it('calls POST for registerExchangeRate', async () => {
    await profilesService.registerExchangeRate({ penPerUsd: 3.75, effectiveDate: '2026-06-01' });
    expect(apiClient.post).toHaveBeenCalledWith('/exchange-rates', { penPerUsd: 3.75, effectiveDate: '2026-06-01' });
  });
});

it('sends names, nullable birth date and threshold in the profile PUT', async () => {
  const input = { firstName: 'Ana María', lastName: 'Torres Pérez', preferredCurrency: 'PEN', monthlyIncome: 100, lifeCushion: 10, birthDate: null, debtLoadThreshold: 12.5 } as const;
  await profilesService.updateMine(input);
  expect(apiClient.put).toHaveBeenCalledWith('/profiles/me', input);
});
