import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new entity backing operator shift/attendance records raised from the
// /production/shopfloor terminal (start-shift / end-shift with production summary).
@Entity('production_shopfloor_attendance')
export class ShopFloorAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operator_id', type: 'varchar', nullable: true })
  operatorId: string | null;

  @Column({ name: 'operator_name', type: 'varchar', nullable: true })
  operatorName: string | null;

  @Column({ name: 'employee_code', type: 'varchar', nullable: true })
  employeeCode: string | null;

  @Column({ name: 'work_center_id', type: 'varchar', nullable: true })
  workCenterId: string | null;

  @Column({ name: 'work_center_name', type: 'varchar', nullable: true })
  workCenterName: string | null;

  @Column({ type: 'varchar', nullable: true })
  shift: string | null;

  @Column({ name: 'shift_date', type: 'varchar', nullable: true })
  shiftDate: string | null;

  @Column({ name: 'clock_in', type: 'timestamptz', nullable: true })
  clockIn: Date | null;

  @Column({ name: 'clock_out', type: 'timestamptz', nullable: true })
  clockOut: Date | null;

  @Column({ name: 'total_produced', type: 'numeric', precision: 15, scale: 4, default: 0 })
  totalProduced: number;

  @Column({ name: 'total_rejected', type: 'numeric', precision: 15, scale: 4, default: 0 })
  totalRejected: number;

  @Column({ name: 'total_rework', type: 'numeric', precision: 15, scale: 4, default: 0 })
  totalRework: number;

  @Column({ name: 'downtime_minutes', type: 'int', default: 0 })
  downtimeMinutes: number;

  // 'open' while shift is in progress, 'closed' once ended.
  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
