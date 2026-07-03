import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support SLA Setting
 * Backs the /support/sla/settings page. One row per company holding the
 * SLA priority configs, business hours, escalation rules and notification
 * preferences as JSON blobs (upserted via PUT).
 */
@Entity('support_sla_settings')
export class SupportSlaSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  companyId: string;

  @Column({ type: 'json', nullable: true })
  slaConfigs: Array<Record<string, unknown>>;

  @Column({ type: 'json', nullable: true })
  businessHours: Array<Record<string, unknown>>;

  @Column({ type: 'json', nullable: true })
  escalationRules: Array<Record<string, unknown>>;

  @Column({ type: 'json', nullable: true })
  notifications: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
