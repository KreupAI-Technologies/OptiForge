import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_contract_amendments')
export class CrmContractAmendment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  amendmentNumber: string;

  @Column({ type: 'varchar', nullable: true })
  contractNumber: string;

  @Column({ type: 'varchar', nullable: true })
  contractTitle: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar', nullable: true })
  customerCompany: string;

  @Column({ type: 'varchar', default: 'value_change' })
  amendmentType: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  originalValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  newValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valueImpact: number;

  @Column({ type: 'varchar', nullable: true })
  originalEndDate: string;

  @Column({ type: 'varchar', nullable: true })
  newEndDate: string;

  @Column({ type: 'varchar', nullable: true })
  effectiveDate: string;

  @Column({ type: 'varchar', nullable: true })
  requestedDate: string;

  @Column({ type: 'varchar', nullable: true })
  approvedDate: string;

  @Column({ type: 'varchar', nullable: true })
  executedDate: string;

  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approverName: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'simple-array', nullable: true })
  impactedClauses: string[];

  @Column({ type: 'boolean', default: false })
  requiresLegalReview: boolean;

  @Column({ type: 'boolean', default: false })
  requiresCustomerApproval: boolean;

  @Column({ type: 'varchar', nullable: true })
  customerApprovalStatus: string;

  @Column({ type: 'varchar', nullable: true })
  internalApprovalStatus: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  attachments: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
