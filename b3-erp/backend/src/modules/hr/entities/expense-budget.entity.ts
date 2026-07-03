import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ExpenseBudget (orphan-endpoint build)
 * Backs hr/expense-budgets. ADDITIVE ONLY.
 */
@Entity('hr_expense_budgets')
@Index('IDX_hr_expense_budgets_companyId', ['companyId'])
export class ExpenseBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;
  @Column({ type: 'varchar', nullable: true })
  period: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  budgetAmount: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  spentAmount: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  pendingAmount: number;
  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  availableAmount: number;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  utilizationPercent: number;
  @Column({ type: 'jsonb', nullable: true })
  categoryBreakdown: any;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
