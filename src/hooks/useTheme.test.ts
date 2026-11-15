/**
 * Tests of the appearance hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTheme } from '@/hooks/useTheme';

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  vi.unstubAllGlobals();
});

it('applies, stores and follows the system preference', () => {
  const listeners: Array<() => void> = [];
  const media = { matches: true, addEventListener: (_: string, fn: () => void) => listeners.push(fn), removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', () => media);
  const { result } = renderHook(() => useTheme());
  expect(result.current.preference).toBe('light');
  expect(document.documentElement.dataset.theme).toBe('light');
  act(() => result.current.setPreference('dark'));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem('gqwallet-theme')).toBe('dark');
  act(() => result.current.setPreference('system'));
  expect(document.documentElement.dataset.theme).toBe('dark');
  media.matches = false;
  act(() => listeners.forEach((fn) => fn()));
  expect(document.documentElement.dataset.theme).toBe('light');
});
