import { apiClient } from './api/client';

// ============================================================================
// Interfaces
// ============================================================================

export interface ShipmentItem {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    uom: string;
    weight: number;
    volume?: number;
}

export interface Shipment {
    id: string;
    shipmentNumber: string;
    orderId?: string;
    orderNumber?: string;
    customerId: string;
    customerName: string;
    deliveryAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    shipmentDate: string;
    expectedDeliveryDate: string;
    actualDeliveryDate?: string;
    dispatchDate?: string;
    status: 'Draft' | 'Pending' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Returned';
    priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    carrierId?: string;
    carrierName?: string;
    vehicleId?: string;
    vehicleNumber?: string;
    driverId?: string;
    driverName?: string;
    trackingNumber?: string;
    items: ShipmentItem[];
    totalWeight: number;
    totalVolume?: number;
    totalItems: number;
    shippingCost?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShipmentFilters {
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    priority?: string;
    search?: string;
}

export interface CreateShipmentDto {
    orderId?: string;
    customerId: string;
    customerName: string;
    deliveryAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    expectedDeliveryDate: string;
    priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
    carrierId?: string;
    vehicleId?: string;
    driverId?: string;
    items: Omit<ShipmentItem, 'id'>[];
    notes?: string;
}

export interface UpdateShipmentDto extends Partial<CreateShipmentDto> {
    status?: Shipment['status'];
    trackingNumber?: string;
    dispatchDate?: string;
    actualDeliveryDate?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SHIPMENTS: Shipment[] = [
    {
        id: 'SHIP-001',
        shipmentNumber: 'SHP-2025-0001',
        orderId: 'ORD-001',
        orderNumber: 'SO-2025-0145',
        customerId: 'CUST-001',
        customerName: 'Taj Hotels Limited',
        deliveryAddress: '123 Marine Drive, Colaba',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        shipmentDate: '2025-01-20',
        expectedDeliveryDate: '2025-01-25',
        status: 'In Transit',
        priority: 'High',
        carrierId: 'CARR-001',
        carrierName: 'Blue Dart Express',
        vehicleId: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        driverId: 'DRV-001',
        driverName: 'Rajesh Kumar',
        trackingNumber: 'BD2025012001',
        items: [
            { id: 'ITEM-001', productId: 'PRD-001', productCode: 'KIT-COMM-001', productName: 'Commercial Range Hood', quantity: 2, uom: 'PCS', weight: 45 },
            { id: 'ITEM-002', productId: 'PRD-002', productCode: 'KIT-COMM-002', productName: 'Industrial Refrigerator', quantity: 1, uom: 'PCS', weight: 120 },
        ],
        totalWeight: 210,
        totalVolume: 3.5,
        totalItems: 3,
        shippingCost: 15000,
        notes: 'Handle with care - fragile equipment',
        createdAt: '2025-01-19T10:30:00Z',
        updatedAt: '2025-01-20T14:00:00Z',
    },
    {
        id: 'SHIP-002',
        shipmentNumber: 'SHP-2025-0002',
        orderId: 'ORD-002',
        orderNumber: 'SO-2025-0146',
        customerId: 'CUST-002',
        customerName: 'BigBasket Pvt Ltd',
        deliveryAddress: '456 Koramangala Industrial Area',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India',
        shipmentDate: '2025-01-18',
        expectedDeliveryDate: '2025-01-22',
        actualDeliveryDate: '2025-01-21',
        dispatchDate: '2025-01-18',
        status: 'Delivered',
        priority: 'Urgent',
        carrierId: 'CARR-002',
        carrierName: 'Delhivery',
        vehicleId: 'VEH-002',
        vehicleNumber: 'KA-05-MN-5678',
        driverId: 'DRV-002',
        driverName: 'Suresh Babu',
        trackingNumber: 'DEL2025011801',
        items: [
            { id: 'ITEM-003', productId: 'PRD-003', productCode: 'COLD-001', productName: 'Walk-in Cooler Panel', quantity: 10, uom: 'PCS', weight: 25 },
            { id: 'ITEM-004', productId: 'PRD-004', productCode: 'COLD-002', productName: 'Refrigeration Compressor', quantity: 2, uom: 'PCS', weight: 80 },
        ],
        totalWeight: 410,
        totalVolume: 8.2,
        totalItems: 12,
        shippingCost: 22000,
        createdAt: '2025-01-17T09:00:00Z',
        updatedAt: '2025-01-21T16:30:00Z',
    },
    {
        id: 'SHIP-003',
        shipmentNumber: 'SHP-2025-0003',
        orderId: 'ORD-003',
        orderNumber: 'SO-2025-0147',
        customerId: 'CUST-003',
        customerName: 'ITC Grand Chola',
        deliveryAddress: '63 Mount Road, Guindy',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600032',
        country: 'India',
        shipmentDate: '2025-01-22',
        expectedDeliveryDate: '2025-01-27',
        status: 'Pending',
        priority: 'Normal',
        items: [
            { id: 'ITEM-005', productId: 'PRD-005', productCode: 'KIT-COMM-003', productName: 'Commercial Dishwasher', quantity: 3, uom: 'PCS', weight: 95 },
        ],
        totalWeight: 285,
        totalVolume: 4.8,
        totalItems: 3,
        shippingCost: 12500,
        notes: 'Customer requested weekend delivery',
        createdAt: '2025-01-21T11:00:00Z',
        updatedAt: '2025-01-21T11:00:00Z',
    },
    {
        id: 'SHIP-004',
        shipmentNumber: 'SHP-2025-0004',
        orderId: 'ORD-004',
        orderNumber: 'SO-2025-0148',
        customerId: 'CUST-004',
        customerName: 'Zomato Kitchens',
        deliveryAddress: '789 Sector 44, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122003',
        country: 'India',
        shipmentDate: '2025-01-19',
        expectedDeliveryDate: '2025-01-23',
        dispatchDate: '2025-01-19',
        status: 'Dispatched',
        priority: 'High',
        carrierId: 'CARR-001',
        carrierName: 'Blue Dart Express',
        vehicleId: 'VEH-003',
        vehicleNumber: 'HR-26-CD-9012',
        driverId: 'DRV-003',
        driverName: 'Amit Singh',
        trackingNumber: 'BD2025011902',
        items: [
            { id: 'ITEM-006', productId: 'PRD-006', productCode: 'KIT-PREP-001', productName: 'Prep Table Stainless Steel', quantity: 5, uom: 'PCS', weight: 35 },
            { id: 'ITEM-007', productId: 'PRD-007', productCode: 'KIT-PREP-002', productName: 'Commercial Blender', quantity: 4, uom: 'PCS', weight: 8 },
        ],
        totalWeight: 207,
        totalVolume: 2.8,
        totalItems: 9,
        shippingCost: 8500,
        createdAt: '2025-01-18T14:00:00Z',
        updatedAt: '2025-01-19T08:00:00Z',
    },
    {
        id: 'SHIP-005',
        shipmentNumber: 'SHP-2025-0005',
        orderId: 'ORD-005',
        orderNumber: 'SO-2025-0149',
        customerId: 'CUST-005',
        customerName: 'Marriott International',
        deliveryAddress: '101 DLF Phase 5',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
        shipmentDate: '2025-01-15',
        expectedDeliveryDate: '2025-01-20',
        actualDeliveryDate: '2025-01-19',
        dispatchDate: '2025-01-15',
        status: 'Delivered',
        priority: 'Normal',
        carrierId: 'CARR-003',
        carrierName: 'DTDC Express',
        vehicleId: 'VEH-004',
        vehicleNumber: 'DL-01-EF-3456',
        driverId: 'DRV-004',
        driverName: 'Vikram Chauhan',
        trackingNumber: 'DTDC2025011501',
        items: [
            { id: 'ITEM-008', productId: 'PRD-008', productCode: 'KIT-VENT-001', productName: 'Exhaust Hood System', quantity: 1, uom: 'SET', weight: 180 },
        ],
        totalWeight: 180,
        totalVolume: 5.2,
        totalItems: 1,
        shippingCost: 18000,
        createdAt: '2025-01-14T10:00:00Z',
        updatedAt: '2025-01-19T15:00:00Z',
    },
    {
        id: 'SHIP-006',
        shipmentNumber: 'SHP-2025-0006',
        orderId: 'ORD-006',
        orderNumber: 'SO-2025-0150',
        customerId: 'CUST-006',
        customerName: 'Swiggy Instamart',
        deliveryAddress: '234 Electronic City Phase 2',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
        shipmentDate: '2025-01-23',
        expectedDeliveryDate: '2025-01-28',
        status: 'Draft',
        priority: 'Low',
        items: [
            { id: 'ITEM-009', productId: 'PRD-009', productCode: 'STOR-001', productName: 'Storage Rack Heavy Duty', quantity: 8, uom: 'PCS', weight: 45 },
            { id: 'ITEM-010', productId: 'PRD-010', productCode: 'STOR-002', productName: 'Wire Shelving Unit', quantity: 12, uom: 'PCS', weight: 15 },
        ],
        totalWeight: 540,
        totalVolume: 12.5,
        totalItems: 20,
        notes: 'Awaiting final confirmation from customer',
        createdAt: '2025-01-22T09:00:00Z',
        updatedAt: '2025-01-22T09:00:00Z',
    },
    {
        id: 'SHIP-007',
        shipmentNumber: 'SHP-2025-0007',
        orderId: 'ORD-007',
        orderNumber: 'SO-2025-0151',
        customerId: 'CUST-007',
        customerName: 'Oberoi Hotels',
        deliveryAddress: '567 Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400021',
        country: 'India',
        shipmentDate: '2025-01-16',
        expectedDeliveryDate: '2025-01-18',
        status: 'Cancelled',
        priority: 'Urgent',
        items: [
            { id: 'ITEM-011', productId: 'PRD-011', productCode: 'KIT-COMM-004', productName: 'Convection Oven', quantity: 2, uom: 'PCS', weight: 120 },
        ],
        totalWeight: 240,
        totalVolume: 3.0,
        totalItems: 2,
        shippingCost: 10000,
        notes: 'Cancelled by customer - order revised',
        createdAt: '2025-01-15T12:00:00Z',
        updatedAt: '2025-01-16T10:00:00Z',
    },
    {
        id: 'SHIP-008',
        shipmentNumber: 'SHP-2025-0008',
        orderId: 'ORD-008',
        orderNumber: 'SO-2025-0152',
        customerId: 'CUST-008',
        customerName: 'Haldiram Foods',
        deliveryAddress: '890 Mathura Road, Faridabad',
        city: 'Faridabad',
        state: 'Haryana',
        postalCode: '121003',
        country: 'India',
        shipmentDate: '2025-01-21',
        expectedDeliveryDate: '2025-01-26',
        dispatchDate: '2025-01-21',
        status: 'In Transit',
        priority: 'High',
        carrierId: 'CARR-002',
        carrierName: 'Delhivery',
        vehicleId: 'VEH-005',
        vehicleNumber: 'HR-51-GH-7890',
        driverId: 'DRV-005',
        driverName: 'Manoj Tiwari',
        trackingNumber: 'DEL2025012101',
        items: [
            { id: 'ITEM-012', productId: 'PRD-012', productCode: 'FOOD-001', productName: 'Food Processing Line', quantity: 1, uom: 'SET', weight: 850 },
            { id: 'ITEM-013', productId: 'PRD-013', productCode: 'FOOD-002', productName: 'Packaging Machine', quantity: 2, uom: 'PCS', weight: 220 },
        ],
        totalWeight: 1290,
        totalVolume: 18.5,
        totalItems: 3,
        shippingCost: 45000,
        notes: 'Requires crane for unloading',
        createdAt: '2025-01-20T08:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z',
    },
    {
        id: 'SHIP-009',
        shipmentNumber: 'SHP-2025-0009',
        orderId: 'ORD-009',
        orderNumber: 'SO-2025-0153',
        customerId: 'CUST-009',
        customerName: 'Hyatt Regency',
        deliveryAddress: '321 Ring Road, Bhikaji Cama Place',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110066',
        country: 'India',
        shipmentDate: '2025-01-24',
        expectedDeliveryDate: '2025-01-29',
        status: 'Pending',
        priority: 'Normal',
        items: [
            { id: 'ITEM-014', productId: 'PRD-014', productCode: 'KIT-COMM-005', productName: 'Commercial Griddle', quantity: 3, uom: 'PCS', weight: 65 },
            { id: 'ITEM-015', productId: 'PRD-015', productCode: 'KIT-COMM-006', productName: 'Deep Fryer Commercial', quantity: 4, uom: 'PCS', weight: 28 },
        ],
        totalWeight: 307,
        totalVolume: 4.2,
        totalItems: 7,
        shippingCost: 14000,
        createdAt: '2025-01-23T11:00:00Z',
        updatedAt: '2025-01-23T11:00:00Z',
    },
    {
        id: 'SHIP-010',
        shipmentNumber: 'SHP-2025-0010',
        orderId: 'ORD-010',
        orderNumber: 'SO-2025-0154',
        customerId: 'CUST-010',
        customerName: 'Reliance Retail',
        deliveryAddress: '654 Jio World Centre, BKC',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        country: 'India',
        shipmentDate: '2025-01-12',
        expectedDeliveryDate: '2025-01-17',
        status: 'Returned',
        priority: 'High',
        carrierId: 'CARR-001',
        carrierName: 'Blue Dart Express',
        vehicleId: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        driverId: 'DRV-001',
        driverName: 'Rajesh Kumar',
        trackingNumber: 'BD2025011201',
        items: [
            { id: 'ITEM-016', productId: 'PRD-016', productCode: 'DISP-001', productName: 'Display Freezer', quantity: 2, uom: 'PCS', weight: 150 },
        ],
        totalWeight: 300,
        totalVolume: 6.0,
        totalItems: 2,
        shippingCost: 16000,
        notes: 'Returned due to damage during transit',
        createdAt: '2025-01-11T14:00:00Z',
        updatedAt: '2025-01-18T09:00:00Z',
    },
];

// ============================================================================
// Service Class
// ============================================================================

class ShipmentService {
    private mockShipments: Shipment[] = [...MOCK_SHIPMENTS];

