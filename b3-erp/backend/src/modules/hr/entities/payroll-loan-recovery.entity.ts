import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Loan Recovery (orphan-endpoint build)
 * Backs the loan recovery page under /hr/payroll/loans/recovery.
 * Tracks individual recovery/repayment transactions against employee loans.
 * Page-specific fields live in `details`.
 */
@Entity('hr_payroll_loan_recoveries')
export class PayrollLoanRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  loanId: string;

  @Column({ type: 'varchar', nullable: true })
  loanType: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  amountRecovered: number;

  @Column({ type: 'varchar', nullable: true })
  recoveryDate: string;

  // 'salary_deduction' | 'bank_transfer' | 'cheque' | 'cash'
  @Column({ type: 'varchar', default: 'salary_deduction' })
  method: string;

  // 'completed' | 'pending' | 'failed'
  @Index()
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
