import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('procurement_vendor_scorecards')
@Index(['companyId', 'status'])
export class VendorScorecard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorCode: string;

  @Column({ type: 'varchar', length: 255 })
  vendorName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  costScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceScore: number;

  // A | B | C | D or Strategic | Preferred | Approved | Conditional
  @Column({ type: 'varchar', length: 30, nullable: true })
  tier: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  // low | medium | high | critical
  @Column({ type: 'varchar', length: 20, default: 'low' })
  riskLevel: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpend: number;

  @Column({ type: 'integer', default: 0 })
  totalOrders: number;

  @Column({ type: 'date', nullable: true })
  lastEvaluated: Date;

  // active | inactive
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
