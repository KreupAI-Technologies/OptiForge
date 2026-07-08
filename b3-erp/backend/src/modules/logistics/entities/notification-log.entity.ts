import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Record of a logistics notification (site contact / transporter).
 *
 * This persists the notification event only — it does NOT integrate a real
 * SMS/email/WhatsApp provider. The record is created with status 'sent' to
 * represent that the notification was dispatched from this module.
 */
@Entity('logistics_notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 'site' | 'transporter' | 'customer' | 'other'
  @Column({ length: 30 })
  audience: string;

  // 'sms' | 'email' | 'whatsapp' | 'push' | 'in_app'
  @Column({ length: 30, default: 'in_app' })
  channel: string;

  @Column({ nullable: true, length: 100 })
  projectId: string;

  @Column({ nullable: true, length: 50 })
  woNumber: string;

  @Column({ nullable: true, length: 100 })
  coordinationId: string;

  @Column({ nullable: true, length: 200 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  // JSON string of recipient descriptors.
  @Column({ type: 'text', nullable: true })
  recipients: string;

  @Column({ type: 'int', default: 0 })
  recipientCount: number;

  @Column({ length: 30, default: 'sent' })
  status: string;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
