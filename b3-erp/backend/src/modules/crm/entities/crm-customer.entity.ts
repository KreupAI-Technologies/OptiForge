import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_customers')
export class CrmCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  industry: string;

  @Column({ type: 'varchar', nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  segment: string;

  @Column({ type: 'varchar', default: 'Active' })
  accountStatus: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ type: 'varchar', nullable: true })
  lastOrder: string;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'varchar', nullable: true })
  accountManager: string;

  @Column({ type: 'varchar', default: 'approved' })
  creditStatus: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'varchar', nullable: true })
  paymentTerms: string;

  @Column({ type: 'varchar', nullable: true })
  salesOrganization: string;

  @Column({ type: 'varchar', default: 'C' })
  customerClassification: string;

  @Column({ type: 'varchar', default: 'new' })
  customerLifecycleStage: string;

  @Column({ type: 'varchar', default: 'retail' })
  customerGroup: string;

  @Column({ type: 'boolean', default: false })
  salesBlock: boolean;

  @Column({ type: 'boolean', default: false })
  deliveryBlock: boolean;

  @Column({ type: 'boolean', default: false })
  billingBlock: boolean;

  @Column({ type: 'varchar', nullable: true })
  parentCustomerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
