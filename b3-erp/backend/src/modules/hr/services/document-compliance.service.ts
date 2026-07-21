import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrDocument } from '../entities/hr-document.entity';

/**
 * Document Compliance — COMPUTED over the existing `hr_documents` table.
 * No new master table: completeness / missing / expired / expiring are all
 * derived from real document rows (status, expiryDate). Where a source field is
 * absent we return []/zeros — we never fabricate compliance data.
 */
export interface ComplianceRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  documentCategory: string;
  documentType: string;
  documentName: string;
  complianceStatus: 'missing' | 'expired' | 'expiring_soon' | 'compliant';
  dueDate?: string;
  expiryDate?: string;
  submittedDate?: string;
  remindersSent: number;
  lastReminderAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

@Injectable()
export class DocumentComplianceService {
  constructor(
    @InjectRepository(HrDocument)
    private readonly repo: Repository<HrDocument>,
  ) {}

  private parseDate(v?: string): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private computeStatus(
    doc: HrDocument,
    withinDays: number,
  ): ComplianceRow['complianceStatus'] {
    const status = (doc.status || '').toLowerCase();
    if (status === 'missing' || status === 'pending' || status === 'rejected') {
      return 'missing';
    }
    const expiry = this.parseDate(doc.expiryDate);
    if (expiry) {
      const now = new Date();
      if (expiry.getTime() < now.getTime()) return 'expired';
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + withinDays);
      if (expiry.getTime() <= threshold.getTime()) return 'expiring_soon';
    }
    return 'compliant';
  }

  private toRow(
    doc: HrDocument,
    withinDays: number,
  ): ComplianceRow {
    return {
      id: doc.id,
      employeeId: doc.employeeId ?? '',
      employeeName: doc.employeeName ?? '',
      employeeCode: doc.employeeCode ?? '',
      department: doc.department ?? '',
      documentCategory: doc.docCategory ?? '',
      documentType: doc.documentType ?? '',
      documentName: doc.title ?? doc.documentType ?? '',
      complianceStatus: this.computeStatus(doc, withinDays),
      expiryDate: doc.expiryDate ?? undefined,
      submittedDate: doc.uploadedOn ?? undefined,
      remindersSent: doc.remindersSent ?? 0,
      lastReminderAt: doc.lastReminderAt
        ? doc.lastReminderAt.toISOString()
        : undefined,
      resolvedAt: doc.resolvedAt ? doc.resolvedAt.toISOString() : undefined,
      resolvedBy: doc.resolvedBy ?? undefined,
    };
  }

  private async allDocs(
    companyId: string,
    filters?: { employeeId?: string; documentCategory?: string },
  ): Promise<HrDocument[]> {
    const qb = this.repo
      .createQueryBuilder('d')
      .where('d.companyId = :companyId', { companyId })
      .andWhere('d.archived = :archived', { archived: false });
    if (filters?.employeeId)
      qb.andWhere('d.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    if (filters?.documentCategory)
      qb.andWhere('d.docCategory = :cat', { cat: filters.documentCategory });
    return qb.orderBy('d.createdAt', 'DESC').getMany();
  }

  async tracking(
    companyId: string,
    filters?: {
      employeeId?: string;
      documentCategory?: string;
      complianceStatus?: string;
    },
  ): Promise<ComplianceRow[]> {
    const docs = await this.allDocs(companyId, filters);
    let rows = docs.map((d) => this.toRow(d, 30));
    if (filters?.complianceStatus) {
      rows = rows.filter(
        (r) => r.complianceStatus === filters.complianceStatus,
      );
    }
    return rows;
  }

  async missing(companyId: string): Promise<ComplianceRow[]> {
    const docs = await this.allDocs(companyId);
    return docs
      .map((d) => this.toRow(d, 30))
      .filter((r) => r.complianceStatus === 'missing');
  }

  async expired(companyId: string): Promise<ComplianceRow[]> {
    const docs = await this.allDocs(companyId);
    return docs
      .map((d) => this.toRow(d, 30))
      .filter((r) => r.complianceStatus === 'expired');
  }

  async expiring(
    companyId: string,
    withinDays = 30,
  ): Promise<ComplianceRow[]> {
    const docs = await this.allDocs(companyId);
    return docs
      .map((d) => this.toRow(d, withinDays))
      .filter((r) => r.complianceStatus === 'expiring_soon');
  }

  private async findDoc(id: string): Promise<HrDocument> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Document ${id} not found`);
    return entity;
  }

  /** Stamps a reminder on the document row (no separate reminders table). */
  async reminder(id: string): Promise<ComplianceRow> {
    const doc = await this.findDoc(id);
    doc.remindersSent = (doc.remindersSent ?? 0) + 1;
    doc.lastReminderAt = new Date();
    const saved = await this.repo.save(doc);
    return this.toRow(saved, 30);
  }

  async resolve(
    id: string,
    data: { resolvedBy?: string; notes?: string },
  ): Promise<ComplianceRow> {
    const doc = await this.findDoc(id);
    doc.status = 'verified';
    doc.resolvedAt = new Date();
    if (data?.resolvedBy) doc.resolvedBy = data.resolvedBy;
    if (data?.notes) doc.remarks = data.notes;
    const saved = await this.repo.save(doc);
    return this.toRow(saved, 30);
  }
}
