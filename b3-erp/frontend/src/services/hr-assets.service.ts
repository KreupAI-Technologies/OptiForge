// HR Assets Service
// Handles HR asset-management API calls (NestJS domain backend).
// Backs the mock-only pages under /hr/assets/*.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function sendJson<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'test' },
    credentials: 'include',
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export interface AssetItem {
  id: string;
  companyId: string;
  assetClass?: string;
  assetTag?: string;
  brand?: string;
  model?: string;
  item?: string;
  category?: string;
  serialNumber?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  imei?: string;
  simNumber?: string;
  os?: string;
  screenSize?: string;
  resolution?: string;
  purchaseDate?: string;
  warranty?: string;
  cost?: number | string;
  status?: string;
  condition?: string;
  assignedTo?: string;
  employeeCode?: string;
  department?: string;
  location?: string;
}

export interface AssetRequest {
  id: string;
  companyId: string;
  requestId?: string;
  requestDate?: string;
  requester?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  assetCategory?: string;
  assetName?: string;
  quantity?: number;
  priority?: string;
  purpose?: string;
  status?: string;
  approver?: string;
  approvalDate?: string;
  fulfillmentDate?: string;
  remarks?: string;
}

export interface AssetTransfer {
  id: string;
  companyId: string;
  transferId?: string;
  assetTag?: string;
  assetType?: string;
  assetCategory?: string;
  fromEmployee?: string;
  fromEmployeeCode?: string;
  fromDepartment?: string;
  fromLocation?: string;
  toEmployee?: string;
  toEmployeeCode?: string;
  toDepartment?: string;
  toLocation?: string;
  initiatedBy?: string;
  initiatedDate?: string;
  transferReason?: string;
  status?: string;
  approvedBy?: string;
  approvalDate?: string;
  completionDate?: string;
  handoverNotes?: string;
  condition?: string;
}

export interface AssetReturn {
  id: string;
  companyId: string;
  returnId?: string;
  assetTag?: string;
  assetType?: string;
  assetCategory?: string;
  returnedBy?: string;
  employeeCode?: string;
  department?: string;
  assignedDate?: string;
  returnDate?: string;
  returnReason?: string;
  condition?: string;
  status?: string;
  inspectedBy?: string;
  inspectionDate?: string;
  inspectionNotes?: string;
  damageCharges?: number | string;
  accessories?: string;
}

export interface AssetAllocation {
  id: string;
  companyId: string;
  allocationId?: string;
  assetTag?: string;
  assetName?: string;
  category?: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  location?: string;
  allocationDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status?: string;
  condition?: string;
  allocatedBy?: string;
  remarks?: string;
}

export interface AssetInventory {
  id: string;
  companyId: string;
  assetCode?: string;
  assetName?: string;
  category?: string;
  brand?: string;
  model?: string;
  totalQuantity?: number;
  allocated?: number;
  available?: number;
  minStockLevel?: number;
  reorderLevel?: number;
  unitCost?: number | string;
  totalValue?: number | string;
  location?: string;
  supplier?: string;
  status?: string;
}

export interface AssetMaintenance {
  id: string;
  companyId: string;
  recordType?: string;
  requestId?: string;
  ticketId?: string;
  assetTag?: string;
  assetName?: string;
  assetCategory?: string;
  issueType?: string;
  issueDescription?: string;
  requestedBy?: string;
  reportedBy?: string;
  employeeCode?: string;
  department?: string;
  priority?: string;
  status?: string;
  requestDate?: string;
  reportedDate?: string;
  expectedDate?: string;
  startDate?: string;
  completionDate?: string;
  assignedTo?: string;
  approvedBy?: string;
  approvalDate?: string;
  vendor?: string;
  estimatedCost?: number | string;
  cost?: number | string;
  resolutionTime?: number;
  workDone?: string;
  partsReplaced?: string;
  location?: string;
  contactNumber?: string;
  remarks?: string;
}

