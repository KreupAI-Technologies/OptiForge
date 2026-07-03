import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_schedule_tasks')
export class PmScheduleTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', nullable: true })
  assignee: string;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ type: 'varchar', nullable: true })
  phase: string;

  @Column({ type: 'varchar', default: 'Not Started' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
