/**
 * reports-data.service
 * ---------------------
 * Thin, read-only helper used by the report detail pages under
 * `app/(modules)/reports/**` to pull live domain data from the NestJS
 * domain backend (port 3001, `/api/v1`).
 *
 * Report pages historically rendered hardcoded const arrays; this helper lets
 * each page fetch the best-matching domain endpoint instead. It always resolves
 * to an array (never throws for an empty result), so pages can render a clean
 * loading / empty state without special-casing. Non-OK HTTP responses throw so
 * the caller can surface an error banner.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * GET a domain endpoint and return a plain array of records.
 *
 * Handles the three response envelopes the domain backend uses:
 *   - a bare array            -> returned as-is
 *   - `{ data: [...] }`       -> `.data`
 *   - `{ items: [...] }`      -> `.items`
 * Anything else resolves to `[]`.
 *
 * @param path  Endpoint path relative to `/api/v1` (leading slash optional),
 *              e.g. `production/work-order` or `/hr/employees`.
 */
export async function fetchDomainList<T = Record<string, unknown>>(
  path: string,
): Promise<T[]> {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  const url = `${API_BASE_URL}/${clean}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to load "${clean}" (${res.status})`);
  }

  const body = (await res.json()) as unknown;
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}
