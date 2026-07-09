import { apiClient } from './api/client';

// Base URL for raw fetch calls (multipart uploads bypass the JSON apiClient).
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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

export interface ApprovalAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    documentType?: string;
    version?: string;
    uploadedBy?: string;
    uploadedAt?: string;
}

export interface ApprovalComment {
    id: string;
    approvalId: string;
    authorId?: string;
    authorName?: string;
    body: string;
    createdAt: string;
}

export interface WorkflowDocument {
    id: string;
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
    documentType?: string;
    version?: string;
    projectId?: string;
    uploadedBy?: string;
    uploadedAt?: string;
    metadata?: Record<string, unknown>;
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
    },

    async getAttachments(id: string): Promise<ApprovalAttachment[]> {
        const response = await apiClient.get<ApprovalAttachment[]>(`/workflow/approvals/${id}/attachments`);
        return response.data ?? [];
    },

    async getComments(id: string): Promise<ApprovalComment[]> {
        const response = await apiClient.get<ApprovalComment[]>(`/workflow/approvals/${id}/comments`);
        return response.data ?? [];
    },

    async addComment(id: string, body: string, authorId?: string, authorName?: string): Promise<ApprovalComment> {
        const response = await apiClient.post<ApprovalComment>(`/workflow/approvals/${id}/comments`, {
            body,
            authorId,
            authorName,
        });
        return response.data;
    },

    /**
     * Upload an attachment to an approval via multipart/form-data.
     * Uses raw fetch (not the JSON apiClient) so the browser sets the multipart
     * boundary itself — do NOT set Content-Type manually. Returns the created
     * attachment record; callers should refetch the attachments list after.
     */
    async uploadAttachment(
        id: string,
        file: File,
        userId?: string,
        documentType?: string,
    ): Promise<ApprovalAttachment> {
        const formData = new FormData();
        formData.append('file', file);
        if (userId) formData.append('userId', userId);
        if (documentType) formData.append('documentType', documentType);

        const response = await fetch(`${API_BASE_URL}/workflow/approvals/${id}/attachments`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!response.ok) {
            let message = response.statusText || `HTTP ${response.status}`;
            try {
                const body = await response.json();
                if (body?.message) {
                    message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
                }
            } catch {
                // keep statusText fallback
            }
            throw new Error(message);
        }
        const payload = await response.json();
        // Backend wraps most responses as { success, data }; unwrap defensively.
        return (payload?.data ?? payload) as ApprovalAttachment;
    },

    /**
     * Fetch document metadata (fileUrl etc.) for viewing.
     * GET /workflow/documents/:id
     */
    async getDocument(documentId: string): Promise<WorkflowDocument> {
        const response = await apiClient.get<WorkflowDocument>(`/workflow/documents/${documentId}`);
        return response.data;
    }
};
