import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Disciplinary Action
 * Backs /hr/compliance/policy/disciplinary. ADDITIVE ONLY.
 */
@Entity('hr_disciplinary_actions')
@Index('IDX_hr_disciplinary_actions_companyId', ['companyId'])
export class DisciplinaryAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  actionType: string;

  @Column({ type: 'varchar', nullable: true })
  violationCategory: string;

  @Column({ type: 'varchar', nullable: true })
  incidentDate: string;

  @Column({ type: 'varchar', nullable: true })
  actionDate: string;

  @Column({ type: 'varchar', nullable: true })
  issuedBy: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ type: 'jsonb', nullable: true })
  witnessList: string[];

  @Column({ type: 'jsonb', nullable: true })
  evidenceDocuments: string[];

  @Column({ type: 'text', nullable: true })
  employeeStatement: string;

  @Column({ type: 'varchar', nullable: true })
  suspensionDuration: string;

  @Column({ type: 'varchar', nullable: true })
  suspensionStartDate: string;

  @Column({ type: 'varchar', nullable: true })
  suspensionEndDate: string;

  @Column({ type: 'boolean', nullable: true })
  isPaid: boolean;

  @Column({ type: 'varchar', default: 'not_filed' })
  appealStatus: string;

  @Column({ type: 'varchar', nullable: true })
  appealDeadline: string;

  @Column({ type: 'varchar', nullable: true })
  appealFiledDate: string;

  @Column({ type: 'varchar', nullable: true })
  appealReviewedBy: string;

  @Column({ type: 'text', nullable: true })
  appealOutcome: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveUntil: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
