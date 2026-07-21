import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceRequirement } from '../entities/compliance-requirement.entity';

@Injectable()
export class ComplianceRequirementService implements OnModuleInit {
  constructor(
    @InjectRepository(ComplianceRequirement)
    private readonly repository: Repository<ComplianceRequirement>,
  ) {}

  // Seed a small demo catalog on first boot when the table is empty so the
  // compliance page has data immediately. Fixed rows keep this idempotent.
  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repository.count();
      if (count > 0) return;
      await this.repository.save(
        this.repository.create(this.defaults()),
      );
    } catch {
      // table may not exist yet (migration not applied) — ignore on boot
    }
  }

  private defaults(): Partial<ComplianceRequirement>[] {
    return [
      {
        standard: 'GDPR',
        requirement: 'Data Protection',
        description: 'Personal data must be processed lawfully and securely.',
        category: 'Data Privacy',
        status: 'Compliant',
        severity: 'High',
        compliance: 95,
        owner: 'Data Protection Officer',
      },
      {
        standard: 'GDPR',
        requirement: 'Right to Access',
        description: 'Data subjects can request access to their personal data.',
        category: 'Data Privacy',
        status: 'Compliant',
        severity: 'Medium',
        compliance: 90,
        owner: 'Data Protection Officer',
      },
      {
        standard: 'ISO 27001',
        requirement: 'Access Control',
        description: 'Access to information is restricted per policy.',
        category: 'Security',
        status: 'Partially Compliant',
        severity: 'High',
        compliance: 78,
        owner: 'Security Team',
      },
      {
        standard: 'ISO 27001',
        requirement: 'Encryption',
        description: 'Sensitive data is encrypted at rest and in transit.',
        category: 'Security',
        status: 'Compliant',
        severity: 'Critical',
        compliance: 100,
        owner: 'Security Team',
      },
      {
        standard: 'SOC 2',
        requirement: 'Incident Response',
        description: 'Documented incident response procedures are maintained.',
        category: 'Operations',
        status: 'Partially Compliant',
        severity: 'High',
        compliance: 82,
        owner: 'IT Operations',
      },
      {
        standard: 'PCI DSS',
        requirement: 'Payment Security',
        description: 'Cardholder data is protected per PCI DSS controls.',
        category: 'Finance',
        status: 'Compliant',
        severity: 'Critical',
        compliance: 96,
        owner: 'Finance Security',
      },
    ];
  }

  async findAll(filters?: {
    companyId?: string;
    standard?: string;
    category?: string;
    status?: string;
    severity?: string;
  }): Promise<ComplianceRequirement[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.standard && filters.standard !== 'all')
      where.standard = filters.standard;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    if (filters?.severity && filters.severity !== 'all')
      where.severity = filters.severity;
    return this.repository.find({
      where,
      order: { standard: 'ASC', requirement: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ComplianceRequirement> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item)
      throw new NotFoundException(`Compliance requirement ${id} not found`);
    return item;
  }

  async create(
    data: Partial<ComplianceRequirement>,
  ): Promise<ComplianceRequirement> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<ComplianceRequirement>,
  ): Promise<ComplianceRequirement> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }

  /**
   * Aggregates the stored compliance requirements into a summary report:
   * overall score, counts by status, and per-standard breakdowns. Empty-safe.
   */
  async generateReport(companyId?: string): Promise<{
    generatedAt: string;
    totalRequirements: number;
    overallCompliance: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byStandard: Array<{
      standard: string;
      count: number;
      averageCompliance: number;
    }>;
  }> {
    const rows = await this.findAll({ companyId });
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const standardTotals = new Map<string, { sum: number; count: number }>();
    let complianceSum = 0;
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.severity)
        bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
      complianceSum += r.compliance || 0;
      const agg = standardTotals.get(r.standard) ?? { sum: 0, count: 0 };
      agg.sum += r.compliance || 0;
      agg.count += 1;
      standardTotals.set(r.standard, agg);
    }
    const byStandard = Array.from(standardTotals.entries()).map(
      ([standard, { sum, count }]) => ({
        standard,
        count,
        averageCompliance: count > 0 ? Math.round(sum / count) : 0,
      }),
    );
    return {
      generatedAt: new Date().toISOString(),
      totalRequirements: rows.length,
      overallCompliance:
        rows.length > 0 ? Math.round(complianceSum / rows.length) : 0,
      byStatus,
      bySeverity,
      byStandard,
    };
  }
}

