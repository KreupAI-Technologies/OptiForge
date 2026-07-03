import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Net-new orphan entity backing /production/scheduling/enhanced-gantt.
@Entity('production_gantt_tasks')
export class GanttTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string | null;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', length: 30, default: 'not-started' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'varchar', nullable: true })
  assignee: string | null;

  @Column({ name: 'group_id', type: 'varchar', nullable: true })
  groupId: string | null;

  @Column({ name: 'group_name', type: 'varchar', nullable: true })
  groupName: string | null;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
