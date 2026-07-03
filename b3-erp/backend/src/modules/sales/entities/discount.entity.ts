import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'percentage' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'int', default: 0 })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minOrderValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  applicableProducts: string[];

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validTo: Date;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'int', nullable: true })
  usageLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
