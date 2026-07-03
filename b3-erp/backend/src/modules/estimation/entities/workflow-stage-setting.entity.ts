import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_workflow_stage_settings')
export class WorkflowStageSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  stageCode: string;

  @Column({ type: 'varchar' })
  stageName: string;

  @Column({ type: 'int', default: 0 })
  stageOrder: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  approverRole: string;

  @Column({ type: 'boolean', default: false })
  approvalRequired: boolean;

  @Column({ type: 'boolean', default: false })
  autoAdvance: boolean;

  @Column({ type: 'boolean', default: false })
  notifyOnEntry: boolean;

  @Column({ type: 'boolean', default: false })
  notifyOnApproval: boolean;

  @Column({ type: 'int', default: 0 })
  maxDaysInStage: number;

  @Column({ type: 'boolean', default: false })
  escalationEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  escalationDays: number;

  @Column({ type: 'varchar', nullable: true })
  escalateTo: string;

  @Column({ type: 'boolean', default: false })
  allowReject: boolean;

  @Column({ type: 'boolean', default: false })
  allowRevision: boolean;

  // active | inactive
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
