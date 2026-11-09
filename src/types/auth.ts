/**
 * Identity and session types (FR-001, FR-002, FR-013).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Roles granted by the backend. */
export type Role = 'REGISTERED_USER' | 'ADMINISTRATOR';

/** Account created on sign-up or returned on sign-in. */
export interface AuthenticatedUser {
  /** User identifier. */
  id: string;
  /** Sign-in email. */
  email: string;
  /** Granted roles. */
  roles: Role[];
}

/** Credentials submitted on sign-in. */
export interface SignInInput {
  /** Registered email. */
  email: string;
  /** Plain password; sent only over HTTPS. */
  password: string;
}

/** Data submitted on sign-up; consent is mandatory (NFR-009). */
export interface SignUpInput extends SignInInput {
  /** Whether the user accepted the terms and the data-processing policy. */
  consentAccepted: boolean;
}
