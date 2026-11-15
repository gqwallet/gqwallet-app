/**
 * Decorative mascot contained by its stage; never conveys financial advice.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import regia from '@/assets/bonny/regia.png';
import celebra from '@/assets/bonny/celebra.png';
import descansa from '@/assets/bonny/descansa.png';
import { cn } from '@/utils/cn';

const POSES = { regia, celebra, descansa };

/** Props accepted by {@link Bonny}. */
export interface BonnyProps {
  /** Approved transparent pose. */
  pose?: keyof typeof POSES;
  /** Stage placement: heroes crop a circle; empty states use an ellipse. */
  stage?: 'hero' | 'access' | 'empty';
  /** Container layout utilities. */
  className?: string;
  /** Lets heroes place the entire clipping stage without conflicting position utilities. */
  position?: 'relative' | 'absolute';
}

/** Renders one silent, non-interactive mascot, clipped inside its container. */
export function Bonny({ pose = 'regia', stage = 'hero', className, position = 'relative' }: BonnyProps) {
  return <div aria-hidden="true" data-bonny-stage className={cn('pointer-events-none isolate shrink-0 overflow-hidden', stage === 'access' || position === 'absolute' ? 'absolute' : 'relative', stage === 'empty' ? 'h-[108px] w-[200px]' : stage === 'access' ? 'inset-x-0 bottom-0 mx-auto h-[148px] w-44 lg:h-[250px] lg:w-[300px]' : 'h-[124px] w-[150px]', className)}>
    <span className={cn('absolute -z-10 rounded-full', stage === 'empty' ? 'inset-x-0 bottom-0 h-7 bg-accent-container' : stage === 'access' ? 'inset-x-0 top-7 aspect-square bg-accent-container-strong lg:top-[49px] lg:bg-white' : 'inset-x-0 top-5 aspect-square bg-accent-container-strong lg:top-6')} />
    <img src={POSES[pose]} alt="" className={cn('absolute left-1/2 max-w-none -translate-x-1/2 object-contain', stage === 'empty' ? 'top-0 h-24 w-[168px]' : stage === 'access' ? cn('-bottom-[22px] h-[150px] lg:-bottom-[23px] lg:h-[240px]', pose === 'celebra' ? 'w-[88px] lg:w-[141px]' : 'w-[107px] lg:w-[171px]') : pose === 'celebra' ? '-bottom-[18px] h-[126px] w-[74px]' : '-bottom-[18px] h-[126px] w-[90px] lg:-bottom-[14px] lg:h-[106px] lg:w-[76px]')} />
  </div>;
}
