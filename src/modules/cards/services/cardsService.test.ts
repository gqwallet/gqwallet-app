import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/http/httpClient';
import { cardsService } from './cardsService';

vi.mock('@/shared/http/httpClient');
vi.mock('@/modules/transactions/services/transactionsService');

describe('cardsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reads the selectable billing cycles from the card sub-resource', async () => {
    const cycles = [
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05' },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05' },
    ];
    vi.mocked(httpClient.get).mockResolvedValue({ data: cycles } as never);

    const result = await cardsService.listBillingCycles('card-1');

    expect(httpClient.get).toHaveBeenCalledWith('/cards/card-1/billing-cycles');
    expect(result).toEqual(cycles);
  });

  it('reads each payment cycle already priced from the card sub-resource', async () => {
    const cycles = [
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ];
    vi.mocked(httpClient.get).mockResolvedValue({ data: cycles } as never);

    const result = await cardsService.listPaymentCycles('card-1');

    expect(httpClient.get).toHaveBeenCalledWith('/cards/card-1/payment-cycles');
    expect(result).toEqual(cycles);
  });

  it('returns the next-billing projection untouched, including payments', async () => {
    const projection = {
      cycleStart: '2026-07-28',
      billingDate: '2026-08-28',
      paymentDueDate: '2026-09-05',
      expenses: 400,
      payments: 150,
      insurancePercentage: null,
      insuranceCharge: 0,
      amountDue: 250,
    };
    vi.mocked(httpClient.get).mockResolvedValue({ data: projection } as never);

    await expect(cardsService.getNextBilling('card-1')).resolves.toEqual(projection);
  });
});
