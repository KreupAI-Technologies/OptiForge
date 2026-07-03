import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_project_settings')
export class ProjectSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', unique: true, default: 'default' })
  companyId: string;

  // General settings
  @Column({ name: 'default_currency', type: 'varchar', default: 'INR' })
  defaultCurrency: string;

  @Column({ name: 'fiscal_year_start', type: 'varchar', default: '04-01' })
  fiscalYearStart: string;

  @Column({ name: 'default_project_prefix', type: 'varchar', default: 'PRJ' })
  defaultProjectPrefix: string;

  @Column({ name: 'auto_numbering', type: 'boolean', default: true })
  autoNumbering: boolean;

  @Column({ name: 'document_retention', type: 'varchar', default: '7' })
  documentRetention: string;

  // Workflow settings
  @Column({ name: 'project_approval_required', type: 'boolean', default: true })
  projectApprovalRequired: boolean;

  @Column({ name: 'milestone_approval_required', type: 'boolean', default: true })
  milestoneApprovalRequired: boolean;

  @Column({ name: 'document_approval_required', type: 'boolean', default: true })
  documentApprovalRequired: boolean;

  @Column({ name: 'budget_approval_threshold', type: 'varchar', default: '5000000' })
  budgetApprovalThreshold: string;

  @Column({ name: 'change_order_approval_levels', type: 'varchar', default: '2' })
  changeOrderApprovalLevels: string;

  // Notification settings
  @Column({ name: 'project_start_notification', type: 'boolean', default: true })
  projectStartNotification: boolean;

  @Column({ name: 'milestone_complete_notification', type: 'boolean', default: true })
  milestoneCompleteNotification: boolean;

  @Column({ name: 'budget_exceeded_notification', type: 'boolean', default: true })
  budgetExceededNotification: boolean;

  @Column({ name: 'schedule_delay_notification', type: 'boolean', default: true })
  scheduleDelayNotification: boolean;

  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ name: 'sms_notifications', type: 'boolean', default: false })
  smsNotifications: boolean;

  // Approval settings
  @Column({ name: 'project_manager_approval', type: 'boolean', default: true })
  projectManagerApproval: boolean;

  @Column({ name: 'department_head_approval', type: 'boolean', default: true })
  departmentHeadApproval: boolean;

  @Column({ name: 'finance_approval', type: 'boolean', default: true })
  financeApproval: boolean;

  @Column({ name: 'ceo_approval_threshold', type: 'varchar', default: '10000000' })
  ceoApprovalThreshold: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
