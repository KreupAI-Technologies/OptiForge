import { Injectable } from '@nestjs/common';

/**
 * In-memory-seeded overview service backing the after-sales-service landing
 * page (KPI tiles + recent service tickets) and the advanced-features
 * Live SLA tracking view. Persistence contract lives alongside the other
 * additive after-sales tables (see prisma/manual/orphan_after-sales-service.sql
 * and entities/service-analytics.entity.ts); rows are seeded in memory so the
 * pages render real data without a schema migration.
 */
@Injectable()
export class AfterSalesOverviewService {
  private readonly recentTickets = [
    {
      id: 'SRV-2026-456',
      customer: 'ABC Manufacturing Ltd',
      product: 'Hydraulic Press HP-500 (SN: HP5001234)',
      issue: 'Pressure inconsistency in hydraulic system',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Service Engineer A',
      createdDate: '2026-07-02',
      estimatedResolution: '2026-07-08',
      satisfaction: null,
      slaStatus: 'on_track',
      responseDeadline: '2026-07-02T14:00:00',
      resolutionDeadline: '2026-07-08T10:00:00',
    },
    {
      id: 'SRV-2026-457',
      customer: 'XYZ Industries Inc',
      product: 'CNC Machine CM-350 (SN: CM3502345)',
      issue: 'Spindle motor overheating',
      status: 'awaiting_parts',
      priority: 'critical',
      assignedTo: 'Service Engineer B',
      createdDate: '2026-07-01',
      estimatedResolution: '2026-07-09',
      satisfaction: null,
      slaStatus: 'breached',
      responseDeadline: '2026-07-01T10:00:00',
      resolutionDeadline: '2026-07-02T18:00:00',
    },
    {
      id: 'SRV-2026-458',
      customer: 'Tech Solutions Pvt Ltd',
      product: 'Control Panel CP-1000 (SN: CP1003456)',
      issue: 'Display flickering',
      status: 'resolved',
      priority: 'medium',
      assignedTo: 'Service Engineer C',
      createdDate: '2026-06-30',
      estimatedResolution: '2026-07-03',
      satisfaction: 5,
      slaStatus: 'on_track',
      responseDeadline: '2026-06-30T15:00:00',
      resolutionDeadline: '2026-07-03T12:00:00',
    },
    {
      id: 'SRV-2026-459',
      customer: 'Global Exports Corp',
      product: 'Conveyor System CS-200 (SN: CS2004567)',
      issue: 'Belt alignment issue',
      status: 'open',
      priority: 'low',
      assignedTo: 'Not Assigned',
      createdDate: '2026-07-04',
      estimatedResolution: '2026-07-11',
      satisfaction: null,
      slaStatus: 'at_risk',
      responseDeadline: '2026-07-04T22:00:00',
      resolutionDeadline: '2026-07-11T10:00:00',
    },
  ];

  private readonly slaTickets = [
    {
      id: '1',
      ticketNumber: 'TICKET-2026-000123',
      customer: 'Sharma Modular Kitchens',
      priority: 'P1',
      status: 'at_risk',
      responseDeadline: '2026-07-07T14:00:00',
      resolutionDeadline: '2026-07-07T18:00:00',
      timeRemaining: 45,
      assignedTo: 'Rajesh Kumar',
      issueType: 'Chimney Motor Failure',
    },
    {
      id: '2',
      ticketNumber: 'TICKET-2026-000118',
      customer: 'Prestige Developers',
      priority: 'P2',
      status: 'on_track',
      responseDeadline: '2026-07-07T16:00:00',
      resolutionDeadline: '2026-07-08T10:00:00',
      timeRemaining: 180,
      assignedTo: 'Amit Sharma',
      issueType: 'Oven Temperature Issue',
    },
    {
      id: '3',
      ticketNumber: 'TICKET-2026-000115',
      customer: 'Urban Interiors',
      priority: 'P3',
      status: 'met',
      responseDeadline: '2026-07-06T18:00:00',
      resolutionDeadline: '2026-07-07T12:00:00',
      timeRemaining: -120,
      assignedTo: 'Priya Patel',
      issueType: 'Hob Auto-Ignition',
    },
    {
      id: '4',
      ticketNumber: 'TICKET-2026-000089',
      customer: 'Elite Contractors',
      priority: 'P1',
      status: 'breached',
      responseDeadline: '2026-07-07T11:00:00',
      resolutionDeadline: '2026-07-07T15:00:00',
      timeRemaining: -30,
      assignedTo: 'Suresh Reddy',
      issueType: 'Dishwasher Leakage',
    },
    {
      id: '5',
      ticketNumber: 'TICKET-2026-000102',
      customer: 'Modern Homes Ltd',
      priority: 'P2',
      status: 'on_track',
      responseDeadline: '2026-07-07T15:30:00',
      resolutionDeadline: '2026-07-07T19:30:00',
      timeRemaining: 90,
      assignedTo: 'Arun Verma',
      issueType: 'Cooktop Heating Issue',
    },
  ];

  /** KPI tiles + recent tickets for the after-sales-service landing page. */
  getOverview() {
    const stats = {
      totalTickets: 234,
      openTickets: 45,
      resolvedTickets: 178,
      avgResolutionTime: 4.5,
      customerSatisfaction: 4.6,
      activeServiceCalls: 23,
      warrantyClaimsThisMonth: 12,
      technicianUtilization: 78.5,
      pendingParts: 8,
      scheduledVisits: 15,
    };
    return { stats, recentTickets: this.recentTickets };
  }

  /** Live SLA tickets + aggregate stats for the advanced-features SLA tab. */
  getSlaLive() {
    const met = this.slaTickets.filter((t) => t.status === 'met').length;
    const atRisk = this.slaTickets.filter((t) => t.status === 'at_risk').length;
    const breached = this.slaTickets.filter(
      (t) => t.status === 'breached',
    ).length;
    return {
      tickets: this.slaTickets,
      stats: {
        compliance: 92.5,
        metSLA: met,
        atRisk,
        breached,
        avgResponse: 4.2,
      },
    };
  }
}
