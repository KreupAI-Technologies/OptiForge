import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_customer_acceptances')
export class CustomerAcceptanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'acceptance_number', type: 'varchar', nullable: true })
  acceptanceNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'project_type', type: 'varchar', nullable: true })
  projectType: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ name: 'customer_contact', type: 'varchar', nullable: true })
  customerContact: string;

  @Column({ name: 'customer_email', type: 'varchar', nullable: true })
  customerEmail: string;

  @Column({ name: 'acceptance_date', type: 'varchar', nullable: true })
  acceptanceDate: string;

  @Column({ name: 'acceptance_type', type: 'varchar', default: 'Provisional' })
  acceptanceType: string;

  @Column({ type: 'varchar', nullable: true })
  phase: string;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: any;

  @Column({ name: 'acceptance_criteria', type: 'jsonb', nullable: true })
  acceptanceCriteria: any;

  @Column({ name: 'total_criteria', type: 'int', default: 0 })
  totalCriteria: number;

  @Column({ name: 'criteria_met', type: 'int', default: 0 })
  criteriaMet: number;

  @Column({ name: 'criteria_pending', type: 'int', default: 0 })
  criteriaPending: number;

  @Column({ type: 'jsonb', nullable: true })
  documentation: any;

  @Column({ name: 'total_documents', type: 'int', default: 0 })
  totalDocuments: number;

  @Column({ name: 'docs_submitted', type: 'int', default: 0 })
  docsSubmitted: number;

  @Column({ name: 'docs_pending', type: 'int', default: 0 })
  docsPending: number;

  @Column({ name: 'defects_list', type: 'jsonb', nullable: true })
  defectsList: any;

  @Column({ name: 'punch_list_items', type: 'int', default: 0 })
  punchListItems: number;

  @Column({ name: 'completed_punch_items', type: 'int', default: 0 })
  completedPunchItems: number;

  @Column({ name: 'training_completed', type: 'boolean', default: false })
  trainingCompleted: boolean;

  @Column({ name: 'warranty_period', type: 'varchar', nullable: true })
  warrantyPeriod: string;

  @Column({ name: 'warranty_start_date', type: 'varchar', nullable: true })
  warrantyStartDate: string;

  @Column({ name: 'amc_offered', type: 'boolean', default: false })
  amcOffered: boolean;

  @Column({ name: 'amc_duration', type: 'varchar', nullable: true })
  amcDuration: string;

  @Column({ name: 'signed_by', type: 'varchar', nullable: true })
  signedBy: string;

  @Column({ name: 'signed_by_designation', type: 'varchar', nullable: true })
  signedByDesignation: string;

  @Column({ name: 'signed_date', type: 'varchar', nullable: true })
  signedDate: string;

  @Column({ name: 'witnessed_by', type: 'varchar', nullable: true })
  witnessedBy: string;

  @Column({ name: 'overall_status', type: 'varchar', default: 'Pending' })
  overallStatus: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
