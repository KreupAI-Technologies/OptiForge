/**
 * Asset Service
 * Handles all asset-related API operations for the After-Sales module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type AssetStatus = 'active' | 'inactive' | 'under_maintenance' | 'retired' | 'sold' | 'disposed';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'non_operational';
export type AssetType = 'equipment' | 'appliance' | 'machinery' | 'furniture' | 'vehicle' | 'electronic';
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'as_needed';

export interface AssetLocation {
  site: string;
  building?: string;
  floor?: string;
  room?: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface AssetMaintenanceSchedule {
  frequency: MaintenanceFrequency;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceProvider?: string;
  estimatedCost?: number;
}

export interface AssetWarrantyInfo {
  warrantyId?: string;
  warrantyNumber?: string;
  isUnderWarranty: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyType?: string;
  coverage?: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  description: string;
  type: AssetType;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer: string;
  customerId: string;
  customerName: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  location: AssetLocation;
  maintenanceSchedule: AssetMaintenanceSchedule;
  warrantyInfo: AssetWarrantyInfo;
  specifications?: Record<string, string>;
  documents?: string[];
  tags?: string[];
  notes?: string;
  installedDate?: string;
  installedBy?: string;
  lastServiceDate?: string;
  totalServiceCost: number;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetDto {
  name: string;
  description: string;
  type: AssetType;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer: string;
  customerId: string;
  customerName: string;
  purchaseDate: string;
  purchasePrice: number;
  depreciationRate?: number;
  location: AssetLocation;
  maintenanceSchedule?: Partial<AssetMaintenanceSchedule>;
  warrantyInfo?: Partial<AssetWarrantyInfo>;
  specifications?: Record<string, string>;
  tags?: string[];
  notes?: string;
  installedDate?: string;
  installedBy?: string;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {
  status?: AssetStatus;
  condition?: AssetCondition;
  currentValue?: number;
}

export interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  condition?: AssetCondition;
  customerId?: string;
  manufacturer?: string;
  isUnderWarranty?: boolean;
  maintenanceDue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    assetCode: 'AST-2024-0001',
    name: 'Modular Kitchen Premium SS-304',
    description: 'Complete modular kitchen set with stainless steel SS-304 finish, includes base cabinets, wall units, and countertop',
    type: 'equipment',
    status: 'active',
    condition: 'excellent',
    serialNumber: 'MK-SS304-2024-00156',
    modelNumber: 'MK-PREMIUM-2024',
    manufacturer: 'ManufacturingOS Kitchen Systems',
    customerId: 'cust-001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    purchaseDate: '2024-06-15',
    purchasePrice: 450000,
    currentValue: 405000,
    depreciationRate: 10,
    location: {
      site: 'Main Office',
      building: 'Corporate Tower',
      floor: '5th Floor',
      room: 'Executive Kitchen',
      address: '456, Industrial Area Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'quarterly',
      lastMaintenanceDate: '2024-10-15',
      nextMaintenanceDate: '2025-01-15',
      maintenanceProvider: 'ManufacturingOS Service',
      estimatedCost: 5000,
    },
    warrantyInfo: {
      warrantyId: 'wrn-001',
      warrantyNumber: 'WRN-2024-00156',
      isUnderWarranty: true,
      warrantyStartDate: '2024-06-15',
      warrantyEndDate: '2026-06-14',
      warrantyType: 'Extended',
      coverage: 'Parts & Labor',
    },
    specifications: {
      material: 'SS-304 Stainless Steel',
      finish: 'Matt Finish',
      dimensions: '12ft x 10ft L-Shape',
      countertop: 'Granite Black Galaxy',
    },
    tags: ['premium', 'stainless-steel', 'modular'],
    notes: 'VIP customer - priority service',
    installedDate: '2024-06-20',
    installedBy: 'Installation Team A',
    lastServiceDate: '2024-10-15',
    totalServiceCost: 5000,
    serviceCount: 1,
    createdAt: '2024-06-15',
    updatedAt: '2024-10-15',
  },
  {
    id: 'asset-002',
    assetCode: 'AST-2024-0002',
    name: 'Built-in Hob 4 Burner Gas',
    description: 'Premium 4 burner gas hob with auto-ignition and flame failure safety device',
    type: 'appliance',
    status: 'active',
    condition: 'good',
    serialNumber: 'HB-4BG-2024-00234',
    modelNumber: 'HB-PREMIUM-4BG',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-002',
    customerName: 'Prestige Developers Bangalore',
    purchaseDate: '2024-03-20',
    purchasePrice: 28000,
    currentValue: 25200,
    depreciationRate: 10,
    location: {
      site: 'Prestige Lakeside Project',
      building: 'Tower A',
      floor: '12th Floor',
      room: 'Unit 1201',
      address: '123, Whitefield Main Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'yearly',
      lastMaintenanceDate: '2024-09-20',
      nextMaintenanceDate: '2025-09-20',
      maintenanceProvider: 'Authorized Service Center',
      estimatedCost: 1500,
    },
    warrantyInfo: {
      warrantyId: 'wrn-002',
      warrantyNumber: 'WRN-2024-00234',
      isUnderWarranty: true,
      warrantyStartDate: '2024-03-20',
      warrantyEndDate: '2027-03-19',
      warrantyType: 'Extended',
      coverage: 'Comprehensive',
    },
    specifications: {
      burners: '4 Brass Burners',
      ignition: 'Auto Ignition',
      safety: 'Flame Failure Device',
      material: 'Toughened Glass Top',
    },
    tags: ['gas-hob', 'premium', '4-burner'],
    installedDate: '2024-03-25',
    installedBy: 'Installation Team B',
    lastServiceDate: '2024-09-20',
    totalServiceCost: 1500,
    serviceCount: 1,
    createdAt: '2024-03-20',
    updatedAt: '2024-09-20',
  },
  {
    id: 'asset-003',
    assetCode: 'AST-2024-0003',
    name: 'Chimney Auto Clean 90cm',
    description: '90cm auto-clean chimney with filterless technology and gesture control',
    type: 'appliance',
    status: 'under_maintenance',
    condition: 'fair',
    serialNumber: 'CH-AC90-2024-00067',
    modelNumber: 'CH-AUTOCLEAN-90',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-003',
    customerName: 'Urban Interiors & Designers',
    purchaseDate: '2024-05-10',
    purchasePrice: 35000,
    currentValue: 31500,
    depreciationRate: 10,
    location: {
      site: 'Client Site',
      address: '234, Anna Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'monthly',
      lastMaintenanceDate: '2025-01-10',
      nextMaintenanceDate: '2025-02-10',
      maintenanceProvider: 'ManufacturingOS Service',
      estimatedCost: 2000,
    },
    warrantyInfo: {
      isUnderWarranty: true,
      warrantyStartDate: '2024-05-10',
      warrantyEndDate: '2026-05-09',
      warrantyType: 'Manufacturer',
      coverage: 'Parts Only',
    },
    specifications: {
      size: '90cm Width',
      suctionPower: '1400 m3/hr',
      technology: 'Filterless Auto-Clean',
      control: 'Touch + Gesture',
    },
    tags: ['chimney', 'auto-clean', 'filterless'],
    notes: 'Currently under maintenance - motor issue reported',
    installedDate: '2024-05-15',
    installedBy: 'Installation Team A',
    lastServiceDate: '2025-01-10',
    totalServiceCost: 8500,
    serviceCount: 3,
    createdAt: '2024-05-10',
    updatedAt: '2025-01-10',
  },
  {
    id: 'asset-004',
    assetCode: 'AST-2024-0004',
    name: 'Built-in Oven 60L',
    description: '60 Litre built-in oven with convection and grill functions',
    type: 'appliance',
    status: 'active',
    condition: 'excellent',
    serialNumber: 'OV-60L-2024-00543',
    modelNumber: 'OV-BUILTIN-60',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-004',
    customerName: 'Elite Contractors & Builders',
    purchaseDate: '2024-02-01',
    purchasePrice: 55000,
    currentValue: 49500,
    depreciationRate: 10,
    location: {
      site: 'Elite Residences',
      building: 'Block C',
      floor: '8th Floor',
      room: 'Flat C-802',
      address: '567, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'yearly',
      lastMaintenanceDate: '2025-01-05',
      nextMaintenanceDate: '2026-01-05',
      maintenanceProvider: 'Authorized Service Center',
      estimatedCost: 3000,
    },
    warrantyInfo: {
      isUnderWarranty: false,
      warrantyStartDate: '2024-02-01',
      warrantyEndDate: '2025-01-31',
      warrantyType: 'Standard',
      coverage: 'Parts & Labor',
    },
    specifications: {
      capacity: '60 Litres',
      functions: 'Convection, Grill, Bake',
      temperature: '50-250 degrees C',
      energyRating: 'A+',
    },
    tags: ['oven', 'built-in', 'convection'],
    installedDate: '2024-02-10',
    installedBy: 'Installation Team C',
    lastServiceDate: '2025-01-05',
    totalServiceCost: 3000,
    serviceCount: 1,
    createdAt: '2024-02-01',
    updatedAt: '2025-01-05',
  },
  {
    id: 'asset-005',
    assetCode: 'AST-2024-0005',
    name: 'Dishwasher 14 Place Settings',
    description: '14 place settings free-standing dishwasher with multiple wash programs',
    type: 'appliance',
    status: 'active',
    condition: 'good',
    serialNumber: 'DW-14PS-2023-00890',
    modelNumber: 'DW-FREESTAND-14',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-005',
    customerName: 'DLF Universal Projects',
    purchaseDate: '2023-08-15',
    purchasePrice: 65000,
    currentValue: 52000,
    depreciationRate: 10,
    location: {
      site: 'DLF Cyber City',
      building: 'DLF Tower 5',
      floor: '15th Floor',
      room: 'Executive Pantry',
      address: 'DLF Centre, Sansad Marg',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'quarterly',
      lastMaintenanceDate: '2024-12-15',
      nextMaintenanceDate: '2025-03-15',
      maintenanceProvider: 'ManufacturingOS Service',
      estimatedCost: 4000,
    },
    warrantyInfo: {
      warrantyId: 'wrn-005',
      warrantyNumber: 'WRN-2023-00890',
      isUnderWarranty: true,
      warrantyStartDate: '2023-08-15',
      warrantyEndDate: '2026-08-14',
      warrantyType: 'Extended',
      coverage: 'Comprehensive',
    },
    specifications: {
      capacity: '14 Place Settings',
      programs: '8 Wash Programs',
      energyRating: 'A++',
      noiseLevel: '44 dB',
    },
    tags: ['dishwasher', 'enterprise', 'large-capacity'],
    installedDate: '2023-08-20',
    installedBy: 'Installation Team A',
    lastServiceDate: '2024-12-15',
    totalServiceCost: 16000,
    serviceCount: 4,
    createdAt: '2023-08-15',
    updatedAt: '2024-12-15',
  },
  {
    id: 'asset-006',
    assetCode: 'AST-2025-0001',
    name: 'Modular Kitchen L-Shape',
    description: 'L-Shape modular kitchen with laminate finish and soft-close fittings',
    type: 'equipment',
    status: 'active',
    condition: 'excellent',
    serialNumber: 'MK-LSHP-2025-00234',
    modelNumber: 'MK-LSHAPE-STD',
    manufacturer: 'ManufacturingOS Kitchen Systems',
    customerId: 'cust-006',
    customerName: 'Signature Interiors Pune',
    purchaseDate: '2025-01-05',
    purchasePrice: 280000,
    currentValue: 280000,
    depreciationRate: 10,
    location: {
      site: 'Client Residence',
      address: '45, FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'quarterly',
      nextMaintenanceDate: '2025-04-05',
      estimatedCost: 3000,
    },
    warrantyInfo: {
      isUnderWarranty: true,
      warrantyStartDate: '2025-01-05',
      warrantyEndDate: '2026-01-04',
      warrantyType: 'Standard',
      coverage: 'Parts & Labor',
    },
    specifications: {
      material: 'Marine Plywood + Laminate',
      finish: 'High Gloss Laminate',
      dimensions: '10ft x 8ft L-Shape',
      fittings: 'Soft-Close Hinges & Channels',
    },
    tags: ['modular', 'l-shape', 'laminate'],
    installedDate: '2025-01-10',
    installedBy: 'Installation Team B',
    totalServiceCost: 0,
    serviceCount: 0,
    createdAt: '2025-01-05',
    updatedAt: '2025-01-10',
  },
  {
    id: 'asset-007',
    assetCode: 'AST-2024-0006',
    name: 'Induction Hob 4 Burner',
    description: '4 zone induction hob with touch control and power boost function',
    type: 'appliance',
    status: 'inactive',
    condition: 'poor',
    serialNumber: 'IH-4ZN-2024-00789',
    modelNumber: 'IH-INDUCTION-4Z',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-007',
    customerName: 'Royal Homes Hyderabad',
    purchaseDate: '2024-06-15',
    purchasePrice: 42000,
    currentValue: 35700,
    depreciationRate: 15,
    location: {
      site: 'Royal Villa Project',
      building: 'Villa 23',
      room: 'Kitchen',
      address: '123, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'as_needed',
      lastMaintenanceDate: '2024-11-20',
      maintenanceProvider: 'Third Party Service',
      estimatedCost: 8000,
    },
    warrantyInfo: {
      isUnderWarranty: false,
      warrantyStartDate: '2024-06-15',
      warrantyEndDate: '2025-06-14',
      warrantyType: 'Standard',
      coverage: 'Parts & Labor',
    },
    specifications: {
      zones: '4 Cooking Zones',
      power: '7400W Total',
      control: 'Touch Control',
      features: 'Power Boost, Timer',
    },
    tags: ['induction', 'hob', 'touch-control'],
    notes: 'Unit replaced under warranty claim. Original unit returned.',
    installedDate: '2024-06-20',
    installedBy: 'Installation Team C',
    lastServiceDate: '2024-11-20',
    totalServiceCost: 12000,
    serviceCount: 2,
    createdAt: '2024-06-15',
    updatedAt: '2024-11-20',
  },
  {
    id: 'asset-008',
    assetCode: 'AST-2024-0007',
    name: 'Microwave Oven 30L Convection',
    description: '30 Litre convection microwave with auto-cook menu',
    type: 'appliance',
    status: 'active',
    condition: 'excellent',
    serialNumber: 'MW-30C-2025-00123',
    modelNumber: 'MW-CONVECTION-30',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-008',
    customerName: 'Modern Living Ahmedabad',
    purchaseDate: '2025-01-10',
    purchasePrice: 22000,
    currentValue: 22000,
    depreciationRate: 15,
    location: {
      site: 'Showroom Display',
      address: '78, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'yearly',
      nextMaintenanceDate: '2026-01-10',
      estimatedCost: 1000,
    },
    warrantyInfo: {
      isUnderWarranty: true,
      warrantyStartDate: '2025-01-10',
      warrantyEndDate: '2027-01-09',
      warrantyType: 'Manufacturer',
      coverage: 'Comprehensive',
    },
    specifications: {
      capacity: '30 Litres',
      power: '900W Microwave, 1400W Convection',
      menu: '101 Auto-Cook Menus',
      control: 'Digital Touch',
    },
    tags: ['microwave', 'convection', 'display'],
    installedDate: '2025-01-12',
    installedBy: 'Store Team',
    totalServiceCost: 0,
    serviceCount: 0,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-12',
  },
  {
    id: 'asset-009',
    assetCode: 'AST-2023-0015',
    name: 'Water Purifier RO+UV 10L',
    description: '10 Litre RO+UV water purifier with TDS controller',
    type: 'appliance',
    status: 'retired',
    condition: 'non_operational',
    serialNumber: 'WP-RO10-2023-00456',
    modelNumber: 'WP-ROUV-10',
    manufacturer: 'ManufacturingOS Appliances',
    customerId: 'cust-009',
    customerName: 'Cosmos Furniture Mart',
    purchaseDate: '2023-05-10',
    purchasePrice: 18000,
    currentValue: 0,
    depreciationRate: 20,
    location: {
      site: 'Store',
      address: '12, Market Road',
      city: 'Nagpur',
      state: 'Maharashtra',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'quarterly',
      lastMaintenanceDate: '2024-08-10',
      maintenanceProvider: 'Authorized Service Center',
    },
    warrantyInfo: {
      isUnderWarranty: false,
      warrantyStartDate: '2023-05-10',
      warrantyEndDate: '2024-05-09',
      warrantyType: 'Standard',
      coverage: 'Parts Only',
    },
    specifications: {
      capacity: '10 Litres',
      technology: 'RO + UV + UF',
      tds: 'TDS Controller',
      filters: '7-Stage Purification',
    },
    tags: ['water-purifier', 'ro', 'retired'],
    notes: 'Unit beyond economical repair. Recommended replacement.',
    installedDate: '2023-05-15',
    installedBy: 'Installation Team A',
    lastServiceDate: '2024-08-10',
    totalServiceCost: 9500,
    serviceCount: 5,
    createdAt: '2023-05-10',
    updatedAt: '2024-11-15',
  },
  {
    id: 'asset-010',
    assetCode: 'AST-2024-0008',
    name: 'Commercial Kitchen Setup',
    description: 'Complete commercial kitchen setup for government canteen',
    type: 'equipment',
    status: 'active',
    condition: 'good',
    serialNumber: 'CK-COMM-2024-00012',
    modelNumber: 'CK-COMMERCIAL-PRO',
    manufacturer: 'ManufacturingOS Kitchen Systems',
    customerId: 'cust-010',
    customerName: 'Government Housing Authority',
    purchaseDate: '2024-04-01',
    purchasePrice: 1500000,
    currentValue: 1350000,
    depreciationRate: 10,
    location: {
      site: 'Central Government Canteen',
      building: 'Nirman Bhawan',
      floor: 'Ground Floor',
      room: 'Main Kitchen',
      address: 'Maulana Azad Road',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
    maintenanceSchedule: {
      frequency: 'monthly',
      lastMaintenanceDate: '2025-01-01',
      nextMaintenanceDate: '2025-02-01',
      maintenanceProvider: 'ManufacturingOS Service',
      estimatedCost: 15000,
    },
    warrantyInfo: {
      isUnderWarranty: true,
      warrantyStartDate: '2024-04-01',
      warrantyEndDate: '2026-03-31',
      warrantyType: 'Extended',
      coverage: 'Comprehensive',
    },
    specifications: {
      type: 'Commercial Grade',
      capacity: '500 meals/day',
      equipment: 'Full Setup with Storage',
      compliance: 'FSSAI Certified',
    },
    tags: ['commercial', 'government', 'large-scale'],
    notes: 'Government contract - SLA bound maintenance',
    installedDate: '2024-04-15',
    installedBy: 'Commercial Installation Team',
    lastServiceDate: '2025-01-01',
    totalServiceCost: 75000,
    serviceCount: 9,
    createdAt: '2024-04-01',
    updatedAt: '2025-01-01',
  },
];

// ============================================================================
// Asset Service Class
// ============================================================================

export class AssetService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all assets with optional filters
   */
  static async getAllAssets(filters?: AssetFilters): Promise<Asset[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredAssets = [...MOCK_ASSETS];

      if (filters?.type) {
        filteredAssets = filteredAssets.filter((a) => a.type === filters.type);
      }
      if (filters?.status) {
        filteredAssets = filteredAssets.filter((a) => a.status === filters.status);
      }
      if (filters?.condition) {
        filteredAssets = filteredAssets.filter((a) => a.condition === filters.condition);
      }
      if (filters?.customerId) {
        filteredAssets = filteredAssets.filter((a) => a.customerId === filters.customerId);
      }
      if (filters?.manufacturer) {
        filteredAssets = filteredAssets.filter((a) => a.manufacturer === filters.manufacturer);
      }
      if (filters?.isUnderWarranty !== undefined) {
        filteredAssets = filteredAssets.filter((a) => a.warrantyInfo.isUnderWarranty === filters.isUnderWarranty);
      }
      if (filters?.maintenanceDue) {
        const today = new Date().toISOString().split('T')[0];
        filteredAssets = filteredAssets.filter(
          (a) => a.maintenanceSchedule.nextMaintenanceDate && a.maintenanceSchedule.nextMaintenanceDate <= today
        );
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAssets = filteredAssets.filter(
          (a) =>
            a.name.toLowerCase().includes(searchLower) ||
            a.assetCode.toLowerCase().includes(searchLower) ||
            a.serialNumber?.toLowerCase().includes(searchLower) ||
            a.customerName.toLowerCase().includes(searchLower) ||
            a.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredAssets = filteredAssets.slice(start, end);
      }

      return filteredAssets;
    }

    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.set('type', filters.type);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.condition) queryParams.set('condition', filters.condition);
    if (filters?.customerId) queryParams.set('customerId', filters.customerId);
    if (filters?.manufacturer) queryParams.set('manufacturer', filters.manufacturer);
    if (filters?.isUnderWarranty !== undefined) queryParams.set('isUnderWarranty', filters.isUnderWarranty.toString());
    if (filters?.maintenanceDue) queryParams.set('maintenanceDue', 'true');
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Asset[]>(`/after-sales/assets?${queryParams.toString()}`);
  }

  /**
   * Get asset by ID
   */
  static async getAssetById(id: string): Promise<Asset> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const asset = MOCK_ASSETS.find((a) => a.id === id);
      if (!asset) throw new Error('Asset not found');
      return asset;
    }
    return this.request<Asset>(`/after-sales/assets/${id}`);
  }

  /**
   * Get asset by code
   */
  static async getAssetByCode(code: string): Promise<Asset> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const asset = MOCK_ASSETS.find((a) => a.assetCode === code);
      if (!asset) throw new Error('Asset not found');
      return asset;
    }
    return this.request<Asset>(`/after-sales/assets/code/${code}`);
  }

  /**
   * Get assets by customer ID
   */
  static async getAssetsByCustomer(customerId: string): Promise<Asset[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_ASSETS.filter((a) => a.customerId === customerId);
    }
    return this.request<Asset[]>(`/after-sales/assets/customer/${customerId}`);
  }

  /**
   * Create a new asset
   */
  static async createAsset(data: CreateAssetDto): Promise<Asset> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        assetCode: `AST-${now.getFullYear()}-${String(MOCK_ASSETS.length + 1).padStart(4, '0')}`,
        ...data,
        status: 'active',
        condition: 'excellent',
        currentValue: data.purchasePrice,
        depreciationRate: data.depreciationRate || 10,
        maintenanceSchedule: {
          frequency: data.maintenanceSchedule?.frequency || 'yearly',
          ...data.maintenanceSchedule,
        },
        warrantyInfo: {
          isUnderWarranty: data.warrantyInfo?.isUnderWarranty ?? true,
          ...data.warrantyInfo,
        },
        totalServiceCost: 0,
        serviceCount: 0,
        createdAt: now.toISOString().split('T')[0],
        updatedAt: now.toISOString().split('T')[0],
      };
      MOCK_ASSETS.push(newAsset);
      return newAsset;
    }
    return this.request<Asset>('/after-sales/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing asset
   */
  static async updateAsset(id: string, data: UpdateAssetDto): Promise<Asset> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_ASSETS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Asset not found');

      MOCK_ASSETS[index] = {
        ...MOCK_ASSETS[index],
        ...data,
        location: data.location ? { ...MOCK_ASSETS[index].location, ...data.location } : MOCK_ASSETS[index].location,
        maintenanceSchedule: data.maintenanceSchedule
          ? { ...MOCK_ASSETS[index].maintenanceSchedule, ...data.maintenanceSchedule }
          : MOCK_ASSETS[index].maintenanceSchedule,
        warrantyInfo: data.warrantyInfo
          ? { ...MOCK_ASSETS[index].warrantyInfo, ...data.warrantyInfo }
          : MOCK_ASSETS[index].warrantyInfo,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return MOCK_ASSETS[index];
    }
    return this.request<Asset>(`/after-sales/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_ASSETS.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Asset not found');

      if (MOCK_ASSETS[index].status === 'active') {
        throw new Error('Cannot delete active assets. Please retire or dispose first.');
      }

      MOCK_ASSETS.splice(index, 1);
      return;
    }
    await this.request<void>(`/after-sales/assets/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get asset service history
   */
  static async getServiceHistory(assetId: string): Promise<Array<{
    serviceId: string;
    serviceDate: string;
    serviceType: string;
    description: string;
    cost: number;
    technician: string;
  }>> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          serviceId: 'SVC-2025-001',
          serviceDate: '2025-01-10',
          serviceType: 'Preventive Maintenance',
          description: 'Regular quarterly maintenance',
          cost: 5000,
          technician: 'Ravi Kumar',
        },
        {
          serviceId: 'SVC-2024-089',
          serviceDate: '2024-10-15',
          serviceType: 'Repair',
          description: 'Motor replacement',
          cost: 8500,
          technician: 'Suresh Patil',
        },
      ];
    }
    return this.request<Array<{
      serviceId: string;
      serviceDate: string;
      serviceType: string;
      description: string;
      cost: number;
      technician: string;
    }>>(`/after-sales/assets/${assetId}/service-history`);
  }

  /**
   * Get asset statistics
   */
  static async getStatistics(): Promise<{
    totalAssets: number;
    activeAssets: number;
    assetsUnderMaintenance: number;
    retiredAssets: number;
    totalValue: number;
    totalServiceCost: number;
    assetsUnderWarranty: number;
    maintenanceDueCount: number;
    assetsByType: Record<string, number>;
    assetsByStatus: Record<string, number>;
    assetsByCondition: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const assetsByType: Record<string, number> = {};
      const assetsByStatus: Record<string, number> = {};
      const assetsByCondition: Record<string, number> = {};

      const today = new Date().toISOString().split('T')[0];

      MOCK_ASSETS.forEach((asset) => {
        assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1;
        assetsByStatus[asset.status] = (assetsByStatus[asset.status] || 0) + 1;
        assetsByCondition[asset.condition] = (assetsByCondition[asset.condition] || 0) + 1;
      });

      return {
        totalAssets: MOCK_ASSETS.length,
        activeAssets: MOCK_ASSETS.filter((a) => a.status === 'active').length,
        assetsUnderMaintenance: MOCK_ASSETS.filter((a) => a.status === 'under_maintenance').length,
        retiredAssets: MOCK_ASSETS.filter((a) => a.status === 'retired').length,
        totalValue: MOCK_ASSETS.reduce((sum, a) => sum + a.currentValue, 0),
        totalServiceCost: MOCK_ASSETS.reduce((sum, a) => sum + a.totalServiceCost, 0),
        assetsUnderWarranty: MOCK_ASSETS.filter((a) => a.warrantyInfo.isUnderWarranty).length,
        maintenanceDueCount: MOCK_ASSETS.filter(
          (a) => a.maintenanceSchedule.nextMaintenanceDate && a.maintenanceSchedule.nextMaintenanceDate <= today
        ).length,
        assetsByType,
        assetsByStatus,
        assetsByCondition,
      };
    }

    return this.request<{
      totalAssets: number;
      activeAssets: number;
      assetsUnderMaintenance: number;
      retiredAssets: number;
      totalValue: number;
      totalServiceCost: number;
      assetsUnderWarranty: number;
      maintenanceDueCount: number;
      assetsByType: Record<string, number>;
      assetsByStatus: Record<string, number>;
      assetsByCondition: Record<string, number>;
    }>('/after-sales/assets/statistics');
  }
}

// Export singleton instance
export const assetService = AssetService;
