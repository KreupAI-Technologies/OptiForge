/**
 * Field Service Service
 * Handles all field service job-related API operations for the After-Sales module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type FieldServiceStatus = 'scheduled' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
export type FieldServicePriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';

export interface FieldServiceJob {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  status: FieldServiceStatus;
  priority: FieldServicePriority;
  engineerId?: string;
  engineerName?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  estimatedDuration: number;
  actualDuration?: number;
  equipmentModel: string;
  issueType: string;
  siteAddress: string;
  siteContactPerson: string;
  siteContactPhone: string;
  checkInTime?: string;
  checkOutTime?: string;
  travelDistance?: number;
  partsConsumed: number;
  totalPartsValue: number;
  serviceReportSubmitted: boolean;
  customerSignature: boolean;
}

export interface CreateFieldServiceJobDto {
  customerId: string;
  customerName: string;
  priority: FieldServicePriority;
  engineerId?: string;
  engineerName?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  estimatedDuration: number;
  equipmentModel: string;
  issueType: string;
  siteAddress: string;
  siteContactPerson: string;
  siteContactPhone: string;
}

export interface UpdateFieldServiceJobDto extends Partial<CreateFieldServiceJobDto> {
  status?: FieldServiceStatus;
  actualDuration?: number;
  checkInTime?: string;
  checkOutTime?: string;
  travelDistance?: number;
  partsConsumed?: number;
  totalPartsValue?: number;
  serviceReportSubmitted?: boolean;
  customerSignature?: boolean;
}

export interface FieldServiceJobFilters {
  status?: FieldServiceStatus;
  priority?: FieldServicePriority;
  engineerName?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_FIELD_SERVICE_JOBS: FieldServiceJob[] = [
  {
    id: '1',
    jobNumber: 'FS-2025-000456',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    status: 'in_progress',
    priority: 'P1 - Critical',
    engineerId: 'ENG001',
    engineerName: 'Rajesh Kumar',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '09:00 - 11:00',
    estimatedDuration: 2,
    actualDuration: 1.5,
    equipmentModel: 'Chimney Auto Clean 90cm',
    issueType: 'Motor Replacement',
    siteAddress: 'Shop 12, MG Road, Bangalore - 560001',
    siteContactPerson: 'Rajesh Sharma',
    siteContactPhone: '+91-98765-43210',
    checkInTime: '2025-10-17T09:15:00',
    travelDistance: 8.5,
    partsConsumed: 2,
    totalPartsValue: 8500,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '2',
    jobNumber: 'FS-2025-000423',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    status: 'dispatched',
    priority: 'P2 - High',
    engineerId: 'ENG002',
    engineerName: 'Amit Sharma',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '11:00 - 13:00',
    estimatedDuration: 2,
    equipmentModel: 'Built-in Oven 60L',
    issueType: 'Temperature Sensor Issue',
    siteAddress: 'Flat 501, Prestige Sunrise Park, Bangalore - 560102',
    siteContactPerson: 'Suresh Menon',
    siteContactPhone: '+91-80-2345-6789',
    travelDistance: 12.3,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '3',
    jobNumber: 'FS-2025-000398',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    status: 'completed',
    priority: 'P3 - Medium',
    engineerId: 'ENG003',
    engineerName: 'Priya Patel',
    scheduledDate: '2025-10-16',
    scheduledTimeSlot: '14:00 - 16:00',
    estimatedDuration: 2,
    actualDuration: 1.8,
    equipmentModel: 'Built-in Hob 4 Burner Gas',
    issueType: 'Auto-ignition Repair',
    siteAddress: 'Showroom 3, Koramangala, Bangalore - 560095',
    siteContactPerson: 'Anita Desai',
    siteContactPhone: '+91-98123-45678',
    checkInTime: '2025-10-16T14:10:00',
    checkOutTime: '2025-10-16T15:58:00',
    travelDistance: 6.2,
    partsConsumed: 1,
    totalPartsValue: 450,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
  {
    id: '4',
    jobNumber: 'FS-2025-000501',
    customerId: 'CUST004',
    customerName: 'Elite Contractors & Builders',
    status: 'scheduled',
    priority: 'P1 - Critical',
    engineerId: 'ENG001',
    engineerName: 'Rajesh Kumar',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '13:00 - 15:00',
    estimatedDuration: 2,
    equipmentModel: 'Dishwasher 14 Place Settings',
    issueType: 'Water Leakage - Emergency',
    siteAddress: '2BHK, Elite Heights, Whitefield, Bangalore - 560066',
    siteContactPerson: 'Karan Malhotra',
    siteContactPhone: '+91-99876-54321',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '5',
    jobNumber: 'FS-2025-000467',
    customerId: 'CUST005',
    customerName: 'DLF Universal Projects',
    status: 'completed',
    priority: 'P4 - Low',
    engineerId: 'ENG004',
    engineerName: 'Sanjay Gupta',
    scheduledDate: '2025-10-15',
    scheduledTimeSlot: '10:00 - 12:00',
    estimatedDuration: 2,
    actualDuration: 1.5,
    equipmentModel: 'Microwave Oven 30L',
    issueType: 'Turntable Motor Replacement',
    siteAddress: 'Villa 12, DLF Garden City, Bangalore - 560067',
    siteContactPerson: 'Vikram Singh',
    siteContactPhone: '+91-98765-12345',
    checkInTime: '2025-10-15T10:05:00',
    checkOutTime: '2025-10-15T11:35:00',
    travelDistance: 15.7,
    partsConsumed: 1,
    totalPartsValue: 1200,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
  {
    id: '6',
    jobNumber: 'FS-2025-000489',
    customerId: 'CUST006',
    customerName: 'Signature Interiors Pune',
    status: 'in_progress',
    priority: 'P2 - High',
    engineerId: 'ENG005',
    engineerName: 'Neha Singh',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '10:00 - 12:00',
    estimatedDuration: 2,
    actualDuration: 1,
    equipmentModel: 'Induction Hob 4 Burner',
    issueType: 'Cookware Detection Issue',
    siteAddress: 'Flat 302, Baner, Pune - 411045',
    siteContactPerson: 'Pooja Mehta',
    siteContactPhone: '+91-20-4567-8901',
    checkInTime: '2025-10-17T10:05:00',
    travelDistance: 10.2,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '7',
    jobNumber: 'FS-2025-000512',
    customerId: 'CUST007',
    customerName: 'Royal Homes Hyderabad',
    status: 'scheduled',
    priority: 'P3 - Medium',
    engineerId: 'ENG006',
    engineerName: 'Krishna Murthy',
    scheduledDate: '2025-10-18',
    scheduledTimeSlot: '14:00 - 16:00',
    estimatedDuration: 2,
    equipmentModel: 'RO Water Purifier 10L',
    issueType: 'Filter Replacement & Service',
    siteAddress: 'Penthouse, Royal Towers, Hyderabad - 500034',
    siteContactPerson: 'Vikram Reddy',
    siteContactPhone: '+91-40-4567-8901',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '8',
    jobNumber: 'FS-2025-000478',
    customerId: 'CUST008',
    customerName: 'Modern Living Ahmedabad',
    status: 'dispatched',
    priority: 'P2 - High',
    engineerId: 'ENG007',
    engineerName: 'Mehul Patel',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '15:00 - 17:00',
    estimatedDuration: 2,
    equipmentModel: 'Chimney Curved Glass 60cm',
    issueType: 'Suction Power Reduced',
    siteAddress: 'Flat 804, SG Highway, Ahmedabad - 380015',
    siteContactPerson: 'Mehul Patel',
    siteContactPhone: '+91-79-8765-4321',
    travelDistance: 18.5,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '9',
    jobNumber: 'FS-2025-000534',
    customerId: 'CUST009',
    customerName: 'Decor Studio Chennai',
    status: 'scheduled',
    priority: 'P3 - Medium',
    engineerId: 'ENG008',
    engineerName: 'Lakshmi Iyer',
    scheduledDate: '2025-10-19',
    scheduledTimeSlot: '09:00 - 11:00',
    estimatedDuration: 2,
    equipmentModel: 'Built-in Microwave',
    issueType: 'Control Panel Issue',
    siteAddress: 'Villa 23, Anna Nagar, Chennai - 600040',
    siteContactPerson: 'Lakshmi Iyer',
    siteContactPhone: '+91-44-2876-5432',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '10',
    jobNumber: 'FS-2025-000445',
    customerId: 'CUST010',
    customerName: 'Cosmos Furniture Mart',
    status: 'completed',
    priority: 'P3 - Medium',
    engineerId: 'ENG003',
    engineerName: 'Priya Patel',
    scheduledDate: '2025-10-14',
    scheduledTimeSlot: '11:00 - 13:00',
    estimatedDuration: 2,
    actualDuration: 2.2,
    equipmentModel: 'Chimney Auto Clean 90cm',
    issueType: 'Filter Cleaning & Maintenance',
    siteAddress: 'Showroom, MG Road, Mumbai - 400001',
    siteContactPerson: 'Ramesh Agarwal',
    siteContactPhone: '+91-22-3456-7890',
    checkInTime: '2025-10-14T11:00:00',
    checkOutTime: '2025-10-14T13:12:00',
    travelDistance: 22.5,
    partsConsumed: 2,
    totalPartsValue: 850,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
];

// ============================================================================
// Field Service Service Class
// ============================================================================

export class FieldServiceService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
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
   * Get all field service jobs with optional filters
   */
  static async getAllFieldServiceJobs(filters?: FieldServiceJobFilters): Promise<FieldServiceJob[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredJobs = [...MOCK_FIELD_SERVICE_JOBS];

      if (filters?.status) {
        filteredJobs = filteredJobs.filter((j) => j.status === filters.status);
      }
      if (filters?.priority) {
        filteredJobs = filteredJobs.filter((j) => j.priority === filters.priority);
      }
      if (filters?.engineerName) {
        filteredJobs = filteredJobs.filter((j) => j.engineerName === filters.engineerName);
      }
      if (filters?.dateRangeStart && filters?.dateRangeEnd) {
        const startDate = new Date(filters.dateRangeStart);
        const endDate = new Date(filters.dateRangeEnd);
        filteredJobs = filteredJobs.filter((j) => {
          const jobDate = new Date(j.scheduledDate);
          return jobDate >= startDate && jobDate <= endDate;
        });
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (j) =>
            j.jobNumber.toLowerCase().includes(searchLower) ||
            j.customerName.toLowerCase().includes(searchLower) ||
            j.engineerName?.toLowerCase().includes(searchLower) ||
            j.equipmentModel.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredJobs = filteredJobs.slice(start, end);
      }

      return filteredJobs;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.priority) queryParams.set('priority', filters.priority);
    if (filters?.engineerName) queryParams.set('engineerName', filters.engineerName);
    if (filters?.dateRangeStart) queryParams.set('dateRangeStart', filters.dateRangeStart);
    if (filters?.dateRangeEnd) queryParams.set('dateRangeEnd', filters.dateRangeEnd);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<FieldServiceJob[]>(`/after-sales/field-service?${queryParams.toString()}`);
  }

  /**
   * Get field service job by ID
   */
  static async getFieldServiceJobById(id: string): Promise<FieldServiceJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const job = MOCK_FIELD_SERVICE_JOBS.find((j) => j.id === id);
      if (!job) throw new Error('Field service job not found');
      return job;
    }
    return this.request<FieldServiceJob>(`/after-sales/field-service/${id}`);
  }

  /**
   * Create a new field service job
   */
  static async createFieldServiceJob(data: CreateFieldServiceJobDto): Promise<FieldServiceJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const newJob: FieldServiceJob = {
        id: `fs-${Date.now()}`,
        jobNumber: `FS-${now.getFullYear()}-${String(MOCK_FIELD_SERVICE_JOBS.length + 1).padStart(6, '0')}`,
        ...data,
        status: data.engineerId ? 'scheduled' : 'scheduled',
        partsConsumed: 0,
        totalPartsValue: 0,
        serviceReportSubmitted: false,
        customerSignature: false,
      };
      MOCK_FIELD_SERVICE_JOBS.push(newJob);
      return newJob;
    }
    return this.request<FieldServiceJob>('/after-sales/field-service', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing field service job
   */
  static async updateFieldServiceJob(id: string, data: UpdateFieldServiceJobDto): Promise<FieldServiceJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_FIELD_SERVICE_JOBS.findIndex((j) => j.id === id);
      if (index === -1) throw new Error('Field service job not found');

      MOCK_FIELD_SERVICE_JOBS[index] = {
        ...MOCK_FIELD_SERVICE_JOBS[index],
        ...data,
      };
      return MOCK_FIELD_SERVICE_JOBS[index];
    }
    return this.request<FieldServiceJob>(`/after-sales/field-service/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get field service job statistics
   */
  static async getStatistics(): Promise<{
    totalJobs: number;
    scheduledJobs: number;
    dispatchedJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    avgJobDuration: number;
    totalPartsValue: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const jobsWithDuration = MOCK_FIELD_SERVICE_JOBS.filter((j) => j.actualDuration);

      return {
        totalJobs: MOCK_FIELD_SERVICE_JOBS.length,
        scheduledJobs: MOCK_FIELD_SERVICE_JOBS.filter((j) => j.status === 'scheduled').length,
        dispatchedJobs: MOCK_FIELD_SERVICE_JOBS.filter((j) => j.status === 'dispatched').length,
        inProgressJobs: MOCK_FIELD_SERVICE_JOBS.filter((j) => j.status === 'in_progress').length,
        completedJobs: MOCK_FIELD_SERVICE_JOBS.filter((j) => j.status === 'completed').length,
        avgJobDuration:
          jobsWithDuration.length > 0
            ? jobsWithDuration.reduce((sum, j) => sum + (j.actualDuration || 0), 0) / jobsWithDuration.length
            : 0,
        totalPartsValue: MOCK_FIELD_SERVICE_JOBS.reduce((sum, j) => sum + j.totalPartsValue, 0),
      };
    }

    return this.request<{
      totalJobs: number;
      scheduledJobs: number;
      dispatchedJobs: number;
      inProgressJobs: number;
      completedJobs: number;
      avgJobDuration: number;
      totalPartsValue: number;
    }>('/after-sales/field-service/statistics');
  }

  /**
   * Get unique engineers
   */
  static async getEngineers(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return Array.from(
        new Set(MOCK_FIELD_SERVICE_JOBS.filter((j) => j.engineerName).map((j) => j.engineerName!))
      );
    }
    return this.request<string[]>('/after-sales/field-service/engineers');
  }

  /**
   * Get jobs for a specific date (for calendar view)
   */
  static async getJobsForDate(date: Date): Promise<FieldServiceJob[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const dateStr = date.toISOString().split('T')[0];
      return MOCK_FIELD_SERVICE_JOBS.filter((job) => job.scheduledDate === dateStr);
    }
    return this.request<FieldServiceJob[]>(`/after-sales/field-service/by-date/${date.toISOString().split('T')[0]}`);
  }
}

export const fieldServiceService = FieldServiceService;
