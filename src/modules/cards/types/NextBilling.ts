// Mirror of the backend NextBillingResource (FR-017). Every monetary figure arrives already
// computed by the server (NFR-004) — the UI only formats and displays it, never re-derives
// amountDue from the parts. insurancePercentage is null when the card has no seguro
// desgravamen; insuranceCharge is then 0. amountDue already has `payments` subtracted.
export interface NextBilling {
  cycleStart: string; // ISO date (yyyy-mm-dd)
  billingDate: string; // ISO date — when this cycle closes
  paymentDueDate: string; // ISO date — when THIS cycle is due, not the card's stale raw date
  expenses: number;
  payments: number;
  insurancePercentage: number | null;
  insuranceCharge: number;
  amountDue: number;
}

// Mirror of the backend BillingCycleOptionResource (FR-018) — the cycles a movement may be
// charged to. The server returns exactly two: the current one and the next.
export interface BillingCycleOption {
  closingDate: string; // ISO date
  paymentDueDate: string; // ISO date
}
