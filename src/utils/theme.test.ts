/**
 * Tests of the appearance helpers.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { afterEach, expect, it } from 'vitest';
import { applyTheme, flagFromTheme, themeFromFlag, THEME_STORAGE_KEY } from '@/utils/theme';

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

it('maps the account flag to a theme, defaulting to light', () => {
  expect(themeFromFlag(1)).toBe('dark');
  expect(themeFromFlag(0)).toBe('light');
  expect(themeFromFlag(undefined)).toBe('light');
  expect(flagFromTheme('dark')).toBe(1);
  expect(flagFromTheme('light')).toBe(0);
});

it('paints the root and caches the theme for the next load', () => {
  applyTheme('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
});
