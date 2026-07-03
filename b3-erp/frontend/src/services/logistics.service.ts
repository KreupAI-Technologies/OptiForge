/**
 * Logistics Service
 * Typed API client for logistics domain endpoints (NestJS, port 3001).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// Delivery Coordination
// ============================================================================

export interface DeliveryCoordinationDto {
  id: string;
  woNumber: string;
  customerName: string;
  siteAddress?: string;
  siteGps?: string;
  siteLandmark?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactRole?: string;
  preferredDate?: string;
  preferredTime?: string;
  timeSlot?: string;
  transportMethod?: string;
  transporter?: string;
  status?: string;
  transporterNotified?: boolean;
  siteContactNotified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Fuel Records
// ============================================================================

export interface FuelRecordDto {
  id: string;
  fuelId: string;
  vehicleId?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  driverName?: string;
  fuelType?: string;
  quantity?: number;
  unitPrice?: number;
  totalCost?: number;
  fuelStation?: string;
  location?: string;
  odometer?: number;
  previousOdometer?: number;
  distanceCovered?: number;
  fuelEfficiency?: number;
  fillType?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  filledBy?: string;
  filledDate?: string;
  filledTime?: string;
  tripId?: string | null;
  notes?: string;
  status?: string;
  verifiedBy?: string | null;
  expectedEfficiency?: number;
  efficiencyVariance?: number;
  anomalyDetected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class LogisticsService {
  static async getDeliveryCoordinations(filters?: {
    status?: string;
    transportMethod?: string;
  }): Promise<DeliveryCoordinationDto[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.transportMethod)
      params.set('transportMethod', filters.transportMethod);
    const qs = params.toString();
    return request<DeliveryCoordinationDto[]>(
      `/logistics/delivery-coordinations${qs ? `?${qs}` : ''}`,
    );
  }

  static async getFuelRecords(filters?: {
    status?: string;
    fuelType?: string;
    vehicleNumber?: string;
  }): Promise<FuelRecordDto[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.fuelType) params.set('fuelType', filters.fuelType);
    if (filters?.vehicleNumber)
      params.set('vehicleNumber', filters.vehicleNumber);
    const qs = params.toString();
    return request<FuelRecordDto[]>(
      `/logistics/fuel-records${qs ? `?${qs}` : ''}`,
    );
  }
}

export const logisticsService = LogisticsService;
