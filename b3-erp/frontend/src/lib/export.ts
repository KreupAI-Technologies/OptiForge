/**
 * Client-side data export helpers.
 *
 * Replaces the console.log('Export') stubs across the app with real,
 * dependency-free CSV/JSON downloads and a print helper. Works in the browser
 * only (guards against SSR).
 */

type Row = Record<string, unknown>;

function download(filename: string, content: string, mime: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') value = JSON.stringify(value);
  const s = String(value);
  // Quote if it contains a comma, quote, or newline; escape embedded quotes.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Export an array of flat objects to a CSV file.
 * Columns are inferred from the union of keys, or provided explicitly.
 */
export function exportToCsv(
  filename: string,
  rows: readonly object[],
  columns?: { key: string; label?: string }[],
): void {
  const data: Row[] = Array.isArray(rows) ? (rows as Row[]) : [];
  const cols =
    columns && columns.length
      ? columns
      : Array.from(
          data.reduce<Set<string>>((set, r) => {
            Object.keys(r || {}).forEach((k) => set.add(k));
            return set;
          }, new Set<string>()),
        ).map((key): { key: string; label?: string } => ({ key }));

  const header = cols.map((c) => csvCell(c.label ?? c.key)).join(',');
  const body = data
    .map((r) => cols.map((c) => csvCell((r as Row)[c.key])).join(','))
    .join('\n');

  const name = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  download(name, `${header}\n${body}`, 'text/csv');
}

/** Export any JSON-serialisable value to a .json file. */
export function exportToJson(filename: string, data: unknown): void {
  const name = filename.endsWith('.json') ? filename : `${filename}.json`;
  download(name, JSON.stringify(data, null, 2), 'application/json');
}

/** Trigger the browser print dialog (for print/PDF-via-print buttons). */
export function printCurrentView(): void {
  if (typeof window !== 'undefined') window.print();
}
