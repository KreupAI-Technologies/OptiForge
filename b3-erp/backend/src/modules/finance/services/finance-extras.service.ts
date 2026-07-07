import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import {
  FinanceExchangeRate,
  FinanceRecurringTransaction,
  FinanceApprovalWorkflow,
  FinanceAlert,
  FinanceDocument,
  FinanceAuditTrail,
  FinanceCreditLimit,
  FinanceInvestment,
  FinanceReportTemplate,
  FinanceIntegration,
} from '../entities/finance-extras.entity';

const DEFAULT_COMPANY = 'default-company-id';

function stripMeta<T extends object>(data: T): Partial<T> {
  const { id, createdAt, updatedAt, ...rest } = data as any;
  return rest;
}

@Injectable()
export class FinanceExtrasService {
  constructor(
    @InjectRepository(FinanceExchangeRate)
    private readonly exchangeRateRepo: Repository<FinanceExchangeRate>,
    @InjectRepository(FinanceRecurringTransaction)
    private readonly recurringRepo: Repository<FinanceRecurringTransaction>,
    @InjectRepository(FinanceApprovalWorkflow)
    private readonly workflowRepo: Repository<FinanceApprovalWorkflow>,
    @InjectRepository(FinanceAlert)
    private readonly alertRepo: Repository<FinanceAlert>,
    @InjectRepository(FinanceDocument)
    private readonly documentRepo: Repository<FinanceDocument>,
    @InjectRepository(FinanceAuditTrail)
    private readonly auditRepo: Repository<FinanceAuditTrail>,
    @InjectRepository(FinanceCreditLimit)
    private readonly creditRepo: Repository<FinanceCreditLimit>,
    @InjectRepository(FinanceInvestment)
    private readonly investmentRepo: Repository<FinanceInvestment>,
    @InjectRepository(FinanceReportTemplate)
    private readonly reportTemplateRepo: Repository<FinanceReportTemplate>,
    @InjectRepository(FinanceIntegration)
    private readonly integrationRepo: Repository<FinanceIntegration>,
  ) {}

  private async list<T extends ObjectLiteral>(repo: Repository<T>, companyId?: string): Promise<T[]> {
    return repo.find({
      where: { companyId: companyId || DEFAULT_COMPANY } as any,
      order: { createdAt: 'DESC' } as any,
    });
  }

  private async one<T extends ObjectLiteral>(repo: Repository<T>, id: string, label: string): Promise<T> {
    const row = await repo.findOne({ where: { id } as any });
    if (!row) throw new NotFoundException(`${label} ${id} not found`);
    return row;
  }

  private async create<T extends ObjectLiteral>(repo: Repository<T>, data: any): Promise<T> {
    const row = repo.create({ companyId: DEFAULT_COMPANY, ...stripMeta(data) } as any);
    return repo.save(row as any) as any;
  }

  private async update<T extends ObjectLiteral>(repo: Repository<T>, id: string, data: any, label: string): Promise<T> {
    const row = await this.one(repo, id, label);
    Object.assign(row as any, stripMeta(data));
    return repo.save(row as any) as any;
  }

  private async remove<T extends ObjectLiteral>(repo: Repository<T>, id: string, label: string): Promise<void> {
    const res = await repo.delete(id);
    if (!res.affected) throw new NotFoundException(`${label} ${id} not found`);
  }

  // Exchange rates
  listExchangeRates(c?: string) { return this.list(this.exchangeRateRepo, c); }
  getExchangeRate(id: string) { return this.one(this.exchangeRateRepo, id, 'Exchange rate'); }
  createExchangeRate(d: any) { return this.create(this.exchangeRateRepo, d); }
  updateExchangeRate(id: string, d: any) { return this.update(this.exchangeRateRepo, id, d, 'Exchange rate'); }
  deleteExchangeRate(id: string) { return this.remove(this.exchangeRateRepo, id, 'Exchange rate'); }

  // Recurring transactions
  listRecurring(c?: string) { return this.list(this.recurringRepo, c); }
  getRecurring(id: string) { return this.one(this.recurringRepo, id, 'Recurring transaction'); }
  createRecurring(d: any) { return this.create(this.recurringRepo, d); }
  updateRecurring(id: string, d: any) { return this.update(this.recurringRepo, id, d, 'Recurring transaction'); }
  deleteRecurring(id: string) { return this.remove(this.recurringRepo, id, 'Recurring transaction'); }

