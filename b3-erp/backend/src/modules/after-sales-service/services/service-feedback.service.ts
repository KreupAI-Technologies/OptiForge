import { Injectable } from '@nestjs/common';

/**
 * In-memory-seeded feedback service backing the after-sales feedback pages
 * (complaints, ratings, NPS, surveys). Persistence contract lives in the
 * additive `as_service_feedback` table (see prisma/manual/orphan_after_sales.sql
 * and entities/service-feedback.entity.ts); rows are seeded in memory so the
 * pages render real data without a schema migration.
 */
@Injectable()
export class ServiceFeedbackService {
  private complaints: any[] = [
    {
      id: 'CMP-001',
      title: 'Technician arrived late for scheduled service',
      description: 'The assigned technician arrived 2 hours after the scheduled slot without prior notice.',
      complainantName: 'Sharma Kitchens Pvt Ltd',
      email: 'ops@sharmakitchens.in',
      phone: '+91 98450 12345',
      status: 'in-progress',
      priority: 'high',
      category: 'Service Scheduling',
      date: '2026-06-28',
      responseTime: 4,
      assignedTo: 'Rajesh Kumar',
      attachments: 1,
    },
    {
      id: 'CMP-002',
      title: 'Repeated failure of installed unit',
      description: 'Commercial refrigeration unit failed twice within a month of installation.',
      complainantName: 'Royal Restaurant Chain',
      email: 'maintenance@royalchain.com',
      phone: '+91 99000 22334',
      status: 'open',
      priority: 'critical',
      category: 'Product Quality',
      date: '2026-07-01',
      assignedTo: 'Priya Singh',
      attachments: 3,
    },
    {
      id: 'CMP-003',
      title: 'Incorrect billing on AMC invoice',
      description: 'AMC invoice included charges for parts covered under contract.',
      complainantName: 'Hotel Grand Plaza',
      email: 'accounts@grandplaza.com',
      phone: '+91 98111 55667',
      status: 'resolved',
      priority: 'medium',
      category: 'Billing Issue',
      date: '2026-06-20',
      resolvedDate: '2026-06-24',
      responseTime: 6,
      resolutionTime: 96,
      assignedTo: 'Amit Patel',
      attachments: 0,
    },
  ];

  private ratings: any[] = [
    {
      id: 'RAT-001',
      serviceName: 'Emergency Repair - Cold Room',
      serviceType: 'technician',
      customerName: 'Green Valley Resorts',
      rating: 5,
      comment: 'Excellent and prompt service, technician was very professional.',
      date: '2026-06-30',
      category: 'Repair',
      verified: true,
      helpful: 12,
      unhelpful: 0,
    },
    {
      id: 'RAT-002',
      serviceName: 'Kitchen Line Installation',
      serviceType: 'installation',
      customerName: 'City Cafe Express',
      rating: 4,
      comment: 'Good installation, minor delay in commissioning.',
      date: '2026-06-27',
      category: 'Installation',
      verified: true,
      helpful: 5,
      unhelpful: 1,
    },
    {
      id: 'RAT-003',
      serviceName: 'Spare Part Delivery',
      serviceType: 'parts-delivery',
      customerName: 'Prestige Developers',
      rating: 3,
      comment: 'Part delivered but packaging was damaged.',
      date: '2026-06-22',
      category: 'Parts',
      verified: false,
      helpful: 2,
      unhelpful: 2,
    },
  ];

  private nps: any[] = [
    {
      id: 'NPS-001',
      respondentName: 'Sharma Kitchens Pvt Ltd',
      email: 'ops@sharmakitchens.in',
      score: 9,
      category: 'promoter',
      feedback: 'Very satisfied with the overall service quality.',
      date: '2026-06-29',
      serviceType: 'AMC',
      region: 'Bangalore',
    },
    {
      id: 'NPS-002',
      respondentName: 'Hotel Grand Plaza',
      email: 'accounts@grandplaza.com',
      score: 7,
      category: 'passive',
      feedback: 'Service is decent but response could be faster.',
      date: '2026-06-25',
      serviceType: 'Service Call',
      region: 'Mumbai',
    },
    {
      id: 'NPS-003',
      respondentName: 'Royal Restaurant Chain',
      email: 'maintenance@royalchain.com',
      score: 4,
      category: 'detractor',
      feedback: 'Faced repeated equipment failures.',
      date: '2026-06-18',
      serviceType: 'Installation',
      region: 'Delhi',
    },
  ];

  private surveys: any[] = [
    {
      id: 'SUR-001',
      title: 'Post-Service Satisfaction Survey',
      description: 'Measures customer satisfaction after each service visit.',
      type: 'customer',
      category: 'Service Quality',
      status: 'active',
      startDate: '2026-06-01',
      endDate: '2026-07-31',
      responses: 142,
      responseRate: 68,
      questions: 8,
      createdBy: 'Quality Team',
      averageCompletionTime: 4,
      featured: true,
    },
    {
      id: 'SUR-002',
      title: 'Installation Feedback Survey',
      description: 'Captures feedback on installation experience.',
      type: 'installation',
      category: 'Installation',
      status: 'active',
      startDate: '2026-05-15',
      endDate: '2026-08-15',
      responses: 87,
      responseRate: 54,
      questions: 6,
      createdBy: 'Field Ops',
      averageCompletionTime: 5,
      featured: false,
    },
    {
      id: 'SUR-003',
      title: 'Technician Skill Assessment',
      description: 'Internal survey for technician self-assessment.',
      type: 'technician',
      category: 'Technician',
      status: 'draft',
      startDate: '2026-07-10',
      endDate: '2026-09-10',
      responses: 0,
      responseRate: 0,
      questions: 12,
      createdBy: 'HR',
      averageCompletionTime: 10,
      featured: false,
    },
  ];

  getComplaints(): any[] {
    return this.complaints;
  }

  getRatings(): any[] {
    return this.ratings;
  }

  getNps(): any[] {
    return this.nps;
  }

  getSurveys(): any[] {
    return this.surveys;
  }
}
