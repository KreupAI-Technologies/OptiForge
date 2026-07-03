import { apiClient } from './api/client';

// ============================================================================
// Configuration
// ============================================================================
const USE_MOCK_DATA = false;

// ============================================================================
// TypeScript Interfaces
// ============================================================================

// UOM (Unit of Measure) Types
export enum UOMStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface UOM {
  id: string;
  code: string;
  name: string;
  symbol: string;
  description?: string;
  baseUnit?: string;
  conversionFactor?: number;
  category?: string;
  status: UOMStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUOMDto {
  code: string;
  name: string;
  symbol: string;
  description?: string;
  baseUnit?: string;
  conversionFactor?: number;
  category?: string;
  status?: UOMStatus;
}

export interface UpdateUOMDto extends Partial<CreateUOMDto> { }

// Category Types
export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  icon?: string;
  color?: string;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }

// Customer Types
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
}

export interface CustomerAddress {
  id?: string;
  type: 'billing' | 'shipping' | 'both';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerContact {
  id?: string;
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  notes?: string;
  tags?: string[];
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  code: string;
  name: string;
  displayName?: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  addresses?: CustomerAddress[];
  contacts?: CustomerContact[];
  notes?: string;
  tags?: string[];
  status?: CustomerStatus;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> { }

export interface CustomerFilters {
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  tags?: string[];
}

// Item Types
export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  FINISHED_GOODS = 'FINISHED_GOODS',
  SEMI_FINISHED = 'SEMI_FINISHED',
  CONSUMABLE = 'CONSUMABLE',
  SERVICE = 'SERVICE',
  SPARE_PART = 'SPARE_PART',
}

export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  itemType: ItemType;
  categoryId?: string;
  category?: Category;
  uomId: string;
  uom?: UOM;
  sku?: string;
  barcode?: string;
  hsnCode?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  costPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  imageUrl?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  isStockable: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemDto {
  code: string;
  name: string;
  description?: string;
  itemType: ItemType;
  categoryId?: string;
  uomId: string;
  sku?: string;
  barcode?: string;
  hsnCode?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  costPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  imageUrl?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  isStockable?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
  status?: ItemStatus;
}

export interface UpdateItemDto extends Partial<CreateItemDto> { }

export interface ItemFilters {
  search?: string;
  itemType?: ItemType;
  categoryId?: string;
  status?: ItemStatus;
  isStockable?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
  tags?: string[];
}

// ============================================================================
// Mock Data
// ============================================================================

// Mock UOMs
export const MOCK_UOMS: UOM[] = [
  {
    id: 'uom-1',
    code: 'PCS',
    name: 'Pieces',
    symbol: 'pcs',
    description: 'Individual pieces or units',
    category: 'Quantity',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-2',
    code: 'KG',
    name: 'Kilograms',
    symbol: 'kg',
    description: 'Weight measurement in kilograms',
    category: 'Weight',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-3',
    code: 'G',
    name: 'Grams',
    symbol: 'g',
    description: 'Weight measurement in grams',
    baseUnit: 'KG',
    conversionFactor: 0.001,
    category: 'Weight',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-4',
    code: 'MTR',
    name: 'Meters',
    symbol: 'm',
    description: 'Length measurement in meters',
    category: 'Length',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-5',
    code: 'CM',
    name: 'Centimeters',
    symbol: 'cm',
    description: 'Length measurement in centimeters',
    baseUnit: 'MTR',
    conversionFactor: 0.01,
    category: 'Length',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-6',
    code: 'LTR',
    name: 'Liters',
    symbol: 'L',
    description: 'Volume measurement in liters',
    category: 'Volume',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-7',
    code: 'ML',
    name: 'Milliliters',
    symbol: 'ml',
    description: 'Volume measurement in milliliters',
    baseUnit: 'LTR',
    conversionFactor: 0.001,
    category: 'Volume',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-8',
    code: 'BOX',
    name: 'Boxes',
    symbol: 'box',
    description: 'Packaging unit - boxes',
    category: 'Packaging',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-9',
    code: 'PACK',
    name: 'Packs',
    symbol: 'pack',
    description: 'Packaging unit - packs',
    category: 'Packaging',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'uom-10',
    code: 'SET',
    name: 'Sets',
    symbol: 'set',
    description: 'Collection of items as a set',
    category: 'Quantity',
    status: UOMStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Categories
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    code: 'RAW',
    name: 'Raw Materials',
    description: 'Raw materials used in manufacturing',
    icon: 'Package',
    color: '#3B82F6',
    sortOrder: 1,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-2',
    code: 'FG',
    name: 'Finished Goods',
    description: 'Completed products ready for sale',
    icon: 'ShoppingBag',
    color: '#10B981',
    sortOrder: 2,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-3',
    code: 'SPARE',
    name: 'Spare Parts',
    description: 'Replacement parts and components',
    icon: 'Wrench',
    color: '#F59E0B',
    sortOrder: 3,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-4',
    code: 'CONS',
    name: 'Consumables',
    description: 'Items consumed during production',
    icon: 'Droplet',
    color: '#8B5CF6',
    sortOrder: 4,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-5',
    code: 'PACK',
    name: 'Packaging Materials',
    description: 'Materials used for packaging products',
    icon: 'Box',
    color: '#EC4899',
    sortOrder: 5,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-6',
    code: 'ELEC',
    name: 'Electronics',
    description: 'Electronic components and devices',
    parentId: 'cat-1',
    icon: 'Cpu',
    color: '#06B6D4',
    sortOrder: 6,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-7',
    code: 'MECH',
    name: 'Mechanical Parts',
    description: 'Mechanical components and assemblies',
    parentId: 'cat-1',
    icon: 'Cog',
    color: '#64748B',
    sortOrder: 7,
    status: CategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Customers
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'Acme Manufacturing Ltd.',
    displayName: 'Acme Manufacturing',
    type: CustomerType.BUSINESS,
    email: 'orders@acme-mfg.com',
    phone: '+1-555-0100',
    website: 'https://acme-mfg.com',
    taxId: 'TAX123456789',
    creditLimit: 500000,
    paymentTerms: 'Net 30',
    addresses: [
      {
        id: 'addr-1',
        type: 'both',
        line1: '123 Industrial Blvd',
        line2: 'Suite 100',
        city: 'Detroit',
        state: 'Michigan',
        postalCode: '48201',
        country: 'USA',
        isDefault: true,
      },
    ],
    contacts: [
      {
        id: 'contact-1',
        name: 'John Smith',
        designation: 'Procurement Manager',
        email: 'john.smith@acme-mfg.com',
        phone: '+1-555-0101',
        isPrimary: true,
      },
    ],
    tags: ['enterprise', 'manufacturing', 'priority'],
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'TechParts Inc.',
    displayName: 'TechParts',
    type: CustomerType.BUSINESS,
    email: 'purchasing@techparts.com',
    phone: '+1-555-0200',
    website: 'https://techparts.com',
    taxId: 'TAX987654321',
    creditLimit: 250000,
    paymentTerms: 'Net 45',
    addresses: [
      {
        id: 'addr-2',
        type: 'billing',
        line1: '456 Tech Park',
        city: 'San Jose',
        state: 'California',
        postalCode: '95110',
        country: 'USA',
        isDefault: true,
      },
      {
        id: 'addr-3',
        type: 'shipping',
        line1: '789 Warehouse Rd',
        city: 'Fremont',
        state: 'California',
        postalCode: '94538',
        country: 'USA',
        isDefault: false,
      },
    ],
    contacts: [
      {
        id: 'contact-2',
        name: 'Sarah Johnson',
        designation: 'Supply Chain Director',
        email: 'sarah.j@techparts.com',
        phone: '+1-555-0201',
        isPrimary: true,
      },
      {
        id: 'contact-3',
        name: 'Mike Chen',
        designation: 'Buyer',
        email: 'mike.chen@techparts.com',
        phone: '+1-555-0202',
        isPrimary: false,
      },
    ],
    tags: ['technology', 'distributor'],
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'cust-3',
    code: 'CUST003',
    name: 'Global Industries Corp.',
    displayName: 'Global Industries',
    type: CustomerType.BUSINESS,
    email: 'info@globalindustries.com',
    phone: '+1-555-0300',
    creditLimit: 1000000,
    paymentTerms: 'Net 60',
    addresses: [
      {
        id: 'addr-4',
        type: 'both',
        line1: '1000 Corporate Center',
        city: 'Houston',
        state: 'Texas',
        postalCode: '77001',
        country: 'USA',
        isDefault: true,
      },
    ],
    contacts: [
      {
        id: 'contact-4',
        name: 'David Williams',
        designation: 'VP Operations',
        email: 'd.williams@globalindustries.com',
        phone: '+1-555-0301',
        isPrimary: true,
      },
    ],
    tags: ['enterprise', 'strategic'],
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'cust-4',
    code: 'CUST004',
    name: 'Metro Supplies LLC',
    displayName: 'Metro Supplies',
    type: CustomerType.BUSINESS,
    email: 'orders@metrosupplies.com',
    phone: '+1-555-0400',
    creditLimit: 100000,
    paymentTerms: 'Net 30',
    addresses: [
      {
        id: 'addr-5',
        type: 'both',
        line1: '555 Commerce St',
        city: 'Chicago',
        state: 'Illinois',
        postalCode: '60601',
        country: 'USA',
        isDefault: true,
      },
    ],
    contacts: [
      {
        id: 'contact-5',
        name: 'Lisa Anderson',
        designation: 'Purchasing Manager',
        email: 'l.anderson@metrosupplies.com',
        phone: '+1-555-0401',
        isPrimary: true,
      },
    ],
    tags: ['regional', 'supplies'],
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'cust-5',
    code: 'CUST005',
    name: 'James Roberts',
    type: CustomerType.INDIVIDUAL,
    email: 'james.roberts@email.com',
    phone: '+1-555-0500',
    addresses: [
      {
        id: 'addr-6',
        type: 'both',
        line1: '100 Main Street',
        city: 'Seattle',
        state: 'Washington',
        postalCode: '98101',
        country: 'USA',
        isDefault: true,
      },
    ],
    contacts: [],
    status: CustomerStatus.ACTIVE,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

// Mock Items
export const MOCK_ITEMS: Item[] = [
  {
    id: 'item-1',
    code: 'RM-STEEL-001',
    name: 'Steel Sheet 2mm',
    description: 'Cold rolled steel sheet, 2mm thickness, 4x8 feet',
    itemType: ItemType.RAW_MATERIAL,
    categoryId: 'cat-1',
    uomId: 'uom-1',
    sku: 'SKU-RM-001',
    barcode: '1234567890123',
    hsnCode: '7209',
    purchasePrice: 150,
    costPrice: 155,
    minStockLevel: 100,
    maxStockLevel: 1000,
    reorderLevel: 200,
    reorderQuantity: 500,
    leadTimeDays: 7,
    weight: 30,
    weightUnit: 'kg',
    dimensions: { length: 2440, width: 1220, height: 2, unit: 'mm' },
    tags: ['steel', 'sheet', 'raw-material'],
    isStockable: true,
    isSellable: false,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'item-2',
    code: 'RM-ALUM-001',
    name: 'Aluminum Rod 10mm',
    description: 'Aluminum round rod, 10mm diameter, 3m length',
    itemType: ItemType.RAW_MATERIAL,
    categoryId: 'cat-1',
    uomId: 'uom-1',
    sku: 'SKU-RM-002',
    purchasePrice: 80,
    costPrice: 85,
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderLevel: 100,
    reorderQuantity: 200,
    leadTimeDays: 5,
    weight: 2.5,
    weightUnit: 'kg',
    tags: ['aluminum', 'rod', 'raw-material'],
    isStockable: true,
    isSellable: false,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'item-3',
    code: 'FG-BRACKET-001',
    name: 'Mounting Bracket Assembly',
    description: 'Heavy-duty mounting bracket assembly, zinc plated',
    itemType: ItemType.FINISHED_GOODS,
    categoryId: 'cat-2',
    uomId: 'uom-1',
    sku: 'SKU-FG-001',
    barcode: '1234567890456',
    hsnCode: '7326',
    purchasePrice: 0,
    sellingPrice: 450,
    costPrice: 280,
    minStockLevel: 20,
    maxStockLevel: 200,
    reorderLevel: 50,
    reorderQuantity: 100,
    leadTimeDays: 3,
    weight: 1.5,
    weightUnit: 'kg',
    tags: ['bracket', 'assembly', 'finished-goods'],
    isStockable: true,
    isSellable: true,
    isPurchasable: false,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'item-4',
    code: 'FG-GEAR-001',
    name: 'Precision Gear Set',
    description: 'Set of 3 precision machined gears, hardened steel',
    itemType: ItemType.FINISHED_GOODS,
    categoryId: 'cat-2',
    uomId: 'uom-10',
    sku: 'SKU-FG-002',
    sellingPrice: 1200,
    costPrice: 750,
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderLevel: 25,
    reorderQuantity: 50,
    leadTimeDays: 5,
    weight: 2.0,
    weightUnit: 'kg',
    tags: ['gear', 'precision', 'finished-goods'],
    isStockable: true,
    isSellable: true,
    isPurchasable: false,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'item-5',
    code: 'SP-BEARING-001',
    name: 'Ball Bearing 6205',
    description: 'Deep groove ball bearing 6205-2RS, 25x52x15mm',
    itemType: ItemType.SPARE_PART,
    categoryId: 'cat-3',
    uomId: 'uom-1',
    sku: 'SKU-SP-001',
    barcode: '1234567890789',
    purchasePrice: 25,
    sellingPrice: 45,
    costPrice: 28,
    minStockLevel: 100,
    maxStockLevel: 1000,
    reorderLevel: 200,
    reorderQuantity: 500,
    leadTimeDays: 3,
    weight: 0.15,
    weightUnit: 'kg',
    tags: ['bearing', 'spare-part'],
    isStockable: true,
    isSellable: true,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'item-6',
    code: 'CONS-OIL-001',
    name: 'Machine Oil ISO 68',
    description: 'Industrial machine oil, ISO VG 68, 20L drum',
    itemType: ItemType.CONSUMABLE,
    categoryId: 'cat-4',
    uomId: 'uom-6',
    sku: 'SKU-CONS-001',
    purchasePrice: 120,
    costPrice: 125,
    minStockLevel: 200,
    maxStockLevel: 2000,
    reorderLevel: 400,
    reorderQuantity: 1000,
    leadTimeDays: 2,
    tags: ['oil', 'consumable', 'maintenance'],
    isStockable: true,
    isSellable: false,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'item-7',
    code: 'ELEC-MOTOR-001',
    name: 'AC Motor 5HP',
    description: '3-phase AC induction motor, 5HP, 1450 RPM',
    itemType: ItemType.RAW_MATERIAL,
    categoryId: 'cat-6',
    uomId: 'uom-1',
    sku: 'SKU-ELEC-001',
    purchasePrice: 8500,
    costPrice: 8800,
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderLevel: 10,
    reorderQuantity: 20,
    leadTimeDays: 14,
    weight: 35,
    weightUnit: 'kg',
    tags: ['motor', 'electrical', 'component'],
    isStockable: true,
    isSellable: false,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'item-8',
    code: 'PACK-BOX-001',
    name: 'Corrugated Box 12x12x8',
    description: 'Double-wall corrugated cardboard box, 12x12x8 inches',
    itemType: ItemType.CONSUMABLE,
    categoryId: 'cat-5',
    uomId: 'uom-1',
    sku: 'SKU-PACK-001',
    purchasePrice: 3.5,
    costPrice: 4,
    minStockLevel: 500,
    maxStockLevel: 5000,
    reorderLevel: 1000,
    reorderQuantity: 2000,
    leadTimeDays: 3,
    tags: ['packaging', 'box', 'cardboard'],
    isStockable: true,
    isSellable: false,
    isPurchasable: true,
    status: ItemStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// Core Service Class
// ============================================================================

class CoreServiceClass {
  // ==========================================================================
  // UOM Methods
  // ==========================================================================

  /**
   * Get all UOMs
   */
  static async getAllUOMs(companyId?: string): Promise<UOM[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...MOCK_UOMS];
    }
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    const queryString = params.toString();
    const response = await apiClient.get<UOM[]>(`/core/uom${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  /**
   * Get all Currencies
   */
  static async getAllCurrencies(): Promise < any[] > {
  if(USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return []; // Add mock currencies if needed
  }
    // Assuming 'this.request' is a static method or 'apiClient' is accessible
    // For this change, we'll adapt to the existing 'apiClient.get' pattern
    const response = await apiClient.get<any[]>('/core/currencies'); // Assuming '/core/currencies' is the endpoint
  return response.data;
}

  async getUOMById(id: string): Promise < UOM > {
  if(USE_MOCK_DATA) {
    await delay(200);
    const uom = MOCK_UOMS.find((u) => u.id === id);
    if (!uom) throw new Error('UOM not found');
    return uom;
  }
    const response = await apiClient.get<UOM>(`/core/uom/${id}`);
  return response.data;
}

  async createUOM(data: CreateUOMDto): Promise < UOM > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const newUOM: UOM = {
      id: `uom-${Date.now()}`,
      ...data,
      status: data.status || UOMStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_UOMS.push(newUOM);
    return newUOM;
  }
    const response = await apiClient.post<UOM>('/core/uom', data);
  return response.data;
}

  async updateUOM(id: string, data: UpdateUOMDto): Promise < UOM > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const index = MOCK_UOMS.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('UOM not found');
    MOCK_UOMS[index] = {
      ...MOCK_UOMS[index],
      ...data,
      updatedAt: new Date(),
    };
    return MOCK_UOMS[index];
  }
    const response = await apiClient.put<UOM>(`/core/uom/${id}`, data);
  return response.data;
}

  async deleteUOM(id: string): Promise < void> {
  if(USE_MOCK_DATA) {
    await delay(300);
    const index = MOCK_UOMS.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('UOM not found');
    MOCK_UOMS.splice(index, 1);
    return;
  }
    await apiClient.delete<void>(`/core/uom/${id}`);
}

  // ==========================================================================
  // Category Methods
  // ==========================================================================

  async getAllCategories(): Promise < Category[] > {
  if(USE_MOCK_DATA) {
    await delay(300);
    // Add parent-child relationships
    return MOCK_CATEGORIES.map((cat) => ({
      ...cat,
      parent: cat.parentId
        ? MOCK_CATEGORIES.find((c) => c.id === cat.parentId)
        : undefined,
      children: MOCK_CATEGORIES.filter((c) => c.parentId === cat.id),
    }));
  }
    const response = await apiClient.get<Category[]>('/api/v1/common-masters/item-categories');
  return response.data;
}

  async getCategoryById(id: string): Promise < Category > {
  if(USE_MOCK_DATA) {
    await delay(200);
    const category = MOCK_CATEGORIES.find((c) => c.id === id);
    if (!category) throw new Error('Category not found');
    return {
      ...category,
      parent: category.parentId
        ? MOCK_CATEGORIES.find((c) => c.id === category.parentId)
        : undefined,
      children: MOCK_CATEGORIES.filter((c) => c.parentId === category.id),
    };
  }
    const response = await apiClient.get<Category>(`/core/categories/${id}`);
  return response.data;
}

  async createCategory(data: CreateCategoryDto): Promise < Category > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...data,
      sortOrder: data.sortOrder || MOCK_CATEGORIES.length + 1,
      status: data.status || CategoryStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_CATEGORIES.push(newCategory);
    return newCategory;
  }
    const response = await apiClient.post<Category>('/core/categories', data);
  return response.data;
}

  async updateCategory(id: string, data: UpdateCategoryDto): Promise < Category > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    MOCK_CATEGORIES[index] = {
      ...MOCK_CATEGORIES[index],
      ...data,
      updatedAt: new Date(),
    };
    return MOCK_CATEGORIES[index];
  }
    const response = await apiClient.put<Category>(`/core/categories/${id}`, data);
  return response.data;
}

  async deleteCategory(id: string): Promise < void> {
  if(USE_MOCK_DATA) {
    await delay(300);
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    // Check for children
    const hasChildren = MOCK_CATEGORIES.some((c) => c.parentId === id);
    if (hasChildren) {
      throw new Error('Cannot delete category with children');
    }
    MOCK_CATEGORIES.splice(index, 1);
    return;
  }
    await apiClient.delete<void>(`/core/categories/${id}`);
}

  // ==========================================================================
  // Customer Methods
  // ==========================================================================

  async getAllCustomers(filters ?: CustomerFilters): Promise < Customer[] > {
  if(USE_MOCK_DATA) {
    await delay(300);
    let filteredCustomers = [...MOCK_CUSTOMERS];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.type) {
      filteredCustomers = filteredCustomers.filter((c) => c.type === filters.type);
    }

    if (filters?.status) {
      filteredCustomers = filteredCustomers.filter((c) => c.status === filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredCustomers = filteredCustomers.filter((c) =>
        filters.tags!.some((tag) => c.tags?.includes(tag))
      );
    }

    return filteredCustomers;
  }

    const params = new URLSearchParams();
  if(filters?.search) params.append('search', filters.search);
  if(filters?.type) params.append('type', filters.type);
  if(filters?.status) params.append('status', filters.status);
  if(filters?.tags) params.append('tags', filters.tags.join(','));

  const queryString = params.toString();
  const response = await apiClient.get<Customer[]>(
    `/core/customers${queryString ? `?${queryString}` : ''}`
  );
  return response.data;
}

  async getCustomerById(id: string): Promise < Customer > {
  if(USE_MOCK_DATA) {
    await delay(200);
    const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }
    const response = await apiClient.get<Customer>(`/core/customers/${id}`);
  return response.data;
}

  async createCustomer(data: CreateCustomerDto): Promise < Customer > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      ...data,
      addresses: data.addresses || [],
      contacts: data.contacts || [],
      status: data.status || CustomerStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_CUSTOMERS.push(newCustomer);
    return newCustomer;
  }
    const response = await apiClient.post<Customer>('/core/customers', data);
  return response.data;
}

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise < Customer > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    MOCK_CUSTOMERS[index] = {
      ...MOCK_CUSTOMERS[index],
      ...data,
      updatedAt: new Date(),
    };
    return MOCK_CUSTOMERS[index];
  }
    const response = await apiClient.put<Customer>(`/core/customers/${id}`, data);
  return response.data;
}

  async deleteCustomer(id: string): Promise < void> {
  if(USE_MOCK_DATA) {
    await delay(300);
    const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    MOCK_CUSTOMERS.splice(index, 1);
    return;
  }
    await apiClient.delete<void>(`/core/customers/${id}`);
}

  // ==========================================================================
  // Item Methods
  // ==========================================================================

  async getAllItems(filters ?: ItemFilters): Promise < Item[] > {
  if(USE_MOCK_DATA) {
    await delay(300);
    let filteredItems = [...MOCK_ITEMS];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) ||
          i.code.toLowerCase().includes(searchLower) ||
          i.description?.toLowerCase().includes(searchLower) ||
          i.sku?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.itemType) {
      filteredItems = filteredItems.filter((i) => i.itemType === filters.itemType);
    }

    if (filters?.categoryId) {
      filteredItems = filteredItems.filter((i) => i.categoryId === filters.categoryId);
    }

    if (filters?.status) {
      filteredItems = filteredItems.filter((i) => i.status === filters.status);
    }

    if (filters?.isStockable !== undefined) {
      filteredItems = filteredItems.filter((i) => i.isStockable === filters.isStockable);
    }

    if (filters?.isSellable !== undefined) {
      filteredItems = filteredItems.filter((i) => i.isSellable === filters.isSellable);
    }

    if (filters?.isPurchasable !== undefined) {
      filteredItems = filteredItems.filter((i) => i.isPurchasable === filters.isPurchasable);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter((i) =>
        filters.tags!.some((tag) => i.tags?.includes(tag))
      );
    }

    // Add category and UOM relationships
    return filteredItems.map((item) => ({
      ...item,
      category: MOCK_CATEGORIES.find((c) => c.id === item.categoryId),
      uom: MOCK_UOMS.find((u) => u.id === item.uomId),
    }));
  }

    const params = new URLSearchParams();
  if(filters?.search) params.append('search', filters.search);
  if(filters?.itemType) params.append('itemType', filters.itemType);
  if(filters?.categoryId) params.append('categoryId', filters.categoryId);
  if(filters?.status) params.append('status', filters.status);
  if(filters?.isStockable !== undefined) params.append('isStockable', String(filters.isStockable));
if (filters?.isSellable !== undefined) params.append('isSellable', String(filters.isSellable));
if (filters?.isPurchasable !== undefined) params.append('isPurchasable', String(filters.isPurchasable));
if (filters?.tags) params.append('tags', filters.tags.join(','));

const queryString = params.toString();
const response = await apiClient.get<Item[]>(
  `/api/v1/common-masters/items${queryString ? `?${queryString}` : ''}`
);
return response.data;
  }

  async getItemById(id: string): Promise < Item > {
  if(USE_MOCK_DATA) {
    await delay(200);
    const item = MOCK_ITEMS.find((i) => i.id === id);
    if (!item) throw new Error('Item not found');
    return {
      ...item,
      category: MOCK_CATEGORIES.find((c) => c.id === item.categoryId),
      uom: MOCK_UOMS.find((u) => u.id === item.uomId),
    };
  }
    const response = await apiClient.get<Item>(`/core/items/${id}`);
  return response.data;
}

  async getItemsByCategory(categoryId: string): Promise < Item[] > {
  if(USE_MOCK_DATA) {
    await delay(300);
    // Get items from this category and all child categories
    const categoryIds = [categoryId];
    const childCategories = MOCK_CATEGORIES.filter((c) => c.parentId === categoryId);
    categoryIds.push(...childCategories.map((c) => c.id));

    const items = MOCK_ITEMS.filter((i) => i.categoryId && categoryIds.includes(i.categoryId));
    return items.map((item) => ({
      ...item,
      category: MOCK_CATEGORIES.find((c) => c.id === item.categoryId),
      uom: MOCK_UOMS.find((u) => u.id === item.uomId),
    }));
  }
    const response = await apiClient.get<Item[]>(`/core/items/by-category/${categoryId}`);
  return response.data;
}

  async createItem(data: CreateItemDto): Promise < Item > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const newItem: Item = {
      id: `item-${Date.now()}`,
      ...data,
      isStockable: data.isStockable !== false,
      isSellable: data.isSellable !== false,
      isPurchasable: data.isPurchasable !== false,
      status: data.status || ItemStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_ITEMS.push(newItem);
    return {
      ...newItem,
      category: MOCK_CATEGORIES.find((c) => c.id === newItem.categoryId),
      uom: MOCK_UOMS.find((u) => u.id === newItem.uomId),
    };
  }
    const response = await apiClient.post<Item>('/core/items', data);
  return response.data;
}

  async updateItem(id: string, data: UpdateItemDto): Promise < Item > {
  if(USE_MOCK_DATA) {
    await delay(500);
    const index = MOCK_ITEMS.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');
    MOCK_ITEMS[index] = {
      ...MOCK_ITEMS[index],
      ...data,
      updatedAt: new Date(),
    };
    return {
      ...MOCK_ITEMS[index],
      category: MOCK_CATEGORIES.find((c) => c.id === MOCK_ITEMS[index].categoryId),
      uom: MOCK_UOMS.find((u) => u.id === MOCK_ITEMS[index].uomId),
    };
  }
    const response = await apiClient.put<Item>(`/core/items/${id}`, data);
  return response.data;
}

  async deleteItem(id: string): Promise < void> {
  if(USE_MOCK_DATA) {
    await delay(300);
    const index = MOCK_ITEMS.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');
    MOCK_ITEMS.splice(index, 1);
    return;
  }
    await apiClient.delete<void>(`/core/items/${id}`);
}
}

// Export as singleton
export const CoreService = new CoreServiceClass();

// ============================================================================
// coreService — flexible request client used by feature services
// (reports-management, support-management). Accepts a full options object with
// method/url/params/data and returns the unwrapped response payload.
// ============================================================================

const CORE_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface CoreRequestOptions {
  method: string;
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
}

/** Build a query string from a params object, skipping null/undefined values. */
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const coreService = {
  async request<T>(options: CoreRequestOptions): Promise<T> {
    const isAbsolute = /^https?:\/\//i.test(options.url);
    const base = isAbsolute ? '' : CORE_API_BASE_URL;
    const url = `${base}${options.url}${buildQueryString(options.params)}`;

    const response = await fetch(url, {
      method: options.method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.data !== undefined ? JSON.stringify(options.data) : undefined,
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
    // Unwrap the standard { success, data } envelope when present.
    return (payload && typeof payload === 'object' && 'data' in payload
      ? payload.data
      : payload) as T;
  },
};
