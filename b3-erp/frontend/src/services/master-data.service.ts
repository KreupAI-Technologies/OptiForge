// Master-data picker service.
// Hits the NestJS domain backend (b3-erp) at NEXT_PUBLIC_API_URL for the
// entity-picker dropdowns used across CREATE / EDIT / ADD forms.
//
// Every method is defensive: the backend may return either a bare array
// (`[...]`) or a paginated envelope (`{ data: [...], total }`). Both are
// normalized to a plain array so callers never crash on shape drift.
//
// Endpoints (all verified 200):
//   crm/customers            procurement/vendors        cpq/products
//   hr/employees             inventory/warehouses       projects
//   finance/chart-of-accounts                           finance/cost-centers

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-001';

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

async function getList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-company-id': COMPANY_ID,
      },
    });
    if (!res.ok) return [];
    return normalizeList<T>(await res.json());
  } catch {
    return [];
  }
}

async function getOne<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-company-id': COMPANY_ID,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && typeof json === 'object' && 'data' in json && !Array.isArray(json)) {
      return (json as { data: T }).data ?? null;
    }
    return json as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Entity shapes (only the fields pickers use; backend returns much more)
// ---------------------------------------------------------------------------

export interface MDCustomer {
  id: string;
  customerCode?: string;
  customerName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface MDVendor {
  id: string;
  vendorCode?: string;
  vendorName?: string;
  name?: string;
  email?: string;
  category?: string;
}

export interface MDProduct {
  id: string;
  sku?: string;
  name?: string;
  productName?: string;
  basePrice?: number;
  category?: string;
}

export interface MDEmployee {
  id: string;
  employeeCode?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
}

export interface MDWarehouse {
  id: string;
  warehouseCode?: string;
  warehouseName?: string;
  warehouseType?: string;
  city?: string;
}

export interface MDProject {
  id: string;
  projectCode?: string;
  name?: string;
  clientName?: string;
  status?: string;
}

export interface MDAccount {
  id: string;
  accountCode?: string;
  accountName?: string;
  accountType?: string;
}

export interface MDCostCenter {
  id: string;
  costCenterCode?: string;
  costCenterName?: string;
  department?: string;
}

// ---------------------------------------------------------------------------
// Picker fetchers
// ---------------------------------------------------------------------------

export const MasterDataService = {
  getCustomers: () => getList<MDCustomer>('/crm/customers'),
  getVendors: () => getList<MDVendor>('/procurement/vendors'),
  getProducts: () => getList<MDProduct>('/cpq/products'),
  getEmployees: () => getList<MDEmployee>('/hr/employees'),
  getWarehouses: () => getList<MDWarehouse>('/inventory/warehouses'),
  getProjects: () => getList<MDProject>('/projects'),
  getAccounts: () => getList<MDAccount>('/finance/chart-of-accounts'),
  getCostCenters: () => getList<MDCostCenter>('/finance/cost-centers'),
};

// Generic record-by-id fetcher for edit/[id] prefill.
export function fetchRecordById<T = unknown>(
  resourcePath: string,
  id: string,
): Promise<T | null> {
  const clean = resourcePath.replace(/\/$/, '');
  return getOne<T>(`${clean}/${id}`);
}

// Label helpers so pages don't reimplement the "code — name" pattern.
export const mdLabel = {
  customer: (c: MDCustomer) =>
    c.customerName || c.name || c.customerCode || c.id,
  vendor: (v: MDVendor) => v.vendorName || v.name || v.vendorCode || v.id,
  product: (p: MDProduct) => p.name || p.productName || p.sku || p.id,
  employee: (e: MDEmployee) =>
    e.fullName ||
    [e.firstName, e.lastName].filter(Boolean).join(' ') ||
    e.employeeCode ||
    e.id,
  warehouse: (w: MDWarehouse) =>
    w.warehouseName || w.warehouseCode || w.id,
  project: (p: MDProject) => p.name || p.projectCode || p.id,
  account: (a: MDAccount) =>
    [a.accountCode, a.accountName].filter(Boolean).join(' — ') || a.id,
  costCenter: (c: MDCostCenter) =>
    [c.costCenterCode, c.costCenterName].filter(Boolean).join(' — ') || c.id,
};
