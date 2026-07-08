import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Pricing version-control records — backs the advanced-features
// "Pricing Version Control" tab.
@Entity('cpq_pricing_versions')
@Index('IDX_cpq_pricing_versions_company', ['companyId'])
export class CPQPricingVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  version: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // draft | active | scheduled | archived | superseded
  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  // price_increase | price_decrease | new_product | discontinued | restructure
  @Column({ type: 'varchar', default: 'price_increase' })
  changeType: string;

  @Column({ type: 'json', nullable: true })
  changes: {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
    reason?: string;
  }[];

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  avgPriceChange: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Approval-matrix rules — backs the advanced-features "Approval Matrix" tab.
@Entity('cpq_approval_matrix')
@Index('IDX_cpq_approval_matrix_company', ['companyId'])
export class CPQApprovalMatrixRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Condition that triggers this approval rule.
  @Column({ type: 'json', nullable: true })
  condition: {
    type: string; // deal_value | discount_percent | margin_percent | custom_field
    operator: string; // greater_than | less_than | equals | between
    value: number | [number, number];
  };

  @Column({ type: 'json', nullable: true })
  requiredApprovers: {
    role: string;
    count: number;
  }[];

  // low | medium | high | critical
  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'int', nullable: true })
  autoEscalateAfterHours: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
