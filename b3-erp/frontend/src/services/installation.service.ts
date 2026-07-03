/**
 * Installation Service
 * Handles all installation job-related API operations for the After-Sales module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = true;

// ============================================================================
// Interfaces
// ============================================================================

export type InstallationStatus = 'scheduled' | 'in_progress' | 'completed' | 'handed_over' | 'cancelled';

export interface InstallationJob {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  status: InstallationStatus;
  scheduledDate: string;
  estimatedDuration: number;
  actualDuration?: number;
  equipmentList: string[];
  equipmentCount: number;
  siteAddress: string;
  teamLeaderId: string;
  teamLeaderName: string;
  teamMembers: string[];
  teamSize: number;
  siteSurveyCompleted: boolean;
  installationProgress: number;
  testingCompleted: boolean;
  customerSignature?: boolean;
  orderValue: number;
}

export interface CreateInstallationJobDto {
  customerId: string;
  customerName: string;
  scheduledDate: string;
  estimatedDuration: number;
  equipmentList: string[];
  siteAddress: string;
  teamLeaderId: string;
  teamLeaderName: string;
  teamMembers: string[];
  orderValue: number;
}

export interface UpdateInstallationJobDto extends Partial<CreateInstallationJobDto> {
  status?: InstallationStatus;
  actualDuration?: number;
  installationProgress?: number;
  siteSurveyCompleted?: boolean;
  testingCompleted?: boolean;
  customerSignature?: boolean;
}

export interface InstallationJobFilters {
  status?: InstallationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_INSTALLATION_JOBS: InstallationJob[] = [
  {
    id: '1',
    jobNumber: 'INS-2025-00123',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    status: 'in_progress',
    scheduledDate: '2025-10-17',
    estimatedDuration: 8,
    actualDuration: 6,
    equipmentList: ['Modular Kitchen Premium', 'Built-in Hob', 'Chimney 90cm', 'Built-in Oven'],
    equipmentCount: 4,
    siteAddress: 'Flat 501, Tower A, Prestige Lakeside, Bangalore - 560037',
    teamLeaderId: 'TL001',
    teamLeaderName: 'Rajesh Kumar',
    teamMembers: ['Amit Sharma', 'Suresh Rao', 'Prakash M'],
    teamSize: 4,
    siteSurveyCompleted: true,
    installationProgress: 75,
    testingCompleted: false,
    orderValue: 850000,
  },
  {
    id: '2',
    jobNumber: 'INS-2025-00118',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    status: 'scheduled',
    scheduledDate: '2025-10-19',
    estimatedDuration: 12,
    equipmentList: ['Modular Kitchen L-Shape', 'Dishwasher', 'Chimney', 'Hob', 'Microwave'],
    equipmentCount: 5,
    siteAddress: '3BHK Model Flat, Prestige Sunrise Park, Bangalore - 560102',
    teamLeaderId: 'TL002',
    teamLeaderName: 'Vijay Patil',
    teamMembers: ['Ravi K', 'Mohan S', 'Ganesh R', 'Kiran P'],
    teamSize: 5,
    siteSurveyCompleted: true,
    installationProgress: 0,
    testingCompleted: false,
    orderValue: 1250000,
  },
  {
    id: '3',
    jobNumber: 'INS-2025-00095',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    status: 'completed',
    scheduledDate: '2025-10-15',
    estimatedDuration: 6,
    actualDuration: 5.5,
    equipmentList: ['Built-in Hob 4 Burner', 'Chimney Auto Clean'],
    equipmentCount: 2,
    siteAddress: 'Showroom 3, Interior Design Hub, Koramangala, Bangalore - 560095',
    teamLeaderId: 'TL001',
    teamLeaderName: 'Rajesh Kumar',
    teamMembers: ['Suresh Rao', 'Prakash M'],
    teamSize: 3,
    siteSurveyCompleted: true,
    installationProgress: 100,
    testingCompleted: true,
    customerSignature: true,
    orderValue: 285000,
  },
  {
    id: '4',
    jobNumber: 'INS-2025-00134',
    customerId: 'CUST004',
    customerName: 'DLF Universal Projects',
    status: 'handed_over',
    scheduledDate: '2025-10-12',
    estimatedDuration: 10,
    actualDuration: 9,
    equipmentList: ['Premium Modular Kitchen', 'Built-in Appliances Package', 'Chimney', 'RO System'],
    equipmentCount: 7,
    siteAddress: 'Villa 12, DLF Garden City, Phase 2, Bangalore - 560067',
    teamLeaderId: 'TL003',
    teamLeaderName: 'Arun Reddy',
    teamMembers: ['Venkat M', 'Srikanth K', 'Naveen R', 'Mahesh B'],
    teamSize: 5,
    siteSurveyCompleted: true,
    installationProgress: 100,
    testingCompleted: true,
    customerSignature: true,
    orderValue: 1850000,
  },
  {
    id: '5',
    jobNumber: 'INS-2025-00142',
    customerId: 'CUST005',
    customerName: 'Elite Contractors & Builders',
    status: 'scheduled',
    scheduledDate: '2025-10-20',
    estimatedDuration: 8,
    equipmentList: ['Modular Kitchen Standard', 'Hob', 'Chimney'],
    equipmentCount: 3,
    siteAddress: '2BHK Sample Flat, Elite Heights, Whitefield, Bangalore - 560066',
    teamLeaderId: 'TL002',
    teamLeaderName: 'Vijay Patil',
    teamMembers: ['Ravi K', 'Mohan S', 'Ganesh R'],
    teamSize: 4,
    siteSurveyCompleted: false,
    installationProgress: 0,
    testingCompleted: false,
    orderValue: 580000,
  },
  {
    id: '6',
    jobNumber: 'INS-2025-00087',
    customerId: 'CUST006',
    customerName: 'Royal Homes Hyderabad',
    status: 'in_progress',
    scheduledDate: '2025-10-17',
    estimatedDuration: 7,
    actualDuration: 4,
    equipmentList: ['Induction Hob', 'Chimney', 'Built-in Microwave'],
    equipmentCount: 3,
    siteAddress: 'Penthouse, Royal Towers, Banjara Hills, Hyderabad - 500034',
    teamLeaderId: 'TL004',
    teamLeaderName: 'Krishna Murthy',
    teamMembers: ['Satish K', 'Ramesh G'],
    teamSize: 3,
    siteSurveyCompleted: true,
    installationProgress: 60,
    testingCompleted: false,
    orderValue: 420000,
  },
  {
    id: '7',
    jobNumber: 'INS-2025-00156',
    customerId: 'CUST007',
    customerName: 'Modern Living Ahmedabad',
    status: 'cancelled',
    scheduledDate: '2025-10-18',
    estimatedDuration: 6,
    equipmentList: ['Modular Kitchen Compact', 'Hob 2 Burner'],
    equipmentCount: 2,
    siteAddress: '1BHK, Modern Residency, SG Highway, Ahmedabad - 380015',
    teamLeaderId: 'TL001',
    teamLeaderName: 'Rajesh Kumar',
    teamMembers: ['Amit Sharma'],
    teamSize: 2,
    siteSurveyCompleted: true,
    installationProgress: 0,
    testingCompleted: false,
    orderValue: 180000,
  },
  {
    id: '8',
    jobNumber: 'INS-2025-00101',
    customerId: 'CUST008',
    customerName: 'Signature Interiors Pune',
    status: 'scheduled',
    scheduledDate: '2025-10-21',
    estimatedDuration: 9,
    equipmentList: ['Premium Kitchen Island', 'Chimney Designer', 'Hob 5 Burner', 'Wine Cooler'],
    equipmentCount: 4,
    siteAddress: 'Bungalow 7, Amanora Park Town, Pune - 411028',
    teamLeaderId: 'TL003',
    teamLeaderName: 'Arun Reddy',
    teamMembers: ['Venkat M', 'Srikanth K', 'Naveen R'],
    teamSize: 4,
    siteSurveyCompleted: true,
    installationProgress: 0,
    testingCompleted: false,
    orderValue: 1650000,
  },
];

// ============================================================================
// Installation Service Class
// ============================================================================

export class InstallationService {
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
   * Get all installation jobs with optional filters
   */
  static async getAllInstallationJobs(filters?: InstallationJobFilters): Promise<InstallationJob[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredJobs = [...MOCK_INSTALLATION_JOBS];

      if (filters?.status) {
        filteredJobs = filteredJobs.filter((j) => j.status === filters.status);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (j) =>
            j.jobNumber.toLowerCase().includes(searchLower) ||
            j.customerName.toLowerCase().includes(searchLower) ||
            j.siteAddress.toLowerCase().includes(searchLower)
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
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<InstallationJob[]>(`/after-sales/installations?${queryParams.toString()}`);
  }

  /**
   * Get installation job by ID
   */
  static async getInstallationJobById(id: string): Promise<InstallationJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const job = MOCK_INSTALLATION_JOBS.find((j) => j.id === id);
      if (!job) throw new Error('Installation job not found');
      return job;
    }
    return this.request<InstallationJob>(`/after-sales/installations/${id}`);
  }

  /**
   * Create a new installation job
   */
  static async createInstallationJob(data: CreateInstallationJobDto): Promise<InstallationJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const now = new Date();
      const newJob: InstallationJob = {
        id: `ins-${Date.now()}`,
        jobNumber: `INS-${now.getFullYear()}-${String(MOCK_INSTALLATION_JOBS.length + 1).padStart(5, '0')}`,
        ...data,
        status: 'scheduled',
        equipmentCount: data.equipmentList.length,
        teamSize: data.teamMembers.length + 1,
        siteSurveyCompleted: false,
        installationProgress: 0,
        testingCompleted: false,
      };
      MOCK_INSTALLATION_JOBS.push(newJob);
      return newJob;
    }
    return this.request<InstallationJob>('/after-sales/installations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing installation job
   */
  static async updateInstallationJob(id: string, data: UpdateInstallationJobDto): Promise<InstallationJob> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_INSTALLATION_JOBS.findIndex((j) => j.id === id);
      if (index === -1) throw new Error('Installation job not found');

      MOCK_INSTALLATION_JOBS[index] = {
        ...MOCK_INSTALLATION_JOBS[index],
        ...data,
        equipmentCount: data.equipmentList?.length || MOCK_INSTALLATION_JOBS[index].equipmentCount,
        teamSize: data.teamMembers ? data.teamMembers.length + 1 : MOCK_INSTALLATION_JOBS[index].teamSize,
      };
      return MOCK_INSTALLATION_JOBS[index];
    }
    return this.request<InstallationJob>(`/after-sales/installations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get installation job statistics
   */
  static async getStatistics(): Promise<{
    totalJobs: number;
    scheduledJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    avgCompletionRate: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const jobsWithActual = MOCK_INSTALLATION_JOBS.filter((j) => j.actualDuration && j.estimatedDuration);

      return {
        totalJobs: MOCK_INSTALLATION_JOBS.length,
        scheduledJobs: MOCK_INSTALLATION_JOBS.filter((j) => j.status === 'scheduled').length,
        inProgressJobs: MOCK_INSTALLATION_JOBS.filter((j) => j.status === 'in_progress').length,
        completedJobs: MOCK_INSTALLATION_JOBS.filter(
          (j) => j.status === 'completed' || j.status === 'handed_over'
        ).length,
        avgCompletionRate:
          jobsWithActual.length > 0
            ? jobsWithActual.reduce((sum, j) => sum + ((j.actualDuration! / j.estimatedDuration) * 100), 0) /
              jobsWithActual.length
            : 0,
      };
    }

    return this.request<{
      totalJobs: number;
      scheduledJobs: number;
      inProgressJobs: number;
      completedJobs: number;
      avgCompletionRate: number;
    }>('/after-sales/installations/statistics');
  }
}

export const installationService = InstallationService;
