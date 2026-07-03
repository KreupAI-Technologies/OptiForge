import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JobCostSheetStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  REVISED = 'Revised',
  CLOSED = 'Closed',
}

/**
 * Job cost sheet — tracks estimated vs actual cost for a manufacturing job.
 * Net-new configuration/tracking table (additive only). Backs the finance
 * costing page which previously rendered a hardcoded mock array.
 */
@Entity('job_cost_sheets')
export class JobCostSheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  costSheetNumber: string;

  @Column({ length: 50 })
  jobNumber: string;

  @Column({ length: 255 })
  jobName: string;

  @Column({ length: 100, nullable: true })
  projectType: string;

  @Column({ length: 255, nullable: true })
  customer: string;

  @Column({ type: 'date' })
  costingDate: Date;

  @Column({
    type: 'enum',
    enum: JobCostSheetStatus,
    default: JobCostSheetStatus.DRAFT,
  })
  status: JobCostSheetStatus;

  // Cost breakdown (actuals)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  overheadCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEstimatedCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalActualCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profitMargin: number;

  @Column({ length: 100, nullable: true })
  costEngineer: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
