import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan entity backing /production/shopfloor/machine-timeline.
// One row per machine, with its timeline events embedded as jsonb.
@Entity('production_machine_timelines')
export class MachineTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'machine_code', type: 'varchar', nullable: true })
  machineCode: string | null;

  @Column({ name: 'machine_name', type: 'varchar', nullable: true })
  machineName: string | null;

  @Column({ name: 'machine_type', type: 'varchar', nullable: true })
  machineType: string | null;

  @Column({ type: 'varchar', length: 20, default: 'idle' })
  status: string;

  @Column({ name: 'current_shift', type: 'varchar', length: 30, nullable: true })
  currentShift: string | null;

  @Column({ type: 'int', default: 0 })
  utilization: number;

  @Column({ type: 'jsonb', nullable: true })
  events: any[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
