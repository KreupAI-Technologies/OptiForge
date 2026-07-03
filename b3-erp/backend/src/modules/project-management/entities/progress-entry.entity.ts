import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_progress_entries')
export class ProgressEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ name: 'work_package', type: 'varchar', nullable: true })
  workPackage: string;

  @Column({ type: 'varchar', nullable: true })
  activity: string;

  @Column({ name: 'planned_work', type: 'text', nullable: true })
  plannedWork: string;

  @Column({ name: 'actual_work', type: 'text', nullable: true })
  actualWork: string;

  @Column({ name: 'completion_percent', type: 'int', default: 0 })
  completionPercent: number;

  @Column({ name: 'labor_deployed', type: 'int', default: 0 })
  laborDeployed: number;

  @Column({ name: 'hours_worked', type: 'numeric', precision: 10, scale: 2, default: 0 })
  hoursWorked: number;

  @Column({ name: 'material_used', type: 'text', nullable: true })
  materialUsed: string;

  @Column({ name: 'equipment_used', type: 'text', nullable: true })
  equipmentUsed: string;

  @Column({ type: 'text', nullable: true })
  issues: string;

  @Column({ type: 'int', default: 0 })
  photos: number;

  @Column({ type: 'varchar', nullable: true })
  weather: string;

  @Column({ name: 'safety_incidents', type: 'int', default: 0 })
  safetyIncidents: number;

  @Column({ name: 'reported_by', type: 'varchar', nullable: true })
  reportedBy: string;

  @Column({ type: 'varchar', default: 'Draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
