import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum POStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  IN_PROGRESS = 'In Progress',
  PARTIALLY_RECEIVED = 'Partially Received',
  FULLY_RECEIVED = 'Fully Received',
  CLOSED = 'Closed',
  CANCELLED = 'Cancelled',
}

export enum POType {
  STANDARD = 'Standard',
  BLANKET = 'Blanket',
  CONTRACT = 'Contract',
  PLANNED = 'Planned',
  SERVICE = 'Service',
}

export enum PaymentTerms {
  IMMEDIATE = 'Immediate',
  NET_15 = 'Net 15',
  NET_30 = 'Net 30',
  NET_45 = 'Net 45',
  NET_60 = 'Net 60',
  NET_90 = 'Net 90',
  COD = 'COD',
  ADVANCE = 'Advance',
  CUSTOM = 'Custom',
}

export enum DeliveryTerms {
  EXW = 'EXW',
  FOB = 'FOB',
  CIF = 'CIF',
  CIP = 'CIP',
  DAP = 'DAP',
  DDP = 'DDP',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  poNumber: string;

  @Column({ type: 'date' })
  poDate: Date;

  @Column({ type: 'date' })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Column({
    type: 'enum',
    enum: POType,
    default: POType.STANDARD,
  })
  poType: POType;

  // Reference Information
  @Column({ length: 50, nullable: true })
  prNumber: string;

  @Column({ type: 'varchar', nullable: true })
  prId: string;

  @Column({ length: 50, nullable: true })
  rfqNumber: string;

  @Column({ type: 'varchar', nullable: true })
  rfqId: string;

  @Column({ length: 50, nullable: true })
  quotationNumber: string;

  @Column({ type: 'varchar', nullable: true })
  quotationId: string;

  // Vendor Information
  @Column()
  vendorId: string;

  @Column({ length: 255 })
  vendorName: string;

  @Column({ length: 50, nullable: true })
  vendorCode: string;

  @Column({ type: 'text', nullable: true })
  vendorAddress: string;

  @Column({ length: 100, nullable: true })
  vendorContactPerson: string;

  @Column({ length: 100, nullable: true })
  vendorPhone: string;

  @Column({ length: 100, nullable: true })
  vendorEmail: string;

  // Delivery Information
  @Column({ type: 'text' })
  deliveryAddress: string;

  @Column({ length: 100, nullable: true })
  deliveryLocation: string;

  @Column({ length: 100, nullable: true })
  deliveryContactPerson: string;

  @Column({ length: 50, nullable: true })
  deliveryContactPhone: string;

  @Column({
    type: 'enum',
    enum: DeliveryTerms,
    default: DeliveryTerms.FOB,
  })
  deliveryTerms: DeliveryTerms;

  @Column({ length: 100, nullable: true })
  shippingMethod: string;

  // Financial Information
  @Column({ default: 'INR', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @Column({ length: 255, nullable: true })
  paymentTermsDescription: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  advanceAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceAmount: number;

  // Buyer Information
  @Column({ length: 100 })
  buyerId: string;

  @Column({ length: 255 })
  buyerName: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 100, nullable: true })
  costCenter: string;

  @Column({ length: 100, nullable: true })
  project: string;

  // Approval Workflow
  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true, length: 100 })
  approvedBy: string;

  @Column({ nullable: true, length: 255 })
  approverName: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ nullable: true, length: 100 })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Approval Delegation
  @Column({ nullable: true, length: 100 })
  delegatedTo: string;

  @Column({ nullable: true, length: 100 })
  delegatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  delegatedAt: Date;

  @Column({ type: 'text', nullable: true })
  delegationNotes: string;

  // Approval Info Request
  @Column({ default: false })
  infoRequested: boolean;

  @Column({ nullable: true, length: 100 })
  infoRequestedBy: string;

  @Column({ type: 'text', nullable: true })
  infoRequestMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  infoRequestedAt: Date;

  // Amendment History
  @Column({ type: 'int', default: 0 })
  amendmentNumber: number;

  @Column({ type: 'json', nullable: true })
  amendmentHistory: {
    amendmentNumber: number;
    amendedBy: string;
    amendedAt: Date;
    reason: string;
    changes: Record<string, any>;
  }[];

  // Receipt Tracking
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  receivedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  receivedPercentage: number;

  @Column({ type: 'json', nullable: true })
  goodsReceipts: {
    grnId: string;
    grnNumber: string;
    receivedDate: Date;
    receivedAmount: number;
  }[];

  // Invoice Tracking
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  invoicedAmount: number;

  @Column({ type: 'json', nullable: true })
  purchaseInvoices: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    invoiceAmount: number;
  }[];

  // Terms and Conditions
  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'text', nullable: true })
  qualityRequirements: string;

  @Column({ type: 'text', nullable: true })
  packingInstructions: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];

  // Relationship
  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItem[];

  // Metadata
  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
