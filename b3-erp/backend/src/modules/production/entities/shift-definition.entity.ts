import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ShiftDefinitionType = 'day' | 'evening' | 'night';
export type ShiftDefinitionStatus = 'active' | 'inactive' | 'scheduled';

// Net-new orphan settings entity backing /production/shift-definitions.
// Additive only — distinct table, does not touch the existing `shifts` table.
@Entity('production_shift_definitions')
export class ShiftDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ name: 'shift_type', type: 'varchar', length: 20, default: 'day' })
  shiftType: ShiftDefinitionType;

  @Column({ name: 'start_time', type: 'varchar', length: 10, nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'varchar', length: 10, nullable: true })
  endTime: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 8 })
  duration: number;

  @Column({ name: 'break_time', type: 'int', default: 0 })
  breakTime: number;

  @Column({ name: 'working_days', type: 'jsonb', nullable: true })
  workingDays: string[] | null;

  @Column({ name: 'effective_from', type: 'varchar', nullable: true })
  effectiveFrom: string | null;

  @Column({ name: 'effective_to', type: 'varchar', nullable: true })
  effectiveTo: string | null;

  @Column({ name: 'assigned_workers', type: 'int', default: 0 })
  assignedWorkers: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: ShiftDefinitionStatus;

  @Column({ name: 'allow_overtime_after', type: 'decimal', precision: 6, scale: 2, default: 8 })
  allowOvertimeAfter: number;

  @Column({ name: 'shift_premium', type: 'decimal', precision: 8, scale: 2, default: 0 })
  shiftPremium: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
