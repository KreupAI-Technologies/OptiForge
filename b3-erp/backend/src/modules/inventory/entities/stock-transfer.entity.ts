import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum TransferType {
  WAREHOUSE_TO_WAREHOUSE = 'Warehouse to Warehouse',
  LOCATION_TO_LOCATION = 'Location to Location',
  BRANCH_TRANSFER = 'Branch Transfer',
  CONSIGNMENT = 'Consignment',
  SALES_RETURN = 'Sales Return',
  CUSTOMER_TO_WAREHOUSE = 'Customer to Warehouse',
}

export enum TransferStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  IN_TRANSIT = 'In Transit',
  PARTIALLY_RECEIVED = 'Partially Received',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected',
}

@Entity('stock_transfers')
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  transferNumber: string;

  @Column({
    type: 'enum',
    enum: TransferType,
  })
  transferType: TransferType;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.DRAFT,
  })
  status: TransferStatus;

  @Column({ type: 'date' })
  transferDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedReceiptDate: Date;

  @Column({ type: 'date', nullable: true })
  actualReceiptDate: Date;

  // Source details
  @Column()
  fromWarehouseId: string;

  @Column({ length: 255 })
  fromWarehouseName: string;

  @Column({ type: 'varchar', nullable: true })
  fromLocationId: string;

  @Column({ length: 255, nullable: true })
  fromLocationName: string;

  // Destination details
  @Column()
  toWarehouseId: string;

  @Column({ length: 255 })
  toWarehouseName: string;

  @Column({ type: 'varchar', nullable: true })
  toLocationId: string;

  @Column({ length: 255, nullable: true })
  toLocationName: string;

  // Branch/Company details for inter-branch transfers
  @Column({ type: 'varchar', nullable: true })
  fromBranchId: string;

  @Column({ length: 255, nullable: true })
  fromBranchName: string;

  @Column({ type: 'varchar', nullable: true })
  toBranchId: string;

  @Column({ length: 255, nullable: true })
  toBranchName: string;

  // Reference
  @Column({ nullable: true, length: 100 })
  referenceType: string; // Sales Order, Work Order, etc.

  @Column({ type: 'varchar', nullable: true })
  referenceId: string;

  @Column({ nullable: true, length: 100 })
  referenceNumber: string;

  // Initiated by
  @Column({ type: 'varchar', nullable: true })
  requestedBy: string;

  @Column({ length: 100, nullable: true })
  requestedByName: string;

  // Approval workflow
  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ length: 100, nullable: true })
  approvedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Dispatch details
  @Column({ type: 'timestamp', nullable: true })
  dispatchedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  dispatchedBy: string;

  @Column({ length: 100, nullable: true })
  dispatchedByName: string;

  @Column({ type: 'varchar', nullable: true })
  dispatchStockEntryId: string; // Stock entry for dispatch

  // Receipt details
  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  receivedBy: string;

  @Column({ length: 100, nullable: true })
  receivedByName: string;

  @Column({ type: 'varchar', nullable: true })
  receiptStockEntryId: string; // Stock entry for receipt

  // Transport details
  @Column({ length: 100, nullable: true })
  transportMode: string; // Road, Rail, Air, Sea

  @Column({ length: 100, nullable: true })
  transporterName: string;

  @Column({ length: 100, nullable: true })
  vehicleNumber: string;

  @Column({ length: 100, nullable: true })
  driverName: string;

  @Column({ length: 20, nullable: true })
  driverPhone: string;

  @Column({ length: 100, nullable: true })
  lrNumber: string; // Lorry Receipt Number

  @Column({ type: 'date', nullable: true })
  lrDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  freightCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  otherCharges: number;

  @Column({ default: 'INR', length: 3 })
  currency: string;

  // Valuation
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  // Quality inspection
  @Column({ default: false })
  requiresInspection: boolean;

  @Column({ type: 'varchar', nullable: true })
  inspectionId: string;

  @Column({ length: 50, nullable: true })
  inspectionStatus: string;

  // Cancellation
  @Column({ type: 'varchar', nullable: true })
  cancelledBy: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Rejection (approval workflow)
  @Column({ type: 'varchar', nullable: true })
  rejectedBy: string;

  @Column({ length: 100, nullable: true })
  rejectedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Project/Cost Center
  @Column({ type: 'varchar', nullable: true })
  projectId: string;

  @Column({ length: 255, nullable: true })
  projectName: string;

  @Column({ type: 'varchar', nullable: true })
  costCenterId: string;

  @Column({ length: 255, nullable: true })
  costCenterName: string;

  // Additional information
  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];

  @Column({ nullable: true, length: 100 })
  createdBy: string;

  @Column({ nullable: true, length: 100 })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StockTransferLine, (line) => line.stockTransfer, {
    cascade: true,
  })
  lines: StockTransferLine[];
}

@Entity('stock_transfer_lines')
export class StockTransferLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stockTransferId: string;

  @ManyToOne(() => StockTransfer, (transfer) => transfer.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stockTransferId' })
  stockTransfer: StockTransfer;

  @Column({ type: 'int' })
  lineNumber: number;

  // Item details
  @Column()
  itemId: string;

  @Column({ length: 100 })
  itemCode: string;

  @Column({ length: 255 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Quantity
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  requestedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  dispatchedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  receivedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  acceptedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  rejectedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  shortageQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  damageQuantity: number;

  @Column({ length: 50 })
  uom: string;

  // Batch and Serial
  @Column({ type: 'varchar', nullable: true })
  batchId: string;

  @Column({ length: 100, nullable: true })
  batchNumber: string;

  @Column({ type: 'varchar', nullable: true })
  serialNumberId: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  // Valuation
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  // Location details
  @Column({ type: 'varchar', nullable: true })
  fromLocationId: string;

  @Column({ length: 255, nullable: true })
  fromLocationName: string;

  @Column({ type: 'varchar', nullable: true })
  toLocationId: string;

  @Column({ length: 255, nullable: true })
  toLocationName: string;

  // Quality
  @Column({ length: 50, nullable: true })
  qualityStatus: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
