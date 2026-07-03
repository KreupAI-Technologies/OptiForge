import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_commissioning_activities')
export class CommissioningActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'activity_number', type: 'varchar', nullable: true })
  activityNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'equipment_system', type: 'varchar', nullable: true })
  equipmentSystem: string;

  @Column({ name: 'system_code', type: 'varchar', nullable: true })
  systemCode: string;

  @Column({ name: 'commissioning_type', type: 'varchar', default: 'Commissioning' })
  commissioningType: string;

  @Column({ name: 'scheduled_date', type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ name: 'actual_date', type: 'varchar', nullable: true })
  actualDate: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'varchar', default: 'Scheduled' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', nullable: true })
  engineer: string;

  @Column({ name: 'client_rep', type: 'varchar', nullable: true })
  clientRep: string;

  @Column({ name: 'test_parameters', type: 'jsonb', nullable: true })
  testParameters: any;

  @Column({ name: 'checklist_items', type: 'jsonb', nullable: true })
  checklistItems: any;

  @Column({ name: 'total_checks', type: 'int', default: 0 })
  totalChecks: number;

  @Column({ name: 'passed_checks', type: 'int', default: 0 })
  passedChecks: number;

  @Column({ name: 'failed_checks', type: 'int', default: 0 })
  failedChecks: number;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ name: 'certificate_issued', type: 'boolean', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_number', type: 'varchar', nullable: true })
  certificateNumber: string;

  @Column({ name: 'next_activity', type: 'varchar', nullable: true })
  nextActivity: string;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
