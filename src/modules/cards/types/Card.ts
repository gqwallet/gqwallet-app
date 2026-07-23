// Mirror of the backend CardResource. Note: the domain stores NO card number, CVV or
// credentials (privacy by design, NFR-002) — only these operational fields.
export interface Card {
  id: string;
  name: string;
  bankName: string;
  creditLine: number;
  billingDate: string; // ISO date (yyyy-mm-dd)
  paymentDueDate: string; // ISO date
  color: string; // hex #RRGGBB
  insurancePercentage: number | null; // seguro desgravamen, 0-100, FR-004 (optional)
}

export interface RegisterCardPayload {
  name: string;
  bankName: string;
  creditLine: number;
  billingDate: string;
  paymentDueDate: string;
  color: string;
  insurancePercentage: number | null;
}

export interface UpdateCardPayload {
  name: string;
  bankName: string;
  creditLine: number;
  billingDate: string;
  paymentDueDate: string;
  insurancePercentage: number | null;
}

// The five identifier colors a user can pick for a card (FR-004), from the Figma palette.
export const CARD_COLORS = ['#3366cc', '#cc3333', '#338033', '#994db2', '#cc801a'] as const;
