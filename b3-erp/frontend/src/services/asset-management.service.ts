/**
 * Asset Management Service
 * Handles all asset management operations including allocation, requests, transfers,
 * maintenance, stock management, and reporting
 */

const USE_MOCK_DATA = false;

// ============================================================================
// Enums
// ============================================================================

export enum HRAssetStatus {
  AVAILABLE = 'available',
  ALLOCATED = 'allocated',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  DISPOSED = 'disposed',
  LOST = 'lost',
}

export enum HRAssetCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
}

export enum AssetCategoryType {
  IT_ASSETS = 'it_assets',
  OFFICE_ASSETS = 'office_assets',
  VEHICLES = 'vehicles',
  FURNITURE = 'furniture',
  EQUIPMENT = 'equipment',
}

export enum RequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MaintenanceStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum MaintenanceType {
  SERVICE_REQUEST = 'service_request',
  REPAIR = 'repair',
  PREVENTIVE = 'preventive',
  BREAKDOWN = 'breakdown',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface AssetCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  categoryType: AssetCategoryType;
  description?: string;
  parentCategoryId?: string;
  depreciationMethod?: string;
  depreciationRate?: number;
  usefulLifeYears?: number;
  assetCount?: number;
}

export interface HRAsset {
  id: string;
  assetCode: string;
  assetName: string;
  assetTag?: string;
  serialNumber?: string;
  categoryId: string;
  category?: AssetCategory;
  brand?: string;
  model?: string;
  specifications?: Record<string, any>;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  vendorName?: string;
  invoiceNumber?: string;
  warrantyEndDate?: string;
  currentValue?: number;
  status: HRAssetStatus;
  condition: HRAssetCondition;
  location?: string;
  currentEmployeeId?: string;
  currentEmployeeName?: string;
  currentDepartment?: string;
  allocatedDate?: string;
  registrationNumber?: string;
  fuelType?: string;
}

export interface AssetAllocation {
  id: string;
  allocationNumber: string;
  assetId: string;
  asset?: HRAsset;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  allocationType: string;
  allocatedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: string;
  condition: HRAssetCondition;
  acknowledmentReceived: boolean;
  remarks?: string;
}

export interface AssetRequest {
  id: string;
  requestNumber: string;
  assetId?: string;
  asset?: HRAsset;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  requestType: string;
  assetCategory: string;
  assetType?: string;
  priority: string;
  justification?: string;
  specifications?: Record<string, any>;
  requestDate: string;
  requiredByDate?: string;
  fulfillmentDate?: string;
  status: RequestStatus;
  rejectionReason?: string;
}

export interface AssetTransfer {
  id: string;
  transferNumber: string;
  assetId: string;
  asset?: HRAsset;
  fromEmployeeId: string;
  fromEmployeeName: string;
  fromDepartment?: string;
  fromLocation?: string;
  toEmployeeId: string;
  toEmployeeName: string;
  toDepartment?: string;
  toLocation?: string;
  transferType: string;
  transferReason?: string;
  transferDate: string;
  effectiveDate: string;
  status: TransferStatus;
  conditionBefore?: string;
  conditionAfter?: string;
  initiatedBy: string;
}

export interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  assetId: string;
  asset?: HRAsset;
  requestType: MaintenanceType;
  priority: string;
  issueDescription: string;
  issueCategory?: string;
  reportedBy: string;
  reportedByName: string;
  reportedDate: string;
  assignedTo?: string;
  assignedToName?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  status: MaintenanceStatus;
  diagnosisNotes?: string;
  workPerformed?: string;
  partsReplaced?: Record<string, any>[];
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  resolutionNotes?: string;
  rootCause?: string;
}

export interface PreventiveMaintenance {
  id: string;
  scheduleCode: string;
  scheduleName: string;
  assetCategoryId?: string;
  assetType?: string;
  frequency: string;
  intervalDays?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  maintenanceChecklist?: Record<string, any>[];
  estimatedDuration?: number;
  estimatedCost?: number;
  defaultAssignee?: string;
  vendorName?: string;
  status: string;
}

