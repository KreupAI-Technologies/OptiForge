import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Statutory Return (PF / ESI / TDS / PT / LWF)
 * Shared table backing five mock-only pages under /hr/compliance/returns/*.
 * `returnType` discriminates. Columns are broad + nullable. ADDITIVE ONLY.
 */
@Entity('hr_compliance_returns')
@Index('IDX_hr_compliance_returns_companyId', ['companyId'])
export class ComplianceReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // 'pf' | 'esi' | 'tds' | 'pt' | 'lwf'
  @Column({ type: 'varchar', default: 'pf' })
  returnType: string;

  // Period
  @Column({ type: 'varchar', nullable: true })
  returnMonth: string;

  @Column({ type: 'varchar', nullable: true })
  returnPeriod: string;

  @Column({ type: 'varchar', nullable: true })
  quarter: string;

  @Column({ type: 'varchar', nullable: true })
  financialYear: string;

  @Column({ type: 'varchar', nullable: true })
  establishment: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  branch: string;

  // Registration identifiers (esiCode / tanNumber / rcNumber / registrationNumber / formType)
  @Column({ type: 'varchar', nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', nullable: true })
  formType: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'varchar', nullable: true })
  filingDate: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  // Counts
  @Column({ type: 'int', nullable: true })
  totalEmployees: number;

  @Column({ type: 'int', nullable: true })
  coveredEmployees: number;

  @Column({ type: 'int', nullable: true })
  totalDeductees: number;

  // Amounts
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  grossWages: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  grossSalary: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  employeeContribution: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  employerContribution: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  totalContribution: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  totalDeducted: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  totalPaid: number;

  @Column({ type: 'varchar', nullable: true })
  challanNumber: string;

  @Column({ type: 'varchar', nullable: true })
  challanDate: string;

  @Column({ type: 'varchar', nullable: true })
  acknowledgmentNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  challanDetails: any;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
