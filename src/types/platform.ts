/**
 * Calendar sync and platform metrics types (FR-013, FR-016).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Link between the user and Google Calendar. */
export interface CalendarLink {
  /** Link identifier. */
  id: string;
  /** Active or revoked. */
  status: 'ACTIVE' | 'REVOKED';
  /** Last successful synchronization (ISO instant). */
  lastSyncedAt: string | null;
}

/** Aggregated platform metrics (FR-013). */
export interface PlatformMetrics {
  /** Registered users. */
  registeredUsers: number;
  /** Users with at least one movement in the active window. */
  activeUsers: number;
  /** Size of the active window in days. */
  activeWindowDays: number;
}

/** Number of movements registered on one day. */
export interface DailyTransactionCount {
  /** Day (ISO date). */
  date: string;
  /** Movements registered. */
  count: number;
}
