import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_designer_tasks')
export class PmDesignerTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  project: string;

  @Column({ type: 'varchar', nullable: true })
  assignee: string;

  @Column({ name: 'target_date', type: 'varchar', nullable: true })
  targetDate: string;

  @Column({ type: 'varchar', default: 'Pending Review' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
