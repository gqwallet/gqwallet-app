/**
 * Tests of the class joiner.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('returns an empty string without classes', () => expect(cn()).toBe(''));
});
