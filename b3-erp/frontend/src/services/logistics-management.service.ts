// Logistics Management Service
// Handles all Logistics related API calls and data management

const USE_MOCK_DATA = false;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ============================================
// ENUMS
// ============================================

export enum ShipmentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
}

export enum ShipmentMode {
  ROAD = 'road',
  RAIL = 'rail',
  AIR = 'air',
  SEA = 'sea',
  MULTIMODAL = 'multimodal',
}

export enum ShipmentStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  UNDER_MAINTENANCE = 'under_maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_TRIP = 'on_trip',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
}

export enum CarrierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

export enum GatePassType {
  INWARD = 'inward',
  OUTWARD = 'outward',
  RETURNABLE = 'returnable',
  NON_RETURNABLE = 'non_returnable',
}

export enum GatePassStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ExceptionType {
  DELAY = 'delay',
  DAMAGE = 'damage',
  SHORTAGE = 'shortage',
  LOSS = 'loss',
  WRONG_DELIVERY = 'wrong_delivery',
  REFUSED = 'refused',
  ADDRESS_ISSUE = 'address_issue',
}

export enum ExceptionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ============================================
// INTERFACES
// ============================================

export interface Transporter {
  id: string;
  transporterCode: string;
  transporterName: string;
  transporterType: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  gstNumber?: string;
  panNumber?: string;
  status: string;
  rating?: number;
}

export interface LogisticsRoute {
  id: string;
  routeCode: string;
  routeName: string;
  routeType: string;
  originCity: string;
  originState?: string;
  destinationCity: string;
  destinationState?: string;
  distance?: number;
  estimatedTime?: number;
  tollCharges?: number;
  fuelCost?: number;
  status: string;
}

export interface PackagingType {
  id: string;
  packagingCode: string;
  packagingName: string;
  category: string;
  materialType?: string;
  length?: number;
  width?: number;
  height?: number;
  maxWeight?: number;
  tareWeight?: number;
  isReusable: boolean;
}

export interface FreightTerm {
  id: string;
  termCode: string;
  termName: string;
  description?: string;
  incoterm?: string;
  riskTransferPoint?: string;
  costTransferPoint?: string;
}

export interface Port {
  id: string;
  portCode: string;
  portName: string;
  portType: string;
  country: string;
  city?: string;
  timeZone?: string;
  status: string;
}

