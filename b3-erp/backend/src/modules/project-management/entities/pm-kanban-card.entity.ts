import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PmKanbanCardEntity — backs the projects/execution/kanban board.
 * Additive table (pm_kanban_cards).
 */
@Entity('pm_kanban_cards')
export class PmKanbanCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', length: 100, default: 'default' })
  companyId: string;

  @Column({ name: 'task_number', type: 'varchar', nullable: true })
  taskNumber: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_code', type: 'varchar', nullable: true })
  projectCode: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ type: 'varchar', nullable: true })
  assignee: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ name: 'due_date', type: 'varchar', nullable: true })
  dueDate: string;

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedHours: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: any;

  @Column({ name: 'column_key', type: 'varchar', default: 'backlog' })
  column: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
