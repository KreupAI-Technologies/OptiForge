import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Per-user two-factor (2FA) enrollment status.
// Backs the security/2fa "User Status" tab and admin actions
// (GET /it-admin/two-factor/enrollments + reminder/reset/backup-codes).
@Entity('it_two_factor_enrollments')
@Index(['companyId'])
@Index(['userId'])
export class TwoFactorEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  role: string;

  // app | sms | email | Not Set
  @Column({ default: 'Not Set' })
  method: string;

  @Column({ type: 'boolean', default: false })
  enrolled: boolean;

  // Hashed backup codes (sha256 hex). Plain codes are only returned once on
  // generation and never persisted in the clear.
  @Column({ type: 'jsonb', nullable: true })
  backupCodes: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastVerifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReminderAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