export interface Vehicle {
  id: string;
  vehicleCode: string;
  vehicleNumber: string;
  vehicleType: string;
  make?: string;
  model?: string;
  year?: number;
  capacityWeight?: number;
  capacityVolume?: number;
  fuelType?: string;
  ownershipType: string;
  status: string;
  currentOdometer?: number;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  permitExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface VehicleMaintenance {
  id: string;
  maintenanceCode: string;
  vehicleId: string;
  vehicleNumber?: string;
  maintenanceType: string;
  maintenanceDate: string;
  odometerReading?: number;
  description?: string;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  status: string;
  performedBy?: string;
  vendorName?: string;
  nextServiceDate?: string;
}

export interface FuelRecord {
  id: string;
  fuelCode: string;
  vehicleId: string;
  vehicleNumber?: string;
  fuelDate: string;
  fuelType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  odometerReading?: number;
  fuelStationName?: string;
  filledBy?: string;
}

export interface Driver {
  id: string;
  driverCode: string;
  driverName: string;
  driverType: string;
  contactPhone?: string;
  email?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  status: string;
  totalTrips?: number;
  totalDistance?: number;
  rating?: number;
  currentVehicle?: string;
}

export interface DriverAssignment {
  id: string;
  assignmentCode: string;
  driverId: string;
  driverName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  tripId?: string;
  assignmentDate: string;
  assignmentType: string;
  startTime?: string;
  endTime?: string;
  status: string;
}

export interface DriverCompliance {
  id: string;
  complianceCode: string;
  driverId: string;
  driverName?: string;
  complianceType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface Carrier {
  id: string;
  carrierCode: string;
  carrierName: string;
  carrierType: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceArea?: string[];
  transportModes?: string[];
  status: string;
  rating?: number;
  totalShipments?: number;
  onTimeDeliveryRate?: number;
  damageRate?: number;
}

export interface CarrierRate {
  id: string;
  rateCode: string;
  carrierId: string;
  carrierName?: string;
  rateType: string;
  originCity?: string;
  destinationCity?: string;
  vehicleType?: string;
  weightFrom?: number;
  weightTo?: number;
  baseRate: number;
  perKgRate?: number;
  perKmRate?: number;
  minCharge?: number;
  fuelSurcharge?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: string;
}

export interface CarrierContract {
  id: string;
  contractCode: string;
  carrierId: string;
  carrierName?: string;
  contractName: string;
  contractType: string;
  startDate: string;
  endDate: string;
  contractValue?: number;
  minCommitment?: number;
  maxCommitment?: number;
  paymentTerms?: string;
  status: string;
}

export interface CarrierPerformance {
  id: string;
  carrierId: string;
  carrierName?: string;
  periodStart: string;
  periodEnd: string;
  totalShipments: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  damagedShipments: number;
  lostShipments: number;
  onTimePercentage?: number;
  damagePercentage?: number;
  overallRating?: number;
}

export interface LogisticsShipment {
  id: string;
  shipmentCode: string;
  shipmentNumber: string;
  shipmentType: string;
  shipmentMode: string;
  originAddress?: string;
  originCity?: string;
  originState?: string;
  originPincode?: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationPincode?: string;
  shipmentDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  carrierId?: string;
  carrierName?: string;
  vehicleNumber?: string;
  driverName?: string;
  totalWeight?: number;
  totalVolume?: number;
  totalPackages?: number;
  freightValue?: number;
  insuranceValue?: number;
  status: string;
  trackingNumber?: string;
  podReceived?: boolean;
  podDocument?: string;
  isDelayed?: boolean;
  delayReason?: string;
  items?: LogisticsShipmentItem[];
  trackingHistory?: LogisticsShipmentTracking[];
  exceptions?: LogisticsDeliveryException[];
}

export interface LogisticsShipmentItem {
  id: string;
  shipmentId: string;
  lineNumber: number;
  productCode?: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  packageCount: number;
  packageType?: string;
  weight?: number;
  volume?: number;
  unitValue?: number;
  totalValue?: number;
  isHazardous?: boolean;
}

export interface LogisticsShipmentTracking {
  id: string;
  trackingCode: string;
  shipmentId: string;
  eventDateTime: string;
  eventType: string;
  eventStatus: string;
  location?: string;
  city?: string;
  state?: string;
  description?: string;
  updatedByName?: string;
  source?: string;
}

export interface LogisticsDeliveryException {
  id: string;
  exceptionCode: string;
  shipmentId: string;
  exceptionType: string;
  severity: string;
  exceptionDateTime: string;
  location?: string;
  description: string;
  rootCause?: string;
  affectedQuantity?: number;
  affectedValue?: number;
  status: string;
  resolutionType?: string;
  resolutionDetails?: string;
  resolvedAt?: string;
}

export interface TripPlan {
  id: string;
  tripCode: string;
  tripName?: string;
  tripType: string;
  tripDate: string;
  vehicleId?: string;
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  startLocation?: string;
  endLocation?: string;
  plannedDistance?: number;
  actualDistance?: number;
  plannedDuration?: number;
  actualDuration?: number;
  fuelAllowance?: number;
  status: string;
  stops?: any[];
  shipmentIds?: string[];
}

export interface LoadPlan {
  id: string;
  loadCode: string;
  loadName?: string;
  loadType: string;
  planDate: string;
  vehicleId?: string;
  vehicleNumber?: string;
  vehicleCapacity?: number;
  plannedWeight?: number;
  actualWeight?: number;
  utilizationPercent?: number;
  status: string;
  shipmentIds?: string[];
}

export interface DispatchBoard {
  id: string;
  dispatchCode: string;
  shipmentId?: string;
  shipmentNumber?: string;
  dispatchDate: string;
  dispatchTime?: string;
  scheduledPickup?: string;
  scheduledDelivery?: string;
  vehicleNumber?: string;
  driverName?: string;
  dispatchStatus: string;
  priority: string;
  notes?: string;
}

export interface DockSchedule {
  id: string;
  scheduleCode: string;
  warehouseId?: string;
  warehouseName?: string;
  dockNumber: string;
  dockType: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  shipmentId?: string;
  shipmentNumber?: string;
  carrierName?: string;
  vehicleNumber?: string;
  status: string;
  actualArrival?: string;
  actualDeparture?: string;
}

export interface YardManagement {
  id: string;
  yardCode: string;
  warehouseId?: string;
  warehouseName?: string;
  yardZone?: string;
  spotNumber?: string;
  vehicleNumber?: string;
  trailerNumber?: string;
  driverName?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  purpose?: string;
  shipmentId?: string;
}

export interface FreightQuote {
  id: string;
  quoteCode: string;
  quoteDate: string;
  carrierId?: string;
  carrierName?: string;
  transportMode: string;
  originCity?: string;
  destinationCity?: string;
  weight?: number;
  volume?: number;
  quoteAmount: number;
  transitDays?: number;
  validUntil?: string;
  quoteStatus: string;
}

export interface FreightBooking {
  id: string;
  bookingCode: string;
  bookingDate: string;
  quoteId?: string;
  carrierId?: string;
  carrierName?: string;
  transportMode: string;
  originCity?: string;
  destinationCity?: string;
  pickupDate?: string;
  expectedDelivery?: string;
  bookedAmount: number;
  bookingStatus: string;
}

export interface FreightInvoice {
  id: string;
  invoiceCode: string;
  invoiceNumber: string;
  invoiceDate: string;
  carrierId?: string;
  carrierName?: string;
  invoiceType: string;
  shipmentIds?: string[];
  freightAmount: number;
  fuelSurcharge?: number;
  otherCharges?: number;
  taxAmount?: number;
  totalAmount: number;
  dueDate?: string;
  invoiceStatus: string;
  paidAmount?: number;
  paidDate?: string;
}

export interface FreightAudit {
  id: string;
  auditCode: string;
  invoiceId?: string;
  invoiceNumber?: string;
  auditDate: string;
  auditedBy?: string;
  invoicedAmount: number;
  calculatedAmount: number;
  discrepancyAmount?: number;
  discrepancyReason?: string;
  auditStatus: string;
  adjustmentType?: string;
  adjustedAmount?: number;
}

export interface GatePass {
  id: string;
  gatePassCode: string;
  gatePassNumber: string;
  gatePassType: string;
  passDate: string;
  passTime?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  visitorName?: string;
  visitorCompany?: string;
  purpose: string;
  approvedBy?: string;
  approverName?: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  remarks?: string;
  items?: GatePassItem[];
}

export interface GatePassItem {
  id: string;
  gatePassId: string;
  lineNumber: number;
  itemType: string;
  itemCode?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  value?: number;
  serialNumbers?: string[];
  isReturnable: boolean;
  returnedQuantity?: number;
  returnedDate?: string;
}

export interface LogisticsSettings {
  id: string;
  companyId: string;
  autoGenerateShipmentCode: boolean;
  shipmentCodePrefix?: string;
  shipmentCodeLength?: number;
  autoGenerateGatePassCode: boolean;
  gatePassCodePrefix?: string;
  defaultShipmentMode?: string;
  defaultCarrierId?: string;
  enableGpsTracking: boolean;
  trackingUpdateInterval?: number;
  enableAutoAlerts: boolean;
  delayAlertThreshold?: number;
  requirePodForDelivery: boolean;
  requireGatePassApproval: boolean;
}

export interface LogisticsDashboard {
  summary: {
    totalShipments: number;
    pendingShipments: number;
    inTransitShipments: number;
    deliveredThisMonth: number;
    activeVehicles: number;
    activeDrivers: number;
    activeCarriers: number;
    openExceptions: number;
    todayDispatches: number;
    pendingGatePasses: number;
  };
}

// ============================================
// MOCK DATA
// ============================================

const mockTransporters: Transporter[] = [
  {
    id: '1',
    transporterCode: 'TRP-001',
    transporterName: 'Blue Dart Express',
    transporterType: 'courier',
    contactPerson: 'Rajesh Kumar',
    email: 'support@bluedart.com',
    phone: '1800-233-1234',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    gstNumber: '27AAACB1234F1ZZ',
    status: 'active',
    rating: 4.5,
  },
  {
    id: '2',
    transporterCode: 'TRP-002',
    transporterName: 'TCI Freight',
    transporterType: 'ftl',
    contactPerson: 'Suresh Patel',
    email: 'logistics@tcifreight.com',
    phone: '022-66767676',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    gstNumber: '24AAACT5678G1ZZ',
    status: 'active',
    rating: 4.2,
  },
  {
    id: '3',
    transporterCode: 'TRP-003',
    transporterName: 'Gati KWE',
    transporterType: 'ltl',
    contactPerson: 'Amit Shah',
    email: 'customercare@gati.com',
    phone: '1800-180-4284',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    gstNumber: '36AAACG9012H1ZZ',
    status: 'active',
    rating: 4.0,
  },
];

const mockRoutes: LogisticsRoute[] = [
  {
    id: '1',
    routeCode: 'RT-001',
    routeName: 'Mumbai - Delhi Highway',
    routeType: 'highway',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destinationCity: 'Delhi',
    destinationState: 'Delhi',
    distance: 1400,
    estimatedTime: 24,
    tollCharges: 3500,
    fuelCost: 8500,
    status: 'active',
  },
  {
    id: '2',
    routeCode: 'RT-002',
    routeName: 'Mumbai - Pune Expressway',
    routeType: 'expressway',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destinationCity: 'Pune',
    destinationState: 'Maharashtra',
    distance: 150,
    estimatedTime: 3,
    tollCharges: 500,
    fuelCost: 900,
    status: 'active',
  },
  {
    id: '3',
    routeCode: 'RT-003',
    routeName: 'Delhi - Jaipur Route',
    routeType: 'highway',
    originCity: 'Delhi',
    originState: 'Delhi',
    destinationCity: 'Jaipur',
    destinationState: 'Rajasthan',
    distance: 280,
    estimatedTime: 5,
    tollCharges: 800,
    fuelCost: 1700,
    status: 'active',
  },
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleCode: 'VEH-001',
    vehicleNumber: 'MH-01-AB-1234',
    vehicleType: 'truck_14t',
    make: 'Tata',
    model: 'Prima',
    year: 2022,
    capacityWeight: 14000,
    capacityVolume: 45,
    fuelType: 'diesel',
    ownershipType: 'owned',
    status: 'available',
    currentOdometer: 45000,
    insuranceExpiry: '2025-06-30',
    fitnessExpiry: '2025-03-31',
    permitExpiry: '2025-12-31',
    lastMaintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-04-15',
  },
  {
    id: '2',
    vehicleCode: 'VEH-002',
    vehicleNumber: 'MH-02-CD-5678',
    vehicleType: 'truck_20t',
    make: 'Ashok Leyland',
    model: 'Captain',
    year: 2021,
    capacityWeight: 20000,
    capacityVolume: 60,
    fuelType: 'diesel',
    ownershipType: 'owned',
    status: 'in_use',
    currentOdometer: 78000,
    insuranceExpiry: '2025-04-30',
    fitnessExpiry: '2025-02-28',
    permitExpiry: '2025-10-31',
    lastMaintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-04-20',
  },
  {
    id: '3',
    vehicleCode: 'VEH-003',
    vehicleNumber: 'GJ-01-EF-9012',
    vehicleType: 'van',
    make: 'Mahindra',
    model: 'Supro',
    year: 2023,
    capacityWeight: 1000,
    capacityVolume: 8,
    fuelType: 'diesel',
    ownershipType: 'leased',
    status: 'available',
    currentOdometer: 12000,
    insuranceExpiry: '2025-12-31',
    fitnessExpiry: '2025-12-31',
    permitExpiry: '2025-12-31',
  },
];

const mockDrivers: Driver[] = [
  {
    id: '1',
    driverCode: 'DRV-001',
    driverName: 'Ramesh Yadav',
    driverType: 'permanent',
    contactPhone: '9876543210',
    email: 'ramesh.yadav@email.com',
    licenseNumber: 'MH-1234567890123',
    licenseType: 'heavy',
    licenseExpiry: '2027-05-15',
    dateOfBirth: '1985-03-20',
    dateOfJoining: '2020-01-15',
    status: 'available',
    totalTrips: 450,
    totalDistance: 125000,
    rating: 4.7,
  },
  {
    id: '2',
    driverCode: 'DRV-002',
    driverName: 'Sunil Sharma',
    driverType: 'permanent',
    contactPhone: '9876543211',
    email: 'sunil.sharma@email.com',
    licenseNumber: 'MH-9876543210987',
    licenseType: 'heavy',
    licenseExpiry: '2026-08-20',
    dateOfBirth: '1988-07-12',
    dateOfJoining: '2019-06-01',
    status: 'on_trip',
    totalTrips: 520,
    totalDistance: 145000,
    rating: 4.5,
    currentVehicle: 'MH-02-CD-5678',
  },
  {
    id: '3',
    driverCode: 'DRV-003',
    driverName: 'Manoj Kumar',
    driverType: 'contract',
    contactPhone: '9876543212',
    licenseNumber: 'GJ-5432109876543',
    licenseType: 'light',
    licenseExpiry: '2025-12-10',
    dateOfBirth: '1990-11-05',
    dateOfJoining: '2023-03-01',
    status: 'available',
    totalTrips: 85,
    totalDistance: 18000,
    rating: 4.2,
  },
];

const mockCarriers: Carrier[] = [
  {
    id: '1',
    carrierCode: 'CAR-001',
    carrierName: 'Delhivery',
    carrierType: 'express',
    contactPerson: 'Vikram Singh',
    email: 'business@delhivery.com',
    phone: '1800-102-1234',
    address: 'Sector 44, Gurgaon',
    serviceArea: ['North India', 'West India', 'South India'],
    transportModes: ['road', 'air'],
    status: 'active',
    rating: 4.3,
    totalShipments: 1250,
    onTimeDeliveryRate: 92.5,
    damageRate: 0.8,
  },
  {
    id: '2',
    carrierCode: 'CAR-002',
    carrierName: 'Ecom Express',
    carrierType: 'ecommerce',
    contactPerson: 'Priya Mehta',
    email: 'partners@ecomexpress.in',
    phone: '1800-419-1234',
    address: 'Okhla Industrial Area, Delhi',
    serviceArea: ['Pan India'],
    transportModes: ['road'],
    status: 'active',
    rating: 4.1,
    totalShipments: 890,
    onTimeDeliveryRate: 88.7,
    damageRate: 1.2,
  },
  {
    id: '3',
    carrierCode: 'CAR-003',
    carrierName: 'Safexpress',
    carrierType: 'ftl',
    contactPerson: 'Anand Gupta',
    email: 'corporate@safexpress.com',
    phone: '1800-113-1234',
    address: 'MIDC Andheri, Mumbai',
    serviceArea: ['Pan India'],
    transportModes: ['road', 'rail'],
    status: 'active',
    rating: 4.4,
    totalShipments: 650,
    onTimeDeliveryRate: 94.2,
    damageRate: 0.5,
  },
];

const mockShipments: LogisticsShipment[] = [
  {
    id: '1',
    shipmentCode: 'SHP-2024-001',
    shipmentNumber: 'SHIP001234',
    shipmentType: 'outbound',
    shipmentMode: 'road',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    originPincode: '400001',
    destinationCity: 'Delhi',
    destinationState: 'Delhi',
    destinationPincode: '110001',
    shipmentDate: '2024-02-10',
    expectedDeliveryDate: '2024-02-12',
    carrierId: '1',
    carrierName: 'Delhivery',
    vehicleNumber: 'MH-01-AB-1234',
    driverName: 'Ramesh Yadav',
    totalWeight: 5000,
    totalVolume: 12,
    totalPackages: 25,
    freightValue: 15000,
    status: 'in_transit',
    trackingNumber: 'DEL1234567890',
    isDelayed: false,
  },
  {
    id: '2',
    shipmentCode: 'SHP-2024-002',
    shipmentNumber: 'SHIP001235',
    shipmentType: 'inbound',
    shipmentMode: 'road',
    originCity: 'Bangalore',
    originState: 'Karnataka',
    originPincode: '560001',
    destinationCity: 'Mumbai',
    destinationState: 'Maharashtra',
    destinationPincode: '400001',
    shipmentDate: '2024-02-08',
    expectedDeliveryDate: '2024-02-10',
    deliveryDate: '2024-02-10',
    carrierId: '2',
    carrierName: 'Ecom Express',
    totalWeight: 2500,
    totalVolume: 6,
    totalPackages: 12,
    freightValue: 8500,
    status: 'delivered',
    trackingNumber: 'ECM9876543210',
    podReceived: true,
    isDelayed: false,
  },
  {
    id: '3',
    shipmentCode: 'SHP-2024-003',
    shipmentNumber: 'SHIP001236',
    shipmentType: 'outbound',
    shipmentMode: 'air',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destinationCity: 'Chennai',
    destinationState: 'Tamil Nadu',
    shipmentDate: '2024-02-11',
    expectedDeliveryDate: '2024-02-12',
    carrierId: '1',
    carrierName: 'Delhivery',
    totalWeight: 500,
    totalPackages: 5,
    freightValue: 12000,
    status: 'confirmed',
    trackingNumber: 'DEL5678901234',
    isDelayed: false,
  },
];

const mockGatePasses: GatePass[] = [
  {
    id: '1',
    gatePassCode: 'GP-2024-001',
    gatePassNumber: 'GP001234',
    gatePassType: 'outward',
    passDate: '2024-02-11',
    passTime: '10:30',
    vehicleNumber: 'MH-01-AB-1234',
    driverName: 'Ramesh Yadav',
    driverPhone: '9876543210',
    purpose: 'Material delivery to customer',
    approvedBy: 'admin-1',
    approverName: 'Warehouse Manager',
    status: 'approved',
    checkInTime: '10:30',
    checkOutTime: '11:15',
  },
  {
    id: '2',
    gatePassCode: 'GP-2024-002',
    gatePassNumber: 'GP001235',
    gatePassType: 'inward',
    passDate: '2024-02-11',
    passTime: '14:00',
    vehicleNumber: 'MH-03-GH-9012',
    driverName: 'Sunil Sharma',
    visitorCompany: 'ABC Suppliers',
    purpose: 'Raw material delivery',
    status: 'pending',
  },
  {
    id: '3',
    gatePassCode: 'GP-2024-003',
    gatePassNumber: 'GP001236',
    gatePassType: 'returnable',
    passDate: '2024-02-10',
    passTime: '09:00',
    vehicleNumber: 'GJ-01-EF-9012',
    driverName: 'Manoj Kumar',
    purpose: 'Equipment sent for repair',
    approvedBy: 'admin-2',
    approverName: 'Operations Manager',
    status: 'completed',
    checkInTime: '09:00',
    checkOutTime: '09:45',
    expectedReturnDate: '2024-02-15',
  },
];

const mockDashboard: LogisticsDashboard = {
  summary: {
    totalShipments: 1250,
    pendingShipments: 45,
    inTransitShipments: 120,
    deliveredThisMonth: 890,
    activeVehicles: 25,
    activeDrivers: 32,
    activeCarriers: 8,
    openExceptions: 12,
    todayDispatches: 28,
    pendingGatePasses: 5,
  },
};

// ============================================
// SERVICE CLASS
// ============================================

class LogisticsManagementService {
  // ============================================
  // DASHBOARD
  // ============================================

