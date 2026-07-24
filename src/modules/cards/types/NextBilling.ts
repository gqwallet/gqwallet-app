// Mirror of the backend NextBillingResource (FR-017). Every monetary figure arrives already
// computed by the server (NFR-004) — the UI only formats and displays it, never re-derives
// amountDue from the parts. insurancePercentage is null when the card has no seguro
// desgravamen; insuranceCharge is then 0.
export interface NextBilling {
  cycleStart: string; // ISO date (yyyy-mm-dd)
  billingDate: string; // ISO date
  expenses: number;
  insurancePercentage: number | null;
  insuranceCharge: number;
  amountDue: number;
}
