import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_wbs_nodes')
export class PmWbsNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', default: 'Not Started' })
  status: string;

  @Column({ name: 'start_date', type: 'varchar', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'varchar', nullable: true })
  endDate: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedHours: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
