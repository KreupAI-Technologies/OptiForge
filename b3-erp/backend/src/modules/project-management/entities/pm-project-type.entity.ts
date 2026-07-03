import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_types')
export class PmProjectTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'type_name', type: 'varchar', nullable: true })
  typeName: string;

  @Column({ name: 'type_code', type: 'varchar', nullable: true })
  typeCode: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  industry: string;

  @Column({ name: 'default_duration', type: 'varchar', nullable: true })
  defaultDuration: string;

  @Column({ name: 'budget_range', type: 'varchar', nullable: true })
  budgetRange: string;

  @Column({ name: 'required_approvals', type: 'int', default: 0 })
  requiredApprovals: number;

  @Column({ name: 'default_workflow', type: 'varchar', nullable: true })
  defaultWorkflow: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: any;

  @Column({ name: 'project_count', type: 'int', default: 0 })
  projectCount: number;

  @Column({ name: 'active_projects', type: 'int', default: 0 })
  activeProjects: number;

  @Column({ name: 'avg_success_rate', type: 'decimal', precision: 6, scale: 2, default: 0 })
  avgSuccessRate: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_date', type: 'varchar', nullable: true })
  createdDate: string;

  @Column({ name: 'last_modified', type: 'varchar', nullable: true })
  lastModified: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
