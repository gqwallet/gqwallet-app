import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import PayCardView from './PayCardView.vue';
import { useTransactions } from '../composables/useTransactions';
import { useBillingCycleOptions } from '../composables/useBillingCycleOptions';
import { useCardDetail } from '@/modules/cards/composables/useCardDetail';

vi.mock('../composables/useTransactions');
vi.mock('../composables/useBillingCycleOptions');
vi.mock('@/modules/cards/composables/useCardDetail');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ params: { id: 'card-1' } }),
}));

const CYCLES = [
  { closingDate: '2026-08-28', paymentDueDate: '2026-09-05' },
  { closingDate: '2026-09-28', paymentDueDate: '2026-10-05' },
];

let payCard: ReturnType<typeof vi.fn>;

function mockCard(amountDue: number) {
  vi.mocked(useCardDetail).mockReturnValue({
    card: ref({ id: 'card-1', name: 'Visa', color: '#3366cc' }),
    linkedTransactions: ref([]),
    linkedTotal: ref(0),
    nextBilling: ref({
      cycleStart: '2026-07-28',
      billingDate: '2026-08-28',
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

describe('PayCardView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    payCard = vi.fn().mockResolvedValue({});
    vi.mocked(useTransactions).mockReturnValue({ payCard } as never);
    vi.mocked(useBillingCycleOptions).mockReturnValue({
      cycles: ref(CYCLES),
      loading: ref(false),
      error: ref(null),
      fetchCycles: vi.fn(),
      clearCycles: vi.fn(),
    } as never);
  });

  it('prefills the outstanding amount and the cycle the card is accruing', async () => {
    mockCard(400);

    render(PayCardView);

    await waitFor(() => {
      expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400);
    });
    expect(screen.getByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ })).toHaveValue('2026-08-28');
  });

  it('offers only the two cycles the card allows', async () => {
    mockCard(400);

    render(PayCardView);

    const select = await screen.findByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ });
    expect(select.querySelectorAll('option')).toHaveLength(3);
  });

  it('submits the amount and the chosen cycle', async () => {
    mockCard(400);
    const user = userEvent.setup();

    render(PayCardView);
    await waitFor(() => expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400));
    await user.click(screen.getByRole('button', { name: 'Confirmar pago' }));

    expect(payCard).toHaveBeenCalledWith('card-1', {
      amount: 400,
      cycleClosingDate: '2026-08-28',
      description: null,
    });
  });

  it('refuses a payment of zero rather than sending it', async () => {
    mockCard(0);
    const user = userEvent.setup();

    render(PayCardView);
    await user.click(screen.getByRole('button', { name: 'Confirmar pago' }));

    expect(payCard).not.toHaveBeenCalled();
    expect(screen.getByText('Ingresa un monto mayor a cero.')).toBeInTheDocument();
  });
});
