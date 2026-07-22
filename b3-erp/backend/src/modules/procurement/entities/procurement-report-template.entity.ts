import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_report_templates')
@Index(['companyId', 'reportType'])
export class ProcurementReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // e.g. spend-analysis | custom-report | dashboard | export
  @Column({ name: 'report_type', type: 'varchar', length: 100 })
  reportType: string;

  @Column({ type: 'jsonb', nullable: true })
  config: any;

  // Cron-like or human schedule string ('daily'|'weekly'|'monthly'|cron); null = ad-hoc.
  @Column({ type: 'varchar', length: 100, nullable: true })
  schedule: string;

  // Email recipients for scheduled delivery (array of addresses).
  @Column({ type: 'jsonb', nullable: true })
  recipients: string[];

  @Column({ name: 'last_run_at', type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ name: 'next_run_at', type: 'timestamp', nullable: true })
  nextRunAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
