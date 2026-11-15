/**
 * Decorative category glyph on a pastel container.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

/** Semantic and categorical icon colors. */
export type IconTileTone = 'indigo' | 'teal' | 'amber' | 'sky' | 'violet' | 'positive' | 'negative' | 'accent' | 'featured';

const TONE: Record<IconTileTone, string> = {
  indigo: 'bg-chart-1-container text-chart-1',
  teal: 'bg-chart-2-container text-chart-2',
  amber: 'bg-chart-3-container text-tertiary',
  sky: 'bg-chart-4-container text-chart-4',
  violet: 'bg-chart-5-container text-chart-5',
  positive: 'bg-secondary-container text-secondary',
  negative: 'bg-danger-container text-danger',
  accent: 'bg-accent-container text-accent',
  featured: 'bg-white/20 text-white',
};

const CATEGORY_TONE: Record<string, IconTileTone> = {
  credit_card: 'sky', wifi: 'sky', devices: 'sky', school: 'sky', directions_car: 'sky',
  savings: 'teal', shield: 'teal', subscriptions: 'teal', payments: 'violet',
  restaurant: 'amber', local_cafe: 'amber', cookie: 'amber', shopping_cart: 'amber', event: 'amber',
  pets: 'violet', favorite: 'violet', spa: 'violet', checkroom: 'violet', flag: 'violet', flight: 'violet',
};

/** Props accepted by {@link IconTile}. */
export interface IconTileProps {
  /** Material Symbols Rounded ligature. */
  icon: string;
  /** Container and glyph tone. */
  tone?: IconTileTone;
  /** Optional placement utilities. */
  className?: string;
}

/** Renders a 36 px tile with a 20 px glyph; adjacent copy carries its meaning. */
export function IconTile({ icon, tone, className }: IconTileProps) {
  return <span aria-hidden="true" data-icon-tile className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-icon-tile', TONE[tone ?? CATEGORY_TONE[icon] ?? 'indigo'], className)}><Icon name={icon} size={20} /></span>;
}
