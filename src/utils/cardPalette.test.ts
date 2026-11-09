/**
 * Tests of the pure utilities.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { cardTone, CARD_COLORS } from '@/utils/cardPalette';
import { categoryIcon } from '@/utils/categoryIcons';
import { cn } from '@/utils/cn';

describe('cardPalette', () => {
  it('maps a stored color to its tone, ignoring case', () => {
    expect(cardTone('#338033')).toBe('success');
    expect(cardTone('#b24d1a')).toBe('warning');
  });
  it('falls back to primary for unknown colors', () => {
    expect(cardTone('#000000')).toBe('primary');
    expect(cardTone(null)).toBe('primary');
  });
  it('offers the five colors of the mockups', () => {
    expect(CARD_COLORS.map((color) => color.label)).toEqual(['Índigo', 'Verde', 'Naranja', 'Rojo', 'Amarillo']);
  });
});

describe('categoryIcon', () => {
  it('returns the icon of a seeded category', () => expect(categoryIcon('Movilidad')).toBe('directions_car'));
  it('returns a tag for user categories', () => expect(categoryIcon('Viajes')).toBe('sell'));
});

describe('cn', () => {
  it('joins truthy classes only', () => expect(cn('a', false, null, 'b', undefined)).toBe('a b'));
});

