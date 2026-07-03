import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crm_pricing_rules')
export class CrmPricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'volume' })
  ruleType: string;

  @Column({ type: 'varchar', default: 'percentage' })
  discountType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountValue: number;

  @Column({ type: 'simple-array', nullable: true })
  conditions: string[];

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: true })
  applicableProducts: string[];

  @Column({ type: 'simple-array', nullable: true })
  applicableCustomers: string[];

  @Column({ type: 'varchar', nullable: true })
  validFrom: string;

  @Column({ type: 'varchar', nullable: true })
  validUntil: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSavings: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
