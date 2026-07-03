import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estimation_labor_cost_rates')
@Index(['companyId', 'department'])
export class LaborCostRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  skill: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  level: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  standardRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overtimeRate: number;

  @Column({ type: 'varchar', length: 20, default: 'hour' })
  unit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilization: number;

  // active | inactive
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
