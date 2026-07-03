import { apiClient } from './api/client';

export interface Permission {
    id: string;
    module: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    roleId: string;
}

export interface Role {
    id: string;
    roleCode: string;
    roleName: string;
    category: string;
    description?: string;
    isActive: boolean;
    permissions?: Permission[];
    users?: User[];
    companyId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    fullName?: string;
    employeeCode?: string;
    employeeId?: string;
    employee?: {
        id: string;
        firstName: string;
        lastName: string;
        designation?: { name: string };
        department?: { name: string };
        branchId?: string;
        grade?: string;
        phone?: string;
        employmentStatus?: string;
        employmentType?: string;
    };
    roleId?: string;
    role?: Role;
    accessLevel: string;
    isActive: boolean;
    mfaEnabled: boolean;
    accountLocked: boolean;
    companyId: string;
    lastLogin?: string;
    createdAt?: string;
}

export interface DocumentType {
    id: string;
    typeCode: string;
    typeName: string;
    category: string;
    description?: string;
    isMandatory: boolean;
    isVerificationRequired: boolean;
    validityPeriod?: number;
    renewalRequired: boolean;
    allowedFormats: string[];
    maxFileSizeMB: number;
    multipleFilesAllowed: boolean;
    encryptionRequired: boolean;
    applicableFor: string;
    requiredForJoining: boolean;
    requiredForPayroll: boolean;
    isActive: boolean;
    companyId: string;
}

export interface NumberSeries {
    id: string;
    seriesCode: string;
    seriesName: string;
    documentType: string;
    module: string;
    prefix?: string;
    suffix?: string;
    separator: string;
    paddingLength: number;
    includeYear: boolean;
    includeMonth: boolean;
    yearFormat: string;
    monthFormat: string;
    currentNumber: number;
    startingNumber: number;
    endingNumber: number;
    incrementBy: number;
    resetFrequency: string;
    lastResetDate: string;
    nextResetDate?: string;
    allowDuplicates: boolean;
    allowManualEntry: boolean;
    validateSequence: boolean;
    defaultSeries: boolean;
    applicableLocations: string[];
    applicableDepartments: string[];
    isActive: boolean;
    companyId: string;
}

class SystemMastersService {
    async getAllUsers(companyId: string): Promise<User[]> {
        const response = await apiClient.get<User[]>(`/api/v1/common-masters/users?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllRoles(companyId: string): Promise<Role[]> {
        const response = await apiClient.get<Role[]>(`/api/v1/common-masters/roles?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllDocumentTypes(companyId: string): Promise<DocumentType[]> {
        const response = await apiClient.get<DocumentType[]>(`/api/v1/common-masters/document-types?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllNumberSeries(companyId: string): Promise<NumberSeries[]> {
        const response = await apiClient.get<NumberSeries[]>(`/api/v1/common-masters/number-series?companyId=${companyId}`);
        return response.data || [];
    }
}

export const systemMastersService = new SystemMastersService();
