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
}

/**
 * Renders the page heading; the title is hidden on small screens where the mobile header shows it.
 *
 * @example
 * ```tsx
 * <PageHeader title="Movimientos" subtitle="Junio 2026" actions={<Button label="Nuevo movimiento" icon="add" />} />
 * ```
 */
export function PageHeader({ title, subtitle, actions, breadcrumb, onBack, className, informationTopic }: PageHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-start lg:justify-between', !subtitle && !onBack && !actions && 'hidden lg:flex', className)}>
      <div className={cn("min-w-0 items-start gap-2", subtitle || onBack ? "flex" : "hidden lg:flex")}>
        {onBack && <IconButton icon="arrow_back" label="Volver" onClick={onBack} className="-ml-2" />}
        <div className="min-w-0 flex flex-col gap-1">
          {breadcrumb && <p className="hidden text-caption text-content-muted lg:block">{breadcrumb}</p>}
          <h1 className="hidden break-words text-headline lg:block">{title}</h1>
          {subtitle && <div className="text-body text-content-secondary">{subtitle}</div>}
        </div>
      </div>
      {informationTopic && <span className="hidden lg:ml-auto lg:-mt-2 lg:block"><InformationButton topic={informationTopic} /></span>}
      {actions && <div className="flex flex-wrap gap-3 [&>*]:flex-1 lg:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}
