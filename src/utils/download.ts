/**
 * Saves text content as a file in the browser.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Triggers the download of a text file.
 *
 * @param fileName - Name proposed to the browser.
 * @param content - File content.
 * @param type - MIME type.
 * @returns Nothing.
 * @example
 * ```ts
 * downloadText('gqwallet_movimientos_2026-06-01_2026-06-30.csv', csv);
 * ```
 */
export function downloadText(fileName: string, content: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Builds the export file name of Rule B-11: `gqwallet_<entity>_<from>_<to>.csv`.
 *
 * @param entity - Entity, e.g. `movimientos`.
 * @param from - Start date (ISO date).
 * @param to - End date (ISO date).
 * @returns The file name.
 * @example
 * ```ts
 * exportFileName('flujo_caja', '2026-01-01', '2026-12-31'); // 'gqwallet_flujo_caja_2026-01-01_2026-12-31.csv'
 * ```
 */
export function exportFileName(entity: string, from: string, to: string): string {
  return `gqwallet_${entity}_${from}_${to}.csv`;
}

/**
 * Reads the server filename, preferring the UTF-8 extended parameter.
 *
 * @param disposition - Content-Disposition header, when exposed by the server.
 * @returns The filename or null when no usable parameter exists.
 * @example
 * ```ts
 * fileNameFromDisposition('attachment; filename="movimientos.csv"'); // 'movimientos.csv'
 * ```
 */
export function fileNameFromDisposition(disposition?: string | null): string | null {
  if (!disposition) return null;
  const extended = /(?:^|;)\s*filename\*\s*=\s*(?:"([^"\r\n]*)"|([^;\r\n]*))/i.exec(disposition);
  const encoded = (extended?.[1] ?? extended?.[2])?.trim();
  if (encoded) {
    const utf8 = /^UTF-8'[^']*'(.*)$/i.exec(encoded);
    if (utf8) {
      try {
        const decoded = decodeURIComponent(utf8[1]);
        if (decoded.trim() && !/[\r\n\0]/.test(decoded)) return decoded;
      } catch {
        // A malformed extended value may still have a valid plain fallback.
      }
    }
  }
  const plain = /(?:^|;)\s*filename\s*=\s*(?:"((?:\\.|[^"\r\n])*)"|([^;\r\n]*))/i.exec(disposition);
  const fileName = (plain?.[1]?.replace(/\\(.)/g, '$1') ?? plain?.[2])?.trim();
  return fileName && !/[\r\n\0]/.test(fileName) ? fileName : null;
}
