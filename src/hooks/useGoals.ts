/**
 * Savings goals (FR-038): list, creation, detail with contributions and new contributions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { savingsService } from '@/services/savings.service';
import type { ApiError } from '@/types/api';
import type { Contribution, CreateSavingsGoalInput, RegisterContributionInput, SavingsGoal } from '@/types/savings';
import type { AccountWithBalance } from '@/hooks/useTransferForm';

/** Data of the goals page. */
export interface GoalsData {
  /** Goals. */
  goals: SavingsGoal[];
  /** Coverage in months of each emergency-fund goal, by goal id. */
  coverage: Record<string, number | null>;
  /** Minimum recommended fund of each emergency-fund goal, by goal id. */
  minimum: Record<string, number>;
  /** Active accounts with balances. */
  accounts: AccountWithBalance[];
}

/** Result of {@link useGoals}. */
export interface GoalsState {
  /** Loaded data. */
  data: GoalsData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Contributes to a goal; resolves whether it succeeded. */
  contribute: (goalId: string, input: RegisterContributionInput) => Promise<boolean>;
  /** Whether a contribution is in flight. */
  isSaving: boolean;
  /** Contribution error. */
  saveError: string | null;
}

/**
 * Loads goals, emergency fund coverage and paying accounts.
 *
 * @returns Goals and the contribute action.
 * @example
 * ```ts
 * const { data, contribute } = useGoals();
 * ```
 */
export function useGoals(): GoalsState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const [goals, accounts] = await Promise.all([savingsService.list(signal), accountsService.list(signal)]);
    const funds = goals.filter((goal) => goal.emergencyFund);
    const active = accounts.filter((account) => account.status === 'ACTIVE');
    const [fundData, balances] = await Promise.all([
      Promise.all(funds.map((goal) => savingsService.getEmergencyFund(goal.currency, signal))),
      Promise.all(active.map((account) => accountsService.getBalance(account.id, undefined, signal))),
    ]);
    return {
      goals,
      coverage: Object.fromEntries(funds.map((goal, index) => [goal.id, fundData[index].coverageMonths])),
      minimum: Object.fromEntries(funds.map((goal, index) => [goal.id, fundData[index].minimum])),
      accounts: active.map((account, index) => ({ ...account, balance: balances[index].balance })),
    };
  }, []);
  const { submit, isSubmitting, error: saveError } = useMutation(({ goalId, input }: { goalId: string; input: RegisterContributionInput }) => savingsService.contribute(goalId, input));
  const contribute = useCallback(
    async (goalId: string, input: RegisterContributionInput) => {
      const saved = await submit({ goalId, input });
      if (saved) refetch();
      return saved !== null;
    },
    [submit, refetch],
  );
  return { data, isLoading, error, contribute, isSaving: isSubmitting, saveError: saveError ? 'No registramos el aporte: la cuenta debe tener la misma moneda de la meta.' : null };
}

/** Data of a goal page. */
export interface GoalDetailData {
  /** Goal. */
  goal: SavingsGoal;
  /** Contributions, newest first. */
  contributions: Contribution[];
  /** Account names by id. */
  accountNames: Record<string, string>;
}

/** Result of {@link useGoalDetail}. */
export interface GoalDetailState extends Omit<GoalsState, 'data'> {
  /** Loaded data. */
  data: GoalDetailData | null;
  /** Active accounts with balances. */
  accounts: AccountWithBalance[];
  /** Total contributions reported by the server. */
  totalContributions: number;
  /** Failure loading contributions; loaded content remains available. */
  paginationError: ApiError | null;
  /** Whether more contributions exist. */
  hasMore: boolean;
  /** Whether an additional page is loading. */
  isLoadingMore: boolean;
  /** Requests another contribution page. */
  loadMore: () => void;
}

/**
 * Loads one goal with its contributions.
 *
 * @param id - Goal identifier.
 * @returns Goal, contributions and the contribute action.
 * @example
 * ```ts
 * const { data } = useGoalDetail(id);
 * ```
 */
export function useGoalDetail(id: string): GoalDetailState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const [goal, accounts] = await Promise.all([savingsService.get(id, signal), accountsService.list(signal)]);
    const active = accounts.filter((account) => account.status === 'ACTIVE');
    const balances = await Promise.all(active.map((account) => accountsService.getBalance(account.id, undefined, signal)));
    return {
      detail: {
        goal,
        contributions: [] as Contribution[],
        accountNames: Object.fromEntries(accounts.map((account) => [account.id, account.alias])),
      },
      accounts: active.map((account, index) => ({ ...account, balance: balances[index].balance })),
    };
  }, [id]);
  const list = useInfiniteList((page, signal) => savingsService.listContributions(id, signal, page), id);
  const { reset } = list;
  const { submit, isSubmitting, error: saveError } = useMutation((input: RegisterContributionInput) => savingsService.contribute(id, input));
  const contribute = useCallback(
    async (_goalId: string, input: RegisterContributionInput) => {
      const saved = await submit(input);
      if (saved) { refetch(); reset(); }
      return saved !== null;
    },
    [submit, refetch, reset],
  );
  return {
    data: data ? { ...data.detail, contributions: list.items } : null,
    totalContributions: list.totalElements, hasMore: list.hasMore, isLoadingMore: list.isLoading || list.isLoadingMore, loadMore: list.loadMore,
    accounts: data?.accounts ?? [],
    isLoading,
    error, paginationError: list.error,
    contribute,
    isSaving: isSubmitting,
    saveError: saveError ? 'No registramos el aporte: la cuenta debe tener la misma moneda de la meta.' : null,
  };
}

/** Result of {@link useCreateGoal}. */
export interface CreateGoalState {
  /** Creates a goal; resolves it or `null`. */
  create: (input: CreateSavingsGoalInput) => Promise<SavingsGoal | null>;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Whether the user already has an emergency fund in that currency. */
  isDuplicateFund: boolean;
  /** Other error. */
  error: string | null;
}

/**
 * Creates a goal; a conflict means a second emergency fund in the same currency.
 *
 * @returns Create action and state.
 * @example
 * ```ts
 * const { create, isDuplicateFund } = useCreateGoal();
 * ```
 */
export function useCreateGoal(): CreateGoalState {
  const { submit, isSubmitting, error } = useMutation((input: CreateSavingsGoalInput) => savingsService.create(input));
  return {
    create: submit,
    isSaving: isSubmitting,
    isDuplicateFund: error?.status === 409,
    error: error && error.status !== 409 ? 'No creamos la meta. Revisa el importe objetivo y la fecha.' : null,
  };
}
