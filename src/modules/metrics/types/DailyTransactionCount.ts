// Mirror of the backend DailyTransactionCountResource (GET /api/v1/metrics/transactions/daily-count,
// ROLE_ADMINISTRATOR only). One entry per day in a fixed 5-month window computed server-side
// (2 months before the current month through 2 after it) — dense and zero-filled, so every
// day in the window is present even with no transactions registered that day.
export interface DailyTransactionCount {
  date: string;
  count: number;
}
