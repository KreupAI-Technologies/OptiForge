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

    async getStockEntries(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/stock-entries');
        return this.unwrapArray(response);
    }

    async getStockEntry(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/stock-entries/${id}`);
        return (response as any)?.data ?? response;
    }

    async getReorderItemAnalysis(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/reorder/analysis');
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

    async getExpiringBatches(): Promise<any[]> {
        const response = await apiClient.get<any[]>('/inventory/batch-numbers/expiring-soon');
        return this.unwrapArray(response);
    }

    async getStockBalance(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/stock-balances/${id}`);
        const data = (response as any)?.data ?? response;
        return data ?? null;
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

    async getCycleCount(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/cycle-counts/${id}`);
        return (response as any)?.data ?? response;
    }

    // ---- Derived analytics (GET /inventory/analytics/*) ----
    async getAgingItems(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/aging?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    async getDeadStock(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/dead-stock?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    async getVelocity(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/velocity?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    async getTurnover(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/turnover?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    async getCarryingCost(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/carrying-cost?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    async getOptimization(warehouseId?: string): Promise<any> {
        const params = new URLSearchParams();
        if (warehouseId) params.append('warehouseId', warehouseId);
        const response = await apiClient.get<any>(`/inventory/analytics/optimization?${params.toString()}`);
        return (response as any)?.data ?? response;
    }

    // ---- Stock entries create/update (Material Receipt/Issue), used by stock add/edit ----
    async createStockEntry(data: any): Promise<any> {
        const response = await apiClient.post<any>('/inventory/stock-entries', data);
        return (response as any)?.data ?? response;
    }

    async updateStockEntry(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/inventory/stock-entries/${id}`, data);
        return (response as any)?.data ?? response;
    }

    async updateStockBalance(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/inventory/stock-balances/${id}`, data);
        return (response as any)?.data ?? response;
    }

    // ---- Stock transfers ----
    async getStockTransfer(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/inventory/stock-transfers/${id}`);
        return (response as any)?.data ?? response;
    }

    async createStockTransfer(data: any): Promise<any> {
        const response = await apiClient.post<any>('/inventory/stock-transfers', data);
        return (response as any)?.data ?? response;
    }

    // ---- Stock adjustments ----
    async createStockAdjustment(data: any): Promise<any> {
        const response = await apiClient.post<any>('/inventory/stock-adjustments', data);
        return (response as any)?.data ?? response;
    }

    // ---- Inventory policies (settings/policies) ----
    async getPolicies(filters?: { policyType?: string; status?: string; search?: string }): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.policyType) params.append('policyType', filters.policyType);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        const response = await apiClient.get<any[]>(`/inventory/policies?${params.toString()}`);
        return this.unwrapArray(response);
    }

    async createPolicy(data: any): Promise<any> {
        const response = await apiClient.post<any>('/inventory/policies', data);
        return (response as any)?.data ?? response;
    }

    async updatePolicy(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/inventory/policies/${id}`, data);
        return (response as any)?.data ?? response;
    }

    async deletePolicy(id: string): Promise<void> {
        await apiClient.delete(`/inventory/policies/${id}`);
    }

    // ---- Stock locations (settings/storage) ----
    async createStockLocation(data: any): Promise<any> {
        const response = await apiClient.post<any>('/inventory/stock-locations', data);
        return (response as any)?.data ?? response;
    }

    async updateStockLocation(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/inventory/stock-locations/${id}`, data);
        return (response as any)?.data ?? response;
    }

    async deleteStockLocation(id: string): Promise<void> {
        await apiClient.delete(`/inventory/stock-locations/${id}`);
    }

    // ---- Stock ledger (movements) ----
    async getStockLedger(filters?: { itemId?: string; warehouseId?: string; fromDate?: string; toDate?: string }): Promise<any[]> {
        const params = new URLSearchParams();
        if (filters?.itemId) params.append('itemId', filters.itemId);
        if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
        if (filters?.fromDate) params.append('fromDate', filters.fromDate);
        if (filters?.toDate) params.append('toDate', filters.toDate);
        const response = await apiClient.get<any[]>(`/inventory/stock-entries/stock-ledger?${params.toString()}`);
        return this.unwrapArray(response);
    }
}

export const inventoryService = new InventoryService();
