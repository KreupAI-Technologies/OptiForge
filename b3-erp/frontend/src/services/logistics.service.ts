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

  static async getTrips(filters?: {
    status?: string;
    driverId?: string;
    vehicleId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.driverId) params.set('driverId', filters.driverId);
    if (filters?.vehicleId) params.set('vehicleId', filters.vehicleId);
    const qs = params.toString();
    return request<any[]>(`/logistics/trips${qs ? `?${qs}` : ''}`);
  }

  static async getDrivers(filters?: {
    status?: string;
    availability?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.availability) params.set('availability', filters.availability);
    const qs = params.toString();
    return request<any[]>(`/logistics/drivers${qs ? `?${qs}` : ''}`);
  }

  static async getVehicles(filters?: {
    status?: string;
    vehicleType?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.vehicleType) params.set('vehicleType', filters.vehicleType);
    const qs = params.toString();
    return request<any[]>(`/logistics/vehicles${qs ? `?${qs}` : ''}`);
  }

  static async getRoutes(filters?: {
    status?: string;
    routeType?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.routeType) params.set('routeType', filters.routeType);
    const qs = params.toString();
    return request<any[]>(`/logistics/routes${qs ? `?${qs}` : ''}`);
  }

  static async getShipments(filters?: {
    status?: string;
    priority?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    const qs = params.toString();
    return request<any[]>(`/logistics/shipments${qs ? `?${qs}` : ''}`);
  }

  static async getFreightCharges(filters?: {
    status?: string;
    carrier?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.carrier) params.set('carrier', filters.carrier);
    const qs = params.toString();
    return request<any[]>(`/logistics/freight-charges${qs ? `?${qs}` : ''}`);
  }

  static async getTransportCompanies(filters?: {
    status?: string;
    transportMode?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.transportMode)
      params.set('transportMode', filters.transportMode);
    const qs = params.toString();
    return request<any[]>(
      `/logistics/transport-companies${qs ? `?${qs}` : ''}`,
    );
  }

  static async createTransportCompany(data: any): Promise<any> {
    return request<any>(`/logistics/transport-companies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateTransportCompany(id: string, data: any): Promise<any> {
    return request<any>(`/logistics/transport-companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteTransportCompany(
    id: string,
  ): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/logistics/transport-companies/${id}`,
      { method: 'DELETE' },
    );
  }

  static async getConsolidationOpportunities(): Promise<any[]> {
    return request<any[]>(`/logistics/consolidation/opportunities`);
  }

  static async getConsolidationReport(): Promise<any> {
    return request<any>(`/logistics/consolidation/report`);
  }

  static async createFreightCharge(data: any): Promise<any> {
    return request<any>(`/logistics/freight-charges`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteFreightCharge(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/logistics/freight-charges/${id}`, {
      method: 'DELETE',
    });
  }

  static async getTrackingEvents(filters?: {
    status?: string;
    eventType?: string;
    shipmentId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.eventType) params.set('eventType', filters.eventType);
    if (filters?.shipmentId) params.set('shipmentId', filters.shipmentId);
    const qs = params.toString();
    return request<any[]>(`/logistics/tracking-events${qs ? `?${qs}` : ''}`);
  }

  static async getCarrierRates(filters?: {
    carrier?: string;
    serviceType?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.carrier) params.set('carrier', filters.carrier);
    if (filters?.serviceType) params.set('serviceType', filters.serviceType);
    const qs = params.toString();
    return request<any[]>(`/logistics/carrier-rates${qs ? `?${qs}` : ''}`);
  }

  static async getCarrierContracts(filters?: {
    status?: string;
    carrier?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.carrier) params.set('carrier', filters.carrier);
    const qs = params.toString();
    return request<any[]>(`/logistics/carrier-contracts${qs ? `?${qs}` : ''}`);
  }

  static async getCrossDockOperations(filters?: {
    status?: string;
    priority?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    const qs = params.toString();
    return request<any[]>(
      `/logistics/cross-dock-operations${qs ? `?${qs}` : ''}`,
    );
  }

  static async getDockDoors(filters?: {
    status?: string;
    type?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    const qs = params.toString();
    return request<any[]>(`/logistics/dock-doors${qs ? `?${qs}` : ''}`);
  }

  static async getYardVehicles(filters?: {
    status?: string;
    vehicleType?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.vehicleType) params.set('vehicleType', filters.vehicleType);
    const qs = params.toString();
    return request<any[]>(`/logistics/yard-vehicles${qs ? `?${qs}` : ''}`);
  }

  // ==========================================================================
  // Port Master
  // ==========================================================================

  static async getPorts(filters?: {
    type?: string;
    status?: string;
  }): Promise<PortDto[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return request<PortDto[]>(`/logistics/ports${qs ? `?${qs}` : ''}`);
  }

  static async createPort(data: Partial<PortDto>): Promise<PortDto> {
    return request<PortDto>(`/logistics/ports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePort(
    id: string,
    data: Partial<PortDto>,
  ): Promise<PortDto> {
    return request<PortDto>(`/logistics/ports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deletePort(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/logistics/ports/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // Packaging Types
  // ==========================================================================

  static async getPackagingTypes(filters?: {
    type?: string;
    status?: string;
  }): Promise<PackagingTypeDto[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return request<PackagingTypeDto[]>(
      `/logistics/packaging-types${qs ? `?${qs}` : ''}`,
    );
  }

  static async createPackagingType(
    data: Partial<PackagingTypeDto>,
  ): Promise<PackagingTypeDto> {
    return request<PackagingTypeDto>(`/logistics/packaging-types`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePackagingType(
    id: string,
    data: Partial<PackagingTypeDto>,
  ): Promise<PackagingTypeDto> {
    return request<PackagingTypeDto>(`/logistics/packaging-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deletePackagingType(
    id: string,
  ): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/logistics/packaging-types/${id}`, {
      method: 'DELETE',
    });
  }
}

export interface PortDto {
  id: string;
  code: string;
  name: string;
  portCode?: string;
  type?: string;
  country?: string;
  state?: string;
  city?: string;
  facilities?: string[];
  customsAvailable?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackagingTypeDto {
  id: string;
  code: string;
  name: string;
  type?: string;
  material?: string;
  dimensions?: string;
  maxWeight?: number;
  cost?: number;
  reusable?: boolean;
  recyclable?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const logisticsService = LogisticsService;
