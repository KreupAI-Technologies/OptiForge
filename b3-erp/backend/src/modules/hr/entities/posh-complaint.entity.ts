import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PoshComplaint (orphan-endpoint build)
 * Backs hr/posh-complaints (HR Compliance > Equal Opportunity > POSH).
 * Prevention of Sexual Harassment complaint register. ADDITIVE ONLY.
 */
@Entity('hr_posh_complaints')
@Index('IDX_hr_posh_complaints_companyId', ['companyId'])
export class PoshComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  complaintCode: string;
  @Column({ type: 'varchar', nullable: true })
  subject: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;
  @Column({ type: 'varchar', nullable: true })
  complainantName: string;
  @Column({ type: 'varchar', nullable: true })
  complainantEmployeeId: string;
  @Column({ type: 'varchar', nullable: true })
  complainantDepartment: string;
  @Column({ type: 'varchar', nullable: true })
  respondentName: string;
  @Column({ type: 'varchar', nullable: true })
  respondentEmployeeId: string;
  @Column({ type: 'varchar', nullable: true })
  respondentDepartment: string;
  @Column({ type: 'varchar', nullable: true })
  incidentDate: string;
  @Column({ type: 'varchar', nullable: true })
  filingDate: string;
  @Column({ type: 'varchar', default: 'normal' })
  severity: string;
  @Column({ type: 'varchar', nullable: true })
  assignedToName: string;
  @Column({ type: 'varchar', nullable: true })
  icMembersInvolved: string;
  @Column({ type: 'varchar', nullable: true })
  inquiryStartDate: string;
  @Column({ type: 'varchar', nullable: true })
  inquiryCompletionDate: string;
  @Column({ type: 'text', nullable: true })
  findings: string;
  @Column({ type: 'text', nullable: true })
  actionTaken: string;
  @Column({ type: 'text', nullable: true })
  remarks: string;
  @Column({ type: 'varchar', default: 'registered' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
