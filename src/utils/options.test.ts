/**
 * Tests of the enum labels.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { MOOD_LABEL, toOptions } from '@/utils/options';

describe('options', () => {
  it('keeps the eight moods of Annex A', () => expect(Object.values(MOOD_LABEL)).toHaveLength(8));
  it('turns labels into options in order', () => expect(toOptions({ A: 'a', B: 'b' })).toEqual([{ value: 'A', label: 'a' }, { value: 'B', label: 'b' }]));
});
