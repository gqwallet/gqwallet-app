/**
 * Title block of a page with optional subtitle and actions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { InformationButton } from '@/components/ui/InformationButton';
import { IconButton } from '@/components/ui';

/** Props of {@link PageHeader}. */
export interface PageHeaderProps {
  /** Page title; on small screens the mobile header already shows it. */
  title: string;
  /** Information topic for this initial module. */
  informationTopic?: string;
  /** Text below the title. */
  subtitle?: ReactNode;
  /** Buttons on the right (below on small screens). */
  actions?: ReactNode;
  /** Breadcrumb trail shown above the title, e.g. `Dashboard / Disponible`. */
  breadcrumb?: string;
  /** Shows a back button that calls this handler. */
  onBack?: () => void;
  /** Layout utilities. */
  className?: string;
  /** Keeps the breadcrumb visible inside a mobile detail page. */
  showMobileBreadcrumb?: boolean;
  /** Stacks long action labels on phones while keeping desktop actions inline. */
  stackActionsOnMobile?: boolean;
}

/**
 * Renders the page heading; the title is hidden on small screens where the mobile header shows it.
 *
 * @example
 * ```tsx
 * <PageHeader title="Movimientos" subtitle="Junio 2026" actions={<Button label="Nuevo movimiento" icon="add" />} />
 * ```
 */
export function PageHeader({ title, subtitle, actions, breadcrumb, onBack, className, informationTopic, showMobileBreadcrumb = false, stackActionsOnMobile = false }: PageHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:gap-4 lg:justify-between', !subtitle && !onBack && !actions && 'hidden lg:flex', className)}>
      <div className={cn("min-w-0 flex-1 items-start gap-2", subtitle || onBack || showMobileBreadcrumb ? "flex" : "hidden lg:flex")}>
        {onBack && <IconButton icon="arrow_back" label="Volver" onClick={onBack} className="-ml-2" />}
        <div className={cn('min-w-0 flex flex-1 flex-col', showMobileBreadcrumb ? 'gap-3 lg:gap-1' : 'gap-1')}>
          {breadcrumb && <p className={cn('text-caption text-content-muted', !showMobileBreadcrumb && 'hidden lg:block')}>{breadcrumb}</p>}
          <div className="hidden items-center justify-between gap-2 lg:flex"><h1 className="hidden break-words text-headline lg:block">{title}</h1>{informationTopic && <InformationButton topic={informationTopic} />}</div>
          {subtitle && <div className="text-body text-content-secondary">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className={cn('flex flex-wrap lg:[&>*]:flex-none', stackActionsOnMobile ? 'flex-col gap-2 [&>*]:flex-none lg:flex-row lg:gap-3' : 'gap-3 [&>*]:flex-1')}>{actions}</div>}
    </div>
  );
}
