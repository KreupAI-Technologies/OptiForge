import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workflow_automation_rules')
export class AutomationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // schedule | event | condition | manual
  @Column({ type: 'varchar', nullable: true })
  trigger: string;

  @Column({ type: 'varchar', nullable: true })
  triggerDetails: string;

  @Column({ type: 'varchar', nullable: true })
  action: string;

  // active | paused | error | draft
  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  frequency: string;

  @Column({ type: 'varchar', nullable: true })
  lastRun: string;

  @Column({ type: 'varchar', nullable: true })
  nextRun: string;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column({ type: 'varchar', nullable: true })
  avgExecutionTime: string;

  // procurement | production | finance | hr | inventory | sales
  @Column({ type: 'varchar', nullable: true })
  category: string;

  // low | medium | high | critical
  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  createdByName: string;

  // Complex sub-structures stored as JSON for extensibility
  @Column({ type: 'json', nullable: true })
  conditions: Record<string, unknown>[];

  @Column({ type: 'json', nullable: true })
  actions: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
