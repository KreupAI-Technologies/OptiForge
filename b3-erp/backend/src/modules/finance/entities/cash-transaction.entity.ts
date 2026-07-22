import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * CashTransaction — a manual cash-book entry (receipt or payment) captured
 * from the finance/cash page. Additive table finance_cash_transaction.
 */
@Entity('finance_cash_transaction')
export class CashTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ length: 20, default: 'receipt' })
  type: string; // receipt | payment

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balance: number;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
