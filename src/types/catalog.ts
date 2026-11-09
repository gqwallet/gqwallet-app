/**
 * Describes the bank catalog exposed to authenticated users.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
/** Active or inactive bank in a country catalog. */
export interface Bank {
  /** Stable bank identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** ISO alpha two country code. */
  countryCode: string;
  /** Whether new instruments can use this bank. */
  active: boolean;
}
