/**
 * Decorative credit-card face painted with the card's identifier color.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Icon } from '@/components/ui/Icon';
import { cardTone, type CardTone } from '@/utils/cardPalette';
import { cn } from '@/utils/cn';

const FACE: Record<CardTone, string> = {
  primary: 'from-card-indigo to-chart-5 text-white',
  success: 'from-card-green to-chart-2 text-white',
  warning: 'from-card-orange to-chart-3 text-white',
  danger: 'from-card-red to-card-orange text-white',
  caution: 'from-card-gold to-caution-accent text-white',
};

/** Props of {@link CreditCardVisual}. */
export interface CreditCardVisualProps {
  /** Issuing bank shown on the card face. */
  bankName: string;
  /** Card currency code. */
  currency: string;
  /** Stored identifier color; mapped to the design-system palette. */
  color: string;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a decorative card face (bank, chip, contactless mark and currency). It is hidden from assistive
 * technology because the card name and figures are announced by the surrounding content.
 *
 * @example
 * ```tsx
 * <CreditCardVisual bankName="Interbank" currency="PEN" color="#3333B2" />
 * ```
 */
export function CreditCardVisual({ bankName, currency, color, className }: CreditCardVisualProps) {
  return (
    <div aria-hidden="true" data-card-face className={cn('relative isolate flex h-[132px] flex-col justify-between overflow-hidden rounded-xl bg-linear-[135deg] p-4 shadow-card select-none lg:h-[148px]', FACE[cardTone(color)], className)}>
      <span className="absolute -top-16 -right-12 -z-10 size-44 rounded-full bg-white/12" />
      <span className="absolute -right-4 -bottom-24 -z-10 size-48 rounded-full bg-white/8" />
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate text-subtitle">{bankName}</span>
        <Icon name="contactless" size={24} className="shrink-0 opacity-90" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="relative h-7 w-10 overflow-hidden rounded-md bg-linear-to-br from-caution-accent to-white/80 shadow-sm">
          <span className="absolute inset-x-0 top-1/2 h-px bg-card-gold/40" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-card-gold/40" />
        </span>
        <span className="text-label tracking-wide opacity-90">Crédito · {currency}</span>
      </div>
    </div>
  );
}
