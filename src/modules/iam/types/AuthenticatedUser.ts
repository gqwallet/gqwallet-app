// Mirror of the backend UserResource returned by sign-up / sign-in.
export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

export interface SignUpPayload {
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}
