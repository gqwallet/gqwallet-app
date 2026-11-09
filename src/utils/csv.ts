/**
 * CSV record parsing for export previews.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Parses RFC 4180 records, preserving quoted commas, escaped quotes and embedded newlines.
 * Empty physical lines outside quoted fields are ignored.
 *
 * @param content - CSV document, optionally with a byte order mark.
 * @returns Parsed records and their decoded fields.
 * @example
 * ```ts
 * parseCsvRecords('id,description\r\n1,"Lunch, today"\r\n');
 * ```
 */
export function parseCsvRecords(content: string): string[][] {
  const text = content.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let isQuoted = false;
  let hasContent = false;
  const finishRecord = () => {
    if (hasContent) records.push([...record, field]);
    record = [];
    field = '';
    hasContent = false;
  };
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      hasContent = true;
      if (isQuoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
    } else if (character === ',' && !isQuoted) {
      record.push(field);
      field = '';
      hasContent = true;
    } else if ((character === '\r' || character === '\n') && !isQuoted) {
      finishRecord();
      if (character === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      field += character;
      hasContent = true;
    }
  }
  finishRecord();
  return records;
}
