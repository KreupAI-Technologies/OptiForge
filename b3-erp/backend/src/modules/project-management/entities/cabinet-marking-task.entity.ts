import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A cabinet marking task (Step 2.9). Teams mark cabinets with identifying
 * labels, photograph them for documentation and generate marking reports for
 * the installation crew. Persists the state shown on the cabinet-marking page.
 */
@Entity('pm_cabinet_marking_tasks')
export class CabinetMarkingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'task_number', type: 'varchar', nullable: true })
  taskNumber: string;

  // The page labels this "Type" (e.g. "Wall Cabinets - Upper Level").
  @Column({ name: 'cabinet_type', type: 'varchar', nullable: true })
  cabinetType: string;

  @Column({ name: 'zone', type: 'varchar', nullable: true })
  zone: string;

  @Column({ name: 'marking_type', type: 'varchar', nullable: true })
  markingType: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  // Free-text team assignment, e.g. "Installation Team A - 4 members".
  @Column({ name: 'assigned_team', type: 'varchar', nullable: true })
  assignedTeam: string;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ name: 'scheduled_date', type: 'varchar', nullable: true })
  scheduledDate: string;

  @Column({ name: 'completed_date', type: 'varchar', nullable: true })
  completedDate: string;

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ name: 'marked_items', type: 'int', default: 0 })
  markedItems: number;

  @Column({ name: 'total_items', type: 'int', default: 0 })
  totalItems: number;

  @Column({ name: 'photos_uploaded', type: 'int', default: 0 })
  photosUploaded: number;

  @Column({ name: 'report_generated', type: 'boolean', default: false })
  reportGenerated: boolean;

  @Column({ type: 'jsonb', nullable: true })
  checklist: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
