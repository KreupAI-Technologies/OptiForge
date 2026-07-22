import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PaymentReminder — a reminder dispatched against a receivable/payable/invoice.
 * Additive table finance_payment_reminder.
 */
@Entity('finance_payment_reminder')
export class PaymentReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'target_type', length: 30, default: 'receivable' })
  targetType: string; // receivable | payable | invoice

  @Column({ name: 'target_id', length: 100, nullable: true })
  targetId: string;

  @Column({ length: 20, default: 'email' })
  channel: string; // email | sms

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ length: 30, default: 'sent' })
  status: string;

  @Column({ name: 'company_id', length: 100, nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
