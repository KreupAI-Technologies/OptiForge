import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_report_templates')
export class PmReportTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'template_name', type: 'varchar', nullable: true })
  templateName: string;

  @Column({ name: 'report_type', type: 'varchar', nullable: true })
  reportType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'data_points', type: 'jsonb', nullable: true })
  dataPoints: string[];

  @Column({ type: 'jsonb', nullable: true })
  filters: string[];

  @Column({ type: 'jsonb', nullable: true })
  charts: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
