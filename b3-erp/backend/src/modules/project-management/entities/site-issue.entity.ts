import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_site_issues')
export class SiteIssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'issue_number', type: 'varchar', nullable: true })
  issueNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'issue_title', type: 'varchar', nullable: true })
  issueTitle: string;

  @Column({ name: 'issue_type', type: 'varchar', nullable: true })
  issueType: string;

  @Column({ type: 'varchar', default: 'Medium' })
  severity: string;

  @Column({ type: 'varchar', default: 'P3' })
  priority: string;

  @Column({ name: 'reported_date', type: 'varchar', nullable: true })
  reportedDate: string;

  @Column({ name: 'reported_by', type: 'varchar', nullable: true })
  reportedBy: string;

  @Column({ name: 'reported_by_role', type: 'varchar', nullable: true })
  reportedByRole: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'impact_on_work', type: 'text', nullable: true })
  impactOnWork: string;

  @Column({ name: 'root_cause', type: 'text', nullable: true })
  rootCause: string;

  @Column({ name: 'proposed_solution', type: 'text', nullable: true })
  proposedSolution: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ name: 'target_date', type: 'varchar', nullable: true })
  targetDate: string;

  @Column({ name: 'actual_resolution_date', type: 'varchar', nullable: true })
  actualResolutionDate: string;

  @Column({ type: 'varchar', default: 'Open' })
  status: string;

  @Column({ name: 'resolution_details', type: 'text', nullable: true })
  resolutionDetails: string;

  @Column({ name: 'cost_impact', type: 'numeric', precision: 15, scale: 2, default: 0 })
  costImpact: number;

  @Column({ name: 'schedule_impact', type: 'int', default: 0 })
  scheduleImpact: number;

  @Column({ name: 'preventive_measures', type: 'text', nullable: true })
  preventiveMeasures: string;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ name: 'related_issues', type: 'jsonb', nullable: true })
  relatedIssues: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
