/**
 * Environment constants read once from the Vite environment.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Base URL of the `qs-gqwallet-api` backend, without the `/api/v1` prefix (it is removed when the env value includes it). */
export const API_URL: string = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

/** Version prefix shared by every backend endpoint. */
export const API_PREFIX = '/api/v1';
