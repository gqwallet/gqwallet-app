/**
 * Surface card with an optional header, the main content container of every page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { InformationButton } from '@/components/ui/InformationButton';
import { cn } from '@/utils/cn';

/** Props of {@link Card}. */
export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /** Title rendered by a section header. */
  title?: string;
  /** Element on the right of the title, usually a ghost button. */
  action?: ReactNode;
  /** Contextual explanation for this financial summary. */
  informationTopic?: string;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a white card with subtle border, 14 px radius and elevation.
 *
 * @example
 * ```tsx
 * <Card title={title} action={<Button variant="ghost" label={actionLabel} />}>…</Card>
 * ```
 */
export function Card({ children, title, action, className, informationTopic }: CardProps) {
  return (
    <section className={cn('min-w-0 rounded-lg border border-line-subtle bg-surface-card p-4 shadow-card lg:p-6', className)}>
      {(title || action || informationTopic) && (
        <header className="mb-4 flex min-h-10 items-center justify-between gap-2">
          {title && <h2 className="min-w-0 flex-1 text-title [overflow-wrap:anywhere]">{title}</h2>}
          {informationTopic && <InformationButton topic={informationTopic} />}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
