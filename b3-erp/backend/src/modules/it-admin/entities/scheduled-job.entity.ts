import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('it_scheduled_jobs')
@Index(['companyId'])
export class ScheduledJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, default: 'Custom' })
  type: string;

  @Column({ length: 200, nullable: true })
  schedule: string;

  @Column({ length: 100, nullable: true })
  cronExpression: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({ length: 50, nullable: true })
  lastRun: string;

  @Column({ length: 50, nullable: true })
  lastRunStatus: string;

  @Column({ length: 50, nullable: true })
  nextRun: string;

  @Column({ length: 50, nullable: true })
  duration: string;

  @Column({ type: 'numeric', default: 0 })
  successRate: number;

  @Column({ type: 'integer', default: 0 })
  totalRuns: number;

  @Column({ type: 'integer', default: 0 })
  failedRuns: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ length: 50, default: 'Medium' })
  priority: string;

  @Column({ length: 150, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
