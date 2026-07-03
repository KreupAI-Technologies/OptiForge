import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Report (orphan-endpoint build)
 * Backs the report pages under /hr/payroll/reports/*
 * ('pf', 'esi', 'bank', 'dept-cost', 'tds', 'payslips', 'register').
 * `category` discriminates the page; each row is a report line item and
 * page-specific columns live in `details`.
 */
@Entity('hr_payroll_reports')
export class PayrollReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'pf' | 'esi' | 'bank' | 'dept-cost' | 'tds' | 'payslips' | 'register'
  @Index()
  @Column({ type: 'varchar', default: 'register' })
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

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
