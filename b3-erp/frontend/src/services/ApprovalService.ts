import { apiClient } from './api/client';

export interface ApprovalRequest {
    id: string;
    documentType: 'requisition' | 'purchase_order' | 'rfq' | 'contract' | 'vendor' | 'payment';
    documentNumber: string;
    title: string;
    requestedBy: string;
    requestedDate: string;
    amount: number;
    currency: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
    currentApprover: string;
    approvalLevel: number;
    totalLevels: number;
    dueDate: string;
    department: string;
    vendor?: string;
    justification: string;
    attachments: number;
    comments: number;
    approvalHistory: ApprovalHistory[];
    nextApprovers: string[];
    slaStatus: 'on_time' | 'due_soon' | 'overdue';
    delegatedFrom?: string;
}

export interface ApprovalHistory {
    approver: string;
    action: 'approved' | 'rejected' | 'returned' | 'escalated';
    date: string;
    comments?: string;
    level: number;
}

export interface CreateApprovalDto {
    projectId: string;
    approvalType: string;
    referenceId: string;
    workflowType: 'sequential' | 'parallel' | 'conditional';
    steps: { approverId: string; approverRole?: string; stepNumber: number }[];
    createdBy: string;
    description?: string;
}

export const approvalService = {
    async getApprovals(filters?: any): Promise<ApprovalRequest[]> {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get<ApprovalRequest[]>(`/workflow/approvals?${params.toString()}`);
        return response.data;
    },

    async getApprovalById(id: string): Promise<ApprovalRequest> {
        const response = await apiClient.get<ApprovalRequest>(`/workflow/approvals/${id}`);
        return response.data;
    },

    async processAction(id: string, userId: string, action: 'approve' | 'reject', comments?: string): Promise<any> {
        const response = await apiClient.post<any>(`/workflow/approvals/${id}/action`, {
            userId,
            action,
            comments
        });
        return response.data;
    },

    async delegate(id: string, fromUserId: string, toUserId: string, reason?: string): Promise<any> {
        const response = await apiClient.post<any>(`/workflow/approvals/${id}/delegate`, {
            fromUserId,
            toUserId,
            reason
        });
        return response.data;
    },

    async getHistory(referenceId: string, approvalType: string): Promise<ApprovalHistory[]> {
        const params = new URLSearchParams({ referenceId, approvalType });
        const response = await apiClient.get<ApprovalHistory[]>(`/workflow/approvals/history?${params.toString()}`);
        return response.data;
    },

    async createApproval(data: CreateApprovalDto): Promise<any> {
        const response = await apiClient.post<any>('/workflow/approvals', data);
        return response.data;
    }
};
