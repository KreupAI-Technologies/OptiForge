import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sales_tax_rates')
export class TaxRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'GST' })
  taxType: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  cgstRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sgstRate: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  igstRate: number;

  @Column({ type: 'varchar', nullable: true })
  hsnCode: string;

  @Column({ type: 'varchar', nullable: true })
  sacCode: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  applicableProducts: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
