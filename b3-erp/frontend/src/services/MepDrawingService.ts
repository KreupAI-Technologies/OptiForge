const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface MepDrawing {
  id: string;
  companyId?: string;
  projectId: string;
  drawingName?: string;
  drawingNumber?: string;
  discipline?: string;
  status?: string;
  revision?: string;
  fileUrl?: string | null;
  sharedWith?: any;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-company-id': process.env.NEXT_PUBLIC_COMPANY_ID || 'test',
  };
}

class MepDrawingService {
  async list(projectId: string): Promise<MepDrawing[]> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/project-management/mep?projectId=${encodeURIComponent(projectId)}`,
        { credentials: 'include', headers: headers(), cache: 'no-store' },
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data ?? [];
    } catch {
      return [];
    }
  }

  async create(data: Partial<MepDrawing>): Promise<MepDrawing> {
    const res = await fetch(`${API_BASE_URL}/api/project-management/mep`, {
      credentials: 'include',
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json?.data;
  }

  async update(id: string, data: Partial<MepDrawing>): Promise<MepDrawing> {
    const res = await fetch(`${API_BASE_URL}/api/project-management/mep/${id}`, {
      credentials: 'include',
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json?.data;
  }

  async remove(id: string): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/project-management/mep/${id}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: headers(),
    });
    const json = await res.json();
    return json?.data;
  }
}

export const mepDrawingService = new MepDrawingService();
