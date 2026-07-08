import { apiClient } from './api/client';

export interface CostCenter {
    id: string;
    code: string;
    name: string;
    companyId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Plant {
    id: string;
    code: string;
    name: string;
    companyId: string;
    branchId?: string;
    branch?: {
        id: string;
        name: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExchangeRate {
    id: string;
    fromCurrencyId: string;
    fromCurrency: {
        id: string;
        code: string;
        name: string;
    };
    toCurrencyId: string;
    toCurrency: {
        id: string;
        code: string;
        name: string;
    };
    rate: number;
    effectiveDate: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ItemCategory {
    id: string;
    name: string;
    companyId: string;
    isActive: boolean;
}

export interface ItemGroup {
    id: string;
    name: string;
    categoryId: string;
    category?: ItemCategory;
    companyId: string;
    isActive: boolean;
}

export interface Brand {
    id: string;
    name: string;
    companyId: string;
    isActive: boolean;
}

export interface HsnSac {
    id: string;
    code: string;
    description?: string;
    gstPercentage: number;
    companyId: string;
    isActive: boolean;
}

export interface CustomerCategory {
    id: string;
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    level?: string;
    classification?: string;
    status: string;
    criteria?: any;
    benefits?: any;
    terms?: any;
    targets?: any;
    metrics?: any;
}

export interface Customer {
    id: string;
    customerCode: string;
    customerName: string;
    customerType: string;
    status: string;
    categoryId?: string;
    category?: CustomerCategory;
    contactPerson?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    website?: string;
    address?: any;
    billingAddress?: any;
    taxInfo?: any;
    creditInfo?: any;
    pricing?: any;
    salesInfo?: any;
}

export interface VendorCategory {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Vendor {
    id: string;
    vendorCode: string;
    vendorName: string;
    vendorType: string;
    status: string;
    categoryId?: string;
    category?: VendorCategory;
    contactPerson?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    website?: string;
    address?: any;
    taxInfo?: any;
    paymentInfo?: any;
    qualifications?: any;
    supplierInfo?: any;
    performance?: any;
}

export interface Account {
    id: string;
    accountCode: string;
    accountName: string;
    parentId?: string;
    level: number;
    accountType: string;
    accountSubType?: string;
    status: string;
    description?: string;
    isControlAccount: boolean;
    allowPosting: boolean;
    currency: string;
    taxConfiguration?: any;
    reportingSettings?: any;
    balanceInfo?: any;
    restrictions?: any;
    integration?: any;
}

export interface BankAccount {
    id: string;
    bankName: string;
    branchName?: string;
    accountNumber: string;
    accountType: string;
    ifscCode: string;
    swiftCode?: string;
    micrCode?: string;
    accountHolderName: string;
    currency: string;
    status: string;
    isPrimary: boolean;
    contactDetails?: any;
    bankingDetails?: any;
    onlineAccess?: any;
}

export interface Tax {
    id: string;
    taxCode: string;
    taxName: string;
    taxType: string;
    status: string;
    description?: string;
    rate: number;
    rateType: string;
    taxComponents?: any;
    applicability?: any;
    calculation?: any;
    compliance?: any;
    validity?: any;
    accounting?: any;
    statistics?: any;
}

export interface PaymentTerm {
    id: string;
    termCode: string;
    termName: string;
    description?: string;
    paymentType: string;
    dueDays?: number;
    dueDate?: number;
    installments?: any;
    discountTerms?: any;
    penaltyTerms?: any;
    applicableTo: string;
    isDefault: boolean;
    status: string;
}

export interface PriceListItem {
    id: string;
    itemCode: string;
    itemName: string;
    price: number;
    minQty?: number;
    maxQty?: number;
}

export interface PriceList {
    id: string;
    priceListCode: string;
    priceListName: string;
    description?: string;
    effectiveFrom: string;
    effectiveTo?: string;
    customerCategory: string;
    applicableFor: string;
    pricingMethod: string;
    markupPercentage?: number;
    currency: string;
    includeTax: boolean;
    isDefault: boolean;
    status: string;
    items?: PriceListItem[];
}

export interface Country {
    id: string;
    code: string;
    name: string;
    phoneCode?: string;
    isActive: boolean;
}

export interface State {
    id: string;
    name: string;
    countryId: string;
    country?: Country;
    isActive: boolean;
}

export interface City {
    id: string;
    name: string;
    stateId: string;
    state?: State & { country?: Country };
    isActive: boolean;
}

export interface Territory {
    id: string;
    code: string;
    name: string;
    companyId: string;
    isActive: boolean;
}

export interface HrGrade {
    id: string;
    gradeCode: string;
    gradeName: string;
    level: number;
    category: string;
    minSalary: number;
    maxSalary: number;
    currency: string;
    benefits?: any;
    leaveEntitlement?: any;
    perks: string[];
    probationPeriod: number;
    noticePeriod: number;
    appraisalCycle: string;
    eligibleDesignations: string[];
    description?: string;
    companyId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: string;
    name: string;
    taxId: string;
    registrationNumber?: string;
    baseCurrencyId?: string;
    baseCurrency?: { id: string; code: string; name: string };
    logoUrl?: string;
    address?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Branch {
    id: string;
    name: string;
    companyId: string;
    cityId?: string;
    city?: { id: string; name: string; state?: { id: string; name: string; country?: Country } };
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol?: string;
    exchangeRate?: number;
    isActive: boolean;
}

export interface UomConversion {
    id: string;
    fromUomId: string;
    fromUom: { id: string; code: string; name: string };
    toUomId: string;
    toUom: { id: string; code: string; name: string };
    conversionFactor: number;
    itemId?: string;
    item?: { id: string; code: string; name: string };
    companyId: string;
    isActive: boolean;
}

export interface Barcode {
    id: string;
    code: string;
    barcode?: string;
    barcodeType?: string;
    description?: string;
    itemId: string;
    item?: { id: string; code: string; name: string };
    companyId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CabinetType {
    id: string;
    code: string;
    name: string;
    category?: string;
    description?: string;
    specifications?: any;
    companyId: string;
    isActive: boolean;
}

export interface KitchenHardware {
    id: string;
    code: string;
    name: string;
    category?: string;
    manufacturer?: string;
    price?: number;
    companyId: string;
    isActive: boolean;
}

export interface KitchenFinish {
    id: string;
    code: string;
    name: string;
    category?: string;
    color?: string;
    texture?: string;
    price?: number;
    companyId: string;
    isActive: boolean;
}

export interface MaterialGrade {
    id: string;
    code: string;
    name: string;
    category?: string;
    description?: string;
    priceMultiplier?: number;
    companyId: string;
    isActive: boolean;
}

export interface KitchenLayout {
    id: string;
    code: string;
    name: string;
    layoutType?: string;
    description?: string;
    image?: string;
    companyId: string;
    isActive: boolean;
}

export interface InstallationType {
    id: string;
    code: string;
    name: string;
    description?: string;
    laborRate?: number;
    estimatedDays?: number;
    companyId: string;
    isActive: boolean;
}

export interface KitchenAppliance {
    id: string;
    code: string;
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    price?: number;
    companyId: string;
    isActive: boolean;
}

export interface CounterMaterial {
    id: string;
    code: string;
    name: string;
    materialType: string;
    category?: string;
    thickness?: string[];
    colors?: string[];
    finishes?: string[];
    durability?: string;
    heatResistance?: string;
    stainResistance?: string;
    scratchResistance?: string;
    pricePerSqFt?: number;
    minimumOrderSqFt?: number;
    leadTimeDays?: number;
    specifications?: any;
    careInstructions?: string;
    warranty?: string;
    supplier?: string;
    origin?: string;
    certification?: string[];
    status: string;
    companyId: string;
    isActive: boolean;
}

export interface BulkImportResult {
    entity: string;
    total: number;
    created: number;
    skipped: number;
    errors: { row: number; reason: string }[];
}

export interface Warehouse {
    id: string;
    warehouseCode: string;
    warehouseName: string;
    companyId: string;
    branchId?: string;
    branch?: { id: string; name: string };
    address?: string;
    warehouseType?: string;
    status?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    totalArea?: number;
    areaUnit?: string;
    storageCapacity?: number;
    capacityUnit?: string;
    currentUtilization?: number;
    managerName?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Location {
    id: string;
    code: string;
    name: string;
    type: string;
    parentId?: string;
    parent?: { id: string; name: string };
    parentName?: string;
    address?: any;
    coordinates?: any;
    contact?: any;
    operational?: any;
    logistics?: any;
    compliance?: any;
    facilities?: string[];
    restrictions?: string[];
    status?: string;
    companyId: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

class CommonMastersService {
    // ===========================
    // GENERIC CRUD HELPER METHODS
    // ===========================
    private buildParams(companyId?: string): string {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        return params.toString();
    }

    // ===========================
    // BULK CSV IMPORT
    // ===========================
    /**
     * Bulk-create master records from parsed CSV rows.
     * `entity` is the URL segment, e.g. 'countries', 'item-categories'.
     * Company-scoped entities require `companyId`.
     */
    async bulkCreate(
        entity: string,
        rows: Record<string, string>[],
        companyId?: string,
    ): Promise<BulkImportResult> {
        const response = await apiClient.post<BulkImportResult>(
            `/api/v1/common-masters/${entity}/bulk`,
            { rows, companyId },
        );
        return response.data;
    }

    /**
     * Get all cost centers
     */
    async getAllCostCenters(companyId?: string): Promise<CostCenter[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<CostCenter[]>(`/api/v1/common-masters/cost-centers?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all plants
     */
    async getAllPlants(companyId?: string): Promise<Plant[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Plant[]>(`/api/v1/common-masters/plants?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all exchange rates
     */
    async getAllExchangeRates(companyId?: string): Promise<ExchangeRate[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<ExchangeRate[]>(`/api/v1/common-masters/exchange-rates?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all Item Categories
     */
    async getAllItemCategories(companyId?: string): Promise<ItemCategory[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<ItemCategory[]>(`/api/v1/common-masters/item-categories?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all Units of Measure (UOM master)
     */
    async getAllUoms(companyId?: string): Promise<any[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<any[]>(`/api/v1/common-masters/uoms?${params.toString()}`);
        return response.data || [];
    }

    async createUom(data: any): Promise<any> {
        const response = await apiClient.post<any>('/api/v1/common-masters/uoms', data);
        return response.data;
    }

    async updateUom(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/api/v1/common-masters/uoms/${id}`, data);
        return response.data;
    }

    async deleteUom(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/uoms/${id}`);
    }

    /**
     * Get all Item Groups
     */
    async getAllItemGroups(companyId?: string): Promise<ItemGroup[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<ItemGroup[]>(`/api/v1/common-masters/item-groups?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all Brands
     */
    async getAllBrands(companyId?: string): Promise<Brand[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Brand[]>(`/api/v1/common-masters/brands?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all HSN/SAC Codes
     */
    async getAllHsnSacs(companyId?: string): Promise<HsnSac[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<HsnSac[]>(`/api/v1/common-masters/hsn-sacs?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all customer categories
     */
    async getAllCustomerCategories(companyId?: string): Promise<CustomerCategory[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<CustomerCategory[]>(`/api/v1/common-masters/customer-categories?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all customers
     */
    async getAllCustomers(companyId?: string): Promise<Customer[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Customer[]>(`/api/v1/common-masters/customers?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all vendor categories
     */
    async getAllVendorCategories(companyId?: string): Promise<VendorCategory[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<VendorCategory[]>(`/api/v1/common-masters/vendor-categories?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all vendors
     */
    async getAllVendors(companyId?: string): Promise<Vendor[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Vendor[]>(`/api/v1/common-masters/vendors?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all financial accounts
     */
    async getAllAccounts(companyId?: string): Promise<Account[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Account[]>(`/api/v1/common-masters/accounts?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all bank accounts
     */
    async getAllBankAccounts(companyId?: string): Promise<BankAccount[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<BankAccount[]>(`/api/v1/common-masters/bank-accounts?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all taxes
     */
    async getAllTaxes(companyId?: string): Promise<Tax[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Tax[]>(`/api/v1/common-masters/taxes?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all payment terms
     */
    async getAllPaymentTerms(companyId?: string): Promise<PaymentTerm[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<PaymentTerm[]>(`/api/v1/common-masters/payment-terms?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all price lists
     */
    async getAllPriceLists(companyId?: string): Promise<PriceList[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<PriceList[]>(`/api/v1/common-masters/price-lists?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all countries
     */
    async getAllCountries(): Promise<Country[]> {
        const response = await apiClient.get<Country[]>('/api/v1/common-masters/countries');
        return response.data || [];
    }

    /**
     * Get all states by country
     */
    async getStatesByCountry(countryId: string): Promise<State[]> {
        const response = await apiClient.get<State[]>(`/api/v1/common-masters/states/${countryId}`);
        return response.data || [];
    }

    /**
     * Get all cities by state
     */
    async getCitiesByState(stateId: string): Promise<City[]> {
        const response = await apiClient.get<City[]>(`/api/v1/common-masters/cities/${stateId}`);
        return response.data || [];
    }

    /**
     * Get all states (no country filter) — for the state-master page
     */
    async getAllStates(): Promise<State[]> {
        const response = await apiClient.get<State[]>('/api/v1/common-masters/states-all');
        return response.data || [];
    }

    /**
     * Get all cities (no state filter) — for the city-master page
     */
    async getAllCities(): Promise<City[]> {
        const response = await apiClient.get<City[]>('/api/v1/common-masters/cities-all');
        return response.data || [];
    }

    /**
     * Get all HR grades — for the grade-master page
     */
    async getAllHrGrades(companyId?: string): Promise<HrGrade[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<HrGrade[]>(`/api/v1/common-masters/grades?${params.toString()}`);
        return response.data || [];
    }

    /**
     * Get all territories
     */
    async getAllTerritories(companyId?: string): Promise<Territory[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Territory[]>(`/api/v1/common-masters/territories?${params.toString()}`);
        return response.data || [];
    }

    // ===========================
    // COST CENTER CRUD
    // ===========================
    async createCostCenter(data: { code: string; name: string; companyId: string }): Promise<CostCenter> {
        const response = await apiClient.post<CostCenter>('/api/v1/common-masters/cost-centers', data);
        return response.data;
    }

    async updateCostCenter(id: string, data: Partial<CostCenter>): Promise<CostCenter> {
        const response = await apiClient.put<CostCenter>(`/api/v1/common-masters/cost-centers/${id}`, data);
        return response.data;
    }

    async deleteCostCenter(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/cost-centers/${id}`);
    }

    // ===========================
    // PLANT CRUD
    // ===========================
    async createPlant(data: { code: string; name: string; companyId: string; branchId?: string }): Promise<Plant> {
        const response = await apiClient.post<Plant>('/api/v1/common-masters/plants', data);
        return response.data;
    }

    async updatePlant(id: string, data: Partial<Plant>): Promise<Plant> {
        const response = await apiClient.put<Plant>(`/api/v1/common-masters/plants/${id}`, data);
        return response.data;
    }

    async deletePlant(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/plants/${id}`);
    }

    // ===========================
    // ITEM CATEGORY CRUD
    // ===========================
    async createItemCategory(data: { name: string; companyId: string }): Promise<ItemCategory> {
        const response = await apiClient.post<ItemCategory>('/api/v1/common-masters/item-categories', data);
        return response.data;
    }

    async updateItemCategory(id: string, data: Partial<ItemCategory>): Promise<ItemCategory> {
        const response = await apiClient.put<ItemCategory>(`/api/v1/common-masters/item-categories/${id}`, data);
        return response.data;
    }

    async deleteItemCategory(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/item-categories/${id}`);
    }

    // ===========================
    // ITEM GROUP CRUD
    // ===========================
    async createItemGroup(data: { name: string; categoryId: string; companyId: string }): Promise<ItemGroup> {
        const response = await apiClient.post<ItemGroup>('/api/v1/common-masters/item-groups', data);
        return response.data;
    }

    async updateItemGroup(id: string, data: Partial<ItemGroup>): Promise<ItemGroup> {
        const response = await apiClient.put<ItemGroup>(`/api/v1/common-masters/item-groups/${id}`, data);
        return response.data;
    }

    async deleteItemGroup(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/item-groups/${id}`);
    }

    // ===========================
    // BRAND CRUD
    // ===========================
    async createBrand(data: { name: string; companyId: string }): Promise<Brand> {
        const response = await apiClient.post<Brand>('/api/v1/common-masters/brands', data);
        return response.data;
    }

    async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
        const response = await apiClient.put<Brand>(`/api/v1/common-masters/brands/${id}`, data);
        return response.data;
    }

    async deleteBrand(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/brands/${id}`);
    }

    // ===========================
    // HSN/SAC CRUD
    // ===========================
    async createHsnSac(data: { code: string; description?: string; gstPercentage?: number; companyId: string }): Promise<HsnSac> {
        const response = await apiClient.post<HsnSac>('/api/v1/common-masters/hsn-sacs', data);
        return response.data;
    }

    async updateHsnSac(id: string, data: Partial<HsnSac>): Promise<HsnSac> {
        const response = await apiClient.put<HsnSac>(`/api/v1/common-masters/hsn-sacs/${id}`, data);
        return response.data;
    }

    async deleteHsnSac(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/hsn-sacs/${id}`);
    }

    // ===========================
    // CUSTOMER CATEGORY CRUD
    // ===========================
    async createCustomerCategory(data: Partial<CustomerCategory> & { companyId: string }): Promise<CustomerCategory> {
        const response = await apiClient.post<CustomerCategory>('/api/v1/common-masters/customer-categories', data);
        return response.data;
    }

    async updateCustomerCategory(id: string, data: Partial<CustomerCategory>): Promise<CustomerCategory> {
        const response = await apiClient.put<CustomerCategory>(`/api/v1/common-masters/customer-categories/${id}`, data);
        return response.data;
    }

    async deleteCustomerCategory(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/customer-categories/${id}`);
    }

    // ===========================
    // CUSTOMER CRUD
    // ===========================
    async createCustomer(data: Partial<Customer> & { customerCode: string; customerName: string; companyId: string }): Promise<Customer> {
        const response = await apiClient.post<Customer>('/api/v1/common-masters/customers', data);
        return response.data;
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
        const response = await apiClient.put<Customer>(`/api/v1/common-masters/customers/${id}`, data);
        return response.data;
    }

    async deleteCustomer(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/customers/${id}`);
    }

    // ===========================
    // VENDOR CATEGORY CRUD
    // ===========================
    async createVendorCategory(data: { name: string; description?: string; companyId: string }): Promise<VendorCategory> {
        const response = await apiClient.post<VendorCategory>('/api/v1/common-masters/vendor-categories', data);
        return response.data;
    }

    async updateVendorCategory(id: string, data: Partial<VendorCategory>): Promise<VendorCategory> {
        const response = await apiClient.put<VendorCategory>(`/api/v1/common-masters/vendor-categories/${id}`, data);
        return response.data;
    }

    async deleteVendorCategory(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/vendor-categories/${id}`);
    }

    // ===========================
    // VENDOR CRUD
    // ===========================
    async createVendor(data: Partial<Vendor> & { vendorCode: string; vendorName: string; companyId: string }): Promise<Vendor> {
        const response = await apiClient.post<Vendor>('/api/v1/common-masters/vendors', data);
        return response.data;
    }

    async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
        const response = await apiClient.put<Vendor>(`/api/v1/common-masters/vendors/${id}`, data);
        return response.data;
    }

    async deleteVendor(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/vendors/${id}`);
    }

    // ===========================
    // ACCOUNT CRUD
    // ===========================
    async createAccount(data: Partial<Account> & { accountCode: string; accountName: string; accountType: string; companyId: string }): Promise<Account> {
        const response = await apiClient.post<Account>('/api/v1/common-masters/accounts', data);
        return response.data;
    }

    async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
        const response = await apiClient.put<Account>(`/api/v1/common-masters/accounts/${id}`, data);
        return response.data;
    }

    async deleteAccount(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/accounts/${id}`);
    }

    // ===========================
    // BANK ACCOUNT CRUD
    // ===========================
    async createBankAccount(data: Partial<BankAccount> & { bankName: string; accountNumber: string; accountType: string; ifscCode: string; accountHolderName: string; companyId: string }): Promise<BankAccount> {
        const response = await apiClient.post<BankAccount>('/api/v1/common-masters/bank-accounts', data);
        return response.data;
    }

    async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
        const response = await apiClient.put<BankAccount>(`/api/v1/common-masters/bank-accounts/${id}`, data);
        return response.data;
    }

    async deleteBankAccount(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/bank-accounts/${id}`);
    }

    // ===========================
    // TAX CRUD
    // ===========================
    async createTax(data: Partial<Tax> & { taxCode: string; taxName: string; taxType: string; rate: number; companyId: string }): Promise<Tax> {
        const response = await apiClient.post<Tax>('/api/v1/common-masters/taxes', data);
        return response.data;
    }

    async updateTax(id: string, data: Partial<Tax>): Promise<Tax> {
        const response = await apiClient.put<Tax>(`/api/v1/common-masters/taxes/${id}`, data);
        return response.data;
    }

    async deleteTax(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/taxes/${id}`);
    }

    // ===========================
    // PAYMENT TERMS CRUD
    // ===========================
    async createPaymentTerm(data: Partial<PaymentTerm> & { termCode: string; termName: string; paymentType: string; companyId: string }): Promise<PaymentTerm> {
        const response = await apiClient.post<PaymentTerm>('/api/v1/common-masters/payment-terms', data);
        return response.data;
    }

    async updatePaymentTerm(id: string, data: Partial<PaymentTerm>): Promise<PaymentTerm> {
        const response = await apiClient.put<PaymentTerm>(`/api/v1/common-masters/payment-terms/${id}`, data);
        return response.data;
    }

    async deletePaymentTerm(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/payment-terms/${id}`);
    }

    // ===========================
    // PRICE LIST CRUD
    // ===========================
    async createPriceList(data: Partial<PriceList> & { priceListCode: string; priceListName: string; effectiveFrom: string; companyId: string }): Promise<PriceList> {
        const response = await apiClient.post<PriceList>('/api/v1/common-masters/price-lists', data);
        return response.data;
    }

    async updatePriceList(id: string, data: Partial<PriceList>): Promise<PriceList> {
        const response = await apiClient.put<PriceList>(`/api/v1/common-masters/price-lists/${id}`, data);
        return response.data;
    }

    async deletePriceList(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/price-lists/${id}`);
    }

    // ===========================
    // TERRITORY CRUD
    // ===========================
    async createTerritory(data: { code: string; name: string; companyId: string }): Promise<Territory> {
        const response = await apiClient.post<Territory>('/api/v1/common-masters/territories', data);
        return response.data;
    }

    async updateTerritory(id: string, data: Partial<Territory>): Promise<Territory> {
        const response = await apiClient.put<Territory>(`/api/v1/common-masters/territories/${id}`, data);
        return response.data;
    }

    async deleteTerritory(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/territories/${id}`);
    }

    // ===========================
    // COMPANY CRUD
    // ===========================
    async getAllCompanies(): Promise<Company[]> {
        const response = await apiClient.get<Company[]>('/api/v1/common-masters/companies');
        return response.data || [];
    }

    async createCompany(data: Partial<Company> & { name: string; taxId: string }): Promise<Company> {
        const response = await apiClient.post<Company>('/api/v1/common-masters/companies', data);
        return response.data;
    }

    async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
        const response = await apiClient.put<Company>(`/api/v1/common-masters/companies/${id}`, data);
        return response.data;
    }

    async deleteCompany(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/companies/${id}`);
    }

    // ===========================
    // BRANCH CRUD
    // ===========================
    async getAllBranches(companyId?: string): Promise<Branch[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Branch[]>(`/api/v1/common-masters/branches?${params.toString()}`);
        return response.data || [];
    }

    async createBranch(data: { name: string; companyId: string; cityId?: string; address?: string }): Promise<Branch> {
        const response = await apiClient.post<Branch>('/api/v1/common-masters/branches', data);
        return response.data;
    }

    async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
        const response = await apiClient.put<Branch>(`/api/v1/common-masters/branches/${id}`, data);
        return response.data;
    }

    async deleteBranch(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/branches/${id}`);
    }

    // ===========================
    // CURRENCY CRUD
    // ===========================
    async getAllCurrencies(): Promise<Currency[]> {
        const response = await apiClient.get<Currency[]>('/api/v1/common-masters/currencies');
        return response.data || [];
    }

    async createCurrency(data: { code: string; name: string; symbol?: string; exchangeRate?: number }): Promise<Currency> {
        const response = await apiClient.post<Currency>('/api/v1/common-masters/currencies', data);
        return response.data;
    }

    async updateCurrency(id: string, data: Partial<Currency>): Promise<Currency> {
        const response = await apiClient.put<Currency>(`/api/v1/common-masters/currencies/${id}`, data);
        return response.data;
    }

    async deleteCurrency(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/currencies/${id}`);
    }

    // ===========================
    // EXCHANGE RATE CRUD
    // ===========================
    async createExchangeRate(data: { fromCurrencyId: string; toCurrencyId: string; rate: number; effectiveDate: string; companyId: string }): Promise<ExchangeRate> {
        const response = await apiClient.post<ExchangeRate>('/api/v1/common-masters/exchange-rates', data);
        return response.data;
    }

    async updateExchangeRate(id: string, data: Partial<ExchangeRate>): Promise<ExchangeRate> {
        const response = await apiClient.put<ExchangeRate>(`/api/v1/common-masters/exchange-rates/${id}`, data);
        return response.data;
    }

    async deleteExchangeRate(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/exchange-rates/${id}`);
    }

    // ===========================
    // UOM CONVERSION CRUD
    // ===========================
    async getAllUomConversions(companyId?: string): Promise<UomConversion[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<UomConversion[]>(`/api/v1/common-masters/uom-conversions?${params.toString()}`);
        return response.data || [];
    }

    async createUomConversion(data: { fromUomId: string; toUomId: string; conversionFactor: number; companyId: string; itemId?: string }): Promise<UomConversion> {
        const response = await apiClient.post<UomConversion>('/api/v1/common-masters/uom-conversions', data);
        return response.data;
    }

    async updateUomConversion(id: string, data: Partial<UomConversion>): Promise<UomConversion> {
        const response = await apiClient.put<UomConversion>(`/api/v1/common-masters/uom-conversions/${id}`, data);
        return response.data;
    }

    async deleteUomConversion(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/uom-conversions/${id}`);
    }

    // ===========================
    // BARCODE CRUD
    // ===========================
    async getAllBarcodes(companyId?: string): Promise<Barcode[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Barcode[]>(`/api/v1/common-masters/barcodes?${params.toString()}`);
        return response.data || [];
    }

    async createBarcode(data: { code: string; itemId: string; companyId: string; barcodeType?: string; description?: string }): Promise<Barcode> {
        const response = await apiClient.post<Barcode>('/api/v1/common-masters/barcodes', data);
        return response.data;
    }

    async updateBarcode(id: string, data: Partial<Barcode>): Promise<Barcode> {
        const response = await apiClient.put<Barcode>(`/api/v1/common-masters/barcodes/${id}`, data);
        return response.data;
    }

    async deleteBarcode(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/barcodes/${id}`);
    }

    /** Lightweight item list (id/code/name) for selectors such as barcode linking. */
    async getItems(companyId?: string): Promise<{ id: string; code: string; name: string }[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<{ id: string; code: string; name: string }[]>(`/api/v1/common-masters/items?${params.toString()}`);
        return response.data || [];
    }

    // ===========================
    // ITEM CRUD
    // ===========================
    async createItem(data: any): Promise<any> {
        const response = await apiClient.post<any>('/api/v1/common-masters/items', data);
        return response.data;
    }

    async updateItem(id: string, data: any): Promise<any> {
        const response = await apiClient.put<any>(`/api/v1/common-masters/items/${id}`, data);
        return response.data;
    }

    async deleteItem(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/items/${id}`);
    }

    /** Full item list (with type, uom, prices) for item/material pickers in BOM/work-order forms. */
    async getItemsFull(companyId?: string): Promise<Array<{
        id: string; code: string; name: string; description?: string; itemType?: string;
        purchasePrice?: number; sellingPrice?: number; costPrice?: number;
        uom?: { id: string; code?: string; name?: string } | null;
    }>> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<any[]>(`/api/v1/common-masters/items?${params.toString()}`);
        return response.data || [];
    }

    // ===========================
    // CABINET TYPE CRUD
    // ===========================
    async getAllCabinetTypes(companyId?: string): Promise<CabinetType[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<CabinetType[]>(`/api/v1/common-masters/cabinet-types?${params.toString()}`);
        return response.data || [];
    }

    async createCabinetType(data: { code: string; name: string; companyId: string; category?: string; description?: string; specifications?: any }): Promise<CabinetType> {
        const response = await apiClient.post<CabinetType>('/api/v1/common-masters/cabinet-types', data);
        return response.data;
    }

    async updateCabinetType(id: string, data: Partial<CabinetType>): Promise<CabinetType> {
        const response = await apiClient.put<CabinetType>(`/api/v1/common-masters/cabinet-types/${id}`, data);
        return response.data;
    }

    async deleteCabinetType(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/cabinet-types/${id}`);
    }

    // ===========================
    // KITCHEN HARDWARE CRUD
    // ===========================
    async getAllKitchenHardware(companyId?: string): Promise<KitchenHardware[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<KitchenHardware[]>(`/api/v1/common-masters/kitchen-hardware?${params.toString()}`);
        return response.data || [];
    }

    async createKitchenHardware(data: { code: string; name: string; companyId: string; category?: string; manufacturer?: string; price?: number }): Promise<KitchenHardware> {
        const response = await apiClient.post<KitchenHardware>('/api/v1/common-masters/kitchen-hardware', data);
        return response.data;
    }

    async updateKitchenHardware(id: string, data: Partial<KitchenHardware>): Promise<KitchenHardware> {
        const response = await apiClient.put<KitchenHardware>(`/api/v1/common-masters/kitchen-hardware/${id}`, data);
        return response.data;
    }

    async deleteKitchenHardware(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/kitchen-hardware/${id}`);
    }

    // ===========================
    // KITCHEN FINISH CRUD
    // ===========================
    async getAllKitchenFinishes(companyId?: string): Promise<KitchenFinish[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<KitchenFinish[]>(`/api/v1/common-masters/kitchen-finishes?${params.toString()}`);
        return response.data || [];
    }

    async createKitchenFinish(data: { code: string; name: string; companyId: string; category?: string; color?: string; texture?: string; price?: number }): Promise<KitchenFinish> {
        const response = await apiClient.post<KitchenFinish>('/api/v1/common-masters/kitchen-finishes', data);
        return response.data;
    }

    async updateKitchenFinish(id: string, data: Partial<KitchenFinish>): Promise<KitchenFinish> {
        const response = await apiClient.put<KitchenFinish>(`/api/v1/common-masters/kitchen-finishes/${id}`, data);
        return response.data;
    }

    async deleteKitchenFinish(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/kitchen-finishes/${id}`);
    }

    // ===========================
    // MATERIAL GRADE CRUD
    // ===========================
    async getAllMaterialGrades(companyId?: string): Promise<MaterialGrade[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<MaterialGrade[]>(`/api/v1/common-masters/material-grades?${params.toString()}`);
        return response.data || [];
    }

    async createMaterialGrade(data: { code: string; name: string; companyId: string; category?: string; description?: string; priceMultiplier?: number }): Promise<MaterialGrade> {
        const response = await apiClient.post<MaterialGrade>('/api/v1/common-masters/material-grades', data);
        return response.data;
    }

    async updateMaterialGrade(id: string, data: Partial<MaterialGrade>): Promise<MaterialGrade> {
        const response = await apiClient.put<MaterialGrade>(`/api/v1/common-masters/material-grades/${id}`, data);
        return response.data;
    }

    async deleteMaterialGrade(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/material-grades/${id}`);
    }

    // ===========================
    // KITCHEN LAYOUT CRUD
    // ===========================
    async getAllKitchenLayouts(companyId?: string): Promise<KitchenLayout[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<KitchenLayout[]>(`/api/v1/common-masters/kitchen-layouts?${params.toString()}`);
        return response.data || [];
    }

    async createKitchenLayout(data: { code: string; name: string; companyId: string; layoutType?: string; description?: string; image?: string }): Promise<KitchenLayout> {
        const response = await apiClient.post<KitchenLayout>('/api/v1/common-masters/kitchen-layouts', data);
        return response.data;
    }

    async updateKitchenLayout(id: string, data: Partial<KitchenLayout>): Promise<KitchenLayout> {
        const response = await apiClient.put<KitchenLayout>(`/api/v1/common-masters/kitchen-layouts/${id}`, data);
        return response.data;
    }

    async deleteKitchenLayout(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/kitchen-layouts/${id}`);
    }

    // ===========================
    // INSTALLATION TYPE CRUD
    // ===========================
    async getAllInstallationTypes(companyId?: string): Promise<InstallationType[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<InstallationType[]>(`/api/v1/common-masters/installation-types?${params.toString()}`);
        return response.data || [];
    }

    async createInstallationType(data: { code: string; name: string; companyId: string; description?: string; laborRate?: number; estimatedDays?: number }): Promise<InstallationType> {
        const response = await apiClient.post<InstallationType>('/api/v1/common-masters/installation-types', data);
        return response.data;
    }

    async updateInstallationType(id: string, data: Partial<InstallationType>): Promise<InstallationType> {
        const response = await apiClient.put<InstallationType>(`/api/v1/common-masters/installation-types/${id}`, data);
        return response.data;
    }

    async deleteInstallationType(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/installation-types/${id}`);
    }

    // ===========================
    // KITCHEN APPLIANCE CRUD
    // ===========================
    async getAllKitchenAppliances(companyId?: string): Promise<KitchenAppliance[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<KitchenAppliance[]>(`/api/v1/common-masters/kitchen-appliances?${params.toString()}`);
        return response.data || [];
    }

    async createKitchenAppliance(data: { code: string; name: string; companyId: string; category?: string; brand?: string; model?: string; price?: number }): Promise<KitchenAppliance> {
        const response = await apiClient.post<KitchenAppliance>('/api/v1/common-masters/kitchen-appliances', data);
        return response.data;
    }

    async updateKitchenAppliance(id: string, data: Partial<KitchenAppliance>): Promise<KitchenAppliance> {
        const response = await apiClient.put<KitchenAppliance>(`/api/v1/common-masters/kitchen-appliances/${id}`, data);
        return response.data;
    }

    async deleteKitchenAppliance(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/kitchen-appliances/${id}`);
    }

    // ===========================
    // COUNTER MATERIAL CRUD
    // ===========================
    async getAllCounterMaterials(companyId?: string): Promise<CounterMaterial[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<CounterMaterial[]>(`/api/v1/common-masters/counter-materials?${params.toString()}`);
        return response.data || [];
    }

    async createCounterMaterial(data: Partial<CounterMaterial> & { code: string; name: string; materialType: string; companyId: string }): Promise<CounterMaterial> {
        const response = await apiClient.post<CounterMaterial>('/api/v1/common-masters/counter-materials', data);
        return response.data;
    }

    async updateCounterMaterial(id: string, data: Partial<CounterMaterial>): Promise<CounterMaterial> {
        const response = await apiClient.put<CounterMaterial>(`/api/v1/common-masters/counter-materials/${id}`, data);
        return response.data;
    }

    async deleteCounterMaterial(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/counter-materials/${id}`);
    }

    // ===========================
    // GEOGRAPHIC CRUD
    // ===========================
    async createCountry(data: { code: string; name: string; currency?: string; phoneCode?: string }): Promise<Country> {
        const response = await apiClient.post<Country>('/api/v1/common-masters/countries', data);
        return response.data;
    }

    async updateCountry(id: string, data: Partial<Country>): Promise<Country> {
        const response = await apiClient.put<Country>(`/api/v1/common-masters/countries/${id}`, data);
        return response.data;
    }

    async deleteCountry(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/countries/${id}`);
    }

    async createState(data: { code: string; name: string; countryId: string }): Promise<State> {
        const response = await apiClient.post<State>('/api/v1/common-masters/states', data);
        return response.data;
    }

    async updateState(id: string, data: Partial<State>): Promise<State> {
        const response = await apiClient.put<State>(`/api/v1/common-masters/states/${id}`, data);
        return response.data;
    }

    async deleteState(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/states/${id}`);
    }

    async createCity(data: { name: string; stateId: string; pincode?: string }): Promise<City> {
        const response = await apiClient.post<City>('/api/v1/common-masters/cities', data);
        return response.data;
    }

    async updateCity(id: string, data: Partial<City>): Promise<City> {
        const response = await apiClient.put<City>(`/api/v1/common-masters/cities/${id}`, data);
        return response.data;
    }

    async deleteCity(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/cities/${id}`);
    }

    // ===========================
    // HR GRADE CRUD
    // ===========================
    async createHrGrade(data: Partial<HrGrade> & { gradeCode: string; gradeName: string; companyId: string }): Promise<HrGrade> {
        const response = await apiClient.post<HrGrade>('/api/v1/common-masters/grades', data);
        return response.data;
    }

    async updateHrGrade(id: string, data: Partial<HrGrade>): Promise<HrGrade> {
        const response = await apiClient.put<HrGrade>(`/api/v1/common-masters/grades/${id}`, data);
        return response.data;
    }

    async deleteHrGrade(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/grades/${id}`);
    }

    // ===========================
    // WAREHOUSE CRUD
    // ===========================
    async getAllWarehouses(companyId?: string): Promise<Warehouse[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Warehouse[]>(`/api/v1/common-masters/warehouses?${params.toString()}`);
        return response.data || [];
    }

    async createWarehouse(data: Partial<Warehouse> & { warehouseCode?: string; code?: string; name?: string; companyId: string }): Promise<Warehouse> {
        const response = await apiClient.post<Warehouse>('/api/v1/common-masters/warehouses', data);
        return response.data;
    }

    async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
        const response = await apiClient.put<Warehouse>(`/api/v1/common-masters/warehouses/${id}`, data);
        return response.data;
    }

    async deleteWarehouse(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/warehouses/${id}`);
    }

    // ===========================
    // LOCATION CRUD
    // ===========================
    async getAllLocations(companyId?: string): Promise<Location[]> {
        const params = new URLSearchParams();
        if (companyId) params.append('companyId', companyId);
        const response = await apiClient.get<Location[]>(`/api/v1/common-masters/locations?${params.toString()}`);
        return response.data || [];
    }

    async createLocation(data: Partial<Location> & { code: string; name: string; companyId: string }): Promise<Location> {
        const response = await apiClient.post<Location>('/api/v1/common-masters/locations', data);
        return response.data;
    }

    async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
        const response = await apiClient.put<Location>(`/api/v1/common-masters/locations/${id}`, data);
        return response.data;
    }

    async deleteLocation(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/common-masters/locations/${id}`);
    }
}


export const commonMastersService = new CommonMastersService();
