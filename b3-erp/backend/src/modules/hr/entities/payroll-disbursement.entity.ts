import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Disbursement (orphan-endpoint build)
 * Backs the /hr/payroll/{disbursement,verification} pages. `category`
 * discriminates disbursement vs verification rows. Page-specific fields live
 * in `details`.
 */
@Entity('hr_payroll_disbursements')
export class PayrollDisbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'disbursement' | 'verification'
  @Index()
  @Column({ type: 'varchar', default: 'disbursement' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', nullable: true })
  bankName: string;

  @Column({ type: 'varchar', nullable: true })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  netPay: number;

  // 'pending' | 'verified' | 'processing' | 'disbursed' | 'failed' | 'on-hold'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
