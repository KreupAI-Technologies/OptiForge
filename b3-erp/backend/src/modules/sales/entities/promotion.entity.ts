import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', default: 'seasonal' })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  applicableProducts: string[];

  @Column({ type: 'varchar', default: 'percentage' })
  discountType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountValue: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  targetAudience: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minPurchase: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ type: 'int', default: 0 })
  claimedCount: number;

  @Column({ type: 'int', default: 0 })
  targetCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'varchar', nullable: true })
  bannerImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
