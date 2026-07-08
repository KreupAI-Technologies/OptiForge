import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// Configurable security alert rules (security/alerts -> "Alert Rules" tab).
@Entity('it_alert_rules')
@Index(['companyId'])
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'General' })
  category: string;

  @Column({ length: 50, default: 'Medium' })
  severity: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  conditions: string[];

  @Column({ type: 'simple-array', nullable: true })
  actions: string[];

  @Column({ type: 'simple-array', nullable: true })
  notifyVia: string[];

  @Column({ type: 'simple-array', nullable: true })
  recipients: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