export interface AMCContract {
  id: string;
  contractNumber: string;
  contractName: string;
  vendorId?: string;
  vendorName: string;
  vendorContact?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  contractType: string;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  coveredAssets?: string[];
  coverageDetails?: string;
  exclusions?: string;
  contractValue: number;
  paymentTerms?: string;
  paymentStatus: string;
  responseTimeSLA?: number;
  resolutionTimeSLA?: number;
  status: string;
}

export interface AssetStock {
  id: string;
  stockCode: string;
  assetCategoryId: string;
  assetType: string;
  location?: string;
  totalQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  stockId: string;
  stock?: AssetStock;
  employeeId: string;
  employeeName: string;
  department?: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  purpose?: string;
  requiredByDate?: string;
  status: string;
}

export interface StockAudit {
  id: string;
  auditNumber: string;
  auditName: string;
  auditType: string;
  auditDate: string;
  startDate: string;
  endDate?: string;
  locationsCovered: string[];
  categoriesCovered: string[];
  status: string;
  auditLeadName?: string;
  totalItems: number;
  itemsAudited: number;
  matchedItems: number;
  discrepancies: number;
}

export interface AssetDashboardStats {
  totalAssets: number;
  assetsByStatus: Record<string, number>;
  pendingRequests: number;
  pendingMaintenance: number;
  expiringWarranties: number;
  expiringAMCs: number;
  recentAllocations: AssetAllocation[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockCategories: AssetCategory[] = [
  { id: '1', categoryCode: 'IT-001', categoryName: 'Laptops', categoryType: AssetCategoryType.IT_ASSETS, assetCount: 45 },
  { id: '2', categoryCode: 'IT-002', categoryName: 'Desktops', categoryType: AssetCategoryType.IT_ASSETS, assetCount: 30 },
  { id: '3', categoryCode: 'IT-003', categoryName: 'Mobiles', categoryType: AssetCategoryType.IT_ASSETS, assetCount: 25 },
  { id: '4', categoryCode: 'OF-001', categoryName: 'Chairs', categoryType: AssetCategoryType.OFFICE_ASSETS, assetCount: 100 },
  { id: '5', categoryCode: 'OF-002', categoryName: 'Desks', categoryType: AssetCategoryType.OFFICE_ASSETS, assetCount: 80 },
  { id: '6', categoryCode: 'VH-001', categoryName: 'Cars', categoryType: AssetCategoryType.VEHICLES, assetCount: 10 },
  { id: '7', categoryCode: 'VH-002', categoryName: 'Bikes', categoryType: AssetCategoryType.VEHICLES, assetCount: 5 },
];

const mockAssets: HRAsset[] = [
  { id: '1', assetCode: 'AST-000001', assetName: 'MacBook Pro 14"', assetTag: 'LAP-001', serialNumber: 'SN12345', categoryId: '1', brand: 'Apple', model: 'MacBook Pro 14 M3', purchaseDate: '2024-01-15', purchasePrice: 199900, warrantyEndDate: '2025-01-15', status: HRAssetStatus.ALLOCATED, condition: HRAssetCondition.GOOD, currentEmployeeName: 'John Doe', currentDepartment: 'Engineering' },
  { id: '2', assetCode: 'AST-000002', assetName: 'Dell XPS 15', assetTag: 'LAP-002', serialNumber: 'SN12346', categoryId: '1', brand: 'Dell', model: 'XPS 15 9530', purchaseDate: '2024-02-20', purchasePrice: 149900, warrantyEndDate: '2025-02-20', status: HRAssetStatus.AVAILABLE, condition: HRAssetCondition.NEW, location: 'IT Store Room' },
  { id: '3', assetCode: 'AST-000003', assetName: 'iPhone 15 Pro', assetTag: 'MOB-001', serialNumber: 'SN12347', categoryId: '3', brand: 'Apple', model: 'iPhone 15 Pro', purchaseDate: '2024-03-10', purchasePrice: 134900, warrantyEndDate: '2025-03-10', status: HRAssetStatus.ALLOCATED, condition: HRAssetCondition.GOOD, currentEmployeeName: 'Jane Smith', currentDepartment: 'Sales' },
  { id: '4', assetCode: 'AST-000004', assetName: 'Toyota Camry', assetTag: 'CAR-001', registrationNumber: 'KA-01-AB-1234', categoryId: '6', brand: 'Toyota', model: 'Camry', purchaseDate: '2023-06-15', purchasePrice: 4500000, status: HRAssetStatus.ALLOCATED, condition: HRAssetCondition.GOOD, currentEmployeeName: 'Mike Johnson', currentDepartment: 'Management' },
  { id: '5', assetCode: 'AST-000005', assetName: 'HP LaserJet Pro', assetTag: 'PRT-001', serialNumber: 'SN12348', categoryId: '2', brand: 'HP', model: 'LaserJet Pro M404dn', purchaseDate: '2024-01-20', purchasePrice: 35000, status: HRAssetStatus.MAINTENANCE, condition: HRAssetCondition.FAIR, location: 'Admin Office' },
];

const mockAllocations: AssetAllocation[] = [
  { id: '1', allocationNumber: 'ALN-000001', assetId: '1', employeeId: 'E001', employeeName: 'John Doe', employeeCode: 'EMP001', department: 'Engineering', allocationType: 'permanent', allocatedDate: '2024-01-20', status: 'active', condition: HRAssetCondition.GOOD, acknowledmentReceived: true },
  { id: '2', allocationNumber: 'ALN-000002', assetId: '3', employeeId: 'E002', employeeName: 'Jane Smith', employeeCode: 'EMP002', department: 'Sales', allocationType: 'permanent', allocatedDate: '2024-03-15', status: 'active', condition: HRAssetCondition.GOOD, acknowledmentReceived: true },
  { id: '3', allocationNumber: 'ALN-000003', assetId: '4', employeeId: 'E003', employeeName: 'Mike Johnson', employeeCode: 'EMP003', department: 'Management', allocationType: 'permanent', allocatedDate: '2023-06-20', status: 'active', condition: HRAssetCondition.GOOD, acknowledmentReceived: true },
];

const mockRequests: AssetRequest[] = [
  { id: '1', requestNumber: 'REQ-000001', employeeId: 'E004', employeeName: 'Sarah Wilson', employeeCode: 'EMP004', department: 'Marketing', requestType: 'new', assetCategory: 'it_assets', assetType: 'laptop', priority: 'high', justification: 'New joiner needs laptop for work', requestDate: '2024-11-01', requiredByDate: '2024-11-10', status: RequestStatus.PENDING },
  { id: '2', requestNumber: 'REQ-000002', employeeId: 'E005', employeeName: 'Tom Brown', employeeCode: 'EMP005', department: 'HR', requestType: 'replacement', assetCategory: 'it_assets', assetType: 'mobile', priority: 'normal', justification: 'Current phone screen cracked', requestDate: '2024-10-28', status: RequestStatus.APPROVED },
  { id: '3', requestNumber: 'REQ-000003', employeeId: 'E006', employeeName: 'Emily Davis', employeeCode: 'EMP006', department: 'Finance', requestType: 'upgrade', assetCategory: 'it_assets', assetType: 'laptop', priority: 'low', justification: 'Need more RAM for financial modeling', requestDate: '2024-10-20', status: RequestStatus.REJECTED, rejectionReason: 'Current laptop meets requirements' },
];

const mockMaintenanceRequests: MaintenanceRequest[] = [
  { id: '1', requestNumber: 'MNT-000001', assetId: '5', requestType: MaintenanceType.REPAIR, priority: 'high', issueDescription: 'Printer not printing, paper jam error', issueCategory: 'hardware', reportedBy: 'E007', reportedByName: 'Alex Turner', reportedDate: '2024-11-05', status: MaintenanceStatus.IN_PROGRESS, assignedTo: 'IT001', assignedToName: 'IT Support Team' },
  { id: '2', requestNumber: 'MNT-000002', assetId: '1', requestType: MaintenanceType.SERVICE_REQUEST, priority: 'normal', issueDescription: 'Laptop running slow, needs cleanup', issueCategory: 'software', reportedBy: 'E001', reportedByName: 'John Doe', reportedDate: '2024-11-01', status: MaintenanceStatus.OPEN },
];

const mockAMCContracts: AMCContract[] = [
  { id: '1', contractNumber: 'AMC-00001', contractName: 'IT Equipment Annual Maintenance', vendorName: 'TechCare Solutions', vendorContact: 'support@techcare.com', contractType: 'comprehensive', startDate: '2024-01-01', endDate: '2024-12-31', autoRenewal: true, contractValue: 500000, paymentTerms: 'annual', paymentStatus: 'paid', responseTimeSLA: 4, resolutionTimeSLA: 24, status: 'active' },
  { id: '2', contractNumber: 'AMC-00002', contractName: 'Vehicle Fleet Maintenance', vendorName: 'AutoServ India', vendorContact: 'fleet@autoserv.in', contractType: 'comprehensive', startDate: '2024-04-01', endDate: '2025-03-31', autoRenewal: false, contractValue: 250000, paymentTerms: 'quarterly', paymentStatus: 'partial', status: 'active' },
];

const mockStockAudits: StockAudit[] = [
  { id: '1', auditNumber: 'AUD-00001', auditName: 'Q4 2024 IT Asset Audit', auditType: 'full', auditDate: '2024-10-15', startDate: '2024-10-15', endDate: '2024-10-20', locationsCovered: ['HQ', 'Branch-1'], categoriesCovered: ['it_assets'], status: 'completed', auditLeadName: 'Admin Manager', totalItems: 100, itemsAudited: 100, matchedItems: 98, discrepancies: 2 },
  { id: '2', auditNumber: 'AUD-00002', auditName: 'Annual Physical Verification', auditType: 'full', auditDate: '2024-11-01', startDate: '2024-11-01', locationsCovered: ['HQ'], categoriesCovered: ['it_assets', 'office_assets', 'vehicles'], status: 'in_progress', auditLeadName: 'Finance Head', totalItems: 250, itemsAudited: 120, matchedItems: 118, discrepancies: 2 },
];

// ============================================================================
// Service Class
// ============================================================================

export class AssetManagementService {
  // Asset Categories
  static async getAssetCategories(categoryType?: AssetCategoryType): Promise<AssetCategory[]> {
    if (USE_MOCK_DATA) {
      return categoryType
        ? mockCategories.filter(c => c.categoryType === categoryType)
        : mockCategories;
    }
    const params = categoryType ? `?categoryType=${categoryType}` : '';
    const response = await fetch(`/api/hr/asset-categories${params}`);
    return response.json();
  }

  // Assets
  static async getAssets(options?: {
    categoryId?: string;
    categoryType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: HRAsset[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockAssets];
      if (options?.categoryType) {
        const cats = mockCategories.filter(c => c.categoryType === options.categoryType);
        filtered = filtered.filter(a => cats.some(c => c.id === a.categoryId));
      }
      if (options?.status) {
        filtered = filtered.filter(a => a.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.categoryId) params.append('categoryId', options.categoryId);
    if (options?.categoryType) params.append('categoryType', options.categoryType);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/assets?${params.toString()}`);
    return response.json();
  }

  static async getAssetById(id: string): Promise<HRAsset> {
    if (USE_MOCK_DATA) {
      const asset = mockAssets.find(a => a.id === id);
      if (!asset) throw new Error('Asset not found');
      return asset;
    }
    const response = await fetch(`/api/hr/assets/${id}`);
    return response.json();
  }

  static async createAsset(data: Partial<HRAsset>): Promise<HRAsset> {
    if (USE_MOCK_DATA) {
      const newAsset: HRAsset = {
        id: String(mockAssets.length + 1),
        assetCode: `AST-${String(mockAssets.length + 1).padStart(6, '0')}`,
        assetName: data.assetName || 'New Asset',
        categoryId: data.categoryId || '1',
        status: HRAssetStatus.AVAILABLE,
        condition: HRAssetCondition.NEW,
        ...data,
      } as HRAsset;
      mockAssets.push(newAsset);
      return newAsset;
    }
    const response = await fetch('/api/hr/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Asset Allocations
  static async getAssetAllocations(options?: {
    assetId?: string;
    employeeId?: string;
    status?: string;
  }): Promise<{ data: AssetAllocation[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockAllocations];
      if (options?.employeeId) {
        filtered = filtered.filter(a => a.employeeId === options.employeeId);
      }
      if (options?.status) {
        filtered = filtered.filter(a => a.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.assetId) params.append('assetId', options.assetId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/asset-allocations?${params.toString()}`);
    return response.json();
  }

  static async allocateAsset(data: Partial<AssetAllocation>): Promise<AssetAllocation> {
    if (USE_MOCK_DATA) {
      const newAllocation: AssetAllocation = {
        id: String(mockAllocations.length + 1),
        allocationNumber: `ALN-${String(mockAllocations.length + 1).padStart(6, '0')}`,
        assetId: data.assetId || '1',
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        allocationType: data.allocationType || 'permanent',
        allocatedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        condition: HRAssetCondition.GOOD,
        acknowledmentReceived: false,
        ...data,
      } as AssetAllocation;
      mockAllocations.push(newAllocation);
      return newAllocation;
    }
    const response = await fetch('/api/hr/asset-allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async returnAsset(allocationId: string, data: { returnedBy: string; condition: string }): Promise<AssetAllocation> {
    if (USE_MOCK_DATA) {
      const allocation = mockAllocations.find(a => a.id === allocationId);
      if (allocation) {
        allocation.status = 'returned';
        allocation.actualReturnDate = new Date().toISOString().split('T')[0];
      }
      return allocation!;
    }
    const response = await fetch(`/api/hr/asset-allocations/${allocationId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Asset Requests
  static async getAssetRequests(options?: {
    employeeId?: string;
    status?: string;
    assetCategory?: string;
  }): Promise<{ data: AssetRequest[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockRequests];
      if (options?.status) {
        filtered = filtered.filter(r => r.status === options.status);
      }
      if (options?.assetCategory) {
        filtered = filtered.filter(r => r.assetCategory === options.assetCategory);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.status) params.append('status', options.status);
    if (options?.assetCategory) params.append('assetCategory', options.assetCategory);
    const response = await fetch(`/api/hr/asset-requests?${params.toString()}`);
    return response.json();
  }

  static async createAssetRequest(data: Partial<AssetRequest>): Promise<AssetRequest> {
    if (USE_MOCK_DATA) {
      const newRequest: AssetRequest = {
        id: String(mockRequests.length + 1),
        requestNumber: `REQ-${String(mockRequests.length + 1).padStart(6, '0')}`,
        employeeId: data.employeeId || 'E001',
        employeeName: data.employeeName || 'Employee',
        employeeCode: data.employeeCode || 'EMP001',
        requestType: data.requestType || 'new',
        assetCategory: data.assetCategory || 'it_assets',
        priority: data.priority || 'normal',
        requestDate: new Date().toISOString().split('T')[0],
        status: RequestStatus.PENDING,
        ...data,
      } as AssetRequest;
      mockRequests.push(newRequest);
      return newRequest;
    }
    const response = await fetch('/api/hr/asset-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async approveAssetRequest(id: string, approvedBy: string, assetId?: string): Promise<AssetRequest> {
    if (USE_MOCK_DATA) {
      const request = mockRequests.find(r => r.id === id);
      if (request) request.status = RequestStatus.APPROVED;
      return request!;
    }
    const response = await fetch(`/api/hr/asset-requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy, assetId }),
    });
    return response.json();
  }

  static async rejectAssetRequest(id: string, rejectedBy: string, reason: string): Promise<AssetRequest> {
    if (USE_MOCK_DATA) {
      const request = mockRequests.find(r => r.id === id);
      if (request) {
        request.status = RequestStatus.REJECTED;
        request.rejectionReason = reason;
      }
      return request!;
    }
    const response = await fetch(`/api/hr/asset-requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectedBy, reason }),
    });
    return response.json();
  }

  // Asset Transfers
  static async getAssetTransfers(options?: {
    assetId?: string;
    status?: string;
  }): Promise<{ data: AssetTransfer[]; total: number }> {
    if (USE_MOCK_DATA) {
      return { data: [], total: 0 };
    }
    const params = new URLSearchParams();
    if (options?.assetId) params.append('assetId', options.assetId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/asset-transfers?${params.toString()}`);
    return response.json();
  }

  static async createAssetTransfer(data: Partial<AssetTransfer>): Promise<AssetTransfer> {
    if (USE_MOCK_DATA) {
      return {
        id: '1',
        transferNumber: 'TRF-000001',
        ...data,
      } as AssetTransfer;
    }
    const response = await fetch('/api/hr/asset-transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Maintenance Requests
  static async getMaintenanceRequests(options?: {
    assetId?: string;
    requestType?: string;
    status?: string;
    priority?: string;
  }): Promise<{ data: MaintenanceRequest[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockMaintenanceRequests];
      if (options?.status) {
        filtered = filtered.filter(r => r.status === options.status);
      }
      if (options?.requestType) {
        filtered = filtered.filter(r => r.requestType === options.requestType);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.assetId) params.append('assetId', options.assetId);
    if (options?.requestType) params.append('requestType', options.requestType);
    if (options?.status) params.append('status', options.status);
    if (options?.priority) params.append('priority', options.priority);
    const response = await fetch(`/api/hr/maintenance-requests?${params.toString()}`);
    return response.json();
  }

  static async createMaintenanceRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    if (USE_MOCK_DATA) {
      const newRequest: MaintenanceRequest = {
        id: String(mockMaintenanceRequests.length + 1),
        requestNumber: `MNT-${String(mockMaintenanceRequests.length + 1).padStart(6, '0')}`,
        assetId: data.assetId || '1',
        requestType: data.requestType || MaintenanceType.SERVICE_REQUEST,
        priority: data.priority || 'normal',
        issueDescription: data.issueDescription || 'Issue description',
        reportedBy: data.reportedBy || 'E001',
        reportedByName: data.reportedByName || 'Reporter',
        reportedDate: new Date().toISOString().split('T')[0],
        status: MaintenanceStatus.OPEN,
        ...data,
      } as MaintenanceRequest;
      mockMaintenanceRequests.push(newRequest);
      return newRequest;
    }
    const response = await fetch('/api/hr/maintenance-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Preventive Maintenance
  static async getPreventiveMaintenanceSchedules(): Promise<PreventiveMaintenance[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    const response = await fetch('/api/hr/preventive-maintenance');
    return response.json();
  }

  // AMC Contracts
  static async getAMCContracts(options?: {
    status?: string;
    expiringWithinDays?: number;
  }): Promise<AMCContract[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockAMCContracts];
      if (options?.status) {
        filtered = filtered.filter(c => c.status === options.status);
      }
      return filtered;
    }
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.expiringWithinDays) params.append('expiringWithinDays', String(options.expiringWithinDays));
    const response = await fetch(`/api/hr/amc-contracts?${params.toString()}`);
    return response.json();
  }

  // Stock Management
  static async getAssetStock(options?: {
    assetCategoryId?: string;
    location?: string;
    lowStock?: boolean;
  }): Promise<AssetStock[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    const params = new URLSearchParams();
    if (options?.assetCategoryId) params.append('assetCategoryId', options.assetCategoryId);
    if (options?.location) params.append('location', options.location);
    if (options?.lowStock) params.append('lowStock', 'true');
    const response = await fetch(`/api/hr/asset-stock?${params.toString()}`);
    return response.json();
  }

  static async getStockRequests(options?: {
    stockId?: string;
    employeeId?: string;
    status?: string;
  }): Promise<{ data: StockRequest[]; total: number }> {
    if (USE_MOCK_DATA) {
      return { data: [], total: 0 };
    }
    const params = new URLSearchParams();
    if (options?.stockId) params.append('stockId', options.stockId);
    if (options?.employeeId) params.append('employeeId', options.employeeId);
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/stock-requests?${params.toString()}`);
    return response.json();
  }

  // Stock Audits
  static async getStockAudits(options?: {
    status?: string;
  }): Promise<{ data: StockAudit[]; total: number }> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockStockAudits];
      if (options?.status) {
        filtered = filtered.filter(a => a.status === options.status);
      }
      return { data: filtered, total: filtered.length };
    }
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    const response = await fetch(`/api/hr/stock-audits?${params.toString()}`);
    return response.json();
  }

  // Dashboard
  static async getDashboard(): Promise<AssetDashboardStats> {
    if (USE_MOCK_DATA) {
      return {
        totalAssets: mockAssets.length,
        assetsByStatus: {
          available: mockAssets.filter(a => a.status === HRAssetStatus.AVAILABLE).length,
          allocated: mockAssets.filter(a => a.status === HRAssetStatus.ALLOCATED).length,
          maintenance: mockAssets.filter(a => a.status === HRAssetStatus.MAINTENANCE).length,
        },
        pendingRequests: mockRequests.filter(r => r.status === RequestStatus.PENDING).length,
        pendingMaintenance: mockMaintenanceRequests.filter(r => r.status !== MaintenanceStatus.COMPLETED && r.status !== MaintenanceStatus.CLOSED).length,
        expiringWarranties: 2,
        expiringAMCs: 1,
        recentAllocations: mockAllocations.slice(0, 5),
      };
    }
    const response = await fetch('/api/hr/asset-management/dashboard');
    return response.json();
  }

  // Reports
  static async getAssetRegister(options?: {
    categoryId?: string;
    status?: string;
  }): Promise<{ data: HRAsset[]; total: number }> {
    return this.getAssets(options);
  }

  static async getEmployeeAssets(employeeId: string): Promise<AssetAllocation[]> {
    if (USE_MOCK_DATA) {
      return mockAllocations.filter(a => a.employeeId === employeeId && a.status === 'active');
    }
    const response = await fetch(`/api/hr/employees/${employeeId}/assets`);
    return response.json();
  }

  static async getDepartmentAssets(department: string): Promise<HRAsset[]> {
    if (USE_MOCK_DATA) {
      return mockAssets.filter(a => a.currentDepartment === department);
    }
    const response = await fetch(`/api/hr/departments/${department}/assets`);
    return response.json();
  }

  static async getMaintenanceCostReport(options?: {
    fromDate?: string;
    toDate?: string;
    categoryId?: string;
  }): Promise<{ totalCost: number; byCategory: Record<string, number>; records: MaintenanceRequest[] }> {
    if (USE_MOCK_DATA) {
      return {
        totalCost: 15000,
        byCategory: { 'IT Assets': 10000, 'Office Assets': 5000 },
        records: mockMaintenanceRequests.filter(r => r.status === MaintenanceStatus.COMPLETED),
      };
    }
    const params = new URLSearchParams();
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    if (options?.categoryId) params.append('categoryId', options.categoryId);
    const response = await fetch(`/api/hr/reports/maintenance-cost?${params.toString()}`);
    return response.json();
  }
}
