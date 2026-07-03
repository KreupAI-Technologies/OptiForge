import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_overhead_costs')
@Index(['companyId', 'category'])
export class OverheadCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  // fixed | variable | semi-variable
  @Column({ type: 'varchar', length: 50, default: 'fixed' })
  costType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  monthlyAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  annualAmount: number;

  // percentage | per-unit | direct
  @Column({ type: 'varchar', length: 50, default: 'percentage' })
  allocationMethod: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  allocationRate: number;

  // active | inactive
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
