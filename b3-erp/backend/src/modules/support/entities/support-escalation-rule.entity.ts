import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Escalation Rule — backs /support/automation/escalation.
 */
@Entity('support_escalation_rules')
export class SupportEscalationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'json', nullable: true })
  trigger: { type: string; threshold: string };

  @Column({ type: 'varchar', nullable: true })
  escalateTo: string;

  @Column({ type: 'json', nullable: true })
  notificationChannels: string[];

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'varchar', nullable: true })
  avgResponseTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
