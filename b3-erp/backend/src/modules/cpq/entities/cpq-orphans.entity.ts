import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Additive entities backing previously mock-only CPQ pages.
 *
 * Every table here is created with CREATE TABLE IF NOT EXISTS (see
 * prisma/manual/orphan_cpq.sql) and never modifies existing CPQ tables.
 * Column names match the property names exactly (TypeORM default naming).
 */

/**
 * Product configuration rules — backs cpq/products/rules.
 * (Distinct from the existing ConfigurationRule product-config entity; this
 * stores the simplified rules-list shape the page renders.)
 */
@Entity('cpq_config_rules')
@Index(['companyId', 'type'])
export class CPQConfigRuleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['compatibility', 'dependency', 'constraint', 'pricing'],
    default: 'compatibility',
  })
  type: 'compatibility' | 'dependency' | 'constraint' | 'pricing';

  @Column({ type: 'text', nullable: true })
  condition: string | null;

  @Column({ type: 'text', nullable: true })
  action: string | null;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @Column({ type: 'int', default: 0 })
  affectedProducts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Product compatibility matrix entries — backs cpq/products/compatibility.
 */
@Entity('cpq_compatibility_entries')
@Index(['companyId'])
export class CPQCompatibilityEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  product1: string;

  @Column()
  product2: string;

  @Column({ type: 'boolean', default: true })
  compatible: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: ['critical', 'warning', 'info'],
    nullable: true,
  })
  severity: 'critical' | 'warning' | 'info' | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Cross-sell opportunity rules — backs cpq/guided-selling/cross-sell.
 * The nested primary/suggested product objects are stored as JSON.
 */
@Entity('cpq_cross_sell_rules')
@Index(['companyId'])
export class CPQCrossSellRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'json', nullable: true })
  primaryProduct: {
    code?: string;
    name?: string;
    category?: string;
    value?: number;
  } | null;

  @Column({ type: 'json', nullable: true })
  suggestedProduct: {
    code?: string;
    name?: string;
    category?: string;
    value?: number;
  } | null;

  @Column({
    type: 'enum',
    enum: ['complement', 'essential', 'upgrade', 'bundle'],
    default: 'complement',
  })
  relationship: 'complement' | 'essential' | 'upgrade' | 'bundle';

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  coOccurrenceRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  avgAdditionalRevenue: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'int', default: 0 })
  customersCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOpportunityValue: number;

  @Column({
    type: 'enum',
    enum: ['strong', 'medium', 'weak'],
    default: 'medium',
  })
  recommendationStrength: 'strong' | 'medium' | 'weak';

  @Column({ type: 'int', default: 0 })
  activeCampaigns: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * AI / rule-based product recommendations — backs
 * cpq/guided-selling/recommendations.
 */
@Entity('cpq_recommendations')
@Index(['companyId', 'customerId'])
export class CPQRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  customerName: string | null;

  @Column({ type: 'varchar', nullable: true })
  segment: string | null;

  @Column({ type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({
    type: 'enum',
    enum: [
      'best-match',
      'upgrade',
      'alternative',
      'frequently-bought',
      'trending',
    ],
    default: 'best-match',
  })
  recommendationType:
    | 'best-match'
    | 'upgrade'
    | 'alternative'
    | 'frequently-bought'
    | 'trending';

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  confidenceScore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedValue: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'text', nullable: true })
  basedOn: string | null;

  @Column({
    type: 'enum',
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  })
  priority: 'high' | 'medium' | 'low';

  @Column({ type: 'boolean', default: false })
  aiGenerated: boolean;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  acceptanceRate: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Generic reference code lists (branch codes, category codes) — backs
 * cpq/settings/numbering.
 */
@Entity('cpq_code_lists')
@Index(['companyId', 'listType'])
export class CPQCodeListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({
    type: 'enum',
    enum: ['branch', 'category'],
    default: 'branch',
  })
  listType: 'branch' | 'category';

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Integration sync log entries — backs cpq/integration/crm (and reusable by
 * other integration pages via the `system` discriminator).
 */
@Entity('cpq_integration_sync_logs')
@Index(['companyId', 'system'])
export class CPQIntegrationSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ default: 'crm' })
  system: string;

  @Column({ type: 'varchar', nullable: true })
  operation: string | null;

  @Column({ type: 'int', default: 0 })
  records: number;

  @Column({
    type: 'enum',
    enum: ['success', 'error', 'warning'],
    default: 'success',
  })
  status: 'success' | 'error' | 'warning';

  @Column({ type: 'varchar', nullable: true })
  duration: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
