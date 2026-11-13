/**
 * Compact credit-card identifier used in the card-list headings.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { cardTone } from '@/utils/cardPalette';

/** Props accepted by {@link CreditCardMark}. */
export interface CreditCardMarkProps {
  /** Stored identifier color; mapped to the established visual palette. */
  color: string;
}

/**
 * Renders the small credit-card mark from the design system.
 * @example
 * ```tsx
 * <CreditCardMark color={card.color} />
 * ```
 */
export function CreditCardMark({ color }: CreditCardMarkProps) {
  const tone = cardTone(color);
  const fill = { primary: 'bg-chart-1', success: 'bg-chart-2', warning: 'bg-chart-3', danger: 'bg-danger', caution: 'bg-caution-accent' }[tone];
  return <span aria-hidden="true" className={cn('relative mr-3 inline-block h-[30px] w-11 shrink-0 overflow-hidden rounded-sm align-middle', fill)}><span className="absolute inset-x-0 top-1.5 h-1 bg-white/80" /><span className="absolute bottom-1.5 left-1.5 h-1.5 w-2 rounded-xs bg-white/60" /></span>;
}
