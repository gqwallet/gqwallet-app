/**
 * Pure parsers and validators for form input.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Parses an amount typed by the user, accepting thousands separators.
 *
 * @param text - Typed text, e.g. `8,500.00`.
 * @returns The number, or `null` when the text is empty or invalid.
 * @example
 * ```ts
 * parseAmount('8,500.50'); // 8500.5
 * ```
 */
export function parseAmount(text: string): number | null {
  const clean = text.replace(/[,\s]/g, '').replace(/^(S\/|US\$)/, '');
  if (clean === '' || !/^-?\d+(\.\d+)?$/.test(clean)) return null;
  return Number(clean);
}

/**
 * Checks that an amount has at most two decimals.
 *
 * @param value - Amount.
 * @returns Whether the amount has two decimals or fewer.
 * @example
 * ```ts
 * hasTwoDecimalsAtMost(1.234); // false
 * ```
 */
export function hasTwoDecimalsAtMost(value: number): boolean {
  return Math.abs(Math.round(value * 100) - value * 100) < 1e-6;
}

/**
 * Checks the password rule of sign-up: 8 characters with letters and numbers.
 *
 * @param password - Typed password.
 * @returns Whether the password is acceptable.
 * @example
 * ```ts
 * isStrongPassword('abc12345'); // true
 * ```
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

/**
 * Checks the basic shape of an email.
 *
 * @param email - Typed email.
 * @returns Whether it looks like an email.
 * @example
 * ```ts
 * isEmail('ana@correo.pe'); // true
 * ```
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

