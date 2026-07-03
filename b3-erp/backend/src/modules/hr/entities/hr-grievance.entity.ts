import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Grievance / POSH case
 * Shared table backing two mock-only pages:
 *   - /hr/compliance/diversity/grievance (caseType = 'grievance')
 *   - /hr/compliance/diversity/posh      (caseType = 'posh')
 * ADDITIVE ONLY. Broad + nullable columns cover both shapes.
 */
@Entity('hr_grievances')
@Index('IDX_hr_grievances_companyId', ['companyId'])
export class HrGrievance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // 'grievance' | 'posh'
  @Column({ type: 'varchar', default: 'grievance' })
  caseType: string;

  @Column({ type: 'varchar', nullable: true })
  caseNumber: string;

  @Column({ type: 'varchar', nullable: true })
  filedDate: string;

  // Grievance parties
  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  subcategory: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'varchar', default: 'filed' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  targetResolutionDate: string;

  @Column({ type: 'varchar', nullable: true })
  actualResolutionDate: string;

  @Column({ type: 'text', nullable: true })
  resolutionDetails: string;

  @Column({ type: 'varchar', nullable: true })
  employeeSatisfaction: string;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'jsonb', nullable: true })
  witnesses: string[];

  @Column({ type: 'boolean', default: false })
  evidenceProvided: boolean;

  // POSH-specific
  @Column({ type: 'varchar', nullable: true })
  complainantDetails: string;

  @Column({ type: 'varchar', nullable: true })
  respondentName: string;

  @Column({ type: 'varchar', nullable: true })
  respondentDesignation: string;

  @Column({ type: 'varchar', nullable: true })
  respondentDepartment: string;

  @Column({ type: 'varchar', nullable: true })
  incidentDate: string;

  @Column({ type: 'varchar', nullable: true })
  incidentLocation: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'varchar', nullable: true })
  icAssigned: string;

  @Column({ type: 'varchar', nullable: true })
  targetCompletionDate: string;

  @Column({ type: 'varchar', nullable: true })
  actualCompletionDate: string;

  @Column({ type: 'text', nullable: true })
  actionTaken: string;

  @Column({ type: 'boolean', nullable: true })
  confidential: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
