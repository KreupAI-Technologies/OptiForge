import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan list entity backing /production/scheduling.
// Represents a single production schedule line (one work-order slot on a work center).
@Entity('production_schedule_lines')
export class ScheduleLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schedule_code', type: 'varchar', nullable: true })
  scheduleCode: string | null;

  @Column({ name: 'work_order_id', type: 'varchar', nullable: true })
  workOrderId: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'product_code', type: 'varchar', nullable: true })
  productCode: string | null;

  @Column({ name: 'work_center', type: 'varchar', nullable: true })
  workCenter: string | null;

  @Column({ name: 'planned_start', type: 'varchar', nullable: true })
  plannedStart: string | null;

  @Column({ name: 'planned_end', type: 'varchar', nullable: true })
  plannedEnd: string | null;

  @Column({ name: 'actual_start', type: 'varchar', nullable: true })
  actualStart: string | null;

  @Column({ name: 'actual_end', type: 'varchar', nullable: true })
  actualEnd: string | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string | null;

  // Sequence within a work center after a level-load / optimize pass.
  @Column({ name: 'sequence_no', type: 'int', nullable: true })
  sequenceNo: number | null;

  // Set when a batch of schedule lines is published.
  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
