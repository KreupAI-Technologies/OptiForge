import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_document_approvals')
export class PmDocumentApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'document_number', type: 'varchar', nullable: true })
  documentNumber: string;

  @Column({ name: 'document_name', type: 'varchar', nullable: true })
  documentName: string;

  @Column({ type: 'varchar', nullable: true })
  version: string;

  @Column({ name: 'document_type', type: 'varchar', nullable: true })
  documentType: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'sent_to_client', type: 'varchar', nullable: true })
  sentToClient: string;

  @Column({ name: 'client_email', type: 'varchar', nullable: true })
  clientEmail: string;

  @Column({ name: 'sent_date', type: 'varchar', nullable: true })
  sentDate: string;

  @Column({ name: 'due_date', type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ name: 'signature_url', type: 'varchar', nullable: true })
  signatureUrl: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'reminders_sent', type: 'int', default: 0 })
  remindersSent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
