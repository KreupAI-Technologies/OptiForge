import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_templates')
export class ProjectTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'template_name', type: 'varchar' })
  templateName: string;

  @Column({ name: 'project_type', type: 'varchar', nullable: true })
  projectType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'Standard' })
  category: string;

  @Column({ type: 'varchar', default: 'Medium' })
  complexity: string;

  @Column({ name: 'estimated_duration', type: 'varchar', nullable: true })
  estimatedDuration: string;

  @Column({ name: 'estimated_budget', type: 'varchar', nullable: true })
  estimatedBudget: string;

  @Column({ type: 'jsonb', nullable: true })
  phases: any;

  @Column({ type: 'int', default: 0 })
  milestones: number;

  @Column({ type: 'int', default: 0 })
  tasks: number;

  @Column({ type: 'jsonb', nullable: true })
  resources: any;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: any;

  @Column({ name: 'default_settings', type: 'jsonb', nullable: true })
  defaultSettings: any;

  @Column({ type: 'jsonb', nullable: true })
  tags: any;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used', type: 'varchar', nullable: true })
  lastUsed: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
