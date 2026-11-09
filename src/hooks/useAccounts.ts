/**
 * Accounts with their calculated balance (FR-020, FR-021) and account registration.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account, RegisterAccountInput } from '@/types/account';
import type { ApiError } from '@/types/api';

/** Account row of the list. */
export interface AccountSummary extends Account {
  /** Calculated balance at today. */
  balance: number;
  /** Whether the balance is negative. */
  isNegative: boolean;
  /** Movements linked to the account. */
  movementCount: number;
}

/** Result of {@link useAccounts}. */
export interface AccountsState {
  /** Accounts with balances. */
  accounts: AccountSummary[] | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Reloads. */
  refetch: () => void;
}

/**
 * Loads every account with its balance and number of movements.
 *
 * @returns Accounts and state.
 * @example
 * ```ts
 * const { accounts } = useAccounts();
 * ```
 */
export function useAccounts(): AccountsState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const accounts = await accountsService.list(signal);
    const [balances, counts] = await Promise.all([
      Promise.all(accounts.map((account) => accountsService.getBalance(account.id, undefined, signal))),
      Promise.all(accounts.map((account) => transactionsService.list({ instrumentId: account.id, size: 1 }, signal))),
    ]);
    return accounts.map((account, index) => ({
      ...account,
      balance: balances[index].balance,
      isNegative: balances[index].negative,
      movementCount: counts[index].totalElements,
    }));
  }, []);
  return { accounts: data, isLoading, error, refetch };
}

/** Result of {@link useRegisterAccount}. */
export interface RegisterAccountState {
  /** Registers the account; resolves it or `null`. */
  register: (input: RegisterAccountInput) => Promise<Account | null>;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Alias error when the alias is already used. */
  aliasError: string | null;
  /** Other error. */
  error: string | null;
}

/**
 * Registers an account; a conflict means the alias is repeated.
 *
 * @returns Register action and state.
 * @example
 * ```ts
 * const { register, aliasError } = useRegisterAccount();
 * ```
 */
export function useRegisterAccount(): RegisterAccountState {
  const { submit, isSubmitting, error } = useMutation((input: RegisterAccountInput) => accountsService.register(input));
  const register = useCallback((input: RegisterAccountInput) => submit(input), [submit]);
  return {
    register,
    isSaving: isSubmitting,
    aliasError: error?.status === 409 ? 'Ya tienes una cuenta con este alias. Usa otro nombre.' : null,
    error: error && error.status !== 409 ? 'No guardamos la cuenta. Revisa los datos: el saldo inicial debe ser mayor o igual a cero.' : null,
  };
}
