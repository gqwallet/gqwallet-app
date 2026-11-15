/**
 * Tests of the appearance preference helpers.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { afterEach, expect, it } from 'vitest';
import { applyTheme, readThemePreference, resolveTheme, storeThemePreference, THEME_STORAGE_KEY } from '@/utils/theme';

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

it('defaults to light and keeps only known preferences', () => {
  expect(readThemePreference()).toBe('light');
  localStorage.setItem(THEME_STORAGE_KEY, 'neon');
  expect(readThemePreference()).toBe('light');
  storeThemePreference('dark');
  expect(readThemePreference()).toBe('dark');
  storeThemePreference('system');
  expect(readThemePreference()).toBe('system');
});

it('resolves the system preference and paints the root', () => {
  expect(resolveTheme('light', true)).toBe('light');
  expect(resolveTheme('dark', false)).toBe('dark');
  expect(resolveTheme('system', true)).toBe('dark');
  expect(resolveTheme('system', false)).toBe('light');
  applyTheme('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
});
