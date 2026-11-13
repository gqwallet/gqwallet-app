/**
 * Shared semantic chart colors and data contracts.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Semantic palette entry used by a chart segment. */
export type ChartColor = '1' | '2' | '3' | '4' | '5' | '6' | 'positive' | 'negative' | 'projection' | 'neutral' | 'grid';

/** One labeled value supplied to a chart. */
export interface ChartSegment {
  /** Accessible segment label. */
  label: string;
  /** Nonnegative amount or percentage, in one shared unit. */
  value: number;
  /** Semantic design-system color. */
  color: ChartColor;
}

/** Runtime chart paints reference the global Figma tokens. */
export const CHART_COLORS: Record<ChartColor, string> = {
  '1': 'var(--color-chart-1)', '2': 'var(--color-chart-2)', '3': 'var(--color-chart-3)',
  '4': 'var(--color-chart-4)', '5': 'var(--color-chart-5)', '6': 'var(--color-chart-6)',
  grid: 'var(--color-chart-grid)',
  positive: 'var(--color-chart-positive)', negative: 'var(--color-chart-negative)',
  projection: 'var(--color-chart-projection)', neutral: 'var(--color-chart-neutral)',
};

/** Ordered categorical palette, repeated only when the input has more than six categories. */
export const CHART_PALETTE: ChartColor[] = ['1', '2', '4', '3', 'neutral', '5'];
