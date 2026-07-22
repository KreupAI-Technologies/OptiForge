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

  // Cron-like or human schedule string; null = ad-hoc.
  @Column({ type: 'varchar', length: 100, nullable: true })
  schedule: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