export interface Vehicle {
  id: string;
  companyId: string;
  vehicleNumber?: string;
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  purchaseDate?: string;
  purchaseCost?: number | string;
  registrationNumber?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  fitnessExpiry?: string;
  currentOdometer?: number;
  fuelType?: string;
  status?: string;
  assignedTo?: string;
  location?: string;
}

export interface VehicleFuel {
  id: string;
  companyId: string;
  recordId?: string;
  vehicleNumber?: string;
  vehicleName?: string;
  registrationNumber?: string;
  fuelDate?: string;
  fuelType?: string;
  quantity?: number | string;
  pricePerLiter?: number | string;
  totalCost?: number | string;
  odometer?: number;
  fuelStation?: string;
  billNumber?: string;
  filledBy?: string;
  location?: string;
  remarks?: string;
}


export interface IdCard { id: string; companyId: string; cardNumber?: string; cardType?: string; issuedTo?: string; employeeCode?: string; department?: string; designation?: string; issueDate?: string; expiryDate?: string; status?: string; bloodGroup?: string; emergencyContact?: string; photo?: boolean; location?: string; issuedBy?: string; remarks?: string; }
export interface AccessCard { id: string; companyId: string; cardNumber?: string; cardType?: string; issuedTo?: string; employeeCode?: string; department?: string; designation?: string; issueDate?: string; expiryDate?: string; status?: string; accessLevel?: string; accessZones?: string | string[]; location?: string; issuedBy?: string; lastUsed?: string; remarks?: string; }
export interface Stationery { id: string; companyId: string; itemCode?: string; itemName?: string; category?: string; brand?: string; unit?: string; totalQuantity?: number; issued?: number; available?: number; minStockLevel?: number; reorderLevel?: number; unitCost?: number | string; totalValue?: number | string; location?: string; supplier?: string; lastPurchaseDate?: string; status?: string; }
export interface AssetAudit { id: string; companyId: string; auditId?: string; auditDate?: string; auditType?: string; location?: string; auditor?: string; totalAssets?: number; verified?: number; missing?: number; damaged?: number; status?: string; completionDate?: string; remarks?: string; }
export interface VehicleAssignment { id: string; companyId: string; assignmentId?: string; vehicleNumber?: string; vehicleName?: string; registrationNumber?: string; assignedTo?: string; employeeCode?: string; department?: string; designation?: string; assignmentDate?: string; returnDate?: string; purpose?: string; status?: string; odometerReadingStart?: number; odometerReadingEnd?: number; location?: string; remarks?: string; }
export interface AmcContract { id: string; companyId: string; contractId?: string; assetCategory?: string; vendor?: string; vendorContact?: string; startDate?: string; endDate?: string; duration?: number; numberOfAssets?: number; contractValue?: number | string; paymentTerms?: string; coverage?: string; responseTime?: string; status?: string; renewalDate?: string; location?: string; contactPerson?: string; remarks?: string; }
export interface PreventiveMaintenance { id: string; companyId: string; scheduleId?: string; assetTag?: string; assetName?: string; assetCategory?: string; maintenanceType?: string; frequency?: string; lastMaintenanceDate?: string; nextMaintenanceDate?: string; assignedTo?: string; estimatedDuration?: number; status?: string; location?: string; checklist?: string; priority?: string; remarks?: string; }
export interface AssetRegisterReport { assetTag: string; assetName: string; category: string; brand: string; serialNumber: string; purchaseDate: string; purchaseCost: number; assignedTo?: string; department?: string; location: string; warranty: string; status: string; condition: string; }
export interface EmployeeAssetReport { employeeName: string; employeeCode: string; department: string; designation: string; laptop?: string; desktop?: string; mobile?: string; monitor?: string; furniture: string[]; totalAssets: number; totalValue: number; location: string; }
export interface DepartmentAssetReport { department: string; employees: number; laptops: number; desktops: number; mobiles: number; monitors: number; furniture: number; totalValue: number; assetsPerEmployee: number; }
export interface CostSummaryReport { category: string; purchaseCost: number; maintenanceCost: number; totalCost: number; monthlyAvg: number; trend: string; }
export interface AllocationSummaryReport { category: string; total: number; allocated: number; available: number; maintenance: number; utilization: number; }

