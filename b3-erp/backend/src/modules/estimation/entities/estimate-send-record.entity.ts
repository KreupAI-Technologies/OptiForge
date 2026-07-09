import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Records that an estimate was sent to a customer. This is a delivery audit
// record only — no real email/WhatsApp provider is integrated here.
@Entity('estimation_send_records')
@Index('IDX_estimation_send_records_company_estimate', ['companyId', 'estimateId'])
export class EstimateSendRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  estimateId: string;

  // 'email' | 'whatsapp'
  @Column({ type: 'varchar', default: 'email' })
  channel: string;

  @Column({ type: 'varchar', nullable: true })
  recipient: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  includeTerms: boolean;

  @Column({ type: 'boolean', default: false })
  includePaymentSchedule: boolean;

  @Column({ type: 'int', nullable: true })
  validityDays: number;

  @Column({ type: 'varchar', default: 'sent' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'varchar', nullable: true })
  sentBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
