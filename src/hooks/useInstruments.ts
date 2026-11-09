/**
 * Accounts and cards of the user, used as payment means and transfer endpoints (FR-008).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { cardsService } from '@/services/cards.service';
import type { Account } from '@/types/account';
import type { ApiError } from '@/types/api';
import type { Card } from '@/types/card';

/** Accounts and cards with a name index. */
export interface Instruments {
  /** All accounts, active and deactivated. */
  accounts: Account[];
  /** All cards. */
  cards: Card[];
  /** Display name by account or card id. */
  names: Record<string, string>;
}

/** Result of {@link useInstruments}. */
export interface InstrumentsState {
  /** Loaded instruments; empty lists while loading. */
  instruments: Instruments;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Last error. */
  error: ApiError | null;
  /** Reloads. */
  refetch: () => void;
}

const EMPTY: Instruments = { accounts: [], cards: [], names: {} };

/**
 * Loads accounts and cards once.
 *
 * @returns Instruments and state.
 * @example
 * ```ts
 * const { instruments } = useInstruments();
 * ```
 */
export function useInstruments(): InstrumentsState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const [accounts, cards] = await Promise.all([accountsService.list(signal), cardsService.list(signal)]);
    const names: Record<string, string> = {};
    accounts.forEach((account) => (names[account.id] = account.alias));
    cards.forEach((card) => (names[card.id] = card.name));
    return { accounts, cards, names };
  }, []);
  return { instruments: data ?? EMPTY, isLoading, error, refetch };
}
