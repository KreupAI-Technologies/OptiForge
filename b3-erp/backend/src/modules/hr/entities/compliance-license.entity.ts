import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Compliance License / Certificate / Renewal
 * Shared table backing three mock-only pages:
 *   - /hr/compliance/licenses/master        (recordType = 'license')
 *   - /hr/compliance/licenses/certificates  (recordType = 'certificate')
 *   - /hr/compliance/licenses/renewals      (recordType = 'renewal')
 * Columns are broad + nullable so a single row can represent any of the three
 * shapes. ADDITIVE ONLY.
 */
@Entity('hr_compliance_licenses')
@Index('IDX_hr_compliance_licenses_companyId', ['companyId'])
export class ComplianceLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  // 'license' | 'certificate' | 'renewal'
  @Column({ type: 'varchar', default: 'license' })
  recordType: string;

  // Common naming
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  number: string;

  @Column({ type: 'varchar', nullable: true })
  authority: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  applicableTo: string;

  @Column({ type: 'varchar', nullable: true })
  issueDate: string;

  @Column({ type: 'varchar', nullable: true })
  expiryDate: string;

  @Column({ type: 'varchar', nullable: true })
  renewalFrequency: string;

  @Column({ type: 'varchar', nullable: true })
  lastRenewalDate: string;

  @Column({ type: 'varchar', nullable: true })
  contactPerson: string;

  // Certificate-specific
  @Column({ type: 'varchar', nullable: true })
  validUntil: string;

  @Column({ type: 'varchar', nullable: true })
  relatedLicense: string;

  @Column({ type: 'varchar', nullable: true })
  documentUrl: string;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string;

  @Column({ type: 'varchar', nullable: true })
  verificationDate: string;

  // Renewal-specific
  @Column({ type: 'varchar', nullable: true })
  renewalDueDate: string;

  @Column({ type: 'varchar', nullable: true })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  renewalCost: number;

  @Column({ type: 'jsonb', nullable: true })
  documentsRequired: string[];

  @Column({ type: 'varchar', nullable: true })
  submissionDeadline: string;

  @Column({ type: 'varchar', nullable: true })
  applicationNumber: string;

  @Column({ type: 'varchar', nullable: true })
  newExpiryDate: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
