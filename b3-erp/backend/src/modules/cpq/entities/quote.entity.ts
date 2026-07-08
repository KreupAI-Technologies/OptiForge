import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum QuoteStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  SENT = 'Sent to Customer',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  EXPIRED = 'Expired',
  CONVERTED = 'Converted to Order',
  CANCELLED = 'Cancelled',
}

@Entity('cpq_quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  quoteNumber: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', nullable: true })
  parentQuoteId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column()
  customerId: string;

  @Column({ type: 'varchar', nullable: true })
  customerName: string;

  @Column({ type: 'varchar', nullable: true })
  contactId: string;

  @Column({ type: 'varchar', nullable: true })
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  opportunityId: string;

  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.DRAFT,
  })
  status: QuoteStatus;

  @Column({ type: 'date' })
  quoteDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'int', default: 30 })
  validityDays: number;

  // Pricing
  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDiscount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marginAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marginPercentage: number;

  // Addresses
  @Column({ type: 'json', nullable: true })
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'json', nullable: true })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Terms
  @Column({ type: 'text', nullable: true })
  paymentTerms: string;

  @Column({ type: 'text', nullable: true })
  deliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  // Applied Discounts
  @Column({ type: 'json', nullable: true })
  appliedDiscounts: {
    discountId: string;
    discountType: string;
    description: string;
    amount: number;
  }[];

  @Column({ type: 'varchar', nullable: true })
  promoCode: string;

  // Workflow
  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'varchar', nullable: true })
  sentBy: string;

  @Column({ type: 'timestamp', nullable: true })
  customerResponseAt: Date;

  @Column({ type: 'text', nullable: true })
  customerFeedback: string;

  // Conversion
  @Column({ type: 'varchar', nullable: true })
  convertedOrderId: string;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('cpq_quote_items')
export class QuoteItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quoteId: string;

  @ManyToOne(() => Quote)
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;

  @Column({ type: 'int', default: 1 })
  lineNumber: number;

  @Column({ type: 'varchar', nullable: true })
  productId: string;

  @Column({ type: 'varchar', nullable: true })
  configurationId: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 1 })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  listPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  extendedPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marginAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marginPercentage: number;

  @Column({ type: 'json', nullable: true })
  selectedOptions: {
    optionId: string;
    optionName: string;
    value: unknown;
    priceAdjustment: number;
  }[];

  @Column({ type: 'json', nullable: true })
  appliedPricingRules: {
    ruleId: string;
    ruleName: string;
    adjustment: number;
  }[];

  @Column({ type: 'varchar', nullable: true })
  parentItemId: string;

  @Column({ default: false })
  isBundle: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ type: 'date', nullable: true })
  requestedDeliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Quote Templates
@Entity('cpq_quote_templates')
export class QuoteTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ type: 'json', nullable: true })
  defaultItems: {
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    discountPercentage?: number;
  }[];

  @Column({ type: 'text', nullable: true })
  defaultPaymentTerms: string;

  @Column({ type: 'text', nullable: true })
  defaultDeliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  defaultTermsAndConditions: string;

  @Column({ type: 'text', nullable: true })
  headerContent: string;

  @Column({ type: 'text', nullable: true })
  footerContent: string;

  @Column({ type: 'json', nullable: true })
  styling: {
    primaryColor: string;
    logoUrl: string;
    fontFamily: string;
  };

  @Column({ type: 'int', default: 30 })
  defaultValidityDays: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Quote Versions
@Entity('cpq_quote_versions')
export class QuoteVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  quoteId: string;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  @Column({ type: 'json' })
  snapshot: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  itemsSnapshot: Record<string, unknown>[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  previousTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  newTotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  changePercentage: number;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  createdByName: string;

  @CreateDateColumn()
  createdAt: Date;
}
