/**
 * Identifier colors offered for credit cards (FR-004), taken from the design-system palette.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Tone name of a card color, shared with progress bars and calendar markers. */
export type CardTone = 'primary' | 'success' | 'warning' | 'danger' | 'caution';

/** One selectable card color. */
export interface CardColorOption {
  /** Hex value stored by the backend. */
  hex: string;
  /** Visible name. */
  label: string;
  /** Design-system tone used to paint it. */
  tone: CardTone;
}

/** Card colors in the order of the mockup chips. */
export const CARD_COLORS: CardColorOption[] = [
  { hex: '#3333B2', label: 'Índigo', tone: 'primary' },
  { hex: '#338033', label: 'Verde', tone: 'success' },
  { hex: '#B24D1A', label: 'Naranja', tone: 'warning' },
  { hex: '#CC3333', label: 'Rojo', tone: 'danger' },
  { hex: '#E5CC66', label: 'Amarillo', tone: 'caution' },
];

/**
 * Returns the tone of a stored card color.
 *
 * @param hex - Stored `#RRGGBB` value.
 * @returns The matching tone; `primary` for unknown colors.
 * @example
 * ```ts
 * cardTone('#338033'); // 'success'
 * ```
 */
export function cardTone(hex: string | null | undefined): CardTone {
  return CARD_COLORS.find((option) => option.hex.toLowerCase() === (hex ?? '').toLowerCase())?.tone ?? 'primary';
}

/** Banks shown in the mockups; `Efectivo` is used for cash. */
export const BANKS = ['BCP', 'BBVA', 'Interbank', 'Scotiabank', 'Caja Arequipa', 'Efectivo'];
