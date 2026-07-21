import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Training Budget — reuses the existing prisma table `hr_training_budgets`
 * (model TrainingBudget in prisma/schema.prisma). Columns match the prisma
 * model exactly so the TypeORM entity and prisma model stay aligned.
 * Backs the mock-only page /hr/training/budget/allocation.
 * ADDITIVE ONLY.
 */
@Entity('hr_training_budgets')
@Index('IDX_hr_training_budgets_companyId', ['companyId'])
export class TrainingBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  budgetCode: string;

  // company, department, team, individual
  @Column({ type: 'varchar' })
  budgetType: string;

  @Column({ type: 'varchar', nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', nullable: true })
  departmentName: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column()
  fiscalYear: string;

  // annual, quarterly, monthly
  @Column({ type: 'varchar', default: 'annual' })
  periodType: string;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  @Column({ type: 'numeric' })
  allocatedAmount: number;

  @Column({ type: 'numeric', default: 0 })
  utilizedAmount: number;

  @Column({ type: 'numeric' })
  remainingAmount: number;

  @Column({ type: 'numeric', default: 0 })
  reservedAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, unknown>;

  // draft, active, frozen, closed
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @Column()
  companyId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
