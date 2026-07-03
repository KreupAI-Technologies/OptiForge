import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_deliverables')
export class DeliverableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'deliverable_number', type: 'varchar', nullable: true })
  deliverableNumber: string;

  @Column({ name: 'deliverable_name', type: 'varchar', nullable: true })
  deliverableName: string;

  @Column({ name: 'project_number', type: 'varchar', nullable: true })
  projectNumber: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ name: 'planned_date', type: 'varchar', nullable: true })
  plannedDate: string;

  @Column({ name: 'actual_date', type: 'varchar', nullable: true })
  actualDate: string;

  @Column({ type: 'varchar', default: 'Not Started' })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: any;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
