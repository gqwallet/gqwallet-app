/**
 * Loads the bank choices for the profile country.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource } from '@/hooks/useResource';
import { catalogsService } from '@/services/catalogs.service';

/**
 * Fetches active banks whenever the country changes.
 *
 * @param country - Profile country, defaulting to Peru.
 * @returns Bank choices and request state.
 * @example
 * ```ts
 * const { data: banks } = useBanks(profile?.countryCode);
 * ```
 */
export function useBanks(country = 'PE') {
  return useResource((signal) => catalogsService.listBanks(country, signal), [country]);
}
