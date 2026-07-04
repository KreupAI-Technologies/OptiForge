import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Bonus Scheme (orphan-endpoint build)
 * Backs the bonus scheme master page under /hr/payroll/bonus/schemes.
 * Holds bonus scheme definitions/configuration (distinct from bonus records).
 * Page-specific fields (arrays, T&Cs) live in `details`.
 */
@Entity('hr_payroll_bonus_schemes')
export class PayrollBonusScheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  schemeName: string;

  // 'statutory' | 'performance' | 'festive' | 'retention' | 'adhoc' | 'sales' | 'production'
  @Column({ type: 'varchar', default: 'performance' })
  schemeType: string;

  // 'all' | 'department' | 'designation' | 'individual'
  @Column({ type: 'varchar', default: 'all' })
  applicableTo: string;

  @Column({ type: 'varchar', nullable: true })
  eligibilityCriteria: string;

  @Column({ type: 'varchar', nullable: true })
  calculationMethod: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  bonusPercentage: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  fixedAmount: number;

  // 'monthly' | 'quarterly' | 'half-yearly' | 'annual' | 'one-time'
  @Column({ type: 'varchar', default: 'annual' })
  paymentFrequency: string;

  // 'active' | 'inactive' | 'draft'
  @Index()
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveFrom: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveTo: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
