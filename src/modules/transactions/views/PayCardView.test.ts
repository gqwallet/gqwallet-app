import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import PayCardView from './PayCardView.vue';
import { useTransactions } from '../composables/useTransactions';
import { usePaymentCycleOptions } from '../composables/usePaymentCycleOptions';
import { useCardDetail } from '@/modules/cards/composables/useCardDetail';

vi.mock('../composables/useTransactions');
vi.mock('../composables/usePaymentCycleOptions');
vi.mock('@/modules/cards/composables/useCardDetail');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ params: { id: 'card-1' } }),
}));

let payCard: ReturnType<typeof vi.fn>;

function mockCycles(cycles: { closingDate: string; paymentDueDate: string; amountDue: number }[]) {
  vi.mocked(usePaymentCycleOptions).mockReturnValue({
    cycles: ref(cycles),
    loading: ref(false),
    error: ref(null),
    fetchCycles: vi.fn(),
    clearCycles: vi.fn(),
  } as never);
}

function mockCard() {
  vi.mocked(useCardDetail).mockReturnValue({
    card: ref({ id: 'card-1', name: 'Visa', color: '#3366cc' }),
    linkedTransactions: ref([]),
    linkedTotal: ref(0),
    nextBilling: ref(null),
    amountDue: ref(null),
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
    mockCard();
    // FR-021: a payment can never be deleted afterward, so submitting now asks for
    // confirmation first — default to "yes" here, and test the "no" path explicitly below.
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('prefills the outstanding amount and the cycle the card is accruing', async () => {
    mockCycles([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ]);

    render(PayCardView);

    await waitFor(() => {
      expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400);
    });
    expect(screen.getByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ })).toHaveValue('2026-08-28');
  });

  it('offers only the two cycles the card allows', async () => {
    mockCycles([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ]);

    render(PayCardView);

    const select = await screen.findByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ });
    expect(select.querySelectorAll('option')).toHaveLength(3);
  });

  it('disables the option for a cycle with nothing outstanding, so it cannot be selected', async () => {
    mockCycles([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ]);

    render(PayCardView);

    const select = await screen.findByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ });
    const options = select.querySelectorAll('option');
    expect(options[1]).not.toBeDisabled(); // "Selecciona un ciclo" placeholder is index 0
    expect(options[2]).toBeDisabled(); // the empty next cycle
  });

  it('submits the amount and the chosen cycle', async () => {
    mockCycles([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ]);
    const user = userEvent.setup();

    render(PayCardView);
    await waitFor(() => expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400));
    await user.click(screen.getByRole('button', { name: 'Confirmar pago' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(payCard).toHaveBeenCalledWith('card-1', {
      amount: 400,
      cycleClosingDate: '2026-08-28',
      description: null,
    });
  });

  // FR-021: the confirmation is the only safety net left, since the payment can never be
  // deleted afterward — declining it must not register anything.
  it('does not submit when the confirmation is declined', async () => {
    mockCycles([{ closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 }]);
    vi.mocked(window.confirm).mockReturnValue(false);
    const user = userEvent.setup();

    render(PayCardView);
    await waitFor(() => expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400));
    await user.click(screen.getByRole('button', { name: 'Confirmar pago' }));

    expect(payCard).not.toHaveBeenCalled();
  });

  it('refreshes the amount when switching to a differently priced cycle', async () => {
    mockCycles([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 120 },
    ]);
    const user = userEvent.setup();

    render(PayCardView);
    await waitFor(() => expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(400));

    await user.selectOptions(
      screen.getByRole('combobox', { name: /¿Qué ciclo estás pagando\?/ }),
      '2026-09-28',
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(120);
    });
  });

  it('disables the submit button when the selected cycle has nothing outstanding', async () => {
    mockCycles([{ closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 0 }]);

    render(PayCardView);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
    });
    expect(screen.getByText(/No tienes saldo pendiente en este ciclo/)).toBeInTheDocument();
    expect(payCard).not.toHaveBeenCalled();
  });

  it('surfaces the backend message when the payment is rejected on submit', async () => {
    mockCycles([{ closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 289.98 }]);
    payCard.mockRejectedValue({ response: { data: 'Payment exceeds the outstanding balance of 289.98' } });
    const user = userEvent.setup();

    render(PayCardView);
    await waitFor(() => expect(screen.getByLabelText('Monto a pagar (S/.)')).toHaveValue(289.98));
    await user.click(screen.getByRole('button', { name: 'Confirmar pago' }));

    expect(await screen.findByText('Payment exceeds the outstanding balance of 289.98')).toBeInTheDocument();
  });
});
