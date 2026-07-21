import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

// Records "Send Test Email" attempts from the system/email settings page.
// NO real SMTP send is performed — this simply persists the attempt and its
// (simulated) outcome so the console has an auditable record.
@Entity('it_email_test_logs')
@Index(['companyId'])
export class EmailTestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  toAddress: string;

  @Column({ length: 200, nullable: true })
  smtpHost: string;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
