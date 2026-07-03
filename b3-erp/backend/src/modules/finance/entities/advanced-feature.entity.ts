import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * AdvancedFeature — registry of enterprise finance feature toggles that back
 * the finance/advanced-features page tabs (general ledger, consolidation,
 * audit trail, compliance, treasury, cash forecasting, controls).
 *
 * Additive table (finance_advanced_features). Settings/masters record — one
 * row per feature module, with an enabled flag and display metadata.
 */
@Entity('finance_advanced_features')
export class AdvancedFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default' })
  companyId: string;

  @Column({ name: 'feature_key', type: 'varchar', length: 100 })
  featureKey: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
