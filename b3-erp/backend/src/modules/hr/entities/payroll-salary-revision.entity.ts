import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Salary Revision (orphan-endpoint build)
 * Backs the increment/revision pages under
 * /hr/payroll/{revisions, increment/{annual,performance,letters,arrears}}.
 * `category` discriminates the page. Page-specific fields live in `details`.
 */
@Entity('hr_payroll_salary_revisions')
export class PayrollSalaryRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'revision' | 'increment-annual' | 'increment-performance' | 'increment-letters' | 'increment-arrears'
  @Index()
  @Column({ type: 'varchar', default: 'revision' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveDate: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  currentSalary: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  revisedSalary: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  incrementPercent: number;

  // 'pending' | 'approved' | 'implemented' | 'rejected'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
