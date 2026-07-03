import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  carrier: string;

  @Column({ type: 'varchar', default: 'standard' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  deliveryDays: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  baseRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  perKgRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minWeight: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  maxWeight: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  freeShippingThreshold: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  zones: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  applicableProducts: string[];

  @Column({ type: 'boolean', default: false })
  insuranceIncluded: boolean;

  @Column({ type: 'boolean', default: true })
  trackingAvailable: boolean;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
