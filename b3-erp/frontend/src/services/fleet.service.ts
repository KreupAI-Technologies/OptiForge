import { apiClient } from './api/client';

// ============================================================================
// Interfaces
// ============================================================================

export interface Vehicle {
    id: string;
    vehicleNumber: string;
    vehicleType: 'Truck' | 'Van' | 'Mini Truck' | 'Container' | 'Pickup';
    make: string;
    model: string;
    year: number;
    capacity: number;
    capacityUnit: 'KG' | 'Tons';
    volumeCapacity?: number;
    fuelType: 'Diesel' | 'Petrol' | 'CNG' | 'Electric';
    currentMileage: number;
    lastServiceDate?: string;
    nextServiceDue?: string;
    insuranceExpiry: string;
    fitnessExpiry: string;
    permitExpiry: string;
    status: 'Available' | 'In Transit' | 'Under Maintenance' | 'Out of Service';
    currentLocation?: string;
    assignedDriverId?: string;
    assignedDriverName?: string;
    gpsEnabled: boolean;
    gpsDeviceId?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Driver {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: string;
    city: string;
    state: string;
    licenseNumber: string;
    licenseType: 'LMV' | 'HMV' | 'Transport';
    licenseExpiry: string;
    dateOfBirth: string;
    dateOfJoining: string;
    experience: number;
    status: 'Active' | 'On Leave' | 'Inactive' | 'Suspended';
    assignedVehicleId?: string;
    assignedVehicleNumber?: string;
    currentTripId?: string;
    rating: number;
    totalTrips: number;
    totalDistance: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    bloodGroup?: string;
    medicalCertificateExpiry?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleDto {
    vehicleNumber: string;
    vehicleType: Vehicle['vehicleType'];
    make: string;
    model: string;
    year: number;
    capacity: number;
    capacityUnit: 'KG' | 'Tons';
    volumeCapacity?: number;
    fuelType: Vehicle['fuelType'];
    currentMileage: number;
    insuranceExpiry: string;
    fitnessExpiry: string;
    permitExpiry: string;
    gpsEnabled?: boolean;
    gpsDeviceId?: string;
    notes?: string;
}

export interface CreateDriverDto {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: string;
    city: string;
    state: string;
    licenseNumber: string;
    licenseType: Driver['licenseType'];
    licenseExpiry: string;
    dateOfBirth: string;
    dateOfJoining: string;
    experience: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    bloodGroup?: string;
    medicalCertificateExpiry?: string;
}

// ============================================================================
// Mock Data - Vehicles
// ============================================================================

const MOCK_VEHICLES: Vehicle[] = [
    {
        id: 'VEH-001',
        vehicleNumber: 'MH-01-AB-1234',
        vehicleType: 'Truck',
        make: 'Tata',
        model: 'LPT 1613',
        year: 2022,
        capacity: 10,
        capacityUnit: 'Tons',
        volumeCapacity: 45,
        fuelType: 'Diesel',
        currentMileage: 85000,
        lastServiceDate: '2025-01-05',
        nextServiceDue: '2025-03-05',
        insuranceExpiry: '2025-08-15',
        fitnessExpiry: '2025-12-31',
        permitExpiry: '2026-01-31',
        status: 'In Transit',
        currentLocation: 'Pune Highway, Maharashtra',
        assignedDriverId: 'DRV-001',
        assignedDriverName: 'Rajesh Kumar',
        gpsEnabled: true,
        gpsDeviceId: 'GPS-TRK-001',
        createdAt: '2022-03-15T10:00:00Z',
        updatedAt: '2025-01-20T14:00:00Z',
    },
    {
        id: 'VEH-002',
        vehicleNumber: 'KA-05-MN-5678',
        vehicleType: 'Container',
        make: 'Ashok Leyland',
        model: 'BOSS 1920',
        year: 2021,
        capacity: 20,
        capacityUnit: 'Tons',
        volumeCapacity: 75,
        fuelType: 'Diesel',
        currentMileage: 120000,
        lastServiceDate: '2024-12-20',
        nextServiceDue: '2025-02-20',
        insuranceExpiry: '2025-06-30',
        fitnessExpiry: '2025-10-15',
        permitExpiry: '2025-12-31',
        status: 'Available',
        currentLocation: 'Warehouse A, Bangalore',
        gpsEnabled: true,
        gpsDeviceId: 'GPS-TRK-002',
        createdAt: '2021-06-10T10:00:00Z',
        updatedAt: '2025-01-18T09:00:00Z',
    },
    {
        id: 'VEH-003',
        vehicleNumber: 'HR-26-CD-9012',
        vehicleType: 'Van',
        make: 'Mahindra',
        model: 'Supro Cargo Van',
        year: 2023,
        capacity: 1000,
        capacityUnit: 'KG',
        volumeCapacity: 8,
        fuelType: 'CNG',
        currentMileage: 35000,
        lastServiceDate: '2025-01-10',
        nextServiceDue: '2025-04-10',
        insuranceExpiry: '2025-11-20',
        fitnessExpiry: '2026-03-31',
        permitExpiry: '2026-06-30',
        status: 'Available',
        currentLocation: 'Hub C, Gurugram',
        gpsEnabled: true,
        gpsDeviceId: 'GPS-TRK-003',
        notes: 'Ideal for last-mile delivery',
        createdAt: '2023-02-20T10:00:00Z',
        updatedAt: '2025-01-15T11:00:00Z',
    },
    {
        id: 'VEH-004',
        vehicleNumber: 'DL-01-EF-3456',
        vehicleType: 'Mini Truck',
        make: 'Tata',
        model: 'Ace Gold',
        year: 2023,
        capacity: 750,
        capacityUnit: 'KG',
        volumeCapacity: 5,
        fuelType: 'Petrol',
        currentMileage: 28000,
        lastServiceDate: '2024-11-25',
        nextServiceDue: '2025-02-25',
        insuranceExpiry: '2025-09-10',
        fitnessExpiry: '2026-01-15',
        permitExpiry: '2026-04-30',
        status: 'Under Maintenance',
        currentLocation: 'Service Center, New Delhi',
        gpsEnabled: false,
        notes: 'Engine overhaul in progress',
        createdAt: '2023-05-12T10:00:00Z',
        updatedAt: '2025-01-22T08:00:00Z',
    },
    {
        id: 'VEH-005',
        vehicleNumber: 'HR-51-GH-7890',
        vehicleType: 'Truck',
        make: 'Eicher',
        model: 'Pro 3015',
        year: 2020,
        capacity: 15,
        capacityUnit: 'Tons',
        volumeCapacity: 55,
        fuelType: 'Diesel',
        currentMileage: 180000,
        lastServiceDate: '2024-12-01',
        nextServiceDue: '2025-02-01',
        insuranceExpiry: '2025-04-20',
        fitnessExpiry: '2025-07-31',
        permitExpiry: '2025-09-30',
        status: 'In Transit',
        currentLocation: 'NH-44, Near Faridabad',
        assignedDriverId: 'DRV-005',
        assignedDriverName: 'Manoj Tiwari',
        gpsEnabled: true,
        gpsDeviceId: 'GPS-TRK-005',
        createdAt: '2020-08-22T10:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z',
    },
];

// ============================================================================
// Mock Data - Drivers
// ============================================================================

const MOCK_DRIVERS: Driver[] = [
    {
        id: 'DRV-001',
        employeeId: 'EMP-DRV-001',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@optiforge.com',
        phone: '+91 98765 11111',
        address: '45 Transport Nagar',
        city: 'Mumbai',
        state: 'Maharashtra',
        licenseNumber: 'MH01-2015-0012345',
        licenseType: 'HMV',
        licenseExpiry: '2027-03-15',
        dateOfBirth: '1985-06-20',
        dateOfJoining: '2018-04-01',
        experience: 12,
        status: 'Active',
        assignedVehicleId: 'VEH-001',
        assignedVehicleNumber: 'MH-01-AB-1234',
        currentTripId: 'TRIP-001',
        rating: 4.8,
        totalTrips: 856,
        totalDistance: 245000,
        emergencyContactName: 'Sunita Kumar',
        emergencyContactPhone: '+91 98765 11112',
        bloodGroup: 'O+',
        medicalCertificateExpiry: '2025-06-30',
        profileImageUrl: '/avatars/rajesh.jpg',
        createdAt: '2018-04-01T10:00:00Z',
        updatedAt: '2025-01-20T14:00:00Z',
    },
    {
        id: 'DRV-002',
        employeeId: 'EMP-DRV-002',
        firstName: 'Suresh',
        lastName: 'Babu',
        fullName: 'Suresh Babu',
        email: 'suresh.babu@optiforge.com',
        phone: '+91 98765 22222',
        alternatePhone: '+91 98765 22223',
        address: '78 Whitefield Road',
        city: 'Bangalore',
        state: 'Karnataka',
        licenseNumber: 'KA05-2012-0098765',
        licenseType: 'HMV',
        licenseExpiry: '2026-08-20',
        dateOfBirth: '1980-11-15',
        dateOfJoining: '2016-07-15',
        experience: 18,
        status: 'Active',
        rating: 4.9,
        totalTrips: 1245,
        totalDistance: 380000,
        emergencyContactName: 'Lakshmi Babu',
        emergencyContactPhone: '+91 98765 22224',
        bloodGroup: 'A+',
        medicalCertificateExpiry: '2025-09-15',
        profileImageUrl: '/avatars/suresh.jpg',
        createdAt: '2016-07-15T10:00:00Z',
        updatedAt: '2025-01-21T16:30:00Z',
    },
    {
        id: 'DRV-003',
        employeeId: 'EMP-DRV-003',
        firstName: 'Amit',
        lastName: 'Singh',
        fullName: 'Amit Singh',
        email: 'amit.singh@optiforge.com',
        phone: '+91 98765 33333',
        address: '23 Sector 15',
        city: 'Gurugram',
        state: 'Haryana',
        licenseNumber: 'HR26-2018-0056789',
        licenseType: 'Transport',
        licenseExpiry: '2028-01-10',
        dateOfBirth: '1990-03-25',
        dateOfJoining: '2020-02-10',
        experience: 7,
        status: 'Active',
        assignedVehicleId: 'VEH-003',
        assignedVehicleNumber: 'HR-26-CD-9012',
        rating: 4.5,
        totalTrips: 423,
        totalDistance: 95000,
        emergencyContactName: 'Priya Singh',
        emergencyContactPhone: '+91 98765 33334',
        bloodGroup: 'B+',
        medicalCertificateExpiry: '2025-12-31',
        createdAt: '2020-02-10T10:00:00Z',
        updatedAt: '2025-01-19T08:00:00Z',
    },
    {
        id: 'DRV-004',
        employeeId: 'EMP-DRV-004',
        firstName: 'Vikram',
        lastName: 'Chauhan',
        fullName: 'Vikram Chauhan',
        email: 'vikram.chauhan@optiforge.com',
        phone: '+91 98765 44444',
        address: '56 Rohini Sector 7',
        city: 'New Delhi',
        state: 'Delhi',
        licenseNumber: 'DL01-2010-0034567',
        licenseType: 'HMV',
        licenseExpiry: '2025-05-25',
        dateOfBirth: '1982-09-08',
        dateOfJoining: '2015-01-20',
        experience: 15,
        status: 'Active',
        rating: 4.7,
        totalTrips: 1102,
        totalDistance: 320000,
        emergencyContactName: 'Kavita Chauhan',
        emergencyContactPhone: '+91 98765 44445',
        bloodGroup: 'AB-',
        medicalCertificateExpiry: '2025-04-15',
        profileImageUrl: '/avatars/vikram.jpg',
        createdAt: '2015-01-20T10:00:00Z',
        updatedAt: '2025-01-19T15:00:00Z',
    },
    {
        id: 'DRV-005',
        employeeId: 'EMP-DRV-005',
        firstName: 'Manoj',
        lastName: 'Tiwari',
        fullName: 'Manoj Tiwari',
        email: 'manoj.tiwari@optiforge.com',
        phone: '+91 98765 55555',
        address: '89 Ballabgarh',
        city: 'Faridabad',
        state: 'Haryana',
        licenseNumber: 'HR51-2014-0078901',
        licenseType: 'HMV',
        licenseExpiry: '2026-11-30',
        dateOfBirth: '1988-12-12',
        dateOfJoining: '2017-08-05',
        experience: 11,
        status: 'Active',
        assignedVehicleId: 'VEH-005',
        assignedVehicleNumber: 'HR-51-GH-7890',
        currentTripId: 'TRIP-008',
        rating: 4.6,
        totalTrips: 789,
        totalDistance: 210000,
        emergencyContactName: 'Rekha Tiwari',
        emergencyContactPhone: '+91 98765 55556',
        bloodGroup: 'O-',
        medicalCertificateExpiry: '2025-08-20',
        createdAt: '2017-08-05T10:00:00Z',
        updatedAt: '2025-01-21T10:00:00Z',
    },
    {
        id: 'DRV-006',
        employeeId: 'EMP-DRV-006',
        firstName: 'Ravi',
        lastName: 'Shankar',
        fullName: 'Ravi Shankar',
        email: 'ravi.shankar@optiforge.com',
        phone: '+91 98765 66666',
        address: '34 Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        licenseNumber: 'TN09-2016-0023456',
        licenseType: 'Transport',
        licenseExpiry: '2026-07-15',
        dateOfBirth: '1992-04-18',
        dateOfJoining: '2019-05-12',
        experience: 8,
        status: 'On Leave',
        rating: 4.4,
        totalTrips: 356,
        totalDistance: 78000,
        emergencyContactName: 'Meena Shankar',
        emergencyContactPhone: '+91 98765 66667',
        bloodGroup: 'B-',
        medicalCertificateExpiry: '2025-11-10',
        createdAt: '2019-05-12T10:00:00Z',
        updatedAt: '2025-01-15T09:00:00Z',
    },
    {
        id: 'DRV-007',
        employeeId: 'EMP-DRV-007',
        firstName: 'Deepak',
        lastName: 'Verma',
        fullName: 'Deepak Verma',
        email: 'deepak.verma@optiforge.com',
        phone: '+91 98765 77777',
        address: '12 Vaishali Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        licenseNumber: 'RJ14-2011-0045678',
        licenseType: 'HMV',
        licenseExpiry: '2025-02-28',
        dateOfBirth: '1978-07-30',
        dateOfJoining: '2014-03-18',
        experience: 20,
        status: 'Active',
        rating: 4.9,
        totalTrips: 1567,
        totalDistance: 450000,
        emergencyContactName: 'Suman Verma',
        emergencyContactPhone: '+91 98765 77778',
        bloodGroup: 'A-',
        medicalCertificateExpiry: '2025-03-20',
        profileImageUrl: '/avatars/deepak.jpg',
        createdAt: '2014-03-18T10:00:00Z',
        updatedAt: '2025-01-20T11:00:00Z',
    },
    {
        id: 'DRV-008',
        employeeId: 'EMP-DRV-008',
        firstName: 'Sanjay',
        lastName: 'Patel',
        fullName: 'Sanjay Patel',
        email: 'sanjay.patel@optiforge.com',
        phone: '+91 98765 88888',
        address: '67 SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        licenseNumber: 'GJ01-2017-0067890',
        licenseType: 'Transport',
        licenseExpiry: '2027-09-05',
        dateOfBirth: '1995-01-05',
        dateOfJoining: '2021-06-01',
        experience: 5,
        status: 'Active',
        rating: 4.3,
        totalTrips: 245,
        totalDistance: 56000,
        emergencyContactName: 'Nitin Patel',
        emergencyContactPhone: '+91 98765 88889',
        bloodGroup: 'O+',
        medicalCertificateExpiry: '2026-01-15',
        createdAt: '2021-06-01T10:00:00Z',
        updatedAt: '2025-01-18T14:00:00Z',
    },
    {
        id: 'DRV-009',
        employeeId: 'EMP-DRV-009',
        firstName: 'Prakash',
        lastName: 'Yadav',
        fullName: 'Prakash Yadav',
        email: 'prakash.yadav@optiforge.com',
        phone: '+91 98765 99999',
        address: '90 Gomti Nagar',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        licenseNumber: 'UP32-2013-0089012',
        licenseType: 'HMV',
        licenseExpiry: '2026-04-10',
        dateOfBirth: '1984-10-22',
        dateOfJoining: '2016-11-28',
        experience: 14,
        status: 'Suspended',
        rating: 3.8,
        totalTrips: 678,
        totalDistance: 185000,
        emergencyContactName: 'Geeta Yadav',
        emergencyContactPhone: '+91 98765 99990',
        bloodGroup: 'AB+',
        createdAt: '2016-11-28T10:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
    },
    {
        id: 'DRV-010',
        employeeId: 'EMP-DRV-010',
        firstName: 'Arun',
        lastName: 'Nair',
        fullName: 'Arun Nair',
        email: 'arun.nair@optiforge.com',
        phone: '+91 98765 10101',
        alternatePhone: '+91 98765 10102',
        address: '25 Marine Drive',
        city: 'Kochi',
        state: 'Kerala',
        licenseNumber: 'KL07-2019-0012345',
        licenseType: 'Transport',
        licenseExpiry: '2029-02-20',
        dateOfBirth: '1993-08-14',
        dateOfJoining: '2022-01-10',
        experience: 4,
        status: 'Active',
        rating: 4.6,
        totalTrips: 189,
        totalDistance: 42000,
        emergencyContactName: 'Lekha Nair',
        emergencyContactPhone: '+91 98765 10103',
        bloodGroup: 'B+',
        medicalCertificateExpiry: '2026-05-30',
        profileImageUrl: '/avatars/arun.jpg',
        createdAt: '2022-01-10T10:00:00Z',
        updatedAt: '2025-01-22T10:00:00Z',
    },
];

// ============================================================================
// Service Class
// ============================================================================

class FleetService {
    private mockVehicles: Vehicle[] = [...MOCK_VEHICLES];
    private mockDrivers: Driver[] = [...MOCK_DRIVERS];

    // ========================================================================
    // Vehicle Methods
    // ========================================================================

    /**
     * Get all vehicles
     */
    async getAllVehicles(): Promise<Vehicle[]> {
        try {
            const response = await apiClient.get<Vehicle[]>('/logistics/vehicles');
            return response.data;
        } catch (error) {
            console.error('API Error fetching vehicles, using mock data:', error);
            return [...this.mockVehicles];
        }
    }

    /**
     * Get vehicle by ID
     */
    async getVehicleById(id: string): Promise<Vehicle> {
        try {
            const response = await apiClient.get<Vehicle>(`/logistics/vehicles/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching vehicle ${id}, using mock data:`, error);
            const vehicle = this.mockVehicles.find(v => v.id === id);
            if (!vehicle) throw new Error('Vehicle not found');
            return vehicle;
        }
    }

    /**
     * Create a new vehicle
     */
    async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
        try {
            const response = await apiClient.post<Vehicle>('/logistics/vehicles', data);
            return response.data;
        } catch (error) {
            console.error('API Error creating vehicle, using mock:', error);

            const newVehicle: Vehicle = {
                id: `VEH-${Date.now()}`,
                ...data,
                status: 'Available',
                gpsEnabled: data.gpsEnabled || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this.mockVehicles.push(newVehicle);
            return newVehicle;
        }
    }

    /**
     * Update a vehicle
     */
    async updateVehicle(id: string, data: Partial<CreateVehicleDto>): Promise<Vehicle> {
        try {
            const response = await apiClient.put<Vehicle>(`/logistics/vehicles/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`API Error updating vehicle ${id}, using mock:`, error);

            const index = this.mockVehicles.findIndex(v => v.id === id);
            if (index === -1) throw new Error('Vehicle not found');

            this.mockVehicles[index] = {
                ...this.mockVehicles[index],
                ...data,
                updatedAt: new Date().toISOString(),
            };

            return this.mockVehicles[index];
        }
    }

    /**
     * Get available vehicles
     */
    async getAvailableVehicles(): Promise<Vehicle[]> {
        try {
            const response = await apiClient.get<Vehicle[]>('/logistics/vehicles?status=Available');
            return response.data;
        } catch (error) {
            console.error('API Error fetching available vehicles, using mock data:', error);
            return this.mockVehicles.filter(v => v.status === 'Available');
        }
    }

    /**
     * Assign driver to vehicle
     */
    async assignDriverToVehicle(vehicleId: string, driverId: string): Promise<Vehicle> {
        try {
            const response = await apiClient.post<Vehicle>(
                `/logistics/vehicles/${vehicleId}/assign-driver`,
                { driverId }
            );
            return response.data;
        } catch (error) {
            console.error(`API Error assigning driver to vehicle, using mock:`, error);

            const vehicleIndex = this.mockVehicles.findIndex(v => v.id === vehicleId);
            const driver = this.mockDrivers.find(d => d.id === driverId);

            if (vehicleIndex === -1) throw new Error('Vehicle not found');
            if (!driver) throw new Error('Driver not found');

            this.mockVehicles[vehicleIndex] = {
                ...this.mockVehicles[vehicleIndex],
                assignedDriverId: driverId,
                assignedDriverName: driver.fullName,
                updatedAt: new Date().toISOString(),
            };

            return this.mockVehicles[vehicleIndex];
        }
    }

    // ========================================================================
    // Driver Methods
    // ========================================================================

    /**
     * Get all drivers
     */
    async getAllDrivers(): Promise<Driver[]> {
        try {
            const response = await apiClient.get<Driver[]>('/logistics/drivers');
            return response.data;
        } catch (error) {
            console.error('API Error fetching drivers, using mock data:', error);
            return [...this.mockDrivers];
        }
    }

    /**
     * Get driver by ID
     */
    async getDriverById(id: string): Promise<Driver> {
        try {
            const response = await apiClient.get<Driver>(`/logistics/drivers/${id}`);
            return response.data;
        } catch (error) {
            console.error(`API Error fetching driver ${id}, using mock data:`, error);
            const driver = this.mockDrivers.find(d => d.id === id);
            if (!driver) throw new Error('Driver not found');
            return driver;
        }
    }

    /**
     * Create a new driver
     */
    async createDriver(data: CreateDriverDto): Promise<Driver> {
        try {
            const response = await apiClient.post<Driver>('/logistics/drivers', data);
            return response.data;
        } catch (error) {
            console.error('API Error creating driver, using mock:', error);

            const newDriver: Driver = {
                id: `DRV-${Date.now()}`,
                ...data,
                fullName: `${data.firstName} ${data.lastName}`,
                status: 'Active',
                rating: 0,
                totalTrips: 0,
                totalDistance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            this.mockDrivers.push(newDriver);
            return newDriver;
        }
    }

    /**
     * Update a driver
     */
    async updateDriver(id: string, data: Partial<CreateDriverDto>): Promise<Driver> {
        try {
            const response = await apiClient.put<Driver>(`/logistics/drivers/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`API Error updating driver ${id}, using mock:`, error);

            const index = this.mockDrivers.findIndex(d => d.id === id);
            if (index === -1) throw new Error('Driver not found');

            this.mockDrivers[index] = {
                ...this.mockDrivers[index],
                ...data,
                fullName: data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : this.mockDrivers[index].fullName,
                updatedAt: new Date().toISOString(),
            };

            return this.mockDrivers[index];
        }
    }

    /**
     * Delete a driver
     */
    async deleteDriver(id: string): Promise<void> {
        try {
            await apiClient.delete(`/logistics/drivers/${id}`);
        } catch (error) {
            console.error(`API Error deleting driver ${id}, using mock:`, error);

            const index = this.mockDrivers.findIndex(d => d.id === id);
            if (index === -1) throw new Error('Driver not found');

            this.mockDrivers.splice(index, 1);
        }
    }

    /**
     * Get available drivers
     */
    async getAvailableDrivers(): Promise<Driver[]> {
        try {
            const response = await apiClient.get<Driver[]>('/logistics/drivers?status=Active');
            return response.data;
        } catch (error) {
            console.error('API Error fetching available drivers, using mock data:', error);
            return this.mockDrivers.filter(d =>
                d.status === 'Active' && !d.currentTripId
            );
        }
    }

    /**
     * Assign vehicle to driver
     */
    async assignVehicleToDriver(driverId: string, vehicleId: string): Promise<Driver> {
        try {
            const response = await apiClient.post<Driver>(
                `/logistics/drivers/${driverId}/assign-vehicle`,
                { vehicleId }
            );
            return response.data;
        } catch (error) {
            console.error(`API Error assigning vehicle to driver, using mock:`, error);

            const driverIndex = this.mockDrivers.findIndex(d => d.id === driverId);
            const vehicle = this.mockVehicles.find(v => v.id === vehicleId);

            if (driverIndex === -1) throw new Error('Driver not found');
            if (!vehicle) throw new Error('Vehicle not found');

            this.mockDrivers[driverIndex] = {
                ...this.mockDrivers[driverIndex],
                assignedVehicleId: vehicleId,
                assignedVehicleNumber: vehicle.vehicleNumber,
                updatedAt: new Date().toISOString(),
            };

            return this.mockDrivers[driverIndex];
        }
    }
}

export const fleetService = new FleetService();
