import { apiClient } from './api/client';

export interface StockBalance {
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    warehouseId: string;
    warehouseName: string;
    locationId?: string;
    locationName?: string;
    availableQuantity: number;
    reservedQuantity: number;
    freeQuantity: number;
    uom: string;
    stockValue: number;
    reorderLevel: number;
    reorderQuantity: number;
    belowReorderLevel: boolean;
    lastUpdated: string;
}

export interface AdjustmentReason {
    id: string;
    code: string;
    name: string;
    description?: string;
    reasonType: 'Positive' | 'Negative' | 'Both';
    status: 'Active' | 'Inactive';
    requiresApproval: boolean;
    approvalThreshold?: number | string | null;
    sortOrder: number;
    icon?: string;
    color?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RealTimeBalance {
    itemId: string;
    warehouseId: string;
    totalAvailable: number;
    totalReserved: number;
    totalFree: number;
    locations: {
        locationId: string;
        locationName: string;
        available: number;
        reserved: number;
        free: number;
    }[];
}

export interface AgingReport {
    reportDate: string;
    warehouseId?: string;
    agingBuckets: {
        range: string;
        count: number;
        value: number;
    }[];
}

export interface ABCAnalysis {
    reportDate: string;
    warehouseId?: string;
    aClass: { count: number; value: number; percentage: number };
    bClass: { count: number; value: number; percentage: number };
    cClass: { count: number; value: number; percentage: number };
}

export interface ValuationReport {
    reportDate: string;
    warehouseId?: string;
    totalValue: number;
    itemCount: number;
    byCategory: any[];
}

export interface ReorderAnalysis {
    reportDate: string;
    warehouseId?: string;
    itemsBelowReorder: {
        itemId: string;
        itemCode: string;
        itemName: string;
        currentQuantity: number;
        reorderLevel: number;
        reorderQuantity: number;
        shortage: number;
    }[];
}

export interface CycleCountSummary {
    id: string;
    countNumber: string;
    title?: string;
    warehouse: string;
    warehouseId?: string | null;
    zone: string;
    countType: 'ABC' | 'Random' | 'Full' | 'Spot';
    scheduledDate: string;
    assignedTo: string;
    itemsToCount: number;
    itemsCounted: number;
    variancesFound: number;
    status: 'scheduled' | 'in-progress' | 'completed' | 'reconciled';
    accuracy: number;
}

class InventoryService {
    async getStockBalances(filters?: { itemId?: string; warehouseId?: string; locationId?: string }): Promise<StockBalance[]> {
        const params = new URLSearchParams();
        if (filters?.itemId) params.append('itemId', filters.itemId);
        if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
        if (filters?.locationId) params.append('locationId', filters.locationId);

        const response = await apiClient.get<StockBalance[]>(`/inventory/stock-balances?${params.toString()}`);
        return response.data || [];
    }

    async getRealTimeBalance(itemId: string, warehouseId: string): Promise<RealTimeBalance> {
        const params = new URLSearchParams({ itemId, warehouseId });
        const response = await apiClient.get<RealTimeBalance>(`/inventory/stock-balances/real-time?${params.toString()}`);
        return response.data;
    }

    async getAgingReport(warehouseId?: string): Promise<AgingReport> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<AgingReport>(`/inventory/stock-balances/aging-report?${params.toString()}`);
        return response.data;
    }

    async getABCAnalysis(warehouseId?: string): Promise<ABCAnalysis> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<ABCAnalysis>(`/inventory/stock-balances/abc-analysis?${params.toString()}`);
        return response.data;
    }

    async getValuationReport(warehouseId?: string, asOfDate?: string): Promise<ValuationReport> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        if (asOfDate) params.append('asOfDate', asOfDate);
        const response = await apiClient.get<ValuationReport>(`/inventory/stock-balances/valuation-report?${params.toString()}`);
        return response.data;
    }

    async getReorderAnalysis(warehouseId?: string): Promise<ReorderAnalysis> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<ReorderAnalysis>(`/inventory/stock-balances/reorder-analysis?${params.toString()}`);
        return response.data;
    }

    async getReorderSuggestions(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/reorder/suggestions');
        return response.data;
    }

    async approveReorderSuggestion(id: string, approvedBy: string, quantity?: number): Promise<any> {
        const response = await apiClient.post<any>(`/inventory/reorder/suggestions/${id}/approve`, { approvedBy, quantity });
        return response.data;
    }

    async createPurchaseRequisition(suggestionId: string): Promise<{ prId: string }> {
        const response = await apiClient.post<{ prId: string }>(`/inventory/reorder/suggestions/${suggestionId}/create-pr`, {});
        return response.data;
    }

    // Raw ORM-shaped list endpoints. Callers apply their own defensive mapping.
    // These NestJS routes return a bare JSON array (no { data } envelope), so we
    // unwrap defensively: accept either the array itself or a { data } wrapper.
    private unwrapArray(response: any): any[] {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        return [];
    }

    async getStockLocations(warehouseId?: string): Promise<any[]> {
        const path = warehouseId
            ? `/inventory/stock-locations/warehouse/${warehouseId}`
            : '/inventory/stock-locations';
        const response = await apiClient.get<any[]>(path);
        return this.unwrapArray(response);
    }

    async getWarehouses(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/warehouses');
        return this.unwrapArray(response);
    }

    async getCapacityUtilization(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/warehouses/capacity-utilization');
        return this.unwrapArray(response);
    }

    async getWarehouse(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/warehouses/${id}`);
        return (response as any)?.data ?? response;
    }

    async getWarehouseLocations(id: string): Promise<any[]> {
        const response = await apiClient.get<any[]>(`/inventory/warehouses/${id}/locations`);
        return this.unwrapArray(response);
    }

    async getWarehouseStockSummary(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/warehouses/${id}/stock-summary`);
        return (response as any)?.data ?? response;
    }

    async getStockTransfers(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/stock-transfers');
        return this.unwrapArray(response);
    }

    async getStockAdjustments(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/stock-adjustments');
        return this.unwrapArray(response);
    }

    async deleteStockAdjustment(id: string): Promise<void> {
        await apiClient.delete(`/inventory/stock-adjustments/${id}`);
    }

    async approveStockAdjustment(id: string): Promise<any> {
        const response = await apiClient.patch<any>(`/inventory/stock-adjustments/${id}`, { status: 'Approved' });
        return response.data;
    }

    async rejectStockAdjustment(id: string, reason?: string): Promise<any> {
        const response = await apiClient.patch<any>(`/inventory/stock-adjustments/${id}`, {
            status: 'Rejected',
            approvalRemarks: reason,
        });
        return response.data;
    }

    async getSerialNumbers(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/serial-numbers');
        return this.unwrapArray(response);
    }

    async getBatchNumbers(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/batch-numbers');
        return this.unwrapArray(response);
    }

    async getAdjustmentReasons(filters?: { status?: string; reasonType?: string; search?: string }): Promise<AdjustmentReason[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.reasonType) params.append('reasonType', filters.reasonType);
        if (filters?.search) params.append('search', filters.search);
        const response = await apiClient.get<AdjustmentReason[]>(`/inventory/adjustment-reasons?${params.toString()}`);
        return this.unwrapArray(response) as AdjustmentReason[];
    }

    async getCycleCounts(filters?: { status?: string; search?: string; warehouseId?: string }): Promise<CycleCountSummary[]> {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
        const response = await apiClient.get<CycleCountSummary[]>(`/inventory/cycle-counts?${params.toString()}`);
        return this.unwrapArray(response) as CycleCountSummary[];
    }
}

export const inventoryService = new InventoryService();
