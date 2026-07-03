import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Expense Claim (orphan-endpoint build)
 * Shared entity backing:
 *  - /hr/expenses/my, /hr/expenses/submit
 *  - /hr/travel/expenses
 *  - /hr/reimbursement/{pending,processing,paid,settlement}
 * `kind` distinguishes 'expense' | 'travel' | 'reimbursement'. ADDITIVE ONLY.
 */
@Entity('hr_expense_claims')
@Index('IDX_hr_expense_claims_companyId', ['companyId'])
export class ExpenseClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', default: 'expense' })
  kind: string;

  @Column({ type: 'varchar', nullable: true })
  claimNumber: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  claimType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  advanceAmount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  cardExpenses: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  netPayable: number;

  @Column({ type: 'varchar', nullable: true })
  destination: string;

  @Column({ type: 'varchar', nullable: true })
  travelRequestId: string;

  @Column({ type: 'varchar', nullable: true })
  travelDates: string;

  @Column({ type: 'varchar', nullable: true })
  billDate: string;

  @Column({ type: 'varchar', nullable: true })
  submissionDate: string;

  @Column({ type: 'varchar', nullable: true })
  submittedDate: string;

  @Column({ type: 'int', nullable: true })
  itemsCount: number;

  @Column({ type: 'int', nullable: true })
  documentsCount: number;

  @Column({ type: 'boolean', default: false })
  receiptAttached: boolean;

  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'int', nullable: true })
  pendingDays: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approver: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'varchar', nullable: true })
  paidDate: string;

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', nullable: true })
  paymentReference: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'json', nullable: true })
  items: Record<string, any>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
