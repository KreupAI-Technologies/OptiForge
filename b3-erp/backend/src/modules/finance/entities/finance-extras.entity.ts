import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Finance "extras" — genuinely-new entities backing finance data pages that
 * have no home in the existing schema. All additive tables (see
 * prisma/manual/orphan_finance.sql). company_id defaults to 'default-company-id'.
 */

@Entity('finance_exchange_rates')
export class FinanceExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ name: 'from_currency', type: 'varchar', length: 10 })
  fromCurrency: string;

  @Column({ name: 'to_currency', type: 'varchar', length: 10 })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  rate: number;

  @Column({ name: 'previous_rate', type: 'decimal', precision: 18, scale: 6, default: 0 })
  previousRate: number;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 20, default: 'spot' })
  type: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_recurring_transactions')
export class FinanceRecurringTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  frequency: string;

  @Column({ name: 'next_run_date', type: 'date', nullable: true })
  nextRunDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255, nullable: true })
  accountName: string;

  @Column({ name: 'party_name', type: 'varchar', length: 255, nullable: true })
  partyName: string;

  @Column({ name: 'occurrences_generated', type: 'int', default: 0 })
  occurrencesGenerated: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_approval_workflows')
export class FinanceApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'document_type', type: 'varchar', length: 100, nullable: true })
  documentType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'min_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minAmount: number;

  @Column({ name: 'max_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  steps: any;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_alerts')
export class FinanceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, default: 'medium' })
  severity: string;

  @Column({ name: 'condition_type', type: 'varchar', length: 100, nullable: true })
  conditionType: string;

  @Column({ name: 'threshold_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  thresholdValue: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'last_triggered_at', type: 'timestamp', nullable: true })
  lastTriggeredAt: Date;

  @Column({ name: 'trigger_count', type: 'int', default: 0 })
  triggerCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_documents')
export class FinanceDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'document_type', type: 'varchar', length: 100, nullable: true })
  documentType: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'varchar', length: 50, nullable: true })
  fileSize: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'uploaded_by', type: 'varchar', length: 100, nullable: true })
  uploadedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_audit_trail')
export class FinanceAuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 100, nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action: string;

  @Column({ name: 'performed_by', type: 'varchar', length: 100, nullable: true })
  performedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('finance_credit_limits')
export class FinanceCreditLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 100, nullable: true })
  customerId: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'credit_used', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditUsed: number;

  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms: string;

  @Column({ name: 'credit_rating', type: 'varchar', length: 20, nullable: true })
  creditRating: string;

  @Column({ name: 'risk_category', type: 'varchar', length: 50, default: 'low' })
  riskCategory: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ name: 'on_hold', type: 'boolean', default: false })
  onHold: boolean;

  @Column({ name: 'review_date', type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_investments')
export class FinanceInvestment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'investment_type', type: 'varchar', length: 100, nullable: true })
  investmentType: string;

  @Column({ name: 'principal_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  principalAmount: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentValue: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 8, scale: 4, default: 0 })
  interestRate: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'maturity_date', type: 'date', nullable: true })
  maturityDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  institution: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('finance_report_templates')
export class FinanceReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default-company-id' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'report_type', type: 'varchar', length: 100, nullable: true })
  reportType: string;

  @Column({ type: 'jsonb', nullable: true })
  columns: any;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @Column({ name: 'group_by', type: 'varchar', length: 255, nullable: true })
  groupBy: string;

  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared: boolean;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
