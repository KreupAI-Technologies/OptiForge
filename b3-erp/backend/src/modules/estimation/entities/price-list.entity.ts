import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_price_lists')
export class PriceList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar' })
  priceListName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'USD' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  effectiveFrom: string;

  @Column({ type: 'date', nullable: true })
  effectiveTo: string;

  // active | inactive | draft | expired
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  // standard | promotional | bulk | custom
  @Column({ type: 'varchar', default: 'standard' })
  priceType: string;

  @Column({ type: 'varchar', nullable: true })
  customerSegment: string;

  @Column({ type: 'date', nullable: true })
  lastUpdated: string;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageMargin: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
