/**
 * Tests observer pagination and its accessible manual fallback.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';

let observers: ObserverMock[] = [];

class ObserverMock implements IntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  readonly root: Element | Document | null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  readonly observe = vi.fn<(target: Element) => void>();
  readonly unobserve = vi.fn<(target: Element) => void>();
  readonly disconnect = vi.fn<() => void>();
  readonly takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = options?.root ?? null;
    observers.push(this);
  }
}

beforeEach(() => {
  observers = [];
  vi.stubGlobal('IntersectionObserver', ObserverMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('InfiniteScrollSentinel', () => {
  it.each(['vertical', 'horizontal'] as const)('loads intersecting %s lists and disconnects on unmount', (axis) => {
    const loadMore = vi.fn();
    const root = document.createElement('div');
    const { unmount } = render(<InfiniteScrollSentinel hasMore isLoadingMore={false} loadMore={loadMore} axis={axis} root={root} />);
    const boundary = screen.getByRole('button', { name: 'Ver más' }).parentElement;
    expect(boundary).toHaveAttribute('data-axis', axis);
    expect(observers).toHaveLength(1);
    const observer = observers[0];
    expect(observer.root).toBe(root);
    expect(observer.observe).toHaveBeenCalledWith(boundary);
    observer.callback([{ isIntersecting: false }] as IntersectionObserverEntry[], observer);
    expect(loadMore).not.toHaveBeenCalled();
    observer.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], observer);
    expect(loadMore).toHaveBeenCalledOnce();
    unmount();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it('retains a working manual button without IntersectionObserver support', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const loadMore = vi.fn();
    render(<InfiniteScrollSentinel hasMore isLoadingMore={false} loadMore={loadMore} />);
    const button = screen.getByRole('button', { name: 'Ver más' });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(loadMore).toHaveBeenCalledOnce();
    expect(observers).toHaveLength(0);
  });

  it('announces loading, blocks repeated manual requests and stops observing', () => {
    const loadMore = vi.fn();
    const { rerender } = render(<InfiniteScrollSentinel hasMore isLoadingMore={false} loadMore={loadMore} />);
    const observer = observers[0];
    rerender(<InfiniteScrollSentinel hasMore isLoadingMore loadMore={loadMore} />);
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando más…');
    expect(screen.getByRole('button', { name: 'Ver más' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Ver más' }));
    expect(loadMore).not.toHaveBeenCalled();
    expect(observers).toHaveLength(1);
  });

  it('allows manual retries after a failure without automatic retry loops', () => {
    const loadMore = vi.fn();
    render(<InfiniteScrollSentinel hasMore isLoadingMore={false} loadMore={loadMore} error />);
    expect(observers).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Ver más' }));
    expect(loadMore).toHaveBeenCalledOnce();
  });

  it('removes the sentinel and disconnects when all pages are loaded', () => {
    const loadMore = vi.fn();
    const { rerender } = render(<InfiniteScrollSentinel hasMore isLoadingMore={false} loadMore={loadMore} />);
    const observer = observers[0];
    rerender(<InfiniteScrollSentinel hasMore={false} isLoadingMore={false} loadMore={loadMore} />);
    expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
