import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_price_list_items')
export class PriceListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  productCode: string;

  @Column()
  productName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'varchar', default: 'piece' })
  unit: string;

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  priceChange: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  priceChangePercent: number;

  @Column({ type: 'int', default: 0 })
  moq: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
