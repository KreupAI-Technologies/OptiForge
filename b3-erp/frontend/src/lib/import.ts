/**
 * Client-side CSV import helpers.
 *
 * Companion to `export.ts`: turns a user-selected CSV `File` into an array of
 * flat objects keyed by the header row. Dependency-free and browser-only
 * (guards against SSR). Handles quoted fields, embedded commas/newlines, and
 * escaped double-quotes ("") per RFC 4180.
 */

export type CsvRow = Record<string, string>;

/**
 * Parse raw CSV text into an array of records keyed by the header row.
 * Empty lines are ignored; extra columns beyond the header are dropped;
 * missing columns become empty strings.
 */
export function parseCsvText(text: string): CsvRow[] {
  const records = tokenizeCsv(text);
  if (records.length === 0) return [];

  const header = records[0].map((h) => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < records.length; i++) {
    const cells = records[i];
    // Skip fully blank lines.
    if (cells.length === 1 && cells[0].trim() === '') continue;

    const row: CsvRow = {};
    header.forEach((key, idx) => {
      if (!key) return;
      row[key] = (cells[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Read a CSV File (from an <input type="file">) and parse it into objects.
 * The first row is treated as the header.
 */
export function parseCsv(file: File): Promise<CsvRow[]> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('parseCsv is only available in the browser'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        resolve(parseCsvText(text));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Tokenize CSV text into a 2D array of cells, respecting quoted fields.
 */
function tokenizeCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  // Normalize line endings; strip a leading BOM if present.
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\r') {
      // handled together with \n; ignore standalone \r
    } else {
      field += ch;
    }
  }

  // Flush the last field/row (no trailing newline).
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Programmatically prompt the user to pick a CSV file, then parse it.
 * Resolves to null if the user cancels the picker.
 */
export function pickAndParseCsv(): Promise<CsvRow[] | null> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('pickAndParseCsv is only available in the browser'));
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      parseCsv(file).then(resolve).catch(reject);
    };
    input.click();
  });
}
