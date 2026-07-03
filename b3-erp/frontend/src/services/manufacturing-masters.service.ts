import { apiClient } from './api/client';

export interface Machine {
    id: string;
    machineCode: string;
    machineName: string;
    description?: string;
    category?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    capacity?: string;
    power?: string;
    dimensions?: string;
    weight?: number;
    workCenterId?: string;
    workCenter?: {
        id: string;
        name: string;
    };
    status: string;
    efficiency: number;
    utilizationRate: number;
    companyId: string;
    isActive: boolean;
}

export interface WorkCenter {
    id: string;
    code: string;
    name: string;
    type?: string;
    departmentId?: string;
    department?: {
        id: string;
        name: string;
    };
    location?: string;
    dailyCapacity?: number;
    uomId?: string;
    uom?: {
        id: string;
        code: string;
    };
    efficiency: number;
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface Operation {
    id: string;
    code: string;
    name: string;
    description?: string;
    workCenterId: string;
    workCenter?: {
        id: string;
        name: string;
    };
    setupTime?: number;
    runTime?: number;
    companyId: string;
}

export interface Routing {
    id: string;
    code: string;
    name: string;
    itemId: string;
    item?: {
        id: string;
        name: string;
        code: string;
    };
    isDefault: boolean;
    steps?: RoutingStep[];
    companyId: string;
}

export interface RoutingStep {
    id: string;
    stepNumber: number;
    routingId: string;
    operationId: string;
    operation?: {
        id: string;
        name: string;
    };
    workCenterId: string;
    workCenter?: {
        id: string;
        name: string;
    };
    description?: string;
}

export interface Tool {
    id: string;
    code: string;
    name: string;
    description?: string;
    category?: string;
    lastSharpened?: string;
    nextService?: string;
    status: string;
    companyId: string;
}

export interface QualityParameter {
    id: string;
    code: string;
    name: string;
    description?: string;
    unit?: string;
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    companyId: string;
}

export interface Skill {
    id: string;
    name: string;
    description?: string;
    category?: string;
    companyId: string;
}

export interface Batch {
    id: string;
    batchNumber: string;
    itemId: string;
    item?: {
        id: string;
        name: string;
        code: string;
    };
    manufacturingDate?: string;
    expiryDate?: string;
    quantity: number;
    status: string;
    companyId: string;
}

export interface CabinetType {
    id: string;
    code: string;
    name: string;
    category: string;
    subcategory?: string;
    widthOptions?: string;
    depth?: number;
    height?: number;
    unit: string;
    doors: number;
    drawers: number;
    shelves: number;
    features: string[];
    materials: string[];
    finishOptions: string[];
    hardwareIncluded: string[];
    basePrice: number;
    installationType?: string;
    weightCapacity?: number;
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface KitchenHardware {
    id: string;
    code: string;
    name: string;
    category: string;
    subcategory?: string;
    brand?: string;
    specifications?: any;
    priceMin: number;
    priceMax: number;
    warranty?: string;
    installationType?: string;
    features: string[];
    stock: number;
    reorderLevel: number;
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface KitchenFinish {
    id: string;
    code: string;
    name: string;
    category: string;
    subcategory?: string;
    properties?: any;
    colors: string[];
    applicationMethod: string[];
    suitableFor: string[];
    coverageValue?: number;
    coverageUnit?: string;
    pricePerUnit: number;
    maintenance?: string;
    warranty?: string;
    certifications: string[];
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface MaterialGrade {
    id: string;
    code: string;
    name: string;
    category: string;
    grade: string;
    specifications?: any;
    qualityStandards: string[];
    applications: string[];
    features: string[];
    pricePerUnit: number;
    unit?: string;
    minOrderQuantity: number;
    availableSizes: string[];
    supplierRating: number;
    leadTime?: string;
    certifications: string[];
    warranty?: string;
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface KitchenLayout {
    id: string;
    code: string;
    name: string;
    layoutType: string;
    style: string;
    dimensions?: any;
    features: string[];
    cabinetUnits?: any;
    workTriangle?: any;
    specifications?: any;
    appliances: string[];
    estimatedCost: number;
    popularity: number;
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface InstallationType {
    id: string;
    code: string;
    name: string;
    category: string;
    complexity: string;
    requirements?: any;
    prerequisites: string[];
    steps: string[];
    materials: string[];
    suitableFor: string[];
    costMin: number;
    costMax: number;
    durationValue?: number;
    durationUnit?: string;
    warranty?: string;
    safetyRequirements: string[];
    certifications: string[];
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface KitchenAppliance {
    id: string;
    code: string;
    name: string;
    category: string;
    subcategory?: string;
    brand?: string;
    model?: string;
    specifications?: any;
    energyRating?: string;
    color: string[];
    warranty?: string;
    price: number;
    installationRequired: boolean;
    installationCost: number;
    certification: string[];
    availability: string;
    leadTime?: string;
    rating: number;
    reviews: number;
    status: string;
    companyId: string;
    isActive: boolean;
}

class ManufacturingMastersService {
    async getAllMachines(companyId: string): Promise<Machine[]> {
        const response = await apiClient.get<Machine[]>(`/api/v1/common-masters/machines?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllWorkCenters(companyId: string): Promise<WorkCenter[]> {
        const response = await apiClient.get<WorkCenter[]>(`/api/v1/common-masters/work-centers?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllOperations(companyId: string): Promise<Operation[]> {
        const response = await apiClient.get<Operation[]>(`/api/v1/common-masters/operations?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllRoutings(companyId: string): Promise<Routing[]> {
        const response = await apiClient.get<Routing[]>(`/api/v1/common-masters/routings?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllTools(companyId: string): Promise<Tool[]> {
        const response = await apiClient.get<Tool[]>(`/api/v1/common-masters/tools?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllQualityParameters(companyId: string): Promise<QualityParameter[]> {
        const response = await apiClient.get<QualityParameter[]>(`/api/v1/common-masters/quality-parameters?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllSkills(companyId: string): Promise<Skill[]> {
        const response = await apiClient.get<Skill[]>(`/api/v1/common-masters/skills?companyId=${companyId}`);
        return response.data || [];
    }

    async deleteSkill(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/skills/${id}`);
    }

    async getAllBatches(companyId: string): Promise<Batch[]> {
        const response = await apiClient.get<Batch[]>(`/api/v1/common-masters/batches?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllCabinetTypes(companyId: string): Promise<CabinetType[]> {
        const response = await apiClient.get<CabinetType[]>(`/api/v1/common-masters/cabinet-types?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllKitchenHardware(companyId: string): Promise<KitchenHardware[]> {
        const response = await apiClient.get<KitchenHardware[]>(`/api/v1/common-masters/kitchen-hardware?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllKitchenFinishes(companyId: string): Promise<KitchenFinish[]> {
        const response = await apiClient.get<KitchenFinish[]>(`/api/v1/common-masters/kitchen-finishes?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllMaterialGrades(companyId: string): Promise<MaterialGrade[]> {
        const response = await apiClient.get<MaterialGrade[]>(`/api/v1/common-masters/material-grades?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllKitchenLayouts(companyId: string): Promise<KitchenLayout[]> {
        const response = await apiClient.get<KitchenLayout[]>(`/api/v1/common-masters/kitchen-layouts?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllInstallationTypes(companyId: string): Promise<InstallationType[]> {
        const response = await apiClient.get<InstallationType[]>(`/api/v1/common-masters/installation-types?companyId=${companyId}`);
        return response.data || [];
    }

    async getAllKitchenAppliances(companyId: string): Promise<KitchenAppliance[]> {
        const response = await apiClient.get<KitchenAppliance[]>(`/api/v1/common-masters/kitchen-appliances?companyId=${companyId}`);
        return response.data || [];
    }
}

export const manufacturingMastersService = new ManufacturingMastersService();
