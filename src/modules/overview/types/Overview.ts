// Mirror of the backend DashboardResource + PaymentCalendarEntryResource. This module
// has no aggregate of its own — it is a read-only composition over cards + transactions.
export interface UpcomingCard {
  cardId: string;
  name: string;
  // FR-018: the due date OF the cycle amountDue prices — the two always describe the same
  // cycle, so they can be shown side by side without misleading.
  paymentDueDate: string;
  color: string;
  amountDue: number;
}

export interface Dashboard {
  balance: number;
  upcomingCards: UpcomingCard[];
}

export interface PaymentCalendarEntry {
  cardId: string;
  cardName: string;
  color: string;
  billingDate: string;
  paymentDueDate: string;
}