    /**
     * Get all shipments with optional filters
     */
    async getAllShipments(filters?: ShipmentFilters): Promise<{ data: Shipment[]; total: number }> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.customerId) params.append('customerId', filters.customerId);
            if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters?.dateTo) params.append('dateTo', filters.dateTo);
            if (filters?.priority) params.append('priority', filters.priority);
            if (filters?.search) params.append('search', filters.search);

            const response = await apiClient.get<{ data: Shipment[]; total: number }>(
                `/sales-masters/shipments?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('API Error fetching shipments, using mock data:', error);

            // Filter mock data
            let filteredShipments = [...this.mockShipments];

            if (filters?.status) {
                filteredShipments = filteredShipments.filter(s => s.status === filters.status);
            }
            if (filters?.customerId) {
                filteredShipments = filteredShipments.filter(s => s.customerId === filters.customerId);
            }
            if (filters?.priority) {
                filteredShipments = filteredShipments.filter(s => s.priority === filters.priority);
            }
            if (filters?.dateFrom) {
                filteredShipments = filteredShipments.filter(s => s.shipmentDate >= filters.dateFrom!);
            }
            if (filters?.dateTo) {
                filteredShipments = filteredShipments.filter(s => s.shipmentDate <= filters.dateTo!);
            }
            if (filters?.search) {
                const searchLower = filters.search.toLowerCase();
                filteredShipments = filteredShipments.filter(s =>
                    s.shipmentNumber.toLowerCase().includes(searchLower) ||
                    s.customerName.toLowerCase().includes(searchLower) ||
                    s.trackingNumber?.toLowerCase().includes(searchLower)
                );
            }

            return { data: filteredShipments, total: filteredShipments.length };
        }
    }

    /**
     * Get shipment by ID
     */
    async getShipmentById(id: string): Promise<Shipment> {
        try {
            const response = await apiClient.get<Shipment>(`/sales-masters/shipments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching shipment ${id}, using mock data:`, error);
            const shipment = this.mockShipments.find(s => s.id === id);
            if (!shipment) throw new Error('Shipment not found');
            return shipment;
        }
    }

    /**
     * Get outstanding shipments (Pending, Dispatched, In Transit)
     */
    async getOutstandingShipments(): Promise<Shipment[]> {
        try {
            const response = await apiClient.get<Shipment[]>('/sales-masters/shipments/outstanding');
            return response.data;
        } catch (error) {
            console.error('API Error fetching outstanding shipments, using mock data:', error);
            return this.mockShipments.filter(s =>
                ['Pending', 'Dispatched', 'In Transit'].includes(s.status)
            );
        }
    }

    /**
     * Create a new shipment
     */
    async createShipment(data: CreateShipmentDto): Promise<Shipment> {
        try {
            const response = await apiClient.post<Shipment>('/sales-masters/shipments', data);
            return response.data;
        } catch (error) {
            console.error('API Error creating shipment, using mock:', error);

            const newShipment: Shipment = {
                id: `SHIP-${Date.now()}`,
                shipmentNumber: `SHP-2025-${String(this.mockShipments.length + 1).padStart(4, '0')}`,
                ...data,
                shipmentDate: new Date().toISOString().split('T')[0],
                status: 'Draft',
                priority: data.priority || 'Normal',
                items: data.items.map((item, index) => ({
                    ...item,
                    id: `ITEM-${Date.now()}-${index}`,
                })),
                totalWeight: data.items.reduce((sum, item) => sum + item.weight * item.quantity, 0),
                totalItems: data.items.reduce((sum, item) => sum + item.quantity, 0),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this.mockShipments.push(newShipment);
            return newShipment;
        }
    }

    /**
     * Update an existing shipment
     */
    async updateShipment(id: string, data: UpdateShipmentDto): Promise<Shipment> {
        try {
            const response = await apiClient.put<Shipment>(`/sales-masters/shipments/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`API Error updating shipment ${id}, using mock:`, error);

