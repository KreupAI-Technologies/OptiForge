import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_costs')
export class ProjectCostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'project_type', type: 'varchar', nullable: true })
  projectType: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', default: 'In Progress' })
  status: string;

  @Column({ name: 'total_budget', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ name: 'actual_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'committed_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  committedCost: number;

  @Column({ name: 'forecasted_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  forecastedCost: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  variance: number;

  @Column({ name: 'variance_percent', type: 'numeric', precision: 10, scale: 2, default: 0 })
  variancePercent: number;

  @Column({ name: 'cost_breakdown', type: 'jsonb', nullable: true })
  costBreakdown: any;

  @Column({ name: 'profit_margin', type: 'numeric', precision: 10, scale: 2, default: 0 })
  profitMargin: number;

  @Column({ name: 'actual_profit', type: 'numeric', precision: 15, scale: 2, default: 0 })
  actualProfit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
