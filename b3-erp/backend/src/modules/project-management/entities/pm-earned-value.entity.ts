import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PmEarnedValueEntity — backs the projects/tracking/earned-value (EVM) page.
 * Additive table (pm_earned_value).
 */
@Entity('pm_earned_value')
export class PmEarnedValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default' })
  companyId: string;

  @Column({ name: 'project_code', type: 'varchar', nullable: true })
  projectCode: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'budget_at_completion', type: 'decimal', precision: 18, scale: 2, default: 0 })
  budgetAtCompletion: number;

  @Column({ name: 'planned_value', type: 'decimal', precision: 18, scale: 2, default: 0 })
  plannedValue: number;

  @Column({ name: 'earned_value', type: 'decimal', precision: 18, scale: 2, default: 0 })
  earnedValue: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 18, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'progress_percent', type: 'int', default: 0 })
  progressPercent: number;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'varchar', default: 'on-track' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
