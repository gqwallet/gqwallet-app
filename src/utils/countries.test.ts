/**
 * Tests the available country codes used by profile forms.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import { COUNTRY_OPTIONS } from '@/utils/countries';
it('defaults to Peru and exposes distinct ISO alpha two codes', () => {
  expect(COUNTRY_OPTIONS[0]).toEqual({ value: 'PE', label: 'Perú' });
  expect(new Set(COUNTRY_OPTIONS.map((option) => option.value)).size).toBe(COUNTRY_OPTIONS.length);
  for (const option of COUNTRY_OPTIONS) expect(option.value).toMatch(/^[A-Z]{2}$/);
});
