/**
 * Tests of RFC 4180 fields and logical records.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import { parseCsvRecords } from '@/utils/csv';

it('preserves quoted commas, CRLFs, escaped quotes and empty fields', () => {
  expect(parseCsvRecords('\uFEFFid,"description, notes",amount\r\n1,"Line one\r\nLine ""two""",10\r\n2,,20\r\n')).toEqual([
    ['id', 'description, notes', 'amount'], ['1', 'Line one\r\nLine "two"', '10'], ['2', '', '20'],
  ]);
});

it('accepts LF records, final records without a newline and quoted empty records', () => {
  expect(parseCsvRecords('a\n\n""\n"line\nbreak"')).toEqual([['a'], [''], ['line\nbreak']]);
  expect(parseCsvRecords('')).toEqual([]);
  expect(parseCsvRecords('\r\n\n')).toEqual([]);
  expect(parseCsvRecords('a,b\r\n1,')).toEqual([['a', 'b'], ['1', '']]);
});
