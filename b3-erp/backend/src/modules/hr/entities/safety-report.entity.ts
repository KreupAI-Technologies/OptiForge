import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Safety Report row (orphan-endpoint build). ADDITIVE ONLY.
 * Shared discriminator table backing /hr/safety/reports/* pages:
 * `recordType` = analytics | kpi | compliance.
 * Each row is a report line/metric; page-specific fields live in `meta` (jsonb).
 */
@Entity('hr_safety_reports')
@Index('IDX_hr_safety_reports_companyId', ['companyId'])
export class SafetyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'analytics' })
  recordType: string;

  @Column({ type: 'varchar', nullable: true })
  metricKey: string;

  @Column({ type: 'varchar', nullable: true })
  label: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'numeric', nullable: true })
  value: number;

  @Column({ type: 'numeric', nullable: true })
  target: number;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'varchar', nullable: true })
  trend: string;

  @Column({ type: 'varchar', nullable: true })
  framework: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
