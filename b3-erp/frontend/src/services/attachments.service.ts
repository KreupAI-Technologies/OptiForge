/**
 * Attachments Service
 * Thin fetch wrapper for the generic file-attachment capability on the NestJS
 * domain backend (AttachmentsModule) under /api/v1/attachments.
 *
 * Files are uploaded as multipart/form-data (FormData) and linked to an owning
 * record via the (entityType, entityId) pair. Metadata is returned as raw JSON
 * (no { data } envelope).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_DOMAIN_API_URL ||
  'http://localhost:3001/api/v1';

/** Resolve the active company id (falls back to the seeded demo tenant). */
function getCompanyId(): string {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.companyId) return String(u.companyId);
      }
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'test';
}

export interface Attachment {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  uploadedBy: string | null;
  createdAt: string;
}

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string>[];
}

function companyHeaders(): Record<string, string> {
  const companyId = getCompanyId();
  return { 'x-company-id': companyId };
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.message || body?.error || detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(`Attachments API error ${res.status}: ${detail}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : ([] as unknown)) as T;
}

export class AttachmentsService {
  /** Upload a single file linked to (entityType, entityId). */
  static async upload(
    file: File,
    entityType: string,
    entityId: string,
    uploadedBy?: string,
  ): Promise<Attachment> {
    const form = new FormData();
    form.append('file', file);
    form.append('entityType', entityType);
    form.append('entityId', entityId);
    if (uploadedBy) form.append('uploadedBy', uploadedBy);

    const res = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      credentials: 'include',
      headers: companyHeaders(), // no Content-Type: browser sets the multipart boundary
      body: form,
    });
    return asJson<Attachment>(res);
  }

  /** List attachments for an owning record. */
  static async list(entityType: string, entityId: string): Promise<Attachment[]> {
    const url = `${API_BASE_URL}/attachments?entityType=${encodeURIComponent(
      entityType,
    )}&entityId=${encodeURIComponent(entityId)}`;
    const res = await fetch(url, { credentials: 'include', headers: companyHeaders() });
    return asJson<Attachment[]>(res);
  }

  /** Absolute URL to stream/download a stored file. */
  static downloadUrl(id: string): string {
    return `${API_BASE_URL}/attachments/${id}/download`;
  }

  /** Delete an attachment (row + file). */
  static async remove(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/attachments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: companyHeaders(),
    });
    return asJson<{ success: boolean }>(res);
  }

  /** Parse an uploaded spreadsheet (xlsx/xls/csv) into JSON rows (no persist). */
  static async parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/attachments/parse-spreadsheet`, {
      method: 'POST',
      credentials: 'include',
      headers: companyHeaders(),
      body: form,
    });
    return asJson<ParsedSpreadsheet>(res);
  }
}
