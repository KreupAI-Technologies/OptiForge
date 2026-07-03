import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_contract_renewals')
export class CrmContractRenewal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  contractNumber: string;

  @Column({ type: 'varchar', nullable: true })
  contractTitle: string;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar', nullable: true })
  customerCompany: string;

  @Column({ type: 'varchar', nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', nullable: true })
  contactPhone: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  proposedValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valueChange: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  changePercent: number;

  @Column({ type: 'varchar', nullable: true })
  currentEndDate: string;

  @Column({ type: 'varchar', nullable: true })
  proposedStartDate: string;

  @Column({ type: 'int', default: 12 })
  proposedDuration: number;

  @Column({ type: 'int', default: 0 })
  daysUntilExpiry: number;

  @Column({ type: 'int', default: 50 })
  renewalProbability: number;

  @Column({ type: 'varchar', default: 'upcoming' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  lastContactDate: string;

  @Column({ type: 'varchar', nullable: true })
  nextFollowUpDate: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ type: 'boolean', default: false })
  renewalNoticeSent: boolean;

  @Column({ type: 'varchar', nullable: true })
  customerResponse: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
