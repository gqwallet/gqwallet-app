/**
 * Triggers incremental loading while retaining a keyboard accessible fallback.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

/** Props for the pagination boundary. */
export interface InfiniteScrollSentinelProps {
  /** Whether another page exists. */
  hasMore: boolean;
  /** Whether a request is already running. */
  isLoadingMore: boolean;
  /** Requests the next page. */
  loadMore: () => void;
  /** Scroll direction of the collection. */
  axis?: 'vertical' | 'horizontal';
  /** Optional scrolling container; defaults to the viewport. */
  root?: Element | null;
  /** Disables automatic retries after a failed request. */
  error?: boolean;
}

/**
 * Observes either scroll axis and keeps a manual load button available.
 *
 * @example
 * ```tsx
 * <InfiniteScrollSentinel hasMore={hasMore} isLoadingMore={isLoadingMore} loadMore={loadMore} />
 * ```
 */
export function InfiniteScrollSentinel({ hasMore, isLoadingMore, loadMore, axis = 'vertical', root = null, error = false }: InfiniteScrollSentinelProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || isLoadingMore || error || typeof IntersectionObserver === 'undefined' || !sentinel.current) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    }, { root });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, root, axis, error]);
  if (!hasMore && !isLoadingMore) return null;
  return <div ref={sentinel} data-axis={axis} className="flex shrink-0 items-center justify-center gap-3 p-3">
    {isLoadingMore && <span role="status" className="text-body text-content-secondary">Cargando más…</span>}
    <Button label="Ver más" variant="ghost" disabled={isLoadingMore} onClick={loadMore} />
  </div>;
}
