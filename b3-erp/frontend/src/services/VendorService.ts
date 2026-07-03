import { apiClient } from './api/client';

export interface Vendor {
    id: string;
    vendorCode: string;
    vendorName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId?: string;
    paymentTerms?: string;
    currency: string;
    status: 'Active' | 'Inactive' | 'Blacklisted';
    vendorType: 'Manufacturer' | 'Distributor' | 'Service Provider';
    category: string;
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    qualityRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Rating';
    deliveryRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Rating';
    priceRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Rating';
    overallRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Rating';
    averageRating: number;
    totalPurchases: number;
    lastPurchaseDate?: string;
    lastPurchaseAmount?: number;
    outstandingPayables: number;
    paymentStatus: 'Clear' | 'Outstanding' | 'Unknown';
}

export interface VendorEvaluation {
    id: string;
    evaluationNumber: string;
    evaluationDate: string;
    vendorName: string;
    evaluationPeriod: string;
    overallScore: number;
    performanceGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
    status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
    isApproved: boolean;
    createdAt: string;
}

export interface VendorContract {
    id: string;
    contractNumber: string;
    title: string;
    description?: string;
    contractType: 'framework' | 'rate' | 'quantity' | 'value' | 'service' | 'maintenance';
    status: 'draft' | 'pending_approval' | 'active' | 'expired' | 'terminated' | 'suspended' | 'renewed';
    vendorId: string;
    vendorName: string;
    vendorCode?: string;
    startDate: string;
    endDate: string;
    totalValue?: number;
    currency: string;
    utilizationPercentage: number;
    autoRenewal: boolean;
}

export interface VendorScorecard {
    onTimeDeliveryPercentage: number;
    qualityPassRate: number;
    totalOrders: number;
    totalDeliveries: number;
}

export interface CreateVendorDto {
    vendorCode: string;
    vendorName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId?: string;
    paymentTerms?: string;
    currency: string;
    vendorType: string;
    category: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {
    status?: 'Active' | 'Inactive' | 'Blacklisted';
}

export const vendorService = {
    // Vendor Management
    async getVendors(filters?: any): Promise<{ data: Vendor[]; total: number }> {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get<{ data: Vendor[]; total: number }>(`/procurement/vendors?${params.toString()}`);
        return response.data;
    },

    async getVendorById(id: string): Promise<Vendor> {
        const response = await apiClient.get<Vendor>(`/procurement/vendors/${id}`);
        return response.data;
    },

    async createVendor(data: CreateVendorDto): Promise<Vendor> {
        const response = await apiClient.post<Vendor>('/procurement/vendors', data);
        return response.data;
    },

    async updateVendor(id: string, data: UpdateVendorDto): Promise<Vendor> {
        const response = await apiClient.put<Vendor>(`/procurement/vendors/${id}`, data);
        return response.data;
    },

    async deleteVendor(id: string): Promise<void> {
        await apiClient.delete(`/procurement/vendors/${id}`);
    },

    async approveVendor(id: string): Promise<Vendor> {
        const response = await apiClient.post<Vendor>(`/procurement/vendors/${id}/approve`, {});
        return response.data;
    },

    // Vendor Evaluation
    async getEvaluations(filters?: any): Promise<VendorEvaluation[]> {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get<VendorEvaluation[]>(`/vendor-evaluations?${params.toString()}`);
        return response.data;
    },

    async getEvaluationById(id: string): Promise<VendorEvaluation> {
        const response = await apiClient.get<VendorEvaluation>(`/vendor-evaluations/${id}`);
        return response.data;
    },

    async createEvaluation(data: any): Promise<VendorEvaluation> {
        const response = await apiClient.post<VendorEvaluation>('/vendor-evaluations', data);
        return response.data;
    },

    async updateEvaluation(id: string, data: any): Promise<VendorEvaluation> {
        const response = await apiClient.put<VendorEvaluation>(`/vendor-evaluations/${id}`, data);
        return response.data;
    },

    async approveEvaluation(id: string): Promise<VendorEvaluation> {
        const response = await apiClient.post<VendorEvaluation>(`/vendor-evaluations/${id}/approve`, {});
        return response.data;
    },

    async getVendorPerformanceReport(vendorId: string): Promise<any> {
        const response = await apiClient.get<any>(`/procurement/vendor-evaluations/vendor/${vendorId}/performance`);
        return response.data;
    },

    async getVendorScorecard(vendorId: string): Promise<VendorScorecard> {
        const response = await apiClient.get<VendorScorecard>(`/procurement/vendor-evaluations/vendor/${vendorId}/scorecard`);
        return response.data;
    },

    // Contract Management
    async getContracts(filters?: any): Promise<VendorContract[]> {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get<VendorContract[]>(`/procurement/contracts?${params.toString()}`);
        return response.data;
    },

    async getContractById(id: string): Promise<VendorContract> {
        const response = await apiClient.get<VendorContract>(`/procurement/contracts/${id}`);
        return response.data;
    },

    async getExpiringContracts(days: number = 30): Promise<VendorContract[]> {
        const response = await apiClient.get<VendorContract[]>(`/procurement/contracts/expiring?days=${days}`);
        return response.data;
    },

    async getContractStatistics(): Promise<any> {
        const response = await apiClient.get<any>('/procurement/contracts/statistics');
        return response.data;
    }
};
