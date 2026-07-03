import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ArCustomerAccount — Accounts Receivable master record for a single customer.
 *
 * Additive table (finance_ar_customer_account) backing the
 * finance/receivables view + edit pages. Nested collections (aging buckets,
 * invoices, collection activities, payment history, contact) are stored as
 * JSONB so the whole receivable can be persisted/retrieved in one shape.
 */
@Entity('finance_ar_customer_account')
export class ArCustomerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  customerId: string;

  @Column({ length: 255 })
  customerName: string;

  @Column({ length: 100, nullable: true })
  customerCode: string;

  @Column({ length: 50, nullable: true })
  gstNumber: string;

  @Column({ length: 50, nullable: true })
  panNumber: string;

  @Column({ length: 50, nullable: true })
  customerCategory: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOutstanding: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  overdueAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dueThisWeek: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dueThisMonth: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lastCollectionAmount: number;

  @Column({ type: 'date', nullable: true })
  lastCollectionDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditUsed: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableCredit: number;

  @Column({ length: 30, default: 'approved' })
  creditStatus: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentTerms: string;

  @Column({ type: 'int', default: 0 })
  dso: number;

  @Column({ type: 'int', default: 0 })
  averageDaysDelayed: number;

  @Column({ length: 30, default: 'active' })
  accountStatus: string;

  @Column({ length: 20, default: 'low' })
  riskRating: string;

  @Column({ length: 100, nullable: true })
  collectionAgent: string;

  @Column({ length: 20, default: 'medium' })
  collectionPriority: string;

  @Column({ type: 'jsonb', nullable: true })
  agingBuckets: any;

  @Column({ type: 'jsonb', nullable: true })
  invoices: any;

  @Column({ type: 'jsonb', nullable: true })
  collectionActivities: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentHistory: any;

  @Column({ type: 'jsonb', nullable: true })
  customerContact: any;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  @Column({ type: 'date', nullable: true })
  customerSince: Date;

  @Column({ type: 'date', nullable: true })
  lastSaleDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
