import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * IntercompanyTransaction — a transaction posted between two legal entities
 * within the group (for consolidation / intercompany elimination).
 *
 * Additive table finance_intercompany_transaction backing
 * finance/consolidation/intercompany page CRUD.
 */
@Entity('finance_intercompany_transaction')
export class IntercompanyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_from', length: 255 })
  entityFrom: string;

  @Column({ name: 'entity_to', length: 255 })
  entityTo: string;

  @Column({ name: 'transaction_type', length: 100, nullable: true })
  transactionType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
