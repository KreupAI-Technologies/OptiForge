import { Injectable } from '@nestjs/common';

/**
 * In-memory-seeded analytics service backing the after-sales analytics
 * pages (technician performance, first-time-fix). Persistence contract
 * lives in the additive `as_service_analytics` table (see
 * orphan_after_sales.sql and entities/service-analytics.entity.ts).
 */
@Injectable()
export class ServiceAnalyticsService {
  private technicians: any[] = [
    {
      id: 'TECH-001',
      name: 'Rajesh Kumar',
      employeeId: 'EMP-1001',
      region: 'Bangalore',
      experience: 8,
      rating: 4.7,
      totalServices: 342,
      ftfCount: 298,
      avgResolutionTime: 95,
      completionRate: 96,
      specializations: ['Refrigeration', 'Cooking Equipment'],
      certifications: ['OEM Certified', 'Safety Level 2'],
      joiningDate: '2018-03-15',
      status: 'active',
    },
    {
      id: 'TECH-002',
      name: 'Amit Patel',
      employeeId: 'EMP-1002',
      region: 'Pune',
      experience: 5,
      rating: 4.4,
      totalServices: 210,
      ftfCount: 172,
      avgResolutionTime: 120,
      completionRate: 92,
      specializations: ['Installation', 'Laundry'],
      certifications: ['OEM Certified'],
      joiningDate: '2021-07-01',
      status: 'active',
    },
    {
      id: 'TECH-003',
      name: 'Priya Singh',
      employeeId: 'EMP-1003',
      region: 'Delhi',
      experience: 3,
      rating: 4.1,
      totalServices: 128,
      ftfCount: 96,
      avgResolutionTime: 140,
      completionRate: 89,
      specializations: ['Dishwashing'],
      certifications: ['Safety Level 1'],
      joiningDate: '2023-01-10',
      status: 'on-leave',
    },
  ];

  private ftfRecords: any[] = [
    {
      id: 'FTF-001',
      serviceId: 'SR-2026-0045',
      customerName: 'Sharma Kitchens Pvt Ltd',
      equipment: 'Commercial Refrigerator',
      issueType: 'Cooling Failure',
      issueDescription: 'Unit not maintaining temperature',
      serviceDate: '2026-06-29',
      technician: 'Rajesh Kumar',
      region: 'Bangalore',
      ftfStatus: true,
      resolutionTime: 90,
      serviceCategory: 'Repair',
      partsUsed: ['Thermostat 220V'],
    },
    {
      id: 'FTF-002',
      serviceId: 'SR-2026-0046',
      customerName: 'City Cafe Express',
      equipment: 'Dishwasher',
      issueType: 'Water Leak',
      issueDescription: 'Leakage from bottom seal',
      serviceDate: '2026-06-27',
      technician: 'Priya Singh',
      region: 'Delhi',
      ftfStatus: false,
      resolutionTime: 180,
      serviceCategory: 'Repair',
      partsUsed: [],
    },
    {
      id: 'FTF-003',
      serviceId: 'SR-2026-0047',
      customerName: 'Royal Restaurant Chain',
      equipment: 'Cooking Range',
      issueType: 'Ignition Failure',
      issueDescription: 'Burner not igniting',
      serviceDate: '2026-06-24',
      technician: 'Amit Patel',
      region: 'Pune',
      ftfStatus: true,
      resolutionTime: 75,
      serviceCategory: 'Maintenance',
      partsUsed: ['Ignition Coil'],
    },
  ];

  private scheduledReports: any[] = [
    {
      id: 'RPT-001',
      reportName: 'Monthly SLA Performance',
      reportType: 'SLA Performance',
      description: 'SLA adherence across all service requests by priority.',
      frequency: 'Monthly',
      format: 'PDF',
      lastGenerated: '2026-06-30',
      nextScheduled: '2026-07-31',
      status: 'Active',
      recipients: ['ops@company.com', 'quality@company.com'],
      createdBy: 'Operations Manager',
    },
    {
      id: 'RPT-002',
      reportName: 'Weekly Revenue Analysis',
      reportType: 'Revenue Analysis',
      description: 'Service and AMC revenue trends week over week.',
      frequency: 'Weekly',
      format: 'Excel',
      lastGenerated: '2026-06-28',
      nextScheduled: '2026-07-05',
      status: 'Active',
      recipients: ['finance@company.com'],
      createdBy: 'Finance Lead',
    },
    {
      id: 'RPT-003',
      reportName: 'Engineer Performance Scorecard',
      reportType: 'Engineer Performance',
      description: 'FTF rate, resolution time and ratings per engineer.',
      frequency: 'Monthly',
      format: 'PDF',
      lastGenerated: '2026-06-30',
      nextScheduled: '2026-07-31',
      status: 'Generating',
      recipients: ['hr@company.com'],
      createdBy: 'Service Head',
    },
  ];

  getTechnicians(): any[] {
    return this.technicians;
  }

  getFtfRecords(): any[] {
    return this.ftfRecords;
  }

  getScheduledReports(): any[] {
    return this.scheduledReports;
  }
}
