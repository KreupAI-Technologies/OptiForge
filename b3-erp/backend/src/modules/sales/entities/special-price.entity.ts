import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_special_prices')
export class SpecialPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  customerName: string;

  @Column({ type: 'varchar', default: 'dealer' })
  customerType: string;

  @Column({ type: 'varchar', nullable: true })
  productCode: string;

  @Column({ type: 'varchar', nullable: true })
  productName: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  standardPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  specialPrice: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'int', default: 0 })
  minOrderQty: number;

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validTo: Date;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', nullable: true })
  contractRef: string;

  @Column({ type: 'int', default: 0 })
  orderCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
