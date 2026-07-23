// Pure billing-cycle math (no Vue, no httpClient) — used by every module that deals with a
// card's billing/payment day-of-month (cards: register/edit; overview: the payment calendar),
// so it lives here rather than being owned by one module and imported across the boundary.

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// The user only picks a day-of-month; `reference` supplies which month/year to anchor that
// day to (defaults to today, for registering/editing a card). If the payment day would land
// on or before the billing day within that same month, it's rolled to the next month —
// matches how card cycles actually work (billing closes on day X, payment is due some days
// later, often crossing into the next month) and keeps paymentDueDate chronologically after
// billingDate, which the backend requires.
export function composeCycleDates(
  billing: number,
  payment: number,
  reference: Date = new Date(),
): { billingDate: string; paymentDueDate: string } {
  const billingDate = toIsoDate(reference.getFullYear(), reference.getMonth(), billing);

  let payYear = reference.getFullYear();
  let payMonth = reference.getMonth();
  if (payment <= billing) {
    payMonth += 1;
    if (payMonth > 11) {
      payMonth = 0;
      payYear += 1;
    }
  }
  const paymentDueDate = toIsoDate(payYear, payMonth, payment);

  return { billingDate, paymentDueDate };
}

// Inverse of composeCycleDates: pulls just the day-of-month back out of a stored ISO date,
// for prefilling day-only inputs or re-anchoring a stored date to a different month.
export function dayOfMonth(isoDate: string): number {
  return Number(isoDate.slice(8, 10));
}
