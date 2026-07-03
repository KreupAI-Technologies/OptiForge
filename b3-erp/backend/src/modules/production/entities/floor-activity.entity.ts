import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/floor.
@Entity('production_floor_activities')
export class FloorActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'activity_id', type: 'varchar', nullable: true })
  activityId: string | null;

  @Column({ name: 'work_center', type: 'varchar', nullable: true })
  workCenter: string | null;

  @Column({ name: 'operator_name', type: 'varchar', nullable: true })
  operatorName: string | null;

  @Column({ name: 'employee_id', type: 'varchar', nullable: true })
  employeeId: string | null;

  @Column({ name: 'work_order_id', type: 'varchar', nullable: true })
  workOrderId: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'product_code', type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  operation: string | null;

  @Column({ name: 'start_time', type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ name: 'duration_minutes', type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ name: 'output_qty', type: 'int', default: 0 })
  outputQty: number;

  @Column({ name: 'target_qty', type: 'int', default: 0 })
  targetQty: number;

  @Column({ name: 'efficiency_percent', type: 'numeric', precision: 6, scale: 2, default: 0 })
  efficiencyPercent: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shift: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
