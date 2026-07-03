import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_issues')
export class ProjectIssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  number: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', default: 'Issue' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ name: 'project_number', type: 'varchar', nullable: true })
  projectNumber: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'Medium' })
  impact: string;

  @Column({ type: 'varchar', default: 'Medium' })
  probability: string;

  @Column({ type: 'varchar', default: 'Open' })
  status: string;

  @Column({ type: 'varchar', default: 'P3' })
  priority: string;

  @Column({ name: 'raised_by', type: 'varchar', nullable: true })
  raisedBy: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ name: 'raised_date', type: 'varchar', nullable: true })
  raisedDate: string;

  @Column({ name: 'target_date', type: 'varchar', nullable: true })
  targetDate: string;

  @Column({ name: 'resolved_date', type: 'varchar', nullable: true })
  resolvedDate: string;

  @Column({ name: 'mitigation_plan', type: 'text', nullable: true })
  mitigationPlan: string;

  @Column({ name: 'cost_impact', type: 'decimal', precision: 15, scale: 2, default: 0 })
  costImpact: number;

  @Column({ name: 'schedule_impact', type: 'int', default: 0 })
  scheduleImpact: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
