// Presentation metadata for the transaction categories the backend owns as a fixed
// Category enum (GET /api/v1/transactions/categories returns the codes). The Spanish
// label and color are a frontend concern — the backend stays language/UI-agnostic.
export type CategoryCode =
  | 'FOOD'
  | 'TRANSPORT'
  | 'ENTERTAINMENT'
  | 'SERVICES'
  | 'HEALTH'
  | 'OTHER';

export interface CategoryPresentation {
  code: CategoryCode;
  label: string;
  colorVar: string; // CSS custom property from the Tailwind theme
}

export const CATEGORY_PRESENTATION: Record<CategoryCode, CategoryPresentation> = {
  FOOD: { code: 'FOOD', label: 'Alimentación', colorVar: 'var(--color-cat-food)' },
  TRANSPORT: { code: 'TRANSPORT', label: 'Transporte', colorVar: 'var(--color-cat-transport)' },
  ENTERTAINMENT: { code: 'ENTERTAINMENT', label: 'Entretenimiento', colorVar: 'var(--color-cat-entertainment)' },
  SERVICES: { code: 'SERVICES', label: 'Servicios', colorVar: 'var(--color-cat-services)' },
  HEALTH: { code: 'HEALTH', label: 'Salud', colorVar: 'var(--color-cat-health)' },
  OTHER: { code: 'OTHER', label: 'Otros', colorVar: 'var(--color-cat-other)' },
};

// A card payment carries no category (FR-018), so both accessors tolerate null and fall
// back to the neutral presentation rather than the caller having to guard every call site.
export function categoryLabel(code: CategoryCode | null): string {
  return code ? (CATEGORY_PRESENTATION[code]?.label ?? code) : 'Sin categoría';
}

export function categoryColor(code: CategoryCode | null): string {
  return code ? (CATEGORY_PRESENTATION[code]?.colorVar ?? 'var(--color-cat-other)') : 'var(--color-cat-other)';
}
