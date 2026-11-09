/**
 * Tests of the download utilities.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it, vi } from 'vitest';
import { downloadText, exportFileName, fileNameFromDisposition } from '@/utils/download';

describe('exportFileName', () => {
  it('follows Rule B-11', () => expect(exportFileName('movimientos', '2026-01-01', '2026-12-31')).toBe('gqwallet_movimientos_2026-01-01_2026-12-31.csv'));
});

describe('downloadText', () => {
  it('clicks a temporary link with the file name and releases the URL', () => {
    const create = vi.fn(() => 'blob:url');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadText('a.csv', 'x,y');
    expect(create).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith('blob:url');
  });
});

describe('fileNameFromDisposition', () => {
  it.each([
    ['attachment; filename="server.csv"', 'server.csv'],
    ['attachment; filename=server.csv', 'server.csv'],
    ["attachment; filename=plain.csv; filename*=UTF-8''gastos%20Per%C3%BA.csv", 'gastos Perú.csv'],
    ["attachment; filename*=UTF-8'es'Per%C3%BA.csv", 'Perú.csv'],
    ['attachment; FILENAME="semi;colon.csv"', 'semi;colon.csv'],
    ["attachment; filename=plain.csv; filename*=UTF-8''bad%ZZ.csv", 'plain.csv'],
    ["attachment; filename*=UTF-8''bad%ZZ.csv", null],
    ['attachment; filename=""', null],
    ['attachment', null],
    [undefined, null],
  ])('reads %s as %s', (header, expected) => {
    expect(fileNameFromDisposition(header)).toBe(expected);
  });
});
