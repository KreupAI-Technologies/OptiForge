// Procurement Calendar Events service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL.
// Endpoint source of truth: procurement/controllers/procurement-calendar-event.controller.ts
//   @Controller('procurement/calendar-events')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ProcurementCalendarEvent {
  id: string;
  companyId: string;
  title: string;
  type: string;
  eventDate: string;
  time?: string;
  vendor?: string;
  description?: string;
  location?: string;
  items?: number;
  value?: number;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertCalendarEventPayload {
  companyId?: string;
  title: string;
  type?: string;
  eventDate: string;
  time?: string;
  vendor?: string;
  description?: string;
  location?: string;
  items?: number;
  value?: number;
  status?: string;
  priority?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const procurementCalendarService = {
  // GET /procurement/calendar-events
  async getEvents(type?: string): Promise<ProcurementCalendarEvent[]> {
    const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    const data = await request<any>(`/procurement/calendar-events${qs}`);
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  // POST /procurement/calendar-events
  async createEvent(
    payload: UpsertCalendarEventPayload,
  ): Promise<ProcurementCalendarEvent> {
    return request<ProcurementCalendarEvent>('/procurement/calendar-events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // PUT /procurement/calendar-events/:id
  async updateEvent(
    id: string,
    payload: Partial<UpsertCalendarEventPayload>,
  ): Promise<ProcurementCalendarEvent> {
    return request<ProcurementCalendarEvent>(`/procurement/calendar-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // DELETE /procurement/calendar-events/:id
  async deleteEvent(id: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/procurement/calendar-events/${id}`, {
      method: 'DELETE',
    });
  },
};
