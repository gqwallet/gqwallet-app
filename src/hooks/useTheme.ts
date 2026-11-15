/**
 * Appearance preference of this device, following the system when asked to.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState } from 'react';
import { applyTheme, readThemePreference, resolveTheme, storeThemePreference, type ThemePreference } from '@/utils/theme';

/** Result of {@link useTheme}. */
export interface UseThemeResult {
  /** Current preference. */
  preference: ThemePreference;
  /** Stores and applies a new preference. */
  setPreference: (preference: ThemePreference) => void;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Keeps the document theme in sync with the stored preference and, for `system`, with the OS setting.
 *
 * @returns The preference and its setter.
 * @example
 * ```tsx
 * const { preference, setPreference } = useTheme();
 * ```
 */
export function useTheme(): UseThemeResult {
  const [preference, setState] = useState<ThemePreference>(readThemePreference);
  useEffect(() => {
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
    const paint = () => applyTheme(resolveTheme(preference, Boolean(media?.matches)));
    paint();
    if (preference !== 'system' || !media) return undefined;
    media.addEventListener('change', paint);
    return () => media.removeEventListener('change', paint);
  }, [preference]);
  const setPreference = (next: ThemePreference) => {
    storeThemePreference(next);
    setState(next);
  };
  return { preference, setPreference };
}
