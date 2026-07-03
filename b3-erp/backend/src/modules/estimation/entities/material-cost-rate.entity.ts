import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_material_cost_rates')
@Index(['companyId', 'category'])
export class MaterialCostRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  materialCode: string;

  @Column({ type: 'varchar', length: 255 })
  materialName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 20, default: 'unit' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previousPrice: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  variancePercent: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'date', nullable: true })
  lastUpdated: Date;

  // active | inactive
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
