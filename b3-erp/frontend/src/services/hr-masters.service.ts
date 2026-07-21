import { apiClient } from './api/client';

export interface Employee {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email?: string;
    phone?: string;
    designationId?: string;
    designation?: {
        id: string;
        name: string;
    };
    departmentId?: string;
    department?: {
        id: string;
        name: string;
    };
    branchId?: string;
    branch?: {
        id: string;
        name: string;
    };
    companyId: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Shift {
    id: string;
    code: string;
    name: string;
    startTime: string;
    endTime: string;
    companyId: string;
    isActive: boolean;
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
    type: string;
    companyId: string;
    isActive: boolean;
}

export interface Designation {
    id: string;
    code: string;
    name: string;
    companyId: string;
}

class HrMastersService {
    async getAllEmployees(companyId: string): Promise<Employee[]> {
        const response = await apiClient.get<Employee[]>(`/api/v1/common-masters/employees?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllShifts(companyId: string): Promise<Shift[]> {
        const response = await apiClient.get<Shift[]>(`/api/v1/common-masters/shifts?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllHolidays(companyId: string): Promise<Holiday[]> {
        const response = await apiClient.get<Holiday[]>(`/api/v1/common-masters/holidays?companyId=${companyId}`);
        return response.data || [];
    }

    async createHoliday(data: { name: string; date: string; companyId: string; type?: string; description?: string }): Promise<Holiday> {
        const response = await apiClient.post<Holiday>('/api/v1/common-masters/holidays', data);
        return response.data;
    }

    async updateHoliday(id: string, data: { name?: string; date?: string; type?: string; description?: string; isActive?: boolean }): Promise<Holiday> {
        const response = await apiClient.put<Holiday>(`/api/v1/common-masters/holidays/${id}`, data);
        return response.data;
    }

    async deleteHoliday(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/holidays/${id}`);
    }

    async getAllDesignations(companyId: string): Promise<Designation[]> {
        const response = await apiClient.get<Designation[]>(`/api/v1/common-masters/designations?companyId=${companyId}`);
        return response.data || [];
    }
}

export const hrMastersService = new HrMastersService();
