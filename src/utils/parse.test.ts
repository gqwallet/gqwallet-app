/**
 * Tests of the form parsers.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { hasTwoDecimalsAtMost, isEmail, isStrongPassword, parseAmount } from '@/utils/parse';

describe('parse', () => {
  it('parses amounts with separators and symbols', () => {
    expect(parseAmount('8,500.50')).toBe(8500.5);
    expect(parseAmount('S/ 99')).toBe(99);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
  it('limits decimals', () => {
    expect(hasTwoDecimalsAtMost(1.23)).toBe(true);
    expect(hasTwoDecimalsAtMost(1.234)).toBe(false);
  });
  it('validates passwords and emails', () => {
    expect(isStrongPassword('abc12345')).toBe(true);
    expect(isStrongPassword('abcdefgh')).toBe(false);
    expect(isEmail('ana@correo.pe')).toBe(true);
    expect(isEmail('ana@correo')).toBe(false);
  });
});

