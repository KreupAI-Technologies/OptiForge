import { apiClient } from './api/client';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export enum TransferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum TransferType {
  INTER_WAREHOUSE = 'INTER_WAREHOUSE',
  INTRA_WAREHOUSE = 'INTRA_WAREHOUSE',
  PRODUCTION_ISSUE = 'PRODUCTION_ISSUE',
  PRODUCTION_RETURN = 'PRODUCTION_RETURN',
}

export enum TransferPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TransferItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedQuantity: number;
  dispatchedQuantity?: number;
  receivedQuantity?: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  serialNumbers?: string[];
  sourceLocationId?: string;
  sourceLocationName?: string;
  targetLocationId?: string;
  targetLocationName?: string;
  remarks?: string;
  receivedCondition?: 'GOOD' | 'DAMAGED' | 'PARTIAL';
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  transferType: TransferType;
  status: TransferStatus;
  priority: TransferPriority;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  requestDate: string;
  requiredDate?: string;
  dispatchDate?: string;
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  referenceType?: string;
  referenceNumber?: string;
  referenceId?: string;
  items: TransferItem[];
  totalItems: number;
  totalRequestedQuantity: number;
  totalDispatchedQuantity?: number;
  totalReceivedQuantity?: number;
  totalValue: number;
  shippingMethod?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  remarks?: string;
  attachments?: string[];
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  dispatchedBy?: string;
  dispatchedByName?: string;
  dispatchedAt?: string;
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferDto {
  transferType: TransferType;
  priority?: TransferPriority;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  requiredDate?: string;
  referenceType?: string;
  referenceNumber?: string;
  referenceId?: string;
  items: {
    itemId: string;
    requestedQuantity: number;
    batchNumber?: string;
    serialNumbers?: string[];
    sourceLocationId?: string;
    targetLocationId?: string;
    remarks?: string;
  }[];
  shippingMethod?: string;
  remarks?: string;
}

export interface DispatchTransferDto {
  items: {
    itemId: string;
    dispatchedQuantity: number;
    batchNumber?: string;
    serialNumbers?: string[];
  }[];
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  trackingNumber?: string;
  expectedArrivalDate?: string;
  remarks?: string;
}

export interface ReceiveTransferDto {
  items: {
    itemId: string;
    receivedQuantity: number;
    receivedCondition: 'GOOD' | 'DAMAGED' | 'PARTIAL';
    targetLocationId?: string;
    remarks?: string;
  }[];
  remarks?: string;
}

