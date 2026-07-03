import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Policy Violation
 * Backs /hr/compliance/policy/violations. ADDITIVE ONLY.
 * Broad + nullable columns so it fits the page's violation record shape.
 */
@Entity('hr_policy_violations')
@Index('IDX_hr_policy_violations_companyId', ['companyId'])
export class PolicyViolation {
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
  policyName: string;

  @Column({ type: 'varchar', nullable: true })
  violationType: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  severity: string;

  @Column({ type: 'varchar', nullable: true })
  violationDate: string;

  @Column({ type: 'varchar', nullable: true })
  reportedDate: string;

  @Column({ type: 'varchar', nullable: true })
  reportedBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  actionTaken: string;

  @Column({ type: 'varchar', default: 'open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
