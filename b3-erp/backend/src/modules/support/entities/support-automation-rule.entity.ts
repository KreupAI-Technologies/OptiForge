import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Support Automation Rule
 * Backs the /support/automation/rules page. Stores trigger/action
 * definitions plus execution metrics for support workflow automation.
 */
@Entity('support_automation_rules')
export class SupportAutomationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  ruleId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Trigger definition: { type, conditions: string[] }
  @Column({ type: 'json', nullable: true })
  trigger: {
    type: string;
    conditions: string[];
  };

  // Action list: [{ type, details }]
  @Column({ type: 'json', nullable: true })
  actions: {
    type: string;
    details: string;
  }[];

  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecuted: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
