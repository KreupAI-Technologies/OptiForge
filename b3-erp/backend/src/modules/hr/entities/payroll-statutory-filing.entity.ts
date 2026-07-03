import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Payroll Statutory Filing (orphan-endpoint build)
 * Generic record backing the PF / ESI / PT statutory pages under
 * /hr/payroll/{pf,esi,pt}/*. The `category` discriminator selects which page
 * a row belongs to (e.g. 'pf-contribution', 'pf-returns', 'pf-uan',
 * 'esi-contribution', 'esi-returns', 'pt'). Flexible JSON `details` holds the
 * page-specific fields so a single additive table serves every statutory page.
 */
@Entity('hr_payroll_statutory_filings')
export class PayrollStatutoryFiling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  // 'pf-contribution' | 'pf-returns' | 'pf-uan' | 'esi-contribution' | 'esi-returns' | 'pt'
  @Index()
  @Column({ type: 'varchar', default: 'pf-contribution' })
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

  // 'pending' | 'filed' | 'paid' | 'active' | 'inactive'
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
