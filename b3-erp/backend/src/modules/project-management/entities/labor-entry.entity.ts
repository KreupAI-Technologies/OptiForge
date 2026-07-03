import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pm_labor_entries')
export class LaborEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'varchar', default: 'default' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  date: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName: string;

  @Column({ name: 'work_package', type: 'varchar', nullable: true })
  workPackage: string;

  @Column({ name: 'labor_category', type: 'varchar', default: 'Skilled' })
  laborCategory: string;

  @Column({ name: 'workers_deployed', type: 'int', default: 0 })
  workersDeployed: number;

  @Column({ name: 'hours_worked', type: 'numeric', precision: 10, scale: 2, default: 0 })
  hoursWorked: number;

  @Column({ name: 'overtime_hours', type: 'numeric', precision: 10, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'total_manhours', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalManhours: number;

  @Column({ name: 'planned_manhours', type: 'numeric', precision: 12, scale: 2, default: 0 })
  plannedManhours: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  variance: number;

  @Column({ name: 'hourly_rate', type: 'numeric', precision: 12, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ name: 'overtime_rate', type: 'numeric', precision: 12, scale: 2, default: 0 })
  overtimeRate: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'work_description', type: 'text', nullable: true })
  workDescription: string;

  @Column({ type: 'varchar', default: 'Day' })
  shift: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'varchar', nullable: true })
  supervisor: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
