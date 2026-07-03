import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Single-row-per-company password policy configuration (security/password).
@Entity('it_password_policies')
@Index(['companyId'])
export class PasswordPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ type: 'integer', default: 8 })
  minLength: number;

  @Column({ type: 'integer', default: 128 })
  maxLength: number;

  @Column({ type: 'boolean', default: true })
  requireUppercase: boolean;

  @Column({ type: 'boolean', default: true })
  requireLowercase: boolean;

  @Column({ type: 'boolean', default: true })
  requireNumbers: boolean;

  @Column({ type: 'boolean', default: true })
  requireSpecialChars: boolean;

  @Column({ type: 'integer', default: 90 })
  expiryDays: number;

  @Column({ type: 'integer', default: 5 })
  historyCount: number;

  @Column({ type: 'integer', default: 5 })
  lockoutThreshold: number;

  @Column({ type: 'integer', default: 30 })
  lockoutDurationMinutes: number;

  @Column({ type: 'boolean', default: false })
  mfaRequired: boolean;

  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
