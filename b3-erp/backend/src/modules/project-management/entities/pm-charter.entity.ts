import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PmCharterEntity — backs the projects/planning/charter page.
 * Nested collections (objectives, scope, deliverables, stakeholders, risks,
 * assumptions, constraints, successCriteria, approvals) are stored as jsonb.
 * Additive table (pm_charters).
 */
@Entity('pm_charters')
export class PmCharterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default' })
  companyId: string;

  @Column({ name: 'project_code', type: 'varchar', nullable: true })
  projectCode: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'charter_number', type: 'varchar', nullable: true })
  charterNumber: string;

  @Column({ type: 'varchar', default: '1.0' })
  version: string;

  @Column({ name: 'project_manager', type: 'varchar', nullable: true })
  projectManager: string;

  @Column({ type: 'varchar', nullable: true })
  sponsor: string;

  @Column({ type: 'varchar', nullable: true })
  client: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', default: 'construction' })
  category: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'jsonb', nullable: true })
  objectives: any;

  @Column({ type: 'jsonb', nullable: true })
  scope: any;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: any;

  @Column({ type: 'jsonb', nullable: true })
  stakeholders: any;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  budget: number;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'jsonb', nullable: true })
  risks: any;

  @Column({ type: 'jsonb', nullable: true })
  assumptions: any;

  @Column({ type: 'jsonb', nullable: true })
  constraints: any;

  @Column({ name: 'success_criteria', type: 'jsonb', nullable: true })
  successCriteria: any;

  @Column({ type: 'jsonb', nullable: true })
  approvals: any;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ name: 'created_date', type: 'varchar', nullable: true })
  createdDate: string;

  @Column({ name: 'last_modified', type: 'varchar', nullable: true })
  lastModified: string;

  @Column({ name: 'approved_date', type: 'varchar', nullable: true })
  approvedDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
