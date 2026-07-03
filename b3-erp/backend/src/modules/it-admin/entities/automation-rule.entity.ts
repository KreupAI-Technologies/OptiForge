import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_automation_rules')
@Index(['companyId'])
export class AutomationRule {
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

  @Column({ length: 200, nullable: true })
  trigger: string;

  @Column({ length: 100, nullable: true })
  triggerType: string;

  @Column({ type: 'simple-array', nullable: true })
  conditions: string[];

  @Column({ type: 'simple-array', nullable: true })
  actions: string[];

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ length: 50, default: 'Medium' })
  priority: string;

  @Column({ length: 50, nullable: true })
  lastTriggered: string;

  @Column({ type: 'integer', default: 0 })
  executionCount: number;

  @Column({ type: 'integer', default: 0 })
  successCount: number;

  @Column({ type: 'integer', default: 0 })
  failureCount: number;

  @Column({ type: 'numeric', default: 0 })
  successRate: number;

  @Column({ length: 150, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
