import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ApVendorAccount — Accounts Payable master record for a single vendor.
 *
 * Additive table (finance_ap_vendor_account) backing the
 * finance/payables view + edit pages. Nested collections (aging buckets,
 * bills, payment schedule, payment history, contact) are stored as JSONB so
 * the whole payable can be persisted/retrieved in one shape.
 */
@Entity('finance_ap_vendor_account')
export class ApVendorAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  vendorId: string;

  @Column({ length: 255 })
  vendorName: string;

  @Column({ length: 100, nullable: true })
  vendorCode: string;

  @Column({ length: 50, nullable: true })
  gstNumber: string;

  @Column({ length: 50, nullable: true })
  panNumber: string;

  @Column({ length: 50, nullable: true })
  vendorCategory: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOutstanding: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  overdueAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dueThisWeek: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dueThisMonth: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lastPaymentAmount: number;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'int', default: 0 })
  creditPeriod: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentTerms: string;

  @Column({ length: 30, default: 'active' })
  accountStatus: string;

  @Column({ length: 20, default: 'low' })
  riskRating: string;

  @Column({ type: 'jsonb', nullable: true })
  agingBuckets: any;

  @Column({ type: 'jsonb', nullable: true })
  bills: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentSchedule: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentHistory: any;

  @Column({ type: 'jsonb', nullable: true })
  vendorContact: any;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  @Column({ type: 'date', nullable: true })
  vendorSince: Date;

  @Column({ type: 'date', nullable: true })
  lastPurchaseDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
