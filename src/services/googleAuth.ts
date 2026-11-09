/**
 * Google OAuth consent URL for the calendar link (FR-016); the code exchange happens in the backend.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Path that receives the Google authorization code. */
export const CALENDAR_CALLBACK_PATH = '/calendario/conexion';

/**
 * Builds the Google consent URL, or `null` when the client id is not configured.
 *
 * @param origin - Origin of the app, e.g. `http://localhost:5173`.
 * @returns The consent URL or `null`.
 * @example
 * ```ts
 * const url = googleConsentUrl(window.location.origin);
 * ```
 */
export function googleConsentUrl(origin: string): string | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}${CALENDAR_CALLBACK_PATH}`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
