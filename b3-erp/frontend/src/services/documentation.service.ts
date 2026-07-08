/**
 * Documentation Service
 *
 * Typed client for the in-app documentation / help-center pages
 * (src/app/(modules)/documentation, /help). Talks to the NestJS domain
 * backend (port 3001, /api/v1) documentation module, which serves the
 * additive `doc_articles` read-side table. Reads resolve to an array.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

function toArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as T[];
  }
  return [];
}

export interface DocArticle {
  id: string;
  company_id?: string;
  category: string;
  title: string;
  slug: string;
  body: string;
  tags?: string | null;
  updated_at?: string;
  [key: string]: any;
}

export const DocumentationService = {
  /** All documentation articles (optionally filtered by category/search). */
  async getArticles(opts?: {
    category?: string;
    search?: string;
  }): Promise<DocArticle[]> {
    const params = new URLSearchParams();
    if (opts?.category) params.append('category', opts.category);
    if (opts?.search) params.append('search', opts.search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return toArray<DocArticle>(await getJson(`/documentation/articles${q}`));
  },

  /** A single article by slug. */
  async getArticleBySlug(slug: string): Promise<DocArticle | null> {
    try {
      return await getJson<DocArticle>(
        `/documentation/articles/${encodeURIComponent(slug)}`,
      );
    } catch {
      return null;
    }
  },
};
