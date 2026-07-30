import { render, screen } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import CardDetailView from './CardDetailView.vue';
import { useCardDetail } from '../composables/useCardDetail';

vi.mock('../composables/useCardDetail');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { id: 'card-1' } }),
}));

function mockCard(amountDue: number) {
  vi.mocked(useCardDetail).mockReturnValue({
    card: ref({
      id: 'card-1',
      name: 'Bfree',
      bankName: 'BBVA',
      creditLine: 500,
      billingDate: '2026-07-10',
      paymentDueDate: '2026-08-05',
      color: '#3366cc',
      insurancePercentage: null,
    }),
    linkedTransactions: ref([]),
    linkedTotal: ref(0),
    nextBilling: ref({
      cycleStart: '2026-07-10',
      billingDate: '2026-08-10',
      paymentDueDate: '2026-09-05',
      expenses: amountDue,
      payments: 0,
      insurancePercentage: null,
      insuranceCharge: 0,
      amountDue,
    }),
    amountDue: ref(amountDue),
    loading: ref(false),
    error: ref(null),
    fetch: vi.fn(),
    removeCard: vi.fn(),
  } as never);
}

describe('CardDetailView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('enables the pay button when there is an outstanding balance', () => {
    mockCard(289.98);

    render(CardDetailView);

    const buttons = screen.getAllByRole('button', { name: 'Registrar pago de esta tarjeta' });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => expect(button).toBeEnabled());
  });

  it('disables the pay button and relabels it when nothing is owed', () => {
    mockCard(0);

    render(CardDetailView);

    const buttons = screen.getAllByRole('button', { name: 'Sin saldo pendiente' });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => expect(button).toBeDisabled());
    expect(screen.queryByText('Registrar pago de esta tarjeta')).not.toBeInTheDocument();
  });
});
