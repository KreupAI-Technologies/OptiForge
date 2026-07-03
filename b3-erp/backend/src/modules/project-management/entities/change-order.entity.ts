import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_change_orders')
export class ChangeOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'change_order_number', type: 'varchar', nullable: true })
  changeOrderNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'request_date', type: 'varchar', nullable: true })
  requestDate: string;

  @Column({ name: 'requested_by', type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ name: 'requested_by_role', type: 'varchar', nullable: true })
  requestedByRole: string;

  @Column({ name: 'change_type', type: 'varchar', nullable: true })
  changeType: string;

  @Column({ type: 'varchar', default: 'Medium' })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'impact_on_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  impactOnCost: number;

  @Column({ name: 'impact_on_schedule', type: 'int', default: 0 })
  impactOnSchedule: number;

  @Column({ name: 'original_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  originalBudget: number;

  @Column({ name: 'revised_budget', type: 'decimal', precision: 15, scale: 2, default: 0 })
  revisedBudget: number;

  @Column({ name: 'original_end_date', type: 'varchar', nullable: true })
  originalEndDate: string;

  @Column({ name: 'revised_end_date', type: 'varchar', nullable: true })
  revisedEndDate: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ name: 'implementation_date', type: 'varchar', nullable: true })
  implementationDate: string;

  @Column({ name: 'completion_date', type: 'varchar', nullable: true })
  completionDate: string;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