export interface TransferFilters {
  transferType?: TransferType;
  status?: TransferStatus;
  priority?: TransferPriority;
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const USE_MOCK_DATA = false;

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'st-1',
    transferNumber: 'ST-2024-00001',
    transferType: TransferType.INTER_WAREHOUSE,
    status: TransferStatus.COMPLETED,
    priority: TransferPriority.NORMAL,
    sourceWarehouseId: 'wh-2',
    sourceWarehouseName: 'Raw Materials Warehouse',
    targetWarehouseId: 'wh-3',
    targetWarehouseName: 'Work-in-Progress Storage',
    requestDate: '2024-01-18T08:00:00Z',
    requiredDate: '2024-01-19T17:00:00Z',
    dispatchDate: '2024-01-18T14:00:00Z',
    expectedArrivalDate: '2024-01-18T16:00:00Z',
    actualArrivalDate: '2024-01-18T15:45:00Z',
    referenceType: 'WORK_ORDER',
    referenceNumber: 'WO-2024-00040',
    items: [
      {
        id: 'sti-1',
        itemId: 'item-1',
        itemCode: 'STL-001',
        itemName: 'Steel Sheet 4x8 - 16 Gauge',
        requestedQuantity: 20,
        dispatchedQuantity: 20,
        receivedQuantity: 20,
        uom: 'Sheet',
        unitCost: 45.00,
        totalCost: 900.00,
        batchNumber: 'BATCH-2024-001',
        sourceLocationId: 'loc-1',
        sourceLocationName: 'Zone A, Aisle 1, Rack 1',
        targetLocationId: 'loc-5',
        targetLocationName: 'WIP Zone 1',
        receivedCondition: 'GOOD',
      },
      {
        id: 'sti-2',
        itemId: 'item-4',
        itemCode: 'FST-001',
        itemName: 'Fastener Kit - Assorted',
        requestedQuantity: 5,
        dispatchedQuantity: 5,
        receivedQuantity: 5,
        uom: 'Kit',
        unitCost: 25.00,
        totalCost: 125.00,
        sourceLocationId: 'loc-2',
        sourceLocationName: 'Zone A, Aisle 1, Rack 2',
        targetLocationId: 'loc-5',
        targetLocationName: 'WIP Zone 1',
        receivedCondition: 'GOOD',
      },
    ],
    totalItems: 2,
    totalRequestedQuantity: 25,
    totalDispatchedQuantity: 25,
    totalReceivedQuantity: 25,
    totalValue: 1025.00,
    shippingMethod: 'Internal Forklift',
    vehicleNumber: 'FL-003',
    driverName: 'Tom Harris',
    requestedBy: 'emp-103',
    requestedByName: 'Mike Brown',
    approvedBy: 'emp-102',
    approvedByName: 'Sarah Johnson',
    approvedAt: '2024-01-18T10:00:00Z',
    dispatchedBy: 'emp-201',
    dispatchedByName: 'David Lee',
    dispatchedAt: '2024-01-18T14:00:00Z',
    receivedBy: 'emp-205',
    receivedByName: 'Chris Anderson',
    receivedAt: '2024-01-18T15:45:00Z',
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T15:45:00Z',
  },
  {
    id: 'st-2',
    transferNumber: 'ST-2024-00002',
    transferType: TransferType.INTER_WAREHOUSE,
    status: TransferStatus.IN_TRANSIT,
    priority: TransferPriority.HIGH,
    sourceWarehouseId: 'wh-1',
    sourceWarehouseName: 'Main Distribution Center',
    targetWarehouseId: 'wh-4',
    targetWarehouseName: 'Spare Parts Warehouse',
    requestDate: '2024-01-22T09:00:00Z',
    requiredDate: '2024-01-23T12:00:00Z',
    dispatchDate: '2024-01-22T15:00:00Z',
    expectedArrivalDate: '2024-01-23T10:00:00Z',
    items: [
      {
        id: 'sti-3',
        itemId: 'item-10',
        itemCode: 'SPR-001',
        itemName: 'Bearing SKF 6205',
        requestedQuantity: 100,
        dispatchedQuantity: 100,
        uom: 'Piece',
        unitCost: 15.00,
        totalCost: 1500.00,
        sourceLocationId: 'loc-8',
        sourceLocationName: 'Zone C, Aisle 3, Rack 1',
      },
      {
        id: 'sti-4',
        itemId: 'item-12',
        itemCode: 'SPR-003',
        itemName: 'Hydraulic Seal Kit',
        requestedQuantity: 20,
        dispatchedQuantity: 20,
        uom: 'Kit',
        unitCost: 45.00,
        totalCost: 900.00,
        sourceLocationId: 'loc-8',
        sourceLocationName: 'Zone C, Aisle 3, Rack 1',
      },
    ],
    totalItems: 2,
    totalRequestedQuantity: 120,
    totalDispatchedQuantity: 120,
    totalValue: 2400.00,
    shippingMethod: 'Company Truck',
    vehicleNumber: 'TRK-007',
    driverName: 'Mark Stevens',
    driverContact: '+1-555-0201',
    trackingNumber: 'INT-20240122-001',
    requestedBy: 'emp-104',
    requestedByName: 'Emily Davis',
    approvedBy: 'emp-101',
    approvedByName: 'John Smith',
    approvedAt: '2024-01-22T11:00:00Z',
    dispatchedBy: 'emp-206',
    dispatchedByName: 'Kevin White',
    dispatchedAt: '2024-01-22T15:00:00Z',
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'st-3',
    transferNumber: 'ST-2024-00003',
    transferType: TransferType.PRODUCTION_ISSUE,
    status: TransferStatus.APPROVED,
    priority: TransferPriority.URGENT,
    sourceWarehouseId: 'wh-2',
    sourceWarehouseName: 'Raw Materials Warehouse',
    targetWarehouseId: 'wh-3',
    targetWarehouseName: 'Work-in-Progress Storage',
    requestDate: '2024-01-23T07:00:00Z',
    requiredDate: '2024-01-23T10:00:00Z',
    referenceType: 'WORK_ORDER',
    referenceNumber: 'WO-2024-00050',
    items: [
      {
        id: 'sti-5',
        itemId: 'item-2',
        itemCode: 'STL-002',
        itemName: 'Steel Sheet 4x8 - 14 Gauge',
        requestedQuantity: 30,
        uom: 'Sheet',
        unitCost: 55.00,
        totalCost: 1650.00,
        batchNumber: 'BATCH-2024-002',
        sourceLocationId: 'loc-2',
        sourceLocationName: 'Zone A, Aisle 1, Rack 2',
        targetLocationId: 'loc-6',
        targetLocationName: 'WIP Zone 2',
      },
      {
        id: 'sti-6',
        itemId: 'item-6',
        itemCode: 'WLD-001',
        itemName: 'Welding Wire ER70S-6',
        requestedQuantity: 10,
        uom: 'Spool',
        unitCost: 35.00,
        totalCost: 350.00,
        sourceLocationId: 'loc-3',
        sourceLocationName: 'Zone B, Aisle 2, Rack 1',
        targetLocationId: 'loc-6',
        targetLocationName: 'WIP Zone 2',
      },
    ],
    totalItems: 2,
    totalRequestedQuantity: 40,
    totalValue: 2000.00,
    remarks: 'Urgent - Production line waiting',
    requestedBy: 'emp-103',
    requestedByName: 'Mike Brown',
    approvedBy: 'emp-102',
    approvedByName: 'Sarah Johnson',
    approvedAt: '2024-01-23T07:30:00Z',
    createdAt: '2024-01-23T07:00:00Z',
    updatedAt: '2024-01-23T07:30:00Z',
  },
  {
    id: 'st-4',
    transferNumber: 'ST-2024-00004',
    transferType: TransferType.INTRA_WAREHOUSE,
    status: TransferStatus.SUBMITTED,
    priority: TransferPriority.LOW,
    sourceWarehouseId: 'wh-1',
    sourceWarehouseName: 'Main Distribution Center',
    targetWarehouseId: 'wh-1',
    targetWarehouseName: 'Main Distribution Center',
    requestDate: '2024-01-23T10:00:00Z',
    requiredDate: '2024-01-25T17:00:00Z',
    items: [
      {
        id: 'sti-7',
        itemId: 'item-15',
        itemCode: 'FIN-001',
        itemName: 'Finished Assembly Model A',
        requestedQuantity: 50,
        uom: 'Unit',
        unitCost: 250.00,
        totalCost: 12500.00,
        sourceLocationId: 'loc-10',
        sourceLocationName: 'Zone D, Aisle 4, Rack 1',
        targetLocationId: 'loc-11',
        targetLocationName: 'Zone D, Aisle 4, Rack 5',
        remarks: 'Relocating for better organization',
      },
    ],
    totalItems: 1,
    totalRequestedQuantity: 50,
    totalValue: 12500.00,
    remarks: 'Warehouse reorganization - moving to new location',
    requestedBy: 'emp-207',
    requestedByName: 'Laura Chen',
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
  {
    id: 'st-5',
    transferNumber: 'ST-2024-00005',
    transferType: TransferType.PRODUCTION_RETURN,
    status: TransferStatus.DRAFT,
    priority: TransferPriority.NORMAL,
    sourceWarehouseId: 'wh-3',
    sourceWarehouseName: 'Work-in-Progress Storage',
    targetWarehouseId: 'wh-2',
    targetWarehouseName: 'Raw Materials Warehouse',
    requestDate: '2024-01-23T11:00:00Z',
    referenceType: 'WORK_ORDER',
    referenceNumber: 'WO-2024-00045',
    items: [
      {
        id: 'sti-8',
        itemId: 'item-1',
        itemCode: 'STL-001',
        itemName: 'Steel Sheet 4x8 - 16 Gauge',
        requestedQuantity: 5,
        uom: 'Sheet',
        unitCost: 45.00,
        totalCost: 225.00,
        batchNumber: 'BATCH-2024-001',
        sourceLocationId: 'loc-5',
        sourceLocationName: 'WIP Zone 1',
        remarks: 'Excess material from WO-2024-00045',
      },
    ],
    totalItems: 1,
    totalRequestedQuantity: 5,
    totalValue: 225.00,
    remarks: 'Returning excess materials from completed work order',
    requestedBy: 'emp-103',
    requestedByName: 'Mike Brown',
    createdAt: '2024-01-23T11:00:00Z',
    updatedAt: '2024-01-23T11:00:00Z',
  },
  {
    id: 'st-6',
    transferNumber: 'ST-2024-00006',
    transferType: TransferType.INTER_WAREHOUSE,
    status: TransferStatus.REJECTED,
    priority: TransferPriority.NORMAL,
    sourceWarehouseId: 'wh-4',
    sourceWarehouseName: 'Spare Parts Warehouse',
    targetWarehouseId: 'wh-1',
    targetWarehouseName: 'Main Distribution Center',
    requestDate: '2024-01-21T14:00:00Z',
    requiredDate: '2024-01-22T12:00:00Z',
    items: [
      {
        id: 'sti-9',
        itemId: 'item-13',
        itemCode: 'SPR-004',
        itemName: 'Electric Motor 2HP',
        requestedQuantity: 10,
        uom: 'Unit',
        unitCost: 180.00,
        totalCost: 1800.00,
        sourceLocationId: 'loc-15',
        sourceLocationName: 'Spare Parts Zone A',
      },
    ],
    totalItems: 1,
    totalRequestedQuantity: 10,
    totalValue: 1800.00,
    remarks: 'Need motors for maintenance backup',
    requestedBy: 'emp-208',
    requestedByName: 'Peter Adams',
    rejectedBy: 'emp-104',
    rejectedByName: 'Emily Davis',
    rejectedAt: '2024-01-21T16:00:00Z',
    rejectionReason: 'Insufficient stock at source warehouse. Current available: 3 units.',
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-21T16:00:00Z',
  },
];

