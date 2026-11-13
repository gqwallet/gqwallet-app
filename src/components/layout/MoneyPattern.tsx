/**
 * Decorative access-screen bills exported from the current Figma mockups.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import desktopimgMoneyMark from '@/assets/auth/desktop-imgMoneyMark.svg';
import desktopimgBill2 from '@/assets/auth/desktop-imgBill2.svg';
import desktopimgBill3 from '@/assets/auth/desktop-imgBill3.svg';
import desktopimgBill4 from '@/assets/auth/desktop-imgBill4.svg';
import desktopimgBill6 from '@/assets/auth/desktop-imgBill6.svg';
import desktopimgBill7 from '@/assets/auth/desktop-imgBill7.svg';
import desktopimgBill8 from '@/assets/auth/desktop-imgBill8.svg';
import desktopimgBill10 from '@/assets/auth/desktop-imgBill10.svg';
import desktopimgBill11 from '@/assets/auth/desktop-imgBill11.svg';
import desktopimgBill12 from '@/assets/auth/desktop-imgBill12.svg';
import mobileimgBill1 from '@/assets/auth/mobile-imgBill1.svg';
import mobileimgBill2 from '@/assets/auth/mobile-imgBill2.svg';
import mobileimgBill3 from '@/assets/auth/mobile-imgBill3.svg';
import mobileimgBill4 from '@/assets/auth/mobile-imgBill4.svg';
import mobileimgBill5 from '@/assets/auth/mobile-imgBill5.svg';
import mobileimgBill6 from '@/assets/auth/mobile-imgBill6.svg';
import mobileimgBill7 from '@/assets/auth/mobile-imgBill7.svg';

interface PatternBill {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
}

const DESKTOP: PatternBill[] = [
  { src: desktopimgMoneyMark, left: 272.19, top: 60, width: 141.938, height: 122.677, rotation: 18 },
  { src: desktopimgBill2, left: 720, top: 0.95, width: 116.985, height: 104.822, rotation: -24 },
  { src: desktopimgBill3, left: 1166.22, top: 90, width: 144.494, height: 116.407, rotation: 8 },
  { src: desktopimgBill4, left: 520, top: 238.05, width: 134.928, height: 128.298, rotation: -35 },
  { src: desktopimgMoneyMark, left: 917.75, top: 330, width: 148.206, height: 135.802, rotation: 28 },
  { src: desktopimgBill6, left: 1300, top: 395.15, width: 111.364, height: 94.393, rotation: -15 },
  { src: desktopimgBill7, left: 340, top: 532.56, width: 149.699, height: 124.281, rotation: -12 },
  { src: desktopimgBill8, left: 713.54, top: 620, width: 134.928, height: 128.298, rotation: 35 },
  { src: desktopimgMoneyMark, left: 1150, top: 643.66, width: 148.206, height: 135.802, rotation: -28 },
  { src: desktopimgBill10, left: 545.03, top: 800, width: 108.872, height: 90.386, rotation: 12 },
  { src: desktopimgBill11, left: 60, top: 383.06, width: 129.19, height: 113.053, rotation: -20 },
  { src: desktopimgBill12, left: 29.57, top: 780, width: 117.434, height: 105.826, rotation: 25 },
];

const MOBILE: PatternBill[] = [
  { src: mobileimgBill1, left: 22.63, top: 90, width: 98.111, height: 83.713, rotation: 16 },
  { src: mobileimgBill2, left: 250, top: 33.03, width: 86.986, height: 77.04, rotation: -22 },
  { src: mobileimgBill3, left: 118.5, top: 300, width: 104.246, height: 96.56, rotation: 30 },
  { src: mobileimgBill4, left: 290, top: 402.58, width: 82.925, height: 69.814, rotation: -14 },
  { src: mobileimgBill5, left: 30, top: 529.57, width: 88.076, height: 79.369, rotation: -25 },
  { src: mobileimgBill6, left: 198.45, top: 680, width: 100.481, height: 87.93, rotation: 20 },
  { src: mobileimgBill7, left: 110, top: 767.5, width: 80.283, height: 65.682, rotation: -10 },
];

function Tile({ items, className }: { items: PatternBill[]; className: string }) {
  return <div className={className}>{items.map((bill, index) => <span key={index} className="absolute flex items-center justify-center" style={{ left: bill.left, top: bill.top, width: bill.width, height: bill.height }}><img src={bill.src} alt="" className="block max-w-none shrink-0" style={{ transform: `rotate(${bill.rotation}deg)` }} /></span>)}</div>;
}

/**
 * Renders decorative bills at their Figma positions without changing intrinsic SVG dimensions.
 * @example
 * ```tsx
 * <MoneyPattern />
 * ```
 */
export function MoneyPattern() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.06]">
    <Tile items={MOBILE} className="relative h-[874px] w-[402px] lg:hidden" />
    <Tile items={DESKTOP} className="relative hidden h-[900px] w-[1440px] lg:block" />
  </div>;
}
