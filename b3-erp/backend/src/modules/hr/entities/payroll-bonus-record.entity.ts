import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Bonus Record (orphan-endpoint build)
 * Backs the bonus pages under /hr/payroll/bonus/{annual,performance}.
 * `category` discriminates the page. Page-specific fields live in `details`.
 */
@Entity('hr_payroll_bonus_records')
export class PayrollBonusRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'annual' | 'performance'
  @Index()
  @Column({ type: 'varchar', default: 'annual' })
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
  financialYear: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  bonusAmount: number;

  // 'pending' | 'approved' | 'paid' | 'rejected'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
