/**
 * Decorative background of scattered bills at 6 % opacity, as in the Figma Money Pattern.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import moneyMark from '@/assets/money-mark.svg';

// Placements of the desktop and mobile variants: left, top, width and rotation (Figma counter-clockwise degrees).
const DESKTOP: Array<[number, number, number, number]> = [
  [300, 60, 120, -18], [720, 40, 96, 24], [1180, 90, 132, -8], [520, 300, 108, 35], [960, 330, 120, -28], [1300, 420, 96, 15],
  [340, 560, 132, 12], [760, 620, 108, -35], [1150, 700, 120, 28], [560, 800, 96, -12], [60, 420, 108, 20], [60, 780, 96, -25],
];
const MOBILE: Array<[number, number, number, number]> = [
  [40, 90, 84, -16], [250, 60, 72, 22], [150, 300, 84, -30], [290, 420, 72, 14], [30, 560, 72, 25], [220, 680, 84, -20], [110, 780, 72, 10],
];

function Tile({ items, className }: { items: Array<[number, number, number, number]>; className: string }) {
  return (
    <div className={className}>
      {items.map(([left, top, width, rotation]) => (
        <img
          key={`${left}-${top}`}
          src={moneyMark}
          alt=""
          className="absolute"
          style={{ left, top, width, transform: `rotate(${-rotation}deg)` }}
        />
      ))}
    </div>
  );
}

/**
 * Renders the fixed bill pattern behind the page content; it never receives pointer events.
 *
 * @example
 * ```tsx
 * <MoneyPattern />
 * ```
 */
export function MoneyPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.06]">
      <Tile items={MOBILE} className="relative h-[844px] w-[390px] lg:hidden" />
      <Tile items={DESKTOP} className="relative hidden h-[900px] w-[1440px] lg:block" />
    </div>
  );
}
