import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_reports')
export class PmReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'report_name', type: 'varchar', nullable: true })
  reportName: string;

  @Column({ name: 'report_type', type: 'varchar', nullable: true })
  reportType: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  frequency: string;

  @Column({ type: 'varchar', nullable: true })
  format: string;

  @Column({ name: 'last_generated', type: 'varchar', nullable: true })
  lastGenerated: string;

  @Column({ name: 'generated_by', type: 'varchar', nullable: true })
  generatedBy: string;

  @Column({ name: 'project_scope', type: 'varchar', nullable: true })
  projectScope: string;

  @Column({ name: 'project_count', type: 'int', default: 0 })
  projectCount: number;

  @Column({ name: 'file_size', type: 'varchar', nullable: true })
  fileSize: string;

  @Column({ type: 'varchar', default: 'Available' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
