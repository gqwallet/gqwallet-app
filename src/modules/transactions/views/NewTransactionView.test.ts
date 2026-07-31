import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import NewTransactionView from './NewTransactionView.vue';
import { useTransactions } from '../composables/useTransactions';
import { useCategories } from '../composables/useCategories';
import { useCardOptions } from '../composables/useCardOptions';
import { useBillingCycleOptions } from '../composables/useBillingCycleOptions';

vi.mock('../composables/useTransactions');
vi.mock('../composables/useCategories');
vi.mock('../composables/useCardOptions');
vi.mock('../composables/useBillingCycleOptions');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

const CYCLES = [
  { closingDate: '2026-08-28', paymentDueDate: '2026-09-05' },
  { closingDate: '2026-09-28', paymentDueDate: '2026-10-05' },
];

describe('NewTransactionView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      categories: ref(['FOOD', 'OTHER']),
      loading: ref(false),
      error: ref(null),
      fetchCategories: vi.fn(),
    } as never);
    vi.mocked(useCardOptions).mockReturnValue({
      cards: ref([{ id: 'card-1', name: 'Visa' }]),
      loading: ref(false),
      error: ref(null),
      fetchCardOptions: vi.fn(),
    } as never);
    vi.mocked(useTransactions).mockReturnValue({
      registerTransaction: vi.fn(),
      getAvailableCredit: vi.fn().mockResolvedValue(500),
    } as never);
    vi.mocked(useBillingCycleOptions).mockReturnValue({
      cycles: ref(CYCLES),
      loading: ref(false),
      error: ref(null),
      fetchCycles: vi.fn(),
      clearCycles: vi.fn(),
    } as never);
  });

  it('hides the cycle selector until a card is linked', () => {
    render(NewTransactionView);

    expect(screen.queryByText('¿En qué ciclo lo pagarás?')).not.toBeInTheDocument();
  });

  it('offers exactly the two cycles the card allows once linked', async () => {
    const user = userEvent.setup();
    render(NewTransactionView);

    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => expect(screen.getByText('¿En qué ciclo lo pagarás?')).toBeInTheDocument());
    // Asserted on the cycle wording, not the rendered date: es-PE month abbreviations differ
    // between Node's ICU build and the browser, which would make this brittle for no gain.
    expect(screen.getByRole('option', { name: /Ciclo actual/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Próximo ciclo/ })).toBeInTheDocument();
    // Exactly two cycles, plus the disabled placeholder — never a third option.
    const cycleSelect = screen.getByRole('combobox', { name: /¿En qué ciclo lo pagarás\?/ });
    expect(cycleSelect.querySelectorAll('option')).toHaveLength(3);
  });

  it('does not offer the cycle selector for an income', async () => {
    const user = userEvent.setup();
    render(NewTransactionView);

    await user.click(screen.getByRole('button', { name: 'Ingreso' }));

    expect(screen.queryByText('¿En qué ciclo lo pagarás?')).not.toBeInTheDocument();
  });
});
