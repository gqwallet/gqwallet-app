/**
 * Appearance of the signed-in account (light or dark), painted on the document root and cached on this
 * device only to avoid a flash before the profile loads.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { DarkModeFlag } from '@/types/profile';

/** Theme painted on the document root. */
export type Theme = 'light' | 'dark';

/** Cache key of the last painted theme; also read by the inline script in `index.html`. */
export const THEME_STORAGE_KEY = 'gqwallet-theme';

/**
 * Converts the stored account flag to a theme; anything but `1` is light.
 *
 * @param darkMode - Account flag from the profile.
 * @returns `dark` or `light`.
 */
export function themeFromFlag(darkMode: DarkModeFlag | undefined): Theme {
  return darkMode === 1 ? 'dark' : 'light';
}

/**
 * Converts a theme to the account flag persisted by the API.
 *
 * @param theme - Theme chosen by the person.
 * @returns `1` for dark, `0` for light.
 */
export function flagFromTheme(theme: Theme): DarkModeFlag {
  return theme === 'dark' ? 1 : 0;
}

/**
 * Paints the theme on the document root and caches it for the next load; storage failures are ignored.
 *
 * @param theme - Theme to paint.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing or blocked storage: the account value still applies after the profile loads.
  }
}
