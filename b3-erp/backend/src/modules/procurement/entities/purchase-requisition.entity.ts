import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum PRStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PARTIALLY_ORDERED = 'Partially Ordered',
  FULLY_ORDERED = 'Fully Ordered',
  CANCELLED = 'Cancelled',
}

export enum PRPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum PRType {
  STANDARD = 'Standard',
  EMERGENCY = 'Emergency',
  BLANKET = 'Blanket',
  SERVICE = 'Service',
}

@Entity('purchase_requisitions')
export class PurchaseRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  prNumber: string;

  @Column({ type: 'date' })
  prDate: Date;

  @Column({ type: 'date' })
  requiredByDate: Date;

  @Column({
    type: 'enum',
    enum: PRStatus,
    default: PRStatus.DRAFT,
  })
  status: PRStatus;

  @Column({
    type: 'enum',
    enum: PRPriority,
    default: PRPriority.MEDIUM,
  })
  priority: PRPriority;

  @Column({
    type: 'enum',
    enum: PRType,
    default: PRType.STANDARD,
  })
  prType: PRType;

  // Requester Information
  @Column({ length: 100 })
  requesterId: string;

  @Column({ length: 255 })
  requesterName: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 100, nullable: true })
  costCenter: string;

  @Column({ length: 100, nullable: true })
  project: string;

  // Items
  @Column({ type: 'json' })
  items: {
    lineNumber: number;
    itemId: string;
    itemCode: string;
    itemName: string;
    description: string;
    uom: string;
    quantity: number;
    estimatedUnitPrice: number;
    estimatedTotal: number;
    requiredDate: Date;
    specification: string;
    accountCode: string;
    notes: string;
  }[];

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  // Purpose and Justification
  @Column({ type: 'text' })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

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

  // Approval Info Request
  @Column({ default: false })
  infoRequested: boolean;

  @Column({ nullable: true, length: 100 })
  infoRequestedBy: string;

  @Column({ type: 'text', nullable: true })
  infoRequestMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  infoRequestedAt: Date;

  // Conversion to PO
  @Column({ type: 'json', nullable: true })
  purchaseOrders: {
    poId: string;
    poNumber: string;
    createdAt: Date;
  }[];

  // Budget Information
  @Column({ length: 100, nullable: true })
  budgetCode: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAllocated: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetConsumed: number;

  @Column({ default: false })
  isBudgetAvailable: boolean;

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
