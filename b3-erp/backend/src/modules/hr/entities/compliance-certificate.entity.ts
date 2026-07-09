import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ComplianceCertificate (orphan-endpoint build)
 * Backs hr/compliance-certificates (HR Compliance > Licenses > Certificates).
 * ADDITIVE ONLY.
 */
@Entity('hr_compliance_certificates')
@Index('IDX_hr_compliance_certificates_companyId', ['companyId'])
export class ComplianceCertificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  certificateCode: string;
  @Column({ type: 'varchar', nullable: true })
  certificateName: string;
  @Column({ type: 'varchar', nullable: true })
  certificateType: string;
  @Column({ type: 'varchar', nullable: true })
  issuingAuthority: string;
  @Column({ type: 'varchar', nullable: true })
  certificateNumber: string;
  @Column({ type: 'varchar', nullable: true })
  issueDate: string;
  @Column({ type: 'varchar', nullable: true })
  validFrom: string;
  @Column({ type: 'varchar', nullable: true })
  validTo: string;
  @Column({ type: 'varchar', nullable: true })
  scope: string;
  @Column({ type: 'varchar', nullable: true })
  documentUrl: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'text', nullable: true })
  remarks: string;
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
