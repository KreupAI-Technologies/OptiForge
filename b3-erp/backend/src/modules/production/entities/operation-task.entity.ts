import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OperationTaskStatus = 'Queued' | 'In Progress' | 'Completed' | 'On Hold';

// Net-new orphan list entity backing /production/operation-tasks.
// Additive only — distinct table, does not touch the existing `operations` table.
@Entity('production_operation_tasks')
export class OperationTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wo_number', type: 'varchar', nullable: true })
  woNumber: string | null;

  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ name: 'operation_type', type: 'varchar', nullable: true })
  operationType: string | null;

  @Column({ type: 'varchar', nullable: true })
  operator: string | null;

  @Column({ type: 'varchar', nullable: true })
  machine: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Queued' })
  status: OperationTaskStatus;

  @Column({ name: 'start_time', type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'varchar', nullable: true })
  endTime: string | null;

  @Column({ name: 'target_quantity', type: 'int', default: 0 })
  targetQuantity: number;

  @Column({ name: 'completed_quantity', type: 'int', default: 0 })
  completedQuantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
