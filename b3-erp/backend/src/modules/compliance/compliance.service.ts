import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_COMPANY = 'default-company-id';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================
  // DATA-SUBJECT REQUESTS (GDPR)
  // ===========================
  async findAllDataRequests(companyId?: string) {
    return this.prisma.complianceDataRequest.findMany({
      where: { company_id: companyId || DEFAULT_COMPANY },
      orderBy: { created_at: 'desc' },
    });
  }

  async dataRequestSummary(companyId?: string) {
    const rows = await this.findAllDataRequests(companyId);
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status || 'unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    }
    return {
      total: rows.length,
      pending: byStatus['pending'] || 0,
      processing: byStatus['processing'] || 0,
      completed: byStatus['completed'] || 0,
      byStatus,
    };
  }

  async findDataRequestById(id: string) {
    const row = await this.prisma.complianceDataRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Data request ${id} not found`);
    return row;
  }

  async createDataRequest(data: {
    reference?: string;
    subjectName: string;
    subjectEmail?: string;
    requestType?: string;
    status?: string;
    receivedAt?: string;
    deadlineAt?: string;
    notes?: string;
    companyId?: string;
  }) {
    return this.prisma.complianceDataRequest.create({
      data: {
        company_id: data.companyId || DEFAULT_COMPANY,
        reference: data.reference || `DSR-${Date.now()}`,
        subject_name: data.subjectName,
        subject_email: data.subjectEmail,
        request_type: data.requestType || 'data_export',
        status: data.status || 'pending',
        received_at: data.receivedAt ? new Date(data.receivedAt) : new Date(),
        deadline_at: data.deadlineAt ? new Date(data.deadlineAt) : undefined,
        notes: data.notes,
      },
    });
  }

  async updateDataRequest(
    id: string,
    data: {
      subjectName?: string;
      subjectEmail?: string;
      requestType?: string;
      status?: string;
      deadlineAt?: string;
      completedAt?: string;
      notes?: string;
    },
  ) {
    await this.findDataRequestById(id);
    return this.prisma.complianceDataRequest.update({
      where: { id },
      data: {
        subject_name: data.subjectName,
        subject_email: data.subjectEmail,
        request_type: data.requestType,
        status: data.status,
        deadline_at: data.deadlineAt ? new Date(data.deadlineAt) : undefined,
        completed_at: data.completedAt ? new Date(data.completedAt) : undefined,
        notes: data.notes,
      },
    });
  }

  async deleteDataRequest(id: string) {
    await this.findDataRequestById(id);
    return this.prisma.complianceDataRequest.delete({ where: { id } });
  }

  // ===========================
  // REGULATORY REPORTS
  // ===========================
  async findAllReports(companyId?: string, reportType?: string) {
    return this.prisma.complianceRegReport.findMany({
      where: {
        company_id: companyId || DEFAULT_COMPANY,
        ...(reportType ? { report_type: reportType } : {}),
      },
      orderBy: { report_date: 'desc' },
    });
  }

  async findReportById(id: string) {
    const row = await this.prisma.complianceRegReport.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Report ${id} not found`);
    return row;
  }

  async createReport(data: {
    name: string;
    reportType?: string;
    status?: string;
    reportDate?: string;
    fileSize?: string;
    fileUrl?: string;
    generatedBy?: string;
    notes?: string;
    companyId?: string;
  }) {
    return this.prisma.complianceRegReport.create({
      data: {
        company_id: data.companyId || DEFAULT_COMPANY,
        name: data.name,
        report_type: data.reportType || 'Internal',
        status: data.status || 'Scheduled',
        report_date: data.reportDate ? new Date(data.reportDate) : new Date(),
        file_size: data.fileSize,
        file_url: data.fileUrl,
        generated_by: data.generatedBy,
        notes: data.notes,
      },
    });
  }

  async updateReport(
    id: string,
    data: {
      name?: string;
      reportType?: string;
      status?: string;
      reportDate?: string;
      fileSize?: string;
      fileUrl?: string;
      notes?: string;
    },
  ) {
    await this.findReportById(id);
    return this.prisma.complianceRegReport.update({
      where: { id },
      data: {
        name: data.name,
        report_type: data.reportType,
        status: data.status,
        report_date: data.reportDate ? new Date(data.reportDate) : undefined,
        file_size: data.fileSize,
        file_url: data.fileUrl,
        notes: data.notes,
      },
    });
  }

  async deleteReport(id: string) {
    await this.findReportById(id);
    return this.prisma.complianceRegReport.delete({ where: { id } });
  }
}
