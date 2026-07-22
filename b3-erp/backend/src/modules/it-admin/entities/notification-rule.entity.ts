import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Event-driven notification routing rules (system/notifications automation).
// A rule fires a notification on a given eventType via a channel to recipients,
// optionally gated by conditions. Distinct from NotificationSetting (per-category
// preferences) — this is the "when X happens, notify Y via Z" automation.
@Entity('it_notification_rules')
@Index(['companyId'])
export class NotificationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // The domain event that triggers this rule (e.g. 'invoice.overdue').
  @Column({ name: 'event_type', length: 150 })
  eventType: string;

  // Delivery channel: 'email' | 'sms' | 'in-app'.
  @Column({ length: 20, default: 'email' })
  channel: string;

  // List of recipient addresses / user ids / role names.
  @Column({ type: 'jsonb', nullable: true })
  recipients: string[];

  // Optional structured trigger conditions (e.g. { field, operator, value }).
  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, unknown> | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