  static async getDashboard(): Promise<LogisticsDashboard> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDashboard;
    }
    // Backend controller route: @Controller('logistics/management') -> @Get('dashboard')
    // Returns { summary: {...} } with real Prisma counts.
    const res = await apiRequest<{ summary?: Record<string, any> }>(
      '/logistics/management/dashboard'
    );
    const s = (res && typeof res === 'object' && res.summary) ? res.summary : {};
    const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    return {
      summary: {
        totalShipments: num(s.totalShipments),
        pendingShipments: num(s.pendingShipments),
        inTransitShipments: num(s.inTransitShipments),
        deliveredThisMonth: num(s.deliveredThisMonth),
        activeVehicles: num(s.activeVehicles),
        activeDrivers: num(s.activeDrivers),
        activeCarriers: num(s.activeCarriers),
        openExceptions: num(s.openExceptions),
        todayDispatches: num(s.todayDispatches),
        pendingGatePasses: num(s.pendingGatePasses),
      },
    };
  }

  // ============================================
  // TRANSPORTERS
  // ============================================

  static async getTransporters(filters?: {
    transporterType?: string;
    status?: string;
    search?: string;
  }): Promise<Transporter[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockTransporters];
      if (filters?.transporterType) {
        result = result.filter(t => t.transporterType === filters.transporterType);
      }
      if (filters?.status) {
        result = result.filter(t => t.status === filters.status);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(t =>
          t.transporterName.toLowerCase().includes(search) ||
          t.transporterCode.toLowerCase().includes(search)
        );
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getTransporterById(id: string): Promise<Transporter | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockTransporters.find(t => t.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // ROUTES
  // ============================================

  static async getRoutes(filters?: {
    routeType?: string;
    status?: string;
    originCity?: string;
    destinationCity?: string;
  }): Promise<LogisticsRoute[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockRoutes];
      if (filters?.routeType) {
        result = result.filter(r => r.routeType === filters.routeType);
      }
      if (filters?.status) {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters?.originCity) {
        result = result.filter(r => r.originCity.toLowerCase().includes(filters.originCity!.toLowerCase()));
      }
      if (filters?.destinationCity) {
        result = result.filter(r => r.destinationCity.toLowerCase().includes(filters.destinationCity!.toLowerCase()));
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // VEHICLES
  // ============================================

  static async getVehicles(filters?: {
    vehicleType?: string;
    status?: string;
    ownershipType?: string;
  }): Promise<Vehicle[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockVehicles];
      if (filters?.vehicleType) {
        result = result.filter(v => v.vehicleType === filters.vehicleType);
      }
      if (filters?.status) {
        result = result.filter(v => v.status === filters.status);
      }
      if (filters?.ownershipType) {
        result = result.filter(v => v.ownershipType === filters.ownershipType);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getVehicleById(id: string): Promise<Vehicle | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockVehicles.find(v => v.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // DRIVERS
  // ============================================

  static async getDrivers(filters?: {
    status?: string;
    driverType?: string;
    search?: string;
  }): Promise<Driver[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockDrivers];
      if (filters?.status) {
        result = result.filter(d => d.status === filters.status);
      }
      if (filters?.driverType) {
        result = result.filter(d => d.driverType === filters.driverType);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(d =>
          d.driverName.toLowerCase().includes(search) ||
          d.driverCode.toLowerCase().includes(search)
        );
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getDriverById(id: string): Promise<Driver | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockDrivers.find(d => d.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // CARRIERS
  // ============================================

  static async getCarriers(filters?: {
    carrierType?: string;
    status?: string;
    search?: string;
  }): Promise<Carrier[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockCarriers];
      if (filters?.carrierType) {
        result = result.filter(c => c.carrierType === filters.carrierType);
      }
      if (filters?.status) {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(c =>
          c.carrierName.toLowerCase().includes(search) ||
          c.carrierCode.toLowerCase().includes(search)
        );
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getCarrierById(id: string): Promise<Carrier | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCarriers.find(c => c.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // SHIPMENTS
  // ============================================

  static async getShipments(filters?: {
    shipmentType?: string;
    shipmentMode?: string;
    status?: string;
    carrierId?: string;
  }): Promise<LogisticsShipment[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockShipments];
      if (filters?.shipmentType) {
        result = result.filter(s => s.shipmentType === filters.shipmentType);
      }
      if (filters?.shipmentMode) {
        result = result.filter(s => s.shipmentMode === filters.shipmentMode);
      }
      if (filters?.status) {
        result = result.filter(s => s.status === filters.status);
      }
      if (filters?.carrierId) {
        result = result.filter(s => s.carrierId === filters.carrierId);
      }
      return result;
    }
    throw new Error('API not implemented');
  }

  static async getShipmentById(id: string): Promise<LogisticsShipment | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockShipments.find(s => s.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  static async trackShipment(trackingNumber: string): Promise<LogisticsShipmentTracking[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Return mock tracking events
      return [
        {
          id: '1',
          trackingCode: trackingNumber,
          shipmentId: '1',
          eventDateTime: '2024-02-10T10:00:00Z',
          eventType: 'pickup',
          eventStatus: 'completed',
          location: 'Mumbai Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          description: 'Shipment picked up from origin',
          source: 'driver_app',
        },
        {
          id: '2',
          trackingCode: trackingNumber,
          shipmentId: '1',
          eventDateTime: '2024-02-10T14:30:00Z',
          eventType: 'departure',
          eventStatus: 'completed',
          location: 'Mumbai Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          description: 'Shipment departed from Mumbai Hub',
          source: 'system',
        },
        {
          id: '3',
          trackingCode: trackingNumber,
          shipmentId: '1',
          eventDateTime: '2024-02-11T08:00:00Z',
          eventType: 'in_transit',
          eventStatus: 'completed',
          location: 'En Route',
          city: 'Jaipur',
          state: 'Rajasthan',
          description: 'Shipment in transit',
          source: 'gps',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // GATE PASSES
  // ============================================

  static async getGatePasses(filters?: {
    gatePassType?: string;
    status?: string;
  }): Promise<GatePass[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let result = [...mockGatePasses];
      if (filters?.gatePassType) {
        result = result.filter(g => g.gatePassType === filters.gatePassType);
      }
      if (filters?.status) {
        result = result.filter(g => g.status === filters.status);
      }
      return result;
    }
    // Backend controller route: @Controller('api/logistics/gate-pass')
    // Response envelope: { success: boolean; data: GatePass[] }
    const res = await apiRequest<{ success?: boolean; data?: any[] }>(
      '/api/logistics/gate-pass'
    );
    const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res as any) ? (res as any) : [];
    return (rows as any[]).map((g: any) => ({
      id: String(g?.id ?? ''),
      gatePassCode: g?.gatePassCode ?? g?.referenceId ?? g?.gatePassNumber ?? '',
      gatePassNumber: g?.gatePassNumber ?? g?.referenceId ?? '',
      gatePassType: g?.gatePassType ?? g?.type ?? '',
      passDate: g?.passDate ?? g?.createdAt ?? '',
      passTime: g?.passTime ?? undefined,
      vehicleNumber: g?.vehicleNumber ?? g?.vehicle ?? undefined,
      driverName: g?.driverName ?? g?.driver ?? undefined,
      driverPhone: g?.driverPhone ?? undefined,
      purpose: g?.purpose ?? '',
      approvedBy: g?.approvedBy ?? undefined,
      approverName: g?.approverName ?? undefined,
      status: g?.status ?? '',
      checkInTime: g?.checkInTime ?? undefined,
      checkOutTime: g?.checkOutTime ?? undefined,
      expectedReturnDate: g?.expectedReturnDate ?? undefined,
      actualReturnDate: g?.actualReturnDate ?? undefined,
      remarks: g?.remarks ?? undefined,
    })) as GatePass[];
  }

  static async getGatePassById(id: string): Promise<GatePass | null> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockGatePasses.find(g => g.id === id) || null;
    }
    throw new Error('API not implemented');
  }

  static async approveGatePass(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const gatePass = mockGatePasses.find(g => g.id === id);
      if (gatePass) {
        gatePass.status = 'approved';
        return true;
      }
      return false;
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // DELIVERY EXCEPTIONS
  // ============================================

  static async getDeliveryExceptions(filters?: {
    shipmentId?: string;
    exceptionType?: string;
    severity?: string;
    status?: string;
  }): Promise<LogisticsDeliveryException[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Return mock exceptions
      return [
        {
          id: '1',
          exceptionCode: 'EXC-001',
          shipmentId: '1',
          exceptionType: 'delay',
          severity: 'medium',
          exceptionDateTime: '2024-02-11T10:00:00Z',
          location: 'Delhi Hub',
          description: 'Vehicle breakdown causing delay',
          rootCause: 'Mechanical failure',
          status: 'investigating',
        },
        {
          id: '2',
          exceptionCode: 'EXC-002',
          shipmentId: '2',
          exceptionType: 'shortage',
          severity: 'high',
          exceptionDateTime: '2024-02-10T15:30:00Z',
          location: 'Mumbai Warehouse',
          description: '2 packages short delivered',
          affectedQuantity: 2,
          status: 'open',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // DISPATCH BOARD
  // ============================================

  static async getDispatchBoard(filters?: {
    dispatchStatus?: string;
    priority?: string;
    date?: string;
  }): Promise<DispatchBoard[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          dispatchCode: 'DSP-001',
          shipmentId: '1',
          shipmentNumber: 'SHIP001234',
          dispatchDate: '2024-02-11',
          dispatchTime: '08:00',
          scheduledPickup: '2024-02-11T08:00:00Z',
          scheduledDelivery: '2024-02-12T18:00:00Z',
          vehicleNumber: 'MH-01-AB-1234',
          driverName: 'Ramesh Yadav',
          dispatchStatus: 'dispatched',
          priority: 'high',
        },
        {
          id: '2',
          dispatchCode: 'DSP-002',
          shipmentId: '3',
          shipmentNumber: 'SHIP001236',
          dispatchDate: '2024-02-11',
          dispatchTime: '10:00',
          scheduledPickup: '2024-02-11T10:00:00Z',
          scheduledDelivery: '2024-02-12T12:00:00Z',
          dispatchStatus: 'pending',
          priority: 'medium',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // DOCK SCHEDULING
  // ============================================

  static async getDockSchedules(filters?: {
    warehouseId?: string;
    dockType?: string;
    status?: string;
    date?: string;
  }): Promise<DockSchedule[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          scheduleCode: 'DCK-001',
          warehouseName: 'Mumbai Central Warehouse',
          dockNumber: 'D-01',
          dockType: 'loading',
          scheduledDate: '2024-02-11',
          scheduledTime: '09:00',
          duration: 60,
          shipmentNumber: 'SHIP001234',
          carrierName: 'Delhivery',
          vehicleNumber: 'MH-01-AB-1234',
          status: 'scheduled',
        },
        {
          id: '2',
          scheduleCode: 'DCK-002',
          warehouseName: 'Mumbai Central Warehouse',
          dockNumber: 'D-02',
          dockType: 'unloading',
          scheduledDate: '2024-02-11',
          scheduledTime: '11:00',
          duration: 45,
          shipmentNumber: 'SHIP001235',
          carrierName: 'Ecom Express',
          status: 'in_progress',
          actualArrival: '10:55',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // FREIGHT MANAGEMENT
  // ============================================

  static async getFreightQuotes(filters?: {
    quoteStatus?: string;
    transportMode?: string;
  }): Promise<FreightQuote[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          quoteCode: 'FQ-001',
          quoteDate: '2024-02-10',
          carrierName: 'Delhivery',
          transportMode: 'road',
          originCity: 'Mumbai',
          destinationCity: 'Delhi',
          weight: 5000,
          quoteAmount: 15000,
          transitDays: 2,
          validUntil: '2024-02-17',
          quoteStatus: 'received',
        },
        {
          id: '2',
          quoteCode: 'FQ-002',
          quoteDate: '2024-02-10',
          carrierName: 'Safexpress',
          transportMode: 'road',
          originCity: 'Mumbai',
          destinationCity: 'Delhi',
          weight: 5000,
          quoteAmount: 14500,
          transitDays: 3,
          validUntil: '2024-02-17',
          quoteStatus: 'received',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  static async getFreightInvoices(filters?: {
    invoiceStatus?: string;
    carrierId?: string;
  }): Promise<FreightInvoice[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          invoiceCode: 'FI-001',
          invoiceNumber: 'INV-DEL-2024-001',
          invoiceDate: '2024-02-10',
          carrierName: 'Delhivery',
          invoiceType: 'freight',
          freightAmount: 15000,
          fuelSurcharge: 750,
          taxAmount: 2835,
          totalAmount: 18585,
          dueDate: '2024-02-25',
          invoiceStatus: 'pending',
        },
        {
          id: '2',
          invoiceCode: 'FI-002',
          invoiceNumber: 'INV-ECM-2024-001',
          invoiceDate: '2024-02-08',
          carrierName: 'Ecom Express',
          invoiceType: 'freight',
          freightAmount: 8500,
          fuelSurcharge: 425,
          taxAmount: 1606,
          totalAmount: 10531,
          dueDate: '2024-02-23',
          invoiceStatus: 'paid',
          paidAmount: 10531,
          paidDate: '2024-02-12',
        },
      ];
    }
    throw new Error('API not implemented');
  }

  // ============================================
  // ANALYTICS & REPORTS
  // ============================================

  static async getDeliveryPerformanceReport(startDate: string, endDate: string): Promise<{
    totalDeliveries: number;
    onTimeDeliveries: number;
    delayedDeliveries: number;
    onTimePercentage: number;
    byCarrier: Record<string, { total: number; onTime: number; delayed: number }>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        totalDeliveries: 890,
        onTimeDeliveries: 812,
        delayedDeliveries: 78,
        onTimePercentage: 91.2,
        byCarrier: {
          'Delhivery': { total: 450, onTime: 420, delayed: 30 },
          'Ecom Express': { total: 280, onTime: 248, delayed: 32 },
          'Safexpress': { total: 160, onTime: 144, delayed: 16 },
        },
      };
    }
    throw new Error('API not implemented');
  }

  static async getFreightSpendAnalysis(startDate: string, endDate: string): Promise<{
    totalSpend: number;
    byCarrier: Record<string, number>;
    byMode: Record<string, number>;
    invoiceCount: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        totalSpend: 1250000,
        byCarrier: {
          'Delhivery': 520000,
          'Ecom Express': 380000,
          'Safexpress': 350000,
        },
        byMode: {
          'road': 950000,
          'air': 200000,
          'rail': 100000,
        },
        invoiceCount: 145,
      };
    }
    throw new Error('API not implemented');
  }
}

export default LogisticsManagementService;
