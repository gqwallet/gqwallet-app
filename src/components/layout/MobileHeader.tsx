/**
 * Top bar of small screens: menu button, page title and product mark.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { InformationButton } from '@/components/ui/InformationButton';
import { IconButton } from '@/components/ui';
import { Brand } from '@/components/layout/Brand';

/** Props of {@link MobileHeader}. */
export interface MobileHeaderProps {
  /** Title of the current page. */
  title: string;
  /** Initial-module information topic, when applicable. */
  informationTopic?: string;
  /** Called when the menu button is pressed. */
  onOpenMenu: () => void;
}

/**
 * Renders the sticky 56 px header shown below the large breakpoint.
 *
 * @example
 * ```tsx
 * <MobileHeader title="Dashboard" onOpenMenu={open} />
 * ```
 */
export function MobileHeader({ title, onOpenMenu, informationTopic }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line-subtle bg-surface-card pr-4 pl-2 lg:hidden">
      <IconButton icon="menu" label="Abrir menú" onClick={onOpenMenu} />
      <h1 className="min-w-0 flex-1 truncate text-title">{title}</h1>
      {informationTopic && <InformationButton topic={informationTopic} />}
      <Brand isMarkOnly className="[&>span]:size-8" />
    </header>
  );
}
