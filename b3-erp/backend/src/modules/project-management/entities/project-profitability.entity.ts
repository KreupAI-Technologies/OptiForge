import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_profitability')
export class ProjectProfitabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'client_name', type: 'varchar', nullable: true })
  clientName: string;

  @Column({ name: 'project_type', type: 'varchar', nullable: true })
  projectType: string;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'varchar', default: 'In Progress' })
  status: string;

  @Column({ name: 'contract_value', type: 'numeric', precision: 15, scale: 2, default: 0 })
  contractValue: number;

  @Column({ name: 'actual_revenue', type: 'numeric', precision: 15, scale: 2, default: 0 })
  actualRevenue: number;

  @Column({ name: 'revenue_recognized', type: 'numeric', precision: 15, scale: 2, default: 0 })
  revenueRecognized: number;

  @Column({ name: 'total_budget', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ name: 'actual_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'direct_costs', type: 'jsonb', nullable: true })
  directCosts: any;

  @Column({ name: 'indirect_costs', type: 'jsonb', nullable: true })
  indirectCosts: any;

  @Column({ name: 'gross_profit', type: 'numeric', precision: 15, scale: 2, default: 0 })
  grossProfit: number;

  @Column({ name: 'gross_margin', type: 'numeric', precision: 10, scale: 2, default: 0 })
  grossMargin: number;

  @Column({ name: 'net_profit', type: 'numeric', precision: 15, scale: 2, default: 0 })
  netProfit: number;

  @Column({ name: 'net_margin', type: 'numeric', precision: 10, scale: 2, default: 0 })
  netMargin: number;

  @Column({ name: 'budget_variance', type: 'numeric', precision: 15, scale: 2, default: 0 })
  budgetVariance: number;

  @Column({ name: 'variance_percent', type: 'numeric', precision: 10, scale: 2, default: 0 })
  variancePercent: number;

  @Column({ name: 'billed_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  billedAmount: number;

  @Column({ name: 'outstanding_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  outstandingAmount: number;

  @Column({ name: 'payment_status', type: 'varchar', default: 'Pending' })
  paymentStatus: string;

  @Column({ name: 'risk_level', type: 'varchar', default: 'Low' })
  riskLevel: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
