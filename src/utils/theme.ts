/**
 * Appearance preference (light, dark or system) stored on this device and applied to the document root.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Appearance chosen by the person. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Storage key of the appearance preference; also read by the inline script in `index.html`. */
export const THEME_STORAGE_KEY = 'gqwallet-theme';

/**
 * Reads the stored preference; light is the default and storage failures fall back to it.
 *
 * @returns The stored preference, or `light`.
 */
export function readThemePreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'system' ? value : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Stores the preference on this device; storage failures are ignored.
 *
 * @param preference - Appearance to keep.
 */
export function storeThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private browsing or blocked storage: the choice still applies to this session.
  }
}

/**
 * Resolves a preference to the theme actually painted.
 *
 * @param preference - Stored appearance.
 * @param prefersDark - Whether the operating system asks for a dark appearance.
 * @returns `dark` or `light`.
 */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): 'light' | 'dark' {
  return preference === 'dark' || (preference === 'system' && prefersDark) ? 'dark' : 'light';
}

/**
 * Paints the resolved theme on the document root.
 *
 * @param theme - Theme to paint.
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme;
}