            const index = this.mockShipments.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Shipment not found');

            this.mockShipments[index] = {
                ...this.mockShipments[index],
                ...data,
                items: data.items
                    ? data.items.map((item, i) => ({ ...item, id: `ITEM-${Date.now()}-${i}` }))
                    : this.mockShipments[index].items,
                updatedAt: new Date().toISOString(),
            };

            return this.mockShipments[index];
        }
    }

    /**
     * Dispatch a shipment
     */
    async dispatchShipment(id: string): Promise<Shipment> {
        try {
            const response = await apiClient.post<Shipment>(`/sales-masters/shipments/${id}/dispatch`, {});
            return response.data;
        } catch (error) {
            console.error(`API Error dispatching shipment ${id}, using mock:`, error);

            const index = this.mockShipments.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Shipment not found');

            this.mockShipments[index] = {
                ...this.mockShipments[index],
                status: 'Dispatched',
                dispatchDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
            };

            return this.mockShipments[index];
        }
    }

    /**
     * Delete a shipment
     */
    async deleteShipment(id: string): Promise<{ success: boolean }> {
        try {
            await apiClient.delete(`/sales-masters/shipments/${id}`);
            return { success: true };
        } catch (error) {
            console.error(`API Error deleting shipment ${id}, using mock:`, error);

            const index = this.mockShipments.findIndex(s => s.id === id);
            if (index !== -1) {
                this.mockShipments.splice(index, 1);
            }
            return { success: true };
        }
    }

    /**
     * Mark shipment as delivered
     */
    async deliverShipment(id: string): Promise<Shipment> {
        try {
            const response = await apiClient.post<Shipment>(`/sales-masters/shipments/${id}/deliver`, {});
            return response.data;
        } catch (error) {
            console.error(`API Error delivering shipment ${id}, using mock:`, error);

            const index = this.mockShipments.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Shipment not found');

            this.mockShipments[index] = {
                ...this.mockShipments[index],
                status: 'Delivered',
                actualDeliveryDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
            };

            return this.mockShipments[index];
        }
    }
}

export const shipmentService = new ShipmentService();
