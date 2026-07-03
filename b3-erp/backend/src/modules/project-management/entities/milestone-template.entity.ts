import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_milestone_templates')
export class MilestoneTemplateEntity {
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

  @Column({ name: 'total_milestones', type: 'int', default: 0 })
  totalMilestones: number;

  @Column({ name: 'estimated_duration', type: 'varchar', nullable: true })
  estimatedDuration: string;

  @Column({ type: 'jsonb', nullable: true })
  milestones: any;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used', type: 'varchar', nullable: true })
  lastUsed: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