  // Approval workflows
  listWorkflows(c?: string) { return this.list(this.workflowRepo, c); }
  getWorkflow(id: string) { return this.one(this.workflowRepo, id, 'Workflow'); }
  createWorkflow(d: any) { return this.create(this.workflowRepo, d); }
  updateWorkflow(id: string, d: any) { return this.update(this.workflowRepo, id, d, 'Workflow'); }
  deleteWorkflow(id: string) { return this.remove(this.workflowRepo, id, 'Workflow'); }

  // Alerts
  listAlerts(c?: string) { return this.list(this.alertRepo, c); }
  getAlert(id: string) { return this.one(this.alertRepo, id, 'Alert'); }
  createAlert(d: any) { return this.create(this.alertRepo, d); }
  updateAlert(id: string, d: any) { return this.update(this.alertRepo, id, d, 'Alert'); }
  deleteAlert(id: string) { return this.remove(this.alertRepo, id, 'Alert'); }

  // Documents
  listDocuments(c?: string) { return this.list(this.documentRepo, c); }
  getDocument(id: string) { return this.one(this.documentRepo, id, 'Document'); }
  createDocument(d: any) { return this.create(this.documentRepo, d); }
  updateDocument(id: string, d: any) { return this.update(this.documentRepo, id, d, 'Document'); }
  deleteDocument(id: string) { return this.remove(this.documentRepo, id, 'Document'); }

  // Audit trail (read + append only)
  async listAudit(companyId?: string): Promise<FinanceAuditTrail[]> {
    return this.auditRepo.find({
      where: { companyId: companyId || DEFAULT_COMPANY },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
  createAudit(d: any) {
    const row = this.auditRepo.create({ companyId: DEFAULT_COMPANY, ...stripMeta(d) });
    return this.auditRepo.save(row);
  }

  // Credit limits
  listCreditLimits(c?: string) { return this.list(this.creditRepo, c); }
  getCreditLimit(id: string) { return this.one(this.creditRepo, id, 'Credit limit'); }
  createCreditLimit(d: any) { return this.create(this.creditRepo, d); }
  updateCreditLimit(id: string, d: any) { return this.update(this.creditRepo, id, d, 'Credit limit'); }
  deleteCreditLimit(id: string) { return this.remove(this.creditRepo, id, 'Credit limit'); }

  // Investments
  listInvestments(c?: string) { return this.list(this.investmentRepo, c); }
  getInvestment(id: string) { return this.one(this.investmentRepo, id, 'Investment'); }
  createInvestment(d: any) { return this.create(this.investmentRepo, d); }
  updateInvestment(id: string, d: any) { return this.update(this.investmentRepo, id, d, 'Investment'); }
  deleteInvestment(id: string) { return this.remove(this.investmentRepo, id, 'Investment'); }

  // Report templates
  listReportTemplates(c?: string) { return this.list(this.reportTemplateRepo, c); }
  getReportTemplate(id: string) { return this.one(this.reportTemplateRepo, id, 'Report template'); }
  createReportTemplate(d: any) { return this.create(this.reportTemplateRepo, d); }
  updateReportTemplate(id: string, d: any) { return this.update(this.reportTemplateRepo, id, d, 'Report template'); }
  deleteReportTemplate(id: string) { return this.remove(this.reportTemplateRepo, id, 'Report template'); }

  // Integrations (external system configs / status)
  listIntegrations(c?: string) {
    return this.integrationRepo.find({
      where: { companyId: c || DEFAULT_COMPANY },
      order: { createdAt: 'ASC' },
    });
  }
  getIntegration(id: string) { return this.one(this.integrationRepo, id, 'Integration'); }
  createIntegration(d: any) { return this.create(this.integrationRepo, d); }
  updateIntegration(id: string, d: any) { return this.update(this.integrationRepo, id, d, 'Integration'); }
  deleteIntegration(id: string) { return this.remove(this.integrationRepo, id, 'Integration'); }
}
