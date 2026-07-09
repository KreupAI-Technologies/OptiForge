import { apiClient } from './api/client';

// ============================================================================
// Interfaces
// ============================================================================

export interface RouteStop {
    id: string;
    sequence: number;
    locationName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    stopType: 'Pickup' | 'Delivery' | 'Waypoint';
    estimatedArrival?: string;
    estimatedDuration: number; // in minutes
    notes?: string;
}

export interface Route {
    id: string;
    routeCode: string;
    routeName: string;
    description?: string;
    origin: string;
    originCity: string;
    originState: string;
    destination: string;
    destinationCity: string;
    destinationState: string;
    totalDistance: number; // in km
    estimatedDuration: number; // in minutes
    stops: RouteStop[];
    status: 'Active' | 'Inactive' | 'Under Review';
    routeType: 'Regular' | 'Express' | 'Economy';
    tollCost?: number;
    fuelCostEstimate?: number;
    preferredVehicleType?: string;
    restrictions?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Trip {
    id: string;
    tripNumber: string;
    routeId: string;
    routeCode: string;
    routeName: string;
    vehicleId: string;
    vehicleNumber: string;
    driverId: string;
    driverName: string;
    shipmentIds: string[];
    plannedStartTime: string;
    plannedEndTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled' | 'Delayed';
    currentLocation?: string;
    currentLatitude?: number;
    currentLongitude?: number;
    distanceCovered?: number;
    fuelConsumed?: number;
    delays?: {
        reason: string;
        duration: number;
        reportedAt: string;
    }[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TripFilters {
    status?: string;
    driverId?: string;
    vehicleId?: string;
    routeId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateRouteDto {
    routeCode: string;
    routeName: string;
    description?: string;
    origin: string;
    originCity: string;
    originState: string;
    destination: string;
    destinationCity: string;
    destinationState: string;
    totalDistance: number;
    estimatedDuration: number;
    stops?: Omit<RouteStop, 'id'>[];
    routeType?: Route['routeType'];
    tollCost?: number;
    fuelCostEstimate?: number;
    preferredVehicleType?: string;
    restrictions?: string[];
}

export interface CreateTripDto {
    routeId: string;
    vehicleId: string;
    driverId: string;
    shipmentIds: string[];
    plannedStartTime: string;
    plannedEndTime: string;
    notes?: string;
}

// ============================================================================
// Mock Data - Routes
// ============================================================================

const MOCK_ROUTES: Route[] = [
    {
        id: 'ROUTE-001',
        routeCode: 'MUM-BLR-01',
        routeName: 'Mumbai to Bangalore Express',
        description: 'Primary express route via NH48',
        origin: 'Mumbai Warehouse',
        originCity: 'Mumbai',
        originState: 'Maharashtra',
        destination: 'Bangalore Hub',
        destinationCity: 'Bangalore',
        destinationState: 'Karnataka',
        totalDistance: 980,
        estimatedDuration: 960, // 16 hours
        stops: [
            {
                id: 'STOP-001',
                sequence: 1,
                locationName: 'Pune Transit Point',
                address: '45 Hadapsar Industrial Area',
                city: 'Pune',
                state: 'Maharashtra',
                postalCode: '411028',
                latitude: 18.5204,
                longitude: 73.8567,
                stopType: 'Waypoint',
                estimatedArrival: '03:00',
                estimatedDuration: 30,
            },
            {
                id: 'STOP-002',
                sequence: 2,
                locationName: 'Kolhapur Rest Stop',
                address: 'NH48, Kolhapur Bypass',
                city: 'Kolhapur',
                state: 'Maharashtra',
                postalCode: '416002',
                latitude: 16.7050,
                longitude: 74.2433,
                stopType: 'Waypoint',
                estimatedArrival: '07:00',
                estimatedDuration: 45,
                notes: 'Mandatory rest stop - driver change if needed',
            },
            {
                id: 'STOP-003',
                sequence: 3,
                locationName: 'Hubli Distribution Center',
                address: '78 Industrial Estate, Gokul Road',
                city: 'Hubli',
                state: 'Karnataka',
                postalCode: '580030',
                latitude: 15.3647,
                longitude: 75.1240,
                stopType: 'Delivery',
                estimatedArrival: '11:00',
                estimatedDuration: 60,
            },
        ],
        status: 'Active',
        routeType: 'Express',
        tollCost: 2500,
        fuelCostEstimate: 12000,
        preferredVehicleType: 'Truck',
        restrictions: ['No oversized cargo', 'Night driving recommended'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-01-10T14:00:00Z',
    },
    {
        id: 'ROUTE-002',
        routeCode: 'DEL-GGN-01',
        routeName: 'Delhi to Gurugram Local',
        description: 'Short-haul route for NCR deliveries',
        origin: 'Delhi Central Warehouse',
        originCity: 'New Delhi',
        originState: 'Delhi',
        destination: 'Gurugram Hub',
        destinationCity: 'Gurugram',
        destinationState: 'Haryana',
        totalDistance: 35,
        estimatedDuration: 90, // 1.5 hours
        stops: [],
        status: 'Active',
        routeType: 'Regular',
        tollCost: 150,
        fuelCostEstimate: 500,
        preferredVehicleType: 'Van',
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2025-01-05T09:00:00Z',
    },
    {
        id: 'ROUTE-003',
        routeCode: 'BLR-CHN-01',
        routeName: 'Bangalore to Chennai Highway',
        description: 'Main corridor route via NH44',
        origin: 'Bangalore Electronics City',
        originCity: 'Bangalore',
        originState: 'Karnataka',
        destination: 'Chennai Central',
        destinationCity: 'Chennai',
        destinationState: 'Tamil Nadu',
        totalDistance: 350,
        estimatedDuration: 360, // 6 hours
        stops: [
            {
                id: 'STOP-004',
                sequence: 1,
                locationName: 'Vellore Checkpoint',
                address: 'NH44, Vellore Bypass',
                city: 'Vellore',
                state: 'Tamil Nadu',
                postalCode: '632001',
                latitude: 12.9165,
                longitude: 79.1325,
                stopType: 'Waypoint',
                estimatedArrival: '03:30',
                estimatedDuration: 20,
            },
        ],
        status: 'Active',
        routeType: 'Express',
        tollCost: 800,
        fuelCostEstimate: 4500,
        preferredVehicleType: 'Container',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-12-20T11:00:00Z',
    },
    {
        id: 'ROUTE-004',
        routeCode: 'MUM-AHM-01',
        routeName: 'Mumbai to Ahmedabad Corridor',
        description: 'Western corridor via NH48',
        origin: 'Mumbai JNPT',
        originCity: 'Mumbai',
        originState: 'Maharashtra',
        destination: 'Ahmedabad GIDC',
        destinationCity: 'Ahmedabad',
        destinationState: 'Gujarat',
        totalDistance: 530,
        estimatedDuration: 540, // 9 hours
        stops: [
            {
                id: 'STOP-005',
                sequence: 1,
                locationName: 'Vapi Industrial Area',
                address: 'GIDC Phase 2, Vapi',
                city: 'Vapi',
                state: 'Gujarat',
                postalCode: '396191',
                latitude: 20.3714,
                longitude: 72.9051,
                stopType: 'Delivery',
                estimatedArrival: '04:00',
                estimatedDuration: 45,
            },
            {
                id: 'STOP-006',
                sequence: 2,
                locationName: 'Surat Distribution Hub',
                address: 'Ring Road, Udhna',
                city: 'Surat',
                state: 'Gujarat',
                postalCode: '394210',
                latitude: 21.1702,
                longitude: 72.8311,
                stopType: 'Delivery',
                estimatedArrival: '06:00',
                estimatedDuration: 60,
            },
        ],
        status: 'Active',
        routeType: 'Regular',
        tollCost: 1800,
        fuelCostEstimate: 6500,
        preferredVehicleType: 'Truck',
        createdAt: '2024-04-05T10:00:00Z',
        updatedAt: '2025-01-15T08:00:00Z',
    },
    {
        id: 'ROUTE-005',
        routeCode: 'DEL-JAI-01',
        routeName: 'Delhi to Jaipur Express',
        description: 'Rajasthan gateway route via NH48',
        origin: 'Delhi Okhla Hub',
        originCity: 'New Delhi',
        originState: 'Delhi',
        destination: 'Jaipur Sitapura',
        destinationCity: 'Jaipur',
        destinationState: 'Rajasthan',
        totalDistance: 280,
        estimatedDuration: 300, // 5 hours
        stops: [],
        status: 'Active',
        routeType: 'Express',
        tollCost: 700,
        fuelCostEstimate: 3500,
        preferredVehicleType: 'Mini Truck',
        createdAt: '2024-05-18T10:00:00Z',
        updatedAt: '2024-11-30T10:00:00Z',
    },
    {
        id: 'ROUTE-006',
        routeCode: 'HYD-BLR-01',
        routeName: 'Hyderabad to Bangalore Route',
        description: 'South corridor via NH44',
        origin: 'Hyderabad Shamshabad',
        originCity: 'Hyderabad',
        originState: 'Telangana',
        destination: 'Bangalore Peenya',
        destinationCity: 'Bangalore',
        destinationState: 'Karnataka',
        totalDistance: 570,
        estimatedDuration: 540, // 9 hours
        stops: [
            {
                id: 'STOP-007',
                sequence: 1,
                locationName: 'Anantapur Rest Area',
                address: 'NH44, Anantapur',
                city: 'Anantapur',
                state: 'Andhra Pradesh',
                postalCode: '515001',
                latitude: 14.6819,
                longitude: 77.6006,
                stopType: 'Waypoint',
                estimatedArrival: '05:00',
                estimatedDuration: 30,
            },
        ],
        status: 'Under Review',
        routeType: 'Economy',
        tollCost: 1200,
        fuelCostEstimate: 7000,
        preferredVehicleType: 'Container',
        restrictions: ['Avoid peak hours in city limits'],
        createdAt: '2024-06-22T10:00:00Z',
        updatedAt: '2025-01-20T09:00:00Z',
    },
];

// ============================================================================
// Mock Data - Trips
// ============================================================================

const MOCK_TRIPS: Trip[] = [
    {
        id: 'TRIP-001',
        tripNumber: 'TRP-2025-0001',
        routeId: 'ROUTE-001',
        routeCode: 'MUM-BLR-01',
        routeName: 'Mumbai to Bangalore Express',
        vehicleId: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        driverId: 'DRV-001',
        driverName: 'Rajesh Kumar',
        shipmentIds: ['SHIP-001'],
        plannedStartTime: '2025-01-20T18:00:00Z',
        plannedEndTime: '2025-01-21T10:00:00Z',
        actualStartTime: '2025-01-20T18:30:00Z',
        status: 'In Progress',
        currentLocation: 'Near Kolhapur, Maharashtra',
        currentLatitude: 16.7050,
        currentLongitude: 74.2433,
        distanceCovered: 420,
        fuelConsumed: 85,
        delays: [
            {
                reason: 'Traffic congestion at Pune bypass',
                duration: 45,
                reportedAt: '2025-01-20T21:00:00Z',
            },
        ],
        notes: 'On track despite initial delay',
        createdAt: '2025-01-20T14:00:00Z',
        updatedAt: '2025-01-21T02:00:00Z',
    },
    {
        id: 'TRIP-002',
        tripNumber: 'TRP-2025-0002',
        routeId: 'ROUTE-002',
        routeCode: 'DEL-GGN-01',
        routeName: 'Delhi to Gurugram Local',
        vehicleId: 'VEH-003',
        vehicleNumber: 'HR-26-CD-9012',
        driverId: 'DRV-003',
        driverName: 'Amit Singh',
        shipmentIds: ['SHIP-004'],
        plannedStartTime: '2025-01-19T08:00:00Z',
        plannedEndTime: '2025-01-19T10:00:00Z',
        actualStartTime: '2025-01-19T08:15:00Z',
        actualEndTime: '2025-01-19T09:45:00Z',
        status: 'Completed',
        distanceCovered: 35,
        fuelConsumed: 5,
        createdAt: '2025-01-19T07:00:00Z',
        updatedAt: '2025-01-19T09:45:00Z',
    },
    {
        id: 'TRIP-003',
        tripNumber: 'TRP-2025-0003',
        routeId: 'ROUTE-003',
        routeCode: 'BLR-CHN-01',
        routeName: 'Bangalore to Chennai Highway',
        vehicleId: 'VEH-002',
        vehicleNumber: 'KA-05-MN-5678',
        driverId: 'DRV-002',
        driverName: 'Suresh Babu',
        shipmentIds: ['SHIP-002'],
        plannedStartTime: '2025-01-18T06:00:00Z',
        plannedEndTime: '2025-01-18T12:00:00Z',
        actualStartTime: '2025-01-18T06:00:00Z',
        actualEndTime: '2025-01-18T11:30:00Z',
        status: 'Completed',
        distanceCovered: 350,
        fuelConsumed: 70,
        notes: 'Delivered ahead of schedule',
        createdAt: '2025-01-17T15:00:00Z',
        updatedAt: '2025-01-18T11:30:00Z',
    },
    {
        id: 'TRIP-004',
        tripNumber: 'TRP-2025-0004',
        routeId: 'ROUTE-004',
        routeCode: 'MUM-AHM-01',
        routeName: 'Mumbai to Ahmedabad Corridor',
        vehicleId: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        driverId: 'DRV-001',
        driverName: 'Rajesh Kumar',
        shipmentIds: ['SHIP-005'],
        plannedStartTime: '2025-01-15T04:00:00Z',
        plannedEndTime: '2025-01-15T13:00:00Z',
        actualStartTime: '2025-01-15T04:30:00Z',
        actualEndTime: '2025-01-15T14:00:00Z',
        status: 'Completed',
        distanceCovered: 530,
        fuelConsumed: 105,
        delays: [
            {
                reason: 'Vehicle breakdown - tire puncture',
                duration: 60,
                reportedAt: '2025-01-15T08:00:00Z',
            },
        ],
        createdAt: '2025-01-14T18:00:00Z',
        updatedAt: '2025-01-15T14:00:00Z',
    },
    {
        id: 'TRIP-005',
        tripNumber: 'TRP-2025-0005',
        routeId: 'ROUTE-005',
        routeCode: 'DEL-JAI-01',
        routeName: 'Delhi to Jaipur Express',
        vehicleId: 'VEH-004',
        vehicleNumber: 'DL-01-EF-3456',
        driverId: 'DRV-004',
        driverName: 'Vikram Chauhan',
        shipmentIds: [],
        plannedStartTime: '2025-01-25T06:00:00Z',
        plannedEndTime: '2025-01-25T11:00:00Z',
        status: 'Planned',
        notes: 'Scheduled pickup from Delhi warehouse',
        createdAt: '2025-01-22T10:00:00Z',
        updatedAt: '2025-01-22T10:00:00Z',
    },
    {
        id: 'TRIP-006',
        tripNumber: 'TRP-2025-0006',
        routeId: 'ROUTE-002',
        routeCode: 'DEL-GGN-01',
        routeName: 'Delhi to Gurugram Local',
        vehicleId: 'VEH-003',
        vehicleNumber: 'HR-26-CD-9012',
        driverId: 'DRV-003',
        driverName: 'Amit Singh',
        shipmentIds: ['SHIP-009'],
        plannedStartTime: '2025-01-24T09:00:00Z',
        plannedEndTime: '2025-01-24T11:00:00Z',
        status: 'Planned',
        createdAt: '2025-01-23T11:00:00Z',
        updatedAt: '2025-01-23T11:00:00Z',
    },
    {
        id: 'TRIP-007',
        tripNumber: 'TRP-2025-0007',
        routeId: 'ROUTE-006',
        routeCode: 'HYD-BLR-01',
        routeName: 'Hyderabad to Bangalore Route',
        vehicleId: 'VEH-002',
        vehicleNumber: 'KA-05-MN-5678',
        driverId: 'DRV-002',
        driverName: 'Suresh Babu',
        shipmentIds: ['SHIP-003'],
        plannedStartTime: '2025-01-22T05:00:00Z',
        plannedEndTime: '2025-01-22T14:00:00Z',
        status: 'Cancelled',
        notes: 'Cancelled due to vehicle reassignment',
        createdAt: '2025-01-21T15:00:00Z',
        updatedAt: '2025-01-22T04:00:00Z',
    },
    {
        id: 'TRIP-008',
        tripNumber: 'TRP-2025-0008',
        routeId: 'ROUTE-002',
        routeCode: 'DEL-GGN-01',
        routeName: 'Delhi to Gurugram Local',
        vehicleId: 'VEH-005',
        vehicleNumber: 'HR-51-GH-7890',
        driverId: 'DRV-005',
        driverName: 'Manoj Tiwari',
        shipmentIds: ['SHIP-008'],
        plannedStartTime: '2025-01-21T07:00:00Z',
        plannedEndTime: '2025-01-21T16:00:00Z',
        actualStartTime: '2025-01-21T07:00:00Z',
        status: 'In Progress',
        currentLocation: 'Near Faridabad, Haryana',
        currentLatitude: 28.4089,
        currentLongitude: 77.3178,
        distanceCovered: 25,
        fuelConsumed: 45,
        notes: 'Heavy cargo - requires crane unloading',
        createdAt: '2025-01-20T18:00:00Z',
        updatedAt: '2025-01-21T12:00:00Z',
    },
    {
        id: 'TRIP-009',
        tripNumber: 'TRP-2025-0009',
        routeId: 'ROUTE-001',
        routeCode: 'MUM-BLR-01',
        routeName: 'Mumbai to Bangalore Express',
        vehicleId: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        driverId: 'DRV-007',
        driverName: 'Deepak Verma',
        shipmentIds: ['SHIP-010'],
        plannedStartTime: '2025-01-12T18:00:00Z',
        plannedEndTime: '2025-01-13T10:00:00Z',
        actualStartTime: '2025-01-12T18:00:00Z',
        actualEndTime: '2025-01-13T09:30:00Z',
        status: 'Completed',
        distanceCovered: 980,
        fuelConsumed: 195,
        createdAt: '2025-01-12T14:00:00Z',
        updatedAt: '2025-01-13T09:30:00Z',
    },
    {
        id: 'TRIP-010',
        tripNumber: 'TRP-2025-0010',
        routeId: 'ROUTE-003',
        routeCode: 'BLR-CHN-01',
        routeName: 'Bangalore to Chennai Highway',
        vehicleId: 'VEH-002',
        vehicleNumber: 'KA-05-MN-5678',
        driverId: 'DRV-010',
        driverName: 'Arun Nair',
        shipmentIds: [],
        plannedStartTime: '2025-01-26T06:00:00Z',
        plannedEndTime: '2025-01-26T12:00:00Z',
        status: 'Delayed',
        notes: 'Delayed due to vehicle inspection',
        delays: [
            {
                reason: 'Mandatory fitness inspection at RTO',
                duration: 120,
                reportedAt: '2025-01-26T05:00:00Z',
            },
        ],
        createdAt: '2025-01-25T10:00:00Z',
        updatedAt: '2025-01-26T07:00:00Z',
    },
];

// ============================================================================
// Service Class
// ============================================================================

class RouteService {
    private mockRoutes: Route[] = [...MOCK_ROUTES];
    private mockTrips: Trip[] = [...MOCK_TRIPS];

    // ========================================================================
    // Route Methods
    // ========================================================================

    /**
     * Get all routes
     */
    async getAllRoutes(): Promise<Route[]> {
        try {
            const response = await apiClient.get<Route[]>('/logistics/routes');
            return response.data;
        } catch (error) {
            console.error('API Error fetching routes, using mock data:', error);
            return [...this.mockRoutes];
        }
    }

    /**
     * Get route by ID
     */
    async getRouteById(id: string): Promise<Route> {
        try {
            const response = await apiClient.get<Route>(`/logistics/routes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching route ${id}, using mock data:`, error);
            const route = this.mockRoutes.find(r => r.id === id);
            if (!route) throw new Error('Route not found');
            return route;
        }
    }

    /**
     * Create a new route
     */
    async createRoute(data: CreateRouteDto): Promise<Route> {
        try {
            const response = await apiClient.post<Route>('/logistics/routes', data);
            return response.data;
        } catch (error) {
            console.error('API Error creating route, using mock:', error);

            const newRoute: Route = {
                id: `ROUTE-${Date.now()}`,
                ...data,
                stops: data.stops?.map((stop, index) => ({
                    ...stop,
                    id: `STOP-${Date.now()}-${index}`,
                })) || [],
                status: 'Active',
                routeType: data.routeType || 'Regular',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this.mockRoutes.push(newRoute);
            return newRoute;
        }
    }

    /**
     * Update a route
     */
    async updateRoute(id: string, data: Partial<CreateRouteDto>): Promise<Route> {
        try {
            const response = await apiClient.put<Route>(`/logistics/routes/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`API Error updating route ${id}, using mock:`, error);

            const index = this.mockRoutes.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Route not found');

            this.mockRoutes[index] = {
                ...this.mockRoutes[index],
                ...data,
                stops: data.stops
                    ? data.stops.map((stop, i) => ({ ...stop, id: `STOP-${Date.now()}-${i}` }))
                    : this.mockRoutes[index].stops,
                updatedAt: new Date().toISOString(),
            };

            return this.mockRoutes[index];
        }
    }
    /**
     * Optimize a route
     */
    async optimizeRoute(id: string): Promise<Route> {
        try {
            const response = await apiClient.post<Route>(`/logistics/routes/${id}/optimize`, {});
            return response.data;
        } catch (error) {
            console.error(`API Error optimizing route ${id}, using mock:`, error);

            const index = this.mockRoutes.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Route not found');

            this.mockRoutes[index] = {
                ...this.mockRoutes[index],
                status: 'Active',
                description: (this.mockRoutes[index].description || '') + ' [Optimized]',
                updatedAt: new Date().toISOString(),
            };

            return this.mockRoutes[index];
        }
    }

    /**
     * Batch-optimize all active routes via the deterministic backend heuristic.
     * Returns an aggregate summary of what was re-sequenced.
     */
    async optimizeAllRoutes(): Promise<{
        routesConsidered: number;
        routesOptimized: number;
        stopsReordered: number;
        optimizedAt: string;
        routes: Array<{
            id: string;
            routeCode: string;
            routeName: string;
            numberOfStops: number;
            reordered: boolean;
        }>;
    }> {
        const response = await apiClient.post<{
            routesConsidered: number;
            routesOptimized: number;
            stopsReordered: number;
            optimizedAt: string;
            routes: Array<{
                id: string;
                routeCode: string;
                routeName: string;
                numberOfStops: number;
                reordered: boolean;
            }>;
        }>('/logistics/routes/optimize', {});
        return response.data;
    }

    /**
     * Get freight charges and variance analysis
     */
    async getFreightAnalysis(): Promise<any> {
        try {
            const response = await apiClient.get<any>('/logistics/freight-charges/analysis');
            return response.data;
        } catch (error) {
            console.error('API Error fetching freight analysis, using mock:', error);
            return {
                estimatedTotal: 125000,
                actualTotal: 132450,
                variance: 7450,
                variancePercentage: 5.96,
                topVariances: [
                    { category: 'Fuel', estimated: 45000, actual: 49200, variance: 4200 },
                    { category: 'Toll', estimated: 12000, actual: 12150, variance: 150 },
                    { category: 'Driver', estimated: 35000, actual: 36000, variance: 1000 },
                ]
            };
        }
    }

    /**
     * Get active routes
     */
    async getActiveRoutes(): Promise<Route[]> {
        try {
            const response = await apiClient.get<Route[]>('/logistics/routes?status=Active');
            return response.data;
        } catch (error) {
            console.error('API Error fetching active routes, using mock data:', error);
            return this.mockRoutes.filter(r => r.status === 'Active');
        }
    }

    // ========================================================================
    // Trip Methods
    // ========================================================================

    /**
     * Get all trips with optional filters
     */
    async getAllTrips(filters?: TripFilters): Promise<{ data: Trip[]; total: number }> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.driverId) params.append('driverId', filters.driverId);
            if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
            if (filters?.routeId) params.append('routeId', filters.routeId);
            if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters?.dateTo) params.append('dateTo', filters.dateTo);

            const response = await apiClient.get<{ data: Trip[]; total: number }>(
                `/logistics/trips?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('API Error fetching trips, using mock data:', error);

            // Filter mock data
            let filteredTrips = [...this.mockTrips];

            if (filters?.status) {
                filteredTrips = filteredTrips.filter(t => t.status === filters.status);
            }
            if (filters?.driverId) {
                filteredTrips = filteredTrips.filter(t => t.driverId === filters.driverId);
            }
            if (filters?.vehicleId) {
                filteredTrips = filteredTrips.filter(t => t.vehicleId === filters.vehicleId);
            }
            if (filters?.routeId) {
                filteredTrips = filteredTrips.filter(t => t.routeId === filters.routeId);
            }
            if (filters?.dateFrom) {
                filteredTrips = filteredTrips.filter(t =>
                    t.plannedStartTime >= filters.dateFrom!
                );
            }
            if (filters?.dateTo) {
                filteredTrips = filteredTrips.filter(t =>
                    t.plannedStartTime <= filters.dateTo!
                );
            }

            return { data: filteredTrips, total: filteredTrips.length };
        }
    }

    /**
     * Get trip by ID
     */
    async getTripById(id: string): Promise<Trip> {
        try {
            const response = await apiClient.get<Trip>(`/logistics/trips/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching trip ${id}, using mock data:`, error);
            const trip = this.mockTrips.find(t => t.id === id);
            if (!trip) throw new Error('Trip not found');
            return trip;
        }
    }

    /**
     * Create a new trip
     */
    async createTrip(data: CreateTripDto): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>('/logistics/trips', data);
            return response.data;
        } catch (error) {
            console.error('API Error creating trip, using mock:', error);

            const route = this.mockRoutes.find(r => r.id === data.routeId);
            if (!route) throw new Error('Route not found');

            const newTrip: Trip = {
                id: `TRIP-${Date.now()}`,
                tripNumber: `TRP-2025-${String(this.mockTrips.length + 1).padStart(4, '0')}`,
                routeCode: route.routeCode,
                routeName: route.routeName,
                vehicleNumber: `VEH-${data.vehicleId}`,
                driverName: `Driver ${data.driverId}`,
                ...data,
                status: 'Planned',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this.mockTrips.push(newTrip);
            return newTrip;
        }
    }

    /**
     * Update a trip
     */
    async updateTrip(id: string, data: Partial<Trip>): Promise<Trip> {
        try {
            const response = await apiClient.put<Trip>(`/logistics/trips/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`API Error updating trip ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                ...data,
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }

    /**
     * Start a trip
     */
    async startTrip(id: string): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>(`/logistics/trips/${id}/start`, {});
            return response.data;
        } catch (error) {
            console.error(`API Error starting trip ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                status: 'In Progress',
                actualStartTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }

    /**
     * Complete a trip
     */
    async completeTrip(id: string, distanceCovered?: number, fuelConsumed?: number): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>(`/logistics/trips/${id}/complete`, {
                distanceCovered,
                fuelConsumed
            });
            return response.data;
        } catch (error) {
            console.error(`API Error completing trip ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                status: 'Completed',
                actualEndTime: new Date().toISOString(),
                distanceCovered: distanceCovered || this.mockTrips[index].distanceCovered,
                fuelConsumed: fuelConsumed || this.mockTrips[index].fuelConsumed,
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }

    /**
     * Cancel a trip
     */
    async cancelTrip(id: string, reason?: string): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>(`/logistics/trips/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error(`API Error cancelling trip ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                status: 'Cancelled',
                notes: reason || this.mockTrips[index].notes,
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }

    /**
     * Report delay on a trip
     */
    async reportDelay(id: string, reason: string, duration: number): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>(`/logistics/trips/${id}/delay`, {
                reason,
                duration
            });
            return response.data;
        } catch (error) {
            console.error(`API Error reporting delay for trip ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            const newDelay = {
                reason,
                duration,
                reportedAt: new Date().toISOString(),
            };

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                status: 'Delayed',
                delays: [...(this.mockTrips[index].delays || []), newDelay],
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }

    /**
     * Update trip location
     */
    async updateTripLocation(
        id: string,
        currentLocation: string,
        latitude?: number,
        longitude?: number
    ): Promise<Trip> {
        try {
            const response = await apiClient.post<Trip>(`/logistics/trips/${id}/location`, {
                currentLocation,
                latitude,
                longitude
            });
            return response.data;
        } catch (error) {
            console.error(`API Error updating trip location ${id}, using mock:`, error);

            const index = this.mockTrips.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Trip not found');

            this.mockTrips[index] = {
                ...this.mockTrips[index],
                currentLocation,
                currentLatitude: latitude,
                currentLongitude: longitude,
                updatedAt: new Date().toISOString(),
            };

            return this.mockTrips[index];
        }
    }
}

export const routeService = new RouteService();
