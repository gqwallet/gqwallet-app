// Mirror of the backend DashboardResource + PaymentCalendarEntryResource. This module
// has no aggregate of its own — it is a read-only composition over cards + transactions.
export interface UpcomingCard {
  cardId: string;
  name: string;
  paymentDueDate: string;
  color: string;
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
