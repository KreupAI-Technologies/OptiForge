import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProductionLineConfigStatus = 'operational' | 'idle' | 'maintenance' | 'offline';

// Net-new orphan settings entity backing /production/line-configs.
// Additive only — distinct table, does not touch the existing `production_lines` table.
@Entity('production_line_configs')
export class ProductionLineConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ name: 'line_type', type: 'varchar', nullable: true })
  lineType: string | null;

  @Column({ name: 'work_centers', type: 'int', default: 0 })
  workCenters: number;

  @Column({ type: 'int', default: 0 })
  operators: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  capacity: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  utilization: number;

  @Column({ type: 'varchar', length: 20, default: 'operational' })
  status: ProductionLineConfigStatus;

  @Column({ name: 'shift_schedule', type: 'varchar', nullable: true })
  shiftSchedule: string | null;

  @Column({ type: 'varchar', nullable: true })
  supervisor: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
