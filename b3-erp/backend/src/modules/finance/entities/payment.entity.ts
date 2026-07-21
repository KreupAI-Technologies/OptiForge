import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentType {
  RECEIPT = 'Receipt',
  PAYMENT = 'Payment',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CHEQUE = 'Cheque',
  BANK_TRANSFER = 'Bank Transfer',
  UPI = 'UPI',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS',
  DD = 'Demand Draft',
  OTHER = 'Other',
}

export enum PaymentStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  PROCESSED = 'Processed',
  RECONCILED = 'Reconciled',
  BOUNCED = 'Bounced',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
  FAILED = 'Failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  paymentNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({ type: 'date' })
  paymentDate: Date;

  // Party information
  @Column()
  partyId: string;

  @Column({ length: 255 })
  partyName: string;

  @Column({ length: 50 })
  partyType: string; // Customer, Vendor, Employee

  // Payment details
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'INR', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Bank details
  @Column({ type: 'varchar', nullable: true })
  bankAccountId: string;

  @Column({ nullable: true, length: 100 })
  bankName: string;

  @Column({ nullable: true, length: 100 })
  chequeNumber: string;

  @Column({ type: 'date', nullable: true })
  chequeDate: Date;

  @Column({ nullable: true, length: 100 })
  transactionReference: string;

  // Status
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.DRAFT,
  })
  status: PaymentStatus;

  // Invoice allocation
  @Column({ type: 'json', nullable: true })
  invoiceAllocations: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceAmount: number;
    allocatedAmount: number;
  }[];

  // Posting to GL
  @Column({ default: false })
  isPosted: boolean;

  @Column({ type: 'varchar', nullable: true })
  journalEntryId: string;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  postedBy: string;

  // Reconciliation
  @Column({ default: false })
  isReconciled: boolean;

  @Column({ type: 'date', nullable: true })
  reconciledDate: Date;

  @Column({ type: 'varchar', nullable: true })
  reconciledBy: string;

  // Bounced payment
  @Column({ default: false })
  isBounced: boolean;

  @Column({ type: 'date', nullable: true })
  bouncedDate: Date;

  @Column({ type: 'text', nullable: true })
  bounceReason: string;

  // Refund
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ type: 'date', nullable: true })
  refundDate: Date;

  @Column({ type: 'varchar', nullable: true })
  refundReason: string;

  // Failure
  @Column({ type: 'varchar', nullable: true })
  failureReason: string;

  // TDS (Tax Deducted at Source)
  @Column({ default: false })
  hasTDS: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tdsAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tdsRate: number;

  @Column({ nullable: true, length: 100 })
  tdsSection: string;

  // Reference
  @Column({ nullable: true, length: 100 })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];

  // Approval
  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
