import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Tax Record (orphan-endpoint build)
 * Backs the tax pages under /hr/payroll/tax/{tds,declarations,form16}.
 * `category` discriminates the page. Page-specific fields live in `details`.
 */
@Entity('hr_payroll_tax_records')
export class PayrollTaxRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'tds' | 'declarations' | 'form16'
  @Index()
  @Column({ type: 'varchar', default: 'tds' })
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
  financialYear: string;

  @Column({ type: 'varchar', nullable: true })
  period: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  amount: number;

  // 'pending' | 'submitted' | 'approved' | 'issued' | 'rejected'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
