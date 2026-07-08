import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

export enum GRNStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  QUALITY_CHECK_PENDING = 'Quality Check Pending',
  QUALITY_CHECK_PASSED = 'Quality Check Passed',
  QUALITY_CHECK_FAILED = 'Quality Check Failed',
  PARTIALLY_ACCEPTED = 'Partially Accepted',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  POSTED = 'Posted',
  CANCELLED = 'Cancelled',
}

export enum GRNType {
  AGAINST_PO = 'Against PO',
  WITHOUT_PO = 'Without PO',
  RETURN_FROM_PRODUCTION = 'Return From Production',
  SAMPLE = 'Sample',
  FREE_OF_COST = 'Free of Cost',
}

@Entity('goods_receipts')
export class GoodsReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  grnNumber: string;

  @Column({ type: 'date' })
  grnDate: Date;

  @Column({ type: 'timestamp' })
  receiptDateTime: Date;

  @Column({
    type: 'enum',
    enum: GRNStatus,
    default: GRNStatus.DRAFT,
  })
  status: GRNStatus;

  @Column({
    type: 'enum',
    enum: GRNType,
    default: GRNType.AGAINST_PO,
  })
  grnType: GRNType;

  // Purchase Order Reference
  @Column({ type: 'varchar', nullable: true })
  purchaseOrderId: string;

  @Column({ length: 50, nullable: true })
  purchaseOrderNumber: string;

  @Column({ type: 'date', nullable: true })
  purchaseOrderDate: Date;

  // Vendor Information
  @Column()
  vendorId: string;

  @Column({ length: 255 })
  vendorName: string;

  @Column({ length: 50 })
  vendorCode: string;

  @Column({ type: 'text', nullable: true })
  vendorAddress: string;

  // Delivery Information
  @Column({ length: 100, nullable: true })
  deliveryNoteNumber: string;

  @Column({ type: 'date', nullable: true })
  deliveryNoteDate: Date;

  @Column({ length: 100, nullable: true })
  vehicleNumber: string;

  @Column({ length: 100, nullable: true })
  driverName: string;

  @Column({ length: 50, nullable: true })
  driverPhone: string;

  @Column({ length: 100, nullable: true })
  transporterName: string;

  @Column({ length: 100, nullable: true })
  lrNumber: string;

  @Column({ type: 'date', nullable: true })
  lrDate: Date;

  @Column({ length: 100, nullable: true })
  eWayBillNumber: string;

  // Receipt Location
  @Column({ length: 100 })
  warehouseId: string;

  @Column({ length: 255 })
  warehouseName: string;

  @Column({ length: 100, nullable: true })
  receivingLocation: string;

  @Column({ type: 'text', nullable: true })
  receivingAddress: string;

  // Inspector Information
  @Column({ length: 100 })
  receivedBy: string;

  @Column({ length: 255 })
  receivedByName: string;

  @Column({ length: 100, nullable: true })
  inspectedBy: string;

  @Column({ length: 255, nullable: true })
  inspectedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  inspectionDateTime: Date;

  // Financial Information
  @Column({ default: 'INR', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOrderedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalReceivedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAcceptedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRejectedAmount: number;

  // Quality Check
  @Column({ default: false })
  requiresQualityCheck: boolean;

  @Column({ default: false })
  qualityCheckCompleted: boolean;

  @Column({ default: false })
  qualityCheckPassed: boolean;

  @Column({ type: 'text', nullable: true })
  qualityCheckRemarks: string;

  @Column({ type: 'json', nullable: true })
  qualityCheckResults: {
    parameter: string;
    standard: string;
    result: string;
    status: string;
    remarks: string;
  }[];

  // Inventory Posting
  @Column({ default: false })
  isPostedToInventory: boolean;

  @Column({ type: 'timestamp', nullable: true })
  inventoryPostedAt: Date;

  @Column({ nullable: true, length: 100 })
  inventoryPostedBy: string;

  @Column({ type: 'json', nullable: true })
  inventoryTransactions: {
    transactionId: string;
    transactionNumber: string;
    itemId: string;
    quantity: number;
    postedAt: Date;
  }[];

  // Accounting Posting
  @Column({ default: false })
  isPostedToAccounting: boolean;

  @Column({ type: 'timestamp', nullable: true })
  accountingPostedAt: Date;

  @Column({ nullable: true, length: 100 })
  accountingPostedBy: string;

  @Column({ type: 'varchar', nullable: true })
  journalEntryId: string;

  @Column({ length: 50, nullable: true })
  journalEntryNumber: string;

  // Invoice Matching
  @Column({ default: false })
  isInvoiceMatched: boolean;

  @Column({ type: 'varchar', nullable: true })
  matchedInvoiceId: string;

  @Column({ length: 50, nullable: true })
  matchedInvoiceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  invoiceMatchedAt: Date;

  @Column({ nullable: true, length: 100 })
  invoiceMatchedBy: string;

  @Column({ type: 'text', nullable: true })
  invoiceMatchNotes: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

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
  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt, {
    cascade: true,
  })
  items: GoodsReceiptItem[];

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
