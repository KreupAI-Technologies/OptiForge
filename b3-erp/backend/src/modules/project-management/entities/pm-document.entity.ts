import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_documents')
export class PmDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'document_number', type: 'varchar', nullable: true })
  documentNumber: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'document_name', type: 'varchar', nullable: true })
  documentName: string;

  @Column({ name: 'document_type', type: 'varchar', nullable: true })
  documentType: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  version: string;

  @Column({ name: 'upload_date', type: 'varchar', nullable: true })
  uploadDate: string;

  @Column({ name: 'uploaded_by', type: 'varchar', nullable: true })
  uploadedBy: string;

  @Column({ name: 'file_size', type: 'varchar', nullable: true })
  fileSize: string;

  @Column({ name: 'file_format', type: 'varchar', nullable: true })
  fileFormat: string;

  @Column({ type: 'varchar', default: 'Draft' })
  status: string;

  @Column({ name: 'access_level', type: 'varchar', default: 'Internal' })
  accessLevel: string;

  @Column({ name: 'reviewed_by', type: 'varchar', nullable: true })
  reviewedBy: string;

  @Column({ name: 'approved_by', type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'varchar', nullable: true })
  approvalDate: string;

  @Column({ name: 'expiry_date', type: 'varchar', nullable: true })
  expiryDate: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'related_documents', type: 'jsonb', nullable: true })
  relatedDocuments: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
