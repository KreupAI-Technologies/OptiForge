import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Document
 * Shared table backing the mock-only document pages under /hr/documents/*:
 *   personal | insurance | education | employment | statutory | declarations |
 *   nominations
 * `docCategory` discriminates. Category-specific fields live in `meta` (jsonb),
 * common file/verification fields are first-class columns. ADDITIVE ONLY.
 */
@Entity('hr_documents')
@Index('IDX_hr_documents_companyId', ['companyId'])
export class HrDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // 'personal' | 'insurance' | 'education' | 'employment' | 'statutory' |
  // 'declaration' | 'nomination'
  @Column({ type: 'varchar', default: 'personal' })
  docCategory: string;

  @Column({ type: 'varchar', nullable: true })
  documentType: string;

  @Column({ type: 'varchar', nullable: true })
  documentNumber: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  issuingAuthority: string;

  @Column({ type: 'varchar', nullable: true })
  issueDate: string;

  @Column({ type: 'varchar', nullable: true })
  expiryDate: string;

  @Column({ type: 'varchar', nullable: true })
  uploadedOn: string;

  @Column({ type: 'varchar', nullable: true })
  uploadedBy: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'varchar', nullable: true })
  fileSize: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedOn: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  // Category-specific attributes (coverageAmount, degree, companyName, etc.)
  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
