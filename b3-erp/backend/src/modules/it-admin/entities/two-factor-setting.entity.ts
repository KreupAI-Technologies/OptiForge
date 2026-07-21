import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Single-row-per-company two-factor (2FA) organisation settings.
// Backs the security/2fa "2FA Settings" tab (GET/PUT /it-admin/two-factor/settings).
@Entity('it_two_factor_settings')
@Index(['companyId'])
export class TwoFactorSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  // Master switch — 2FA available at all.
  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  // Whether 2FA enrollment is mandatory for users.
  @Column({ type: 'boolean', default: false })
  required: boolean;

  // Allowed methods, e.g. ['app', 'sms', 'email', 'backup'].
  @Column({ type: 'jsonb', nullable: true })
  allowedMethods: string[];

  @Column({ type: 'integer', default: 30 })
  gracePeriodDays: number;

  // Optional structured config for enforcement/recovery/method details the
  // UI carries (SMS provider, backup code count, required roles, etc.).
  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