// ============================================================================
// Stock Transfer Service
// ============================================================================

class StockTransferService {
  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get all stock transfers with optional filters
   */
  async getAllTransfers(filters?: TransferFilters): Promise<StockTransfer[]> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      let result = [...MOCK_STOCK_TRANSFERS];

      if (filters?.transferType) {
        result = result.filter((t) => t.transferType === filters.transferType);
      }
      if (filters?.status) {
        result = result.filter((t) => t.status === filters.status);
      }
      if (filters?.priority) {
        result = result.filter((t) => t.priority === filters.priority);
      }
      if (filters?.sourceWarehouseId) {
        result = result.filter((t) => t.sourceWarehouseId === filters.sourceWarehouseId);
      }
      if (filters?.targetWarehouseId) {
        result = result.filter((t) => t.targetWarehouseId === filters.targetWarehouseId);
      }
      if (filters?.fromDate) {
        result = result.filter((t) => new Date(t.requestDate) >= new Date(filters.fromDate!));
      }
      if (filters?.toDate) {
        result = result.filter((t) => new Date(t.requestDate) <= new Date(filters.toDate!));
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(
          (t) =>
            t.transferNumber.toLowerCase().includes(searchLower) ||
            t.referenceNumber?.toLowerCase().includes(searchLower) ||
            t.sourceWarehouseName.toLowerCase().includes(searchLower) ||
            t.targetWarehouseName.toLowerCase().includes(searchLower) ||
            t.items.some((i) => i.itemName.toLowerCase().includes(searchLower))
        );
      }

