/**
 * Packaging Service
 * Typed API client for the project-scoped packaging endpoints
 * (NestJS domain backend, /api/v1/packaging).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_DOMAIN_API_URL ||
  'http://localhost:3001/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Packaging API error ${response.status}`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : []) as T;
}

export interface PackagingMaterialDto {
  id: string;
  projectId?: string;
  name: string;
  category: string;
  currentStock: number;
  required: number;
  unit: string;
  status: string;
}

export interface PackagingJobDto {
  id: string;
  projectId?: string;
  woNumber?: string;
  productName?: string;
  quantity?: number;
  status?: string;
  packingTeam?: string;
  startDate?: string;
  completionDate?: string;
  materialsUsed?: any;
}

export interface PackagingStagingDto {
  id: string;
  projectId?: string;
  woNumber?: string;
  productName?: string;
  quantity?: number;
  packingComplete?: boolean;
  shippingBillNumber?: string;
  status?: string;
  stagedDate?: string;
  customerName?: string;
  deliveryAddress?: string;
  transportMethod?: string;
}

export interface PackagingShippingBillDto {
  id: string;
  projectId?: string;
  billNumber: string;
  orderNumber?: string;
  customerName?: string;
  destination?: string;
  items?: any[];
  totalPackages?: number;
  totalWeight?: string;
  status?: string;
}

function qs(projectId?: string): string {
  return projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
}

export class PackagingService {
  // Materials
  static getMaterials(projectId?: string): Promise<PackagingMaterialDto[]> {
    return request<PackagingMaterialDto[]>(`/packaging/materials${qs(projectId)}`);
  }
  static createMaterial(data: Partial<PackagingMaterialDto>): Promise<PackagingMaterialDto> {
    return request<PackagingMaterialDto>(`/packaging/materials`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jobs (operations)
  static getJobs(projectId?: string): Promise<PackagingJobDto[]> {
    return request<PackagingJobDto[]>(`/packaging/jobs${qs(projectId)}`);
  }
  static createJob(data: Partial<PackagingJobDto>): Promise<PackagingJobDto> {
    return request<PackagingJobDto>(`/packaging/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  static updateJob(id: string, data: Partial<PackagingJobDto>): Promise<PackagingJobDto> {
    return request<PackagingJobDto>(`/packaging/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Staging
  static getStaging(projectId?: string): Promise<PackagingStagingDto[]> {
    return request<PackagingStagingDto[]>(`/packaging/staging${qs(projectId)}`);
  }
  static updateStaging(id: string, data: Partial<PackagingStagingDto>): Promise<PackagingStagingDto> {
    return request<PackagingStagingDto>(`/packaging/staging/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Shipping bills
  static getShippingBills(projectId?: string): Promise<PackagingShippingBillDto[]> {
    return request<PackagingShippingBillDto[]>(
      `/packaging/shipping-bills${qs(projectId)}`,
    );
  }
  static createShippingBill(
    data: Partial<PackagingShippingBillDto>,
  ): Promise<PackagingShippingBillDto> {
    return request<PackagingShippingBillDto>(`/packaging/shipping-bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const packagingService = PackagingService;
