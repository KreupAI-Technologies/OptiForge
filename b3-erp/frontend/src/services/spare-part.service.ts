/**
 * Spare Part Service
 * Handles after-sales spare-parts catalog API operations.
 * Backend: NestJS @Controller('after-sales') -> @Get('spare-parts')
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface SparePartFilters {
  category?: string;
  search?: string;
}

export class SparePartService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all spare parts. Returns the raw ORM shape; callers should map
   * defensively into their own view models.
   */
  static async getAllSpareParts(filters?: SparePartFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString();
    const data = await this.request<any>(`/after-sales/spare-parts${qs ? `?${qs}` : ''}`);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }
}
