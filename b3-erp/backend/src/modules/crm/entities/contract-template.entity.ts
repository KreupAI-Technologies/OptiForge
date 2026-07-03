import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_contract_templates')
export class ContractTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'service' })
  category: string;

  @Column({ type: 'int', default: 12 })
  defaultDuration: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  defaultValue: number;

  @Column({ type: 'varchar', default: 'monthly' })
  billingCycle: string;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ type: 'int', default: 30 })
  renewalNoticeDays: number;

  @Column({ type: 'varchar', nullable: true })
  paymentTerms: string;

  @Column({ type: 'simple-array', nullable: true })
  clauses: string[];

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'varchar', nullable: true })
  lastUsed: string;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  includesSLA: boolean;

  @Column({ type: 'boolean', default: false })
  includesTermination: boolean;

  @Column({ type: 'boolean', default: false })
  includesIPRights: boolean;

  @Column({ type: 'boolean', default: false })
  includesConfidentiality: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
