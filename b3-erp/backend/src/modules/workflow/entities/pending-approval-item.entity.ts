import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workflow_pending_approvals')
export class PendingApprovalItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  referenceNo: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  module: string;

  @Column({ type: 'varchar', nullable: true })
  moduleUrl: string;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', nullable: true })
  requestedAt: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  // low | medium | high | critical
  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  dueDate: string;

  // on-track | warning | overdue
  @Column({ type: 'varchar', nullable: true })
  slaStatus: string;

  @Column({ type: 'varchar', nullable: true })
  step: string;

  @Column({ type: 'int', default: 1 })
  totalSteps: number;

  @Column({ type: 'int', default: 1 })
  currentStep: number;

  // pending | approved | rejected
  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
