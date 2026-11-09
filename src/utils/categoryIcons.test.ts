/**
 * Tests of the category icon utility.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { categoryIcon } from '@/utils/categoryIcons';

describe('categoryIcon', () => {
  it('covers the income seed', () => expect(categoryIcon('Sueldo')).toBe('payments'));
});
