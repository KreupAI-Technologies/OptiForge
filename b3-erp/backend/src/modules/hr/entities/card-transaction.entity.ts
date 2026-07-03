import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Corporate Card Transaction (orphan-endpoint build)
 * Backs /hr/cards/transactions and /hr/cards/reconciliation. ADDITIVE ONLY.
 */
@Entity('hr_corporate_card_transactions')
@Index('IDX_hr_card_transactions_companyId', ['companyId'])
export class CardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', nullable: true })
  cardNumber: string;

  @Column({ type: 'varchar', nullable: true })
  cardType: string;

  @Column({ type: 'varchar', nullable: true })
  cardHolder: string;

  @Column({ type: 'varchar', nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  merchantName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', nullable: true, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  transactionDate: string;

  @Column({ type: 'varchar', nullable: true })
  transactionTime: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'boolean', default: false })
  receiptUploaded: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
