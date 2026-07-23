// Mirror of the backend ProfileResource (GET/PUT /api/v1/profiles/me).
export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  monthlyIncome: number | null;
  lifeCushion: number | null;
}

// Mirror of UpdateProfileResource: personal data always, financial settings optional
// (both financial fields together or neither — validated by the backend, FR-014).
export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  monthlyIncome?: number | null;
  lifeCushion?: number | null;
}
