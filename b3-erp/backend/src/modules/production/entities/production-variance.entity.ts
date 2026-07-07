import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type VarianceCategory = 'cost' | 'schedule' | 'quantity' | 'quality';
export type VarianceStatus =
  | 'favorable'
  | 'unfavorable'
  | 'critical'
  | 'on-time'
  | 'delayed'
  | 'early'
  | 'acceptable'
  | 'warning';

/**
 * Production variance analysis — planned vs actual across cost, schedule,
 * quantity and quality dimensions. Backs /production/analytics/variance.
 */
@Entity('production_variances')
@Index(['companyId', 'category'])
export class ProductionVariance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', length: 20 })
  category: VarianceCategory;

  @Column({ type: 'varchar', nullable: true })
  workOrder: string;

  @Column({ type: 'varchar', nullable: true })
  product: string;

  @Column({ type: 'varchar', nullable: true })
  subCategory: string;

  // Planned vs actual (generic — meaning depends on category)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  plannedValue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  actualValue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  variance: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  variancePercent: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  impactCost: number;

  @Column({ type: 'varchar', length: 20, default: 'unfavorable' })
  status: VarianceStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  recordDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