const cid = (companyId: string) =>
  `companyId=${encodeURIComponent(companyId)}`;

export class HrAssetsService {
  static async getAssetItems(
    assetClass?: string,
    companyId = 'company-1',
  ): Promise<AssetItem[]> {
    const q = assetClass
      ? `${cid(companyId)}&assetClass=${encodeURIComponent(assetClass)}`
      : cid(companyId);
    const data = await getJson<AssetItem[]>(`/hr/asset-items?${q}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetRequests(companyId = 'company-1'): Promise<AssetRequest[]> {
    const data = await getJson<AssetRequest[]>(`/hr/asset-requests?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async createAssetRequest(
    payload: Partial<AssetRequest>,
    companyId = 'company-1',
  ): Promise<AssetRequest> {
    return sendJson<AssetRequest>('/hr/asset-requests', 'POST', { companyId, ...payload });
  }

  static async updateAssetRequest(
    id: string,
    payload: Partial<AssetRequest>,
  ): Promise<AssetRequest> {
    return sendJson<AssetRequest>(`/hr/asset-requests/${id}`, 'PUT', payload);
  }

  static async getAssetTransfers(companyId = 'company-1'): Promise<AssetTransfer[]> {
    const data = await getJson<AssetTransfer[]>(`/hr/asset-transfers?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetReturns(companyId = 'company-1'): Promise<AssetReturn[]> {
    const data = await getJson<AssetReturn[]>(`/hr/asset-returns?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetAllocations(companyId = 'company-1'): Promise<AssetAllocation[]> {
    const data = await getJson<AssetAllocation[]>(`/hr/asset-allocations?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetInventory(companyId = 'company-1'): Promise<AssetInventory[]> {
    const data = await getJson<AssetInventory[]>(`/hr/asset-inventory?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetMaintenance(
    recordType?: string,
    companyId = 'company-1',
  ): Promise<AssetMaintenance[]> {
    const q = recordType
      ? `${cid(companyId)}&recordType=${encodeURIComponent(recordType)}`
      : cid(companyId);
    const data = await getJson<AssetMaintenance[]>(`/hr/asset-maintenance?${q}`);
    return Array.isArray(data) ? data : [];
  }

  static async getVehicles(companyId = 'company-1'): Promise<Vehicle[]> {
    const data = await getJson<Vehicle[]>(`/hr/vehicles?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getVehicleFuel(companyId = 'company-1'): Promise<VehicleFuel[]> {
    const data = await getJson<VehicleFuel[]>(`/hr/vehicle-fuel?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getIdCards(cardType?: string, companyId = 'company-1'): Promise<IdCard[]> {
    const q = cardType ? `${cid(companyId)}&cardType=${encodeURIComponent(cardType)}` : cid(companyId);
    const data = await getJson<IdCard[]>(`/hr/id-cards?${q}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAccessCards(cardType?: string, companyId = 'company-1'): Promise<AccessCard[]> {
    const q = cardType ? `${cid(companyId)}&cardType=${encodeURIComponent(cardType)}` : cid(companyId);
    const data = await getJson<AccessCard[]>(`/hr/access-cards?${q}`);
    return Array.isArray(data) ? data : [];
  }

  static async getStationery(category?: string, companyId = 'company-1'): Promise<Stationery[]> {
    const q = category ? `${cid(companyId)}&category=${encodeURIComponent(category)}` : cid(companyId);
    const data = await getJson<Stationery[]>(`/hr/stationery?${q}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAssetAudits(companyId = 'company-1'): Promise<AssetAudit[]> {
    const data = await getJson<AssetAudit[]>(`/hr/asset-audits?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getVehicleAssignments(companyId = 'company-1'): Promise<VehicleAssignment[]> {
    const data = await getJson<VehicleAssignment[]>(`/hr/vehicle-assignments?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getAmcContracts(companyId = 'company-1'): Promise<AmcContract[]> {
    const data = await getJson<AmcContract[]>(`/hr/amc-contracts?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getPreventiveMaintenance(companyId = 'company-1'): Promise<PreventiveMaintenance[]> {
    const data = await getJson<PreventiveMaintenance[]>(`/hr/preventive-maintenance?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getReportRegister(companyId = 'company-1'): Promise<AssetRegisterReport[]> {
    const data = await getJson<AssetRegisterReport[]>(`/hr/asset-reports/register?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getReportEmployee(companyId = 'company-1'): Promise<EmployeeAssetReport[]> {
    const data = await getJson<EmployeeAssetReport[]>(`/hr/asset-reports/employee?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getReportDepartment(companyId = 'company-1'): Promise<DepartmentAssetReport[]> {
    const data = await getJson<DepartmentAssetReport[]>(`/hr/asset-reports/department?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getReportCosts(companyId = 'company-1'): Promise<CostSummaryReport[]> {
    const data = await getJson<CostSummaryReport[]>(`/hr/asset-reports/costs?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  static async getReportAllocation(companyId = 'company-1'): Promise<AllocationSummaryReport[]> {
    const data = await getJson<AllocationSummaryReport[]>(`/hr/asset-reports/allocation?${cid(companyId)}`);
    return Array.isArray(data) ? data : [];
  }

  // --- Authoring writes (POST) -------------------------------------------
  // All target existing NestJS controllers under /hr/* which accept a
  // Partial<Entity> & { companyId } body and return the persisted row.

  static async createAssetTransfer(
    payload: Partial<AssetTransfer>,
    companyId = 'company-1',
  ): Promise<AssetTransfer> {
    return sendJson<AssetTransfer>('/hr/asset-transfers', 'POST', { companyId, ...payload });
  }

  static async createAssetReturn(
    payload: Partial<AssetReturn>,
    companyId = 'company-1',
  ): Promise<AssetReturn> {
    return sendJson<AssetReturn>('/hr/asset-returns', 'POST', { companyId, ...payload });
  }

  static async createAssetMaintenance(
    payload: Partial<AssetMaintenance>,
    companyId = 'company-1',
  ): Promise<AssetMaintenance> {
    return sendJson<AssetMaintenance>('/hr/asset-maintenance', 'POST', { companyId, ...payload });
  }

  static async createPreventiveMaintenance(
    payload: Partial<PreventiveMaintenance>,
    companyId = 'company-1',
  ): Promise<PreventiveMaintenance> {
    return sendJson<PreventiveMaintenance>('/hr/preventive-maintenance', 'POST', { companyId, ...payload });
  }

  static async createAmcContract(
    payload: Partial<AmcContract>,
    companyId = 'company-1',
  ): Promise<AmcContract> {
    return sendJson<AmcContract>('/hr/amc-contracts', 'POST', { companyId, ...payload });
  }

  static async createAssetAudit(
    payload: Partial<AssetAudit>,
    companyId = 'company-1',
  ): Promise<AssetAudit> {
    return sendJson<AssetAudit>('/hr/asset-audits', 'POST', { companyId, ...payload });
  }

  static async createVehicleFuel(
    payload: Partial<VehicleFuel>,
    companyId = 'company-1',
  ): Promise<VehicleFuel> {
    return sendJson<VehicleFuel>('/hr/vehicle-fuel', 'POST', { companyId, ...payload });
  }

  static async createVehicleAssignment(
    payload: Partial<VehicleAssignment>,
    companyId = 'company-1',
  ): Promise<VehicleAssignment> {
    return sendJson<VehicleAssignment>('/hr/vehicle-assignments', 'POST', { companyId, ...payload });
  }

  static async createIdCard(
    payload: Partial<IdCard>,
    companyId = 'company-1',
  ): Promise<IdCard> {
    return sendJson<IdCard>('/hr/id-cards', 'POST', { companyId, ...payload });
  }

  static async createAccessCard(
    payload: Partial<AccessCard>,
    companyId = 'company-1',
  ): Promise<AccessCard> {
    return sendJson<AccessCard>('/hr/access-cards', 'POST', { companyId, ...payload });
  }

  static async createStationery(
    payload: Partial<Stationery>,
    companyId = 'company-1',
  ): Promise<Stationery> {
    return sendJson<Stationery>('/hr/stationery', 'POST', { companyId, ...payload });
  }

  // --- Updates (PUT :id) / Deletes (DELETE :id) ---------------------------
  // Each targets an existing NestJS controller under /hr/* that exposes
  // @Put(':id') and @Delete(':id'). Used for state transitions and removals.

  static async updateAssetTransfer(
    id: string,
    payload: Partial<AssetTransfer>,
  ): Promise<AssetTransfer> {
    return sendJson<AssetTransfer>(`/hr/asset-transfers/${id}`, 'PUT', payload);
  }

  static async updateAssetReturn(
    id: string,
    payload: Partial<AssetReturn>,
  ): Promise<AssetReturn> {
    return sendJson<AssetReturn>(`/hr/asset-returns/${id}`, 'PUT', payload);
  }

  static async updateAssetMaintenance(
    id: string,
    payload: Partial<AssetMaintenance>,
  ): Promise<AssetMaintenance> {
    return sendJson<AssetMaintenance>(`/hr/asset-maintenance/${id}`, 'PUT', payload);
  }

  static async updatePreventiveMaintenance(
    id: string,
    payload: Partial<PreventiveMaintenance>,
  ): Promise<PreventiveMaintenance> {
    return sendJson<PreventiveMaintenance>(`/hr/preventive-maintenance/${id}`, 'PUT', payload);
  }

  static async updateAmcContract(
    id: string,
    payload: Partial<AmcContract>,
  ): Promise<AmcContract> {
    return sendJson<AmcContract>(`/hr/amc-contracts/${id}`, 'PUT', payload);
  }

  static async updateAssetAudit(
    id: string,
    payload: Partial<AssetAudit>,
  ): Promise<AssetAudit> {
    return sendJson<AssetAudit>(`/hr/asset-audits/${id}`, 'PUT', payload);
  }

  static async updateVehicleAssignment(
    id: string,
    payload: Partial<VehicleAssignment>,
  ): Promise<VehicleAssignment> {
    return sendJson<VehicleAssignment>(`/hr/vehicle-assignments/${id}`, 'PUT', payload);
  }

  static async updateIdCard(
    id: string,
    payload: Partial<IdCard>,
  ): Promise<IdCard> {
    return sendJson<IdCard>(`/hr/id-cards/${id}`, 'PUT', payload);
  }

  static async updateAccessCard(
    id: string,
    payload: Partial<AccessCard>,
  ): Promise<AccessCard> {
    return sendJson<AccessCard>(`/hr/access-cards/${id}`, 'PUT', payload);
  }

  static async updateStationery(
    id: string,
    payload: Partial<Stationery>,
  ): Promise<Stationery> {
    return sendJson<Stationery>(`/hr/stationery/${id}`, 'PUT', payload);
  }

  static async createAssetInventory(
    payload: Partial<AssetInventory>,
    companyId = 'company-1',
  ): Promise<AssetInventory> {
    return sendJson<AssetInventory>('/hr/asset-inventory', 'POST', { companyId, ...payload });
  }

  static async updateAssetInventory(
    id: string,
    payload: Partial<AssetInventory>,
  ): Promise<AssetInventory> {
    return sendJson<AssetInventory>(`/hr/asset-inventory/${id}`, 'PUT', payload);
  }

  static async updateAssetAllocation(
    id: string,
    payload: Partial<AssetAllocation>,
  ): Promise<AssetAllocation> {
    return sendJson<AssetAllocation>(`/hr/asset-allocations/${id}`, 'PUT', payload);
  }

  static async createAssetAllocation(
    payload: Partial<AssetAllocation>,
    companyId = 'company-1',
  ): Promise<AssetAllocation> {
    return sendJson<AssetAllocation>('/hr/asset-allocations', 'POST', { companyId, ...payload });
  }
}