      return result;
    }

    const params = new URLSearchParams();
    if (filters?.transferType) params.append('transferType', filters.transferType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.sourceWarehouseId) params.append('sourceWarehouseId', filters.sourceWarehouseId);
    if (filters?.targetWarehouseId) params.append('targetWarehouseId', filters.targetWarehouseId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<StockTransfer[]>(`/inventory/stock-transfers?${params.toString()}`);
    return response.data || [];
  }

  /**
   * Get transfer by ID
   */
  async getTransferById(id: string): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(200);
      const transfer = MOCK_STOCK_TRANSFERS.find((t) => t.id === id);
      if (!transfer) {
        throw new Error('Stock transfer not found');
      }
      return { ...transfer };
    }

    const response = await apiClient.get<StockTransfer>(`/inventory/stock-transfers/${id}`);
    return response.data;
  }

  /**
   * Get transfers that are in transit
   */
  async getInTransit(): Promise<StockTransfer[]> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay();
      return MOCK_STOCK_TRANSFERS.filter(
        (t) => t.status === TransferStatus.IN_TRANSIT || t.status === TransferStatus.DISPATCHED
      );
    }

    const response = await apiClient.get<StockTransfer[]>('/inventory/stock-transfers/in-transit');
    return response.data || [];
  }

  /**
   * Create a new stock transfer
   */
  async createTransfer(data: CreateTransferDto): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(500);

      const items: TransferItem[] = data.items.map((item, index) => ({
        id: `sti-${Date.now()}-${index}`,
        itemId: item.itemId,
        itemCode: `ITEM-${item.itemId}`,
        itemName: `Item ${item.itemId}`,
        requestedQuantity: item.requestedQuantity,
        uom: 'Unit',
        unitCost: 0,
        totalCost: 0,
        batchNumber: item.batchNumber,
        serialNumbers: item.serialNumbers,
        sourceLocationId: item.sourceLocationId,
        targetLocationId: item.targetLocationId,
        remarks: item.remarks,
      }));

      const totalRequestedQuantity = items.reduce((sum, i) => sum + i.requestedQuantity, 0);

      const newTransfer: StockTransfer = {
        id: `st-${Date.now()}`,
        transferNumber: `ST-2024-${String(MOCK_STOCK_TRANSFERS.length + 1).padStart(5, '0')}`,
        transferType: data.transferType,
        status: TransferStatus.DRAFT,
        priority: data.priority || TransferPriority.NORMAL,
        sourceWarehouseId: data.sourceWarehouseId,
        sourceWarehouseName: `Source Warehouse ${data.sourceWarehouseId}`,
        targetWarehouseId: data.targetWarehouseId,
        targetWarehouseName: `Target Warehouse ${data.targetWarehouseId}`,
        requestDate: new Date().toISOString(),
        requiredDate: data.requiredDate,
        referenceType: data.referenceType,
        referenceNumber: data.referenceNumber,
        referenceId: data.referenceId,
        items,
        totalItems: items.length,
        totalRequestedQuantity,
        totalValue: 0,
        shippingMethod: data.shippingMethod,
        remarks: data.remarks,
        requestedBy: 'current-user',
        requestedByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_STOCK_TRANSFERS.push(newTransfer);
      return newTransfer;
    }

    const response = await apiClient.post<StockTransfer>('/inventory/stock-transfers', data);
    return response.data;
  }

  /**
   * Submit transfer for approval
   */
  async submitTransfer(id: string): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(300);
      const index = MOCK_STOCK_TRANSFERS.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Stock transfer not found');
      }

      if (MOCK_STOCK_TRANSFERS[index].status !== TransferStatus.DRAFT) {
        throw new Error('Only draft transfers can be submitted');
      }

      MOCK_STOCK_TRANSFERS[index] = {
        ...MOCK_STOCK_TRANSFERS[index],
        status: TransferStatus.SUBMITTED,
        updatedAt: new Date().toISOString(),
      };

      return MOCK_STOCK_TRANSFERS[index];
    }

    const response = await apiClient.post<StockTransfer>(`/inventory/stock-transfers/${id}/submit`, {});
    return response.data;
  }

  /**
   * Approve transfer
   */
  async approveTransfer(id: string): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(300);
      const index = MOCK_STOCK_TRANSFERS.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Stock transfer not found');
      }

      if (MOCK_STOCK_TRANSFERS[index].status !== TransferStatus.SUBMITTED) {
        throw new Error('Only submitted transfers can be approved');
      }

      MOCK_STOCK_TRANSFERS[index] = {
        ...MOCK_STOCK_TRANSFERS[index],
        status: TransferStatus.APPROVED,
        approvedBy: 'current-user',
        approvedByName: 'Current User',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return MOCK_STOCK_TRANSFERS[index];
    }

    const response = await apiClient.post<StockTransfer>(`/inventory/stock-transfers/${id}/approve`, {});
    return response.data;
  }

  /**
   * Dispatch transfer
   */
  async dispatchTransfer(id: string, data?: DispatchTransferDto): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(400);
      const index = MOCK_STOCK_TRANSFERS.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Stock transfer not found');
      }

      if (MOCK_STOCK_TRANSFERS[index].status !== TransferStatus.APPROVED) {
        throw new Error('Only approved transfers can be dispatched');
      }

      const currentTransfer = MOCK_STOCK_TRANSFERS[index];
      const updatedItems = currentTransfer.items.map((item) => {
        const dispatchItem = data?.items.find((d) => d.itemId === item.itemId);
        return {
          ...item,
          dispatchedQuantity: dispatchItem?.dispatchedQuantity || item.requestedQuantity,
          batchNumber: dispatchItem?.batchNumber || item.batchNumber,
          serialNumbers: dispatchItem?.serialNumbers || item.serialNumbers,
        };
      });

      const totalDispatchedQuantity = updatedItems.reduce((sum, i) => sum + (i.dispatchedQuantity || 0), 0);

      MOCK_STOCK_TRANSFERS[index] = {
        ...currentTransfer,
        status: TransferStatus.IN_TRANSIT,
        items: updatedItems,
        totalDispatchedQuantity,
        dispatchDate: new Date().toISOString(),
        vehicleNumber: data?.vehicleNumber,
        driverName: data?.driverName,
        driverContact: data?.driverContact,
        trackingNumber: data?.trackingNumber,
        expectedArrivalDate: data?.expectedArrivalDate,
        dispatchedBy: 'current-user',
        dispatchedByName: 'Current User',
        dispatchedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return MOCK_STOCK_TRANSFERS[index];
    }

    const response = await apiClient.post<StockTransfer>(`/inventory/stock-transfers/${id}/dispatch`, data || {});
    return response.data;
  }

  /**
   * Receive transfer
   */
  async receiveTransfer(id: string, data?: ReceiveTransferDto): Promise<StockTransfer> {
    if (USE_MOCK_DATA) {
      await this.simulateDelay(400);
      const index = MOCK_STOCK_TRANSFERS.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Stock transfer not found');
      }

      const currentStatus = MOCK_STOCK_TRANSFERS[index].status;
      if (currentStatus !== TransferStatus.IN_TRANSIT && currentStatus !== TransferStatus.DISPATCHED) {
        throw new Error('Only dispatched or in-transit transfers can be received');
      }

      const currentTransfer = MOCK_STOCK_TRANSFERS[index];
      const updatedItems = currentTransfer.items.map((item) => {
        const receiveItem = data?.items.find((r) => r.itemId === item.itemId);
        return {
          ...item,
          receivedQuantity: receiveItem?.receivedQuantity || item.dispatchedQuantity || item.requestedQuantity,
          receivedCondition: receiveItem?.receivedCondition || 'GOOD',
          targetLocationId: receiveItem?.targetLocationId || item.targetLocationId,
        };
      });

      const totalReceivedQuantity = updatedItems.reduce((sum, i) => sum + (i.receivedQuantity || 0), 0);

      MOCK_STOCK_TRANSFERS[index] = {
        ...currentTransfer,
        status: TransferStatus.COMPLETED,
        items: updatedItems as TransferItem[],
        totalReceivedQuantity,
        actualArrivalDate: new Date().toISOString(),
        receivedBy: 'current-user',
        receivedByName: 'Current User',
        receivedAt: new Date().toISOString(),
        remarks: data?.remarks || currentTransfer.remarks,
        updatedAt: new Date().toISOString(),
      };

      return MOCK_STOCK_TRANSFERS[index];
    }

    const response = await apiClient.post<StockTransfer>(`/inventory/stock-transfers/${id}/receive`, data || {});
    return response.data;
  }
}

export const stockTransferService = new StockTransferService();
