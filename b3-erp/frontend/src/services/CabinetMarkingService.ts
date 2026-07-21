// Typed client for the Cabinet Marking Tasks persistence vertical.
// Talks to the NestJS domain backend (port 3001).
//
// The NestJS controller is @Controller('api/project-management/cabinet-marking')
// and the app runs behind the global prefix `api/v1`, so the full path is
// `/api/v1/api/project-management/cabinet-marking`. API_BASE_URL already ends in
// `/api/v1`, hence the `/api/project-management/cabinet-marking` suffix below.

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const BASE = `${API_BASE_URL}/api/project-management/cabinet-marking`;

const headers = {
    'Content-Type': 'application/json',
    'x-company-id': process.env.NEXT_PUBLIC_COMPANY_ID || 'test',
};

export interface CabinetMarkingTaskRecord {
    id: string;
    companyId?: string;
    projectId: string;
    projectName?: string;
    taskNumber?: string;
    cabinetType?: string;
    zone?: string;
    markingType?: string;
    quantity?: number;
    assignedTeam?: string;
    assignedTo?: string;
    status?: string;
    scheduledDate?: string;
    completedDate?: string;
    completionPercentage?: number;
    markedItems?: number;
    totalItems?: number;
    photosUploaded?: number;
    reportGenerated?: boolean;
    checklist?: any;
    notes?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

// Unwrap the { success, data } envelope defensively.
function unwrap(payload: any) {
    return payload?.data ?? payload;
}

export const CabinetMarkingService = {
    async list(projectId?: string): Promise<CabinetMarkingTaskRecord[]> {
        const url = projectId
            ? `${BASE}?projectId=${encodeURIComponent(projectId)}`
            : BASE;
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) return [];
        const data = unwrap(await res.json());
        return Array.isArray(data) ? data : [];
    },

    async create(
        data: Partial<CabinetMarkingTaskRecord>,
    ): Promise<CabinetMarkingTaskRecord> {
        const res = await fetch(BASE, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Failed to create task (HTTP ${res.status})`);
        return unwrap(await res.json());
    },

    async update(
        id: string,
        data: Partial<CabinetMarkingTaskRecord>,
    ): Promise<CabinetMarkingTaskRecord> {
        const res = await fetch(`${BASE}/${id}`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Failed to update task (HTTP ${res.status})`);
        return unwrap(await res.json());
    },

    async remove(id: string): Promise<void> {
        const res = await fetch(`${BASE}/${id}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to delete task (HTTP ${res.status})`);
    },
};

export default CabinetMarkingService;
